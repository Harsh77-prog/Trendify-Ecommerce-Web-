const mongoose = require('mongoose');

// Define the Cart Schema
const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Refers to the Product model
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
});

// Middleware to calculate total price before saving
cartSchema.pre('save', async function (next) {
  if (this.isModified('items')) { // Only recalculate if items change
    let total = 0;

    for (const item of this.items) {
      const product = await mongoose.model('Product').findById(item.productId);
      if (product) {
        total += product.price * item.quantity;
      }
    }

    this.totalPrice = total;
  }
  next();
});


// Avoid overwriting the model if it already exists
module.exports = mongoose.models.cart || mongoose.model('cart', cartSchema);
