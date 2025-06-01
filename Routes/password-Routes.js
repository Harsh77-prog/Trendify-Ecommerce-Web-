const express = require('express');
const router = express.Router(); // Use router here
const User = require('../models/user');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');  // Add bcrypt for password hashing
const ejs = require('ejs'); // Import ejs
const path = require('path'); // Import path

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
  
    if (!user) {
      return res.status(404).render("error", { errorMessage: "User not found" });

    }
  
    // Handle OAuth users
    if (user.oauthProvider) {
      const providerLinks = {
        google: 'https://accounts.google.com/signin/recovery',
        facebook: 'https://www.facebook.com/login/identify',
      };
      const provider = user.oauthProvider.toLowerCase();
      return res.send(
        `You can reset your password via ${provider}: ${providerLinks[provider]}`
      );
    }
  
    // Handle database users
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour
    await user.save();
  
    const resetLink = `https://trendify-ecommerce-web.onrender.com/reset-password?token=${token}`;
  
    const emailHtml = await ejs.renderFile(
      path.join(__dirname, '../views/reset-password-email.ejs'), 
      { userName: user.name, resetLink}
    );
  
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: { user: 'hk1533879@gmail.com', pass: 'mvfg qllf ckpa fafx' },
    });
    
    const mailOptions = {
      from: '"Trendify Support" <support@trendify.com>',
      to: user.email,
      subject: 'Reset Your Password - Trendify',
      html: emailHtml, // Use the rendered HTML
    };
  
    await transporter.sendMail(mailOptions);
  
    res.send('Password reset link has been sent to your email.');
  } catch (error) {
    return res.status(500).render("error", { errorMessage: "An error occurred while processing your request." });
  }
});

// Render Reset Password page
router.get('/reset-password', (req, res) => {
  const { token } = req.query;
  res.render('reset-password', { token });
});

// Handle Password Reset
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });
  
    if (!user) {
      return res.status(500).render("error", { errorMessage: "Invalid or expired token" });
      
    }
  
    // Hash the new password before saving it
    const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the salt rounds
  
    // Update user password with the hashed password
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();
  
    res.send('Password has been reset successfully');
  } catch (error) {
    return res.status(500).render("error", { errorMessage: "An error occurred while processing your request." });
  }
});

module.exports = router;  // Export routes
