const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String },
  googleId: { type: String, default: null },
  facebookId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  resetToken: { type: String, default: null },
  resetTokenExpires: { type: Date, default: null },
  oauthProvider: { type: String, default: null },
});

// 🔹 Create indexes without "unique: true"
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ facebookId: 1 }, { sparse: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
