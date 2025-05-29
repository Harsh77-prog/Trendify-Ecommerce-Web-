require('dotenv').config();

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const RETURN_URL = 'http://localhost:3000/payment-status'; // Change to your production domain


function isAuthenticated(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).render("error", { errorMessage: "Please log in to view your orders." });
  }

  req.user = req.session.user;
  console.log(req.user);
  console.log(req.session.user);
  console.log(req.session.user.email);
  next();
}

// ✅ POST /confirm-payment
router.post("/confirm-payment", isAuthenticated, async (req, res) => {
  try {
    const { payment_method } = req.body;

    if (!["Cash on Delivery", "Online Payment"].includes(payment_method)) {
      return res.status(400).render("error", {
        errorMessage: "Invalid payment method selected.",
      });
    }

    if (!req.session.tempOrder) {
      return res.status(400).render("error", {
        errorMessage: "No pending order found. Please try again.",
      });
    }

    const sessionOrder = req.session.tempOrder;

    if (payment_method === "Cash on Delivery") {
      const newOrder = new Order({
        ...sessionOrder,
        paymentMethod: "Cash on Delivery",
        paymentStatus: "Pending",
        status: "Pending",
      });

      await newOrder.save();
      delete req.session.tempOrder;
      return res.render("final", { order: newOrder });
    }

    // Online Payment flow — create order in Cashfree first!
    const paymentData = {
  order_id: uuidv4(),
  order_amount: parseFloat(sessionOrder.totalPrice) || 1.0,
  order_currency: "INR",
  customer_details: {
    customer_id: req.session.user._id || uuidv4(), // optional
    customer_name: req.session.user.username ,// ✅ ADD THIS
    customer_email: req.session.user.email,
    customer_phone: sessionOrder.address.phone
  },
  order_meta: {
    return_url: `${RETURN_URL}?order_id=PLACEHOLDER`,
  },
};
console.log("Payment Data:", paymentData);
console.log("Customer Details:", paymentData.customer_details);


    // Create order on Cashfree
    const cashfreeResponse = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      paymentData,
      {
        headers: {
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json",
        },
      }
    );

    const cashfreeOrderId = cashfreeResponse.data.order_id;
    const paymentLink = cashfreeResponse.data.payment_link || cashfreeResponse.data.payments?.url;

    if (!paymentLink) {
      throw new Error("Payment link not found in Cashfree response.");
    }

    // Now save order in DB with official Cashfree order_id
    const newOrder = new Order({
      ...sessionOrder,
      paymentMethod: "Online Payment",
      paymentStatus: "Pending",
      cashfreeOrderId,
      status: "Pending",
    });

    await newOrder.save();

    // Update return_url with newOrder._id to identify order on return
    // Note: If you want to update Cashfree order's return_url, you can do that here if API supports
    // Otherwise, just handle in your payment confirmation page.

    delete req.session.tempOrder;

    return res.redirect(paymentLink);

  } catch (error) {
    if (error.response) {
      console.error("Axios error response status:", error.response.status);
      console.error("Axios error response headers:", error.response.headers);
      console.error("Axios error response data:", error.response.data);
    } else if (error.request) {
      console.error("No response received from Cashfree:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    console.error("Axios error config:", error.config);

    return res.status(500).render("error", {
      errorMessage: "Internal Server Error. Please try again.",
    });
  }
});

// ✅ GET /payment-status
router.get("/payment-status", async (req, res) => {
  const { order_id } = req.query;

  try {
    const order = await Order.findById(order_id);

    if (!order) {
      return res.status(404).render("error", {
        errorMessage: "Order not found!",
      });
    }

    const response = await axios.get(
      `https://sandbox.cashfree.com/pg/orders/${order.cashfreeOrderId}/payments`,
      {
        headers: {
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "x-api-version": "2022-09-01",
        },
      }
    );

    const paymentInfo = response.data.payment_group?.[0]?.payments?.[0];

    if (!paymentInfo || paymentInfo.payment_status !== "SUCCESS") {
      return res.render("error", {
        errorMessage: "Payment not completed or failed.",
      });
    }

    // ✅ Update Order
    order.paymentStatus = "Paid";
    order.status = "Confirmed"; // Or "Processing"
    order.paymentDetails = {
      paymentId: paymentInfo.payment_id,
      paymentMode: paymentInfo.payment_method,
      paymentTime: new Date(paymentInfo.payment_time),
    };

    await order.save();
    return res.render("final", { order });

  } catch (err) {
    if (err.response) {
      console.error("Axios error response status:", err.response.status);
      console.error("Axios error response headers:", err.response.headers);
      console.error("Axios error response data:", err.response.data);
    } else if (err.request) {
      console.error("No response received from Cashfree:", err.request);
    } else {
      console.error("Error message:", err.message);
    }
    console.error("Axios error config:", err.config);

    return res.status(500).render("error", {
      errorMessage: "Something went wrong during payment verification.",
    });
  }
});

module.exports = router;
