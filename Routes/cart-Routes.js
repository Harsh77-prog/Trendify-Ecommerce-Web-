const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product'); // Ensure Product is imported for validation

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (!req.session || !req.session.userId) {
    console.error('User not logged in');
    return res.status(401).render("error", { errorMessage: "Please log in to access your cart." });
   
  }
  next();
}


// GET /cart - Fetch the cart
router.get('/cart', async (req, res) => {
  const userId = req.session.userId;

  try {
    if (!userId) {
      return res.render('cart', { cart: [], username: null }); // Empty cart for unauthenticated users
    }

    const cart = await Cart.findOne({ userId }).populate('items.productId');
    const username = req.user ? req.user.username : null; // Assuming you're using a user authentication system
    res.render('cart', { cart: cart?.items || [], username });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).render("error", { errorMessage: "An error occurred while fetching the cart." });
    
  }
});


// POST /cart/add - Add product to cart
router.post('/cart/add', isAuthenticated, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    console.error('User not logged in');
    return res.status(500).render("error", { errorMessage: "Please log in to add items to your cart." });
  }

  try {
    // Validate productId and quantity
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).render("error", { errorMessage: "Invalid product or quantity." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).render("error", { errorMessage: "Product not found." });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      console.log('No cart found, creating a new one');
      cart = new Cart({ userId, items: [] });
    }

    // Check if product exists in the cart
    const existingItem = cart.items.find(item => item.productId.equals(productId));
    if (existingItem) {
      console.log('Product exists in cart, updating quantity');
      existingItem.quantity += parseInt(quantity, 10);
    } else {
      cart.items.push({ productId, quantity: parseInt(quantity, 10) });
    }

    await cart.save();

    // Calculate total item count in cart
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    // Send success response with cart count
    res.send({
      success: true,
      message: 'Product added to cart.',
      cartCount: totalItems
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).render("error", { errorMessage: "Failed to add product to cart." });
  }
});

router.get('/cart/count', async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) return res.json({ totalItems: 0 });

    const cart = await Cart.findOne({ userId });
    const totalItems = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

    res.json({ totalItems });
  } catch (err) {
    console.error('Error getting cart count:', err);
    res.status(500).json({ totalItems: 0 });
  }
});


router.post('/cart/remove', async (req, res) => {
  const { productId } = req.body;
  const userId = req.session.userId;

  try {
    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = cart.items.filter(item => !item.productId.equals(productId));
      await cart.save();
    }
    res.redirect('/cart');
  } catch (error) {
    console.error('Error removing from cart:', error);
    return res.status(500).render("error", { errorMessage: "An error occurred while removing the item from the cart." });
 
  }
});
module.exports = router;
