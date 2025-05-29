const mongoose = require("mongoose");

const validCategories = ["fashion", "electronics", "home", "beauty", "sports", "books"];

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },

  // Main product images
  imageUrl: { type: String, required: true },
  imageUrl2: { type: String, default: null },
  imageUrl3: { type: String, default: null },
  imageUrl4: { type: String, default: null },

  // NEW: Dynamic color images array
  colorImages: [{ type: String }],  // Example: ["url-to-red.jpg", "url-to-blue.jpg"]

  price: { type: Number, required: true },
  stock: { type: Number, required: true },

  sizes: [
    {
      size: { type: String, required: true },
      stock: { type: Number, required: true }
    }
  ],

  category: { 
    type: String, 
    enum: [...validCategories, "others"],
    set: value => validCategories.includes(value?.toLowerCase()) ? value.toLowerCase() : "others",
    required: true
  },

  createdAt: { type: Date, default: Date.now },

  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
      username: String,
      rating: Number,
      comment: String,
      date: { type: Date, default: Date.now }
    }
  ]
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
