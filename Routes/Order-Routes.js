const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/product");

// ✅ Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).render("error", { errorMessage: "Please log in to view your orders." });
  }
  req.user = req.session.user;
  next();
}

router.get("/place-order", async (req, res) => {
  try {
    const productId = req.query.product_id;
    const selectedSize = req.query.size;
    const selectedColor = req.query.color; // ✅ Now a full image URL

    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).render("error", { errorMessage: "Invalid Product ID format" });
    }

    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).render("error", { errorMessage: "Product not found" });
    }

    if (!selectedSize || !product.sizes.some(size => size.size === selectedSize)) {
      return res.status(400).render("error", { errorMessage: "Invalid or missing size selection" });
    }

    // ✅ Optional: Check if color exists in colorImages
    if (selectedColor && !product.colorImages.includes(selectedColor)) {
      return res.status(400).render("error", { errorMessage: "Invalid color selected" });
    }

    res.render("order", { product, selectedSize, selectedColor });
  } catch (error) {
    console.error("🚨 Internal Server Error:", error);
    return res.status(500).render("error", { errorMessage: "Internal Server Error" });
  }
});

// ✅ Step 2: Render the Address Form
router.get("/enter-address", isAuthenticated, async (req, res) => {
  try {
    const product_id = req.query.product_id;
    const quantity = req.query.quantity;
    const size = req.query.size;
    const color = req.query.color; // ✅ Now a full image URL

    const product = await Product.findById(product_id);

    if (!product) {
      return res.status(404).render("error", { errorMessage: "Product not found" });
    }

    if (!size || !product.sizes.some(sizeObj => sizeObj.size === size)) {
      return res.status(400).render("error", { errorMessage: "Invalid or missing size selection" });
    }

    // ✅ Optional: Validate the color URL
    if (color && !product.colorImages.includes(color)) {
      return res.status(400).render("error", { errorMessage: "Invalid color selected" });
    }

    const sizeDetails = product.sizes.find(sizeObj => sizeObj.size === size);
    const price = sizeDetails?.price || product.price;

    res.render("address", {
      product,
      quantity,
      size,
      price,
      color // ✅ update to use the correct variable
    });
  } catch (error) {
    console.error("Error rendering address form:", error);
    return res.status(500).render("error", { errorMessage: "Internal Server Error" });
  }
});


router.post("/submit-address", isAuthenticated, async (req, res) => {
  try {
    const {
      product_id,
      quantity,
      selectedSize,
      fullName,
      phone,
      street,
      city,
      state,
      zipCode,
      country,
      color // ✅ Now contains full URL
    } = req.body;

    if (!product_id || !selectedSize || !quantity || !fullName || !phone || !street || !city || !state || !zipCode || !country) {
      return res.status(400).render("error", { errorMessage: "Please fill in all the required fields." });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).render("error", { errorMessage: "Product not found" });
    }

    // ✅ Optional: Validate that color exists in colorImages
    

    const price = product.price;
    const totalPrice = price * quantity;

    req.session.tempOrder = {
      product: product_id,
      user: req.user.id,
      quantity,
      selectedSize,
      selectedColor : color,
      totalPrice,
      address: { fullName, phone, street, city, state, zipCode, country },
    };

    res.redirect("/order-confirmation");
  } catch (error) {
    console.error("❌ Error submitting order:", error);
    return res.status(500).render("error", { errorMessage: "Internal Server Error" });
  }
});


// ✅ Step 4: Order Confirmation Page
router.get("/order-confirmation", isAuthenticated, async (req, res) => {
  try {
    if (!req.session.tempOrder) {
      return res.status(400).render("error", { errorMessage: "No pending order found. Please start the order process again." });
    }

    const product = await Product.findById(req.session.tempOrder.product);
    if (!product) {
      return res.status(404).render("error", { errorMessage: "Product not found." });
    }

    res.render("order-confirmation", { order: req.session.tempOrder, product });
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    return res.status(500).render("error", { errorMessage: "An error occurred while fetching the order details." });
  }
});


// ✅ Step 5: Payment Selection Page
router.get("/select-payment", isAuthenticated, async (req, res) => {
  try {
    if (!req.session.tempOrder) {
      return res.status(400).render("error", { errorMessage: "No pending order found. Please start the order process again." });
    }

    res.render("payment", { order: req.session.tempOrder });
  } catch (error) {
    console.error("Error rendering payment page:", error);
    return res.status(500).render("error", { errorMessage: "Internal Server Error" });
  }
});

// ✅ Step 7: Fetch User Orders
router.get("/my-orders", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).render("error", { errorMessage: "Unauthorized access" });
    }

    const orders = await Order.find({ user: userId })
      .populate({
        path: "product",
        populate: {
          path: "reviews",
          select: "user", // Only fetch 'user' field to avoid unnecessary data
        },
      })
      .lean();

    res.render("my-orders", { orders, userId });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).render("error", { errorMessage: "Internal Server Error" });
  }
});

// ✅ Admin Routes
router.get("/admin/orders", async (req, res) => {
  try {
    const orders = await Order.find().populate("product").populate("user");
    res.render("admin-orders", { orders });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return res.status(500).render("error", { errorMessage: "Internal Server Error" });
  }
});

// ✅ Update Order Status
router.put("/admin/orders/update-status/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).render("error", { errorMessage: "Order not found" });
    }

    order.status = "Delivered";
    await order.save();
    
    res.json({ success: true, message: "Order status updated" });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).render("error", { errorMessage: "Server error" });
  }
});

// ✅ Delete Order (Admin)
router.delete("/admin/orders/delete/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).render("error", { errorMessage: "Order not found" });
    }

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return res.status(500).render("error", { errorMessage: "Server error" });
  }
});

module.exports = router;
