const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },

  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  quantity: { 
    type: Number, 
    required: true, 
    min: [1, "Quantity must be at least 1"] 
  },

  totalPrice: { 
    type: Number, 
    required: true, 
    min: [0, "Total price must be a positive number"] 
  },

  selectedSize: { 
    type: String, 
    required: true 
  },

  // ✅ Selected color image URL
  selectedColor: { 
    type: String, 
    required: true,
    validate: {
      validator: (v) => /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/.test(v),
      message: "Invalid color image URL"
    }
  },

  address: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },


cashfreeOrderId: {
    type: String,
    default: null
  },

  paymentDetails: {
    paymentId: { type: String },
    paymentMode: { type: String },
    paymentTime: { type: Date }
  },

  paymentMethod: { 
    type: String, 
    enum: ["Cash on Delivery", "Online Payment"], 
    default: "Cash on Delivery" 
  },
  status: { 
    type: String, 
    enum: ["Pending", "Confirmed", "Shipped", "Delivered" ,"Failed"], 
    default: "Pending" 
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Order", OrderSchema);
