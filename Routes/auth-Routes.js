const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { OAuth2Client } = require("google-auth-library");
const passport = require("passport");
const bcrypt = require("bcrypt");
const FacebookStrategy = require("passport-facebook").Strategy;
const Product = require("../models/product");
const Order = require("../models/Order"); // Ensure Order model is imported

// ✅ Middleware to check authentication (Fix: Check both session and Passport)
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated() || req.session.user) {
    req.user = req.user || req.session.user; // Ensure `req.user` is always available
    return next();
  }
  res.redirect("/login");
}

// ✅ Home page route (Fix: Ensure username is passed)


// ✅ Product routes (Fix: Ensure username is passed)
router.get("/product", async (req, res) => {
  try {
    req.user = req.user || req.session.user;
    const username = req.user ? req.user.username : null;
    const products = await Product.find(); // Fetch all products
    res.render("product2", { username, products });
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).render("error", { errorMessage: "Error fetching products." });
   
  }
});
// Default route redirects to the home page


router.get('/Product', (req, res) => {
  const username = req.user ? req.user.username : null;  // Example: getting username from session
  res.render('Product', { username: username });
});
router.get('/product', (req, res) => {
  const username = req.user ? req.user.username : null;  // Example: getting username from session
  res.render('product2', { username: username });
});



// Example valid categories
const validCategories = ['electronics', 'clothing', 'home', 'books', 'others'];

// Route to display all products with valid categories and optional username
router.get('/all-products', async (req, res) => {
  try {
    const username = req.user ? req.user.username : null;  // Get username from session if available
    
    // Get pagination parameters from the query string (default values are 1 for page and 30 for limit)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    // Fetch paginated products from MongoDB
    const products = await Product.find().skip(skip).limit(limit);

    // Assuming 'validCategories' is declared elsewhere
    res.render('AllProducts', { 
      products: products,
      validCategories: validCategories,
      username: username,
      page: page,  // Pass current page to the view
      limit: limit,  // Pass limit per page to the view
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).send("Internal Server Error");
  }
});


// Login page route
router.get("/login", (req, res) => {
  res.render("login");
});
router.get("/signup", (req, res) => {
  res.render("signup");
});
// Signup page route
router.post("/signup", async (req, res) => {
  try {
    let { username, email, password } = req.body;

    // Trim input values
    username = username.trim();
    email = email.trim();

    // Check if email already exists
    let existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return res.status(400).render("error", { errorMessage: "Email is already registered." });
      
    }

    // Ensure unique username
    let existingUser = await User.findOne({ username });
    let counter = 1;
    let newUsername = username;

    while (existingUser) {
      newUsername = `${username}${counter}`;
      existingUser = await User.findOne({ username: newUsername });
      counter++;
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    const newUser = new User({ username: newUsername, email, password: hashedPassword });
    await newUser.save();

    // Redirect to login with success message
    res.redirect(`/login?success=User registered successfully! Please log in.`);
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).render("error", { errorMessage: "An error occurred. Please try again later." });
   
  }
});


// GET Route for Viewing Product Details
router.get("/product/:id", async (req, res) => { 
  try {
    req.user = req.user || req.session.user;
    const username = req.user ? req.user.username : null;

    // Fetch the main product
    const product = await Product.findById(req.params.id).populate("reviews.user");

    if (!product) {
      return res.status(404).render("error", { errorMessage: "Product not found" });
    }

    // Fetch related products (same category, excluding the current product)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id }, // Exclude the current product
    }); // Adjust limit as needed

    // Render the page and pass relatedProducts
    res.render("product2", { username, product, relatedProducts });

  } catch (err) {
    return res.status(500).render("error", { errorMessage: "Error fetching product details." });
  }
});


// ✅ Login route (Fix: Store user in session)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).render("error", { errorMessage: "User not found" });
  }
  

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.userId = user._id;
      req.session.user = { id: user._id, username: user.username, email: user.email };
      return res.redirect("/home");
    } else {
      return res.status(401).render("error", { errorMessage: "Invalid credentials!" });
      
    }
  } catch (err) {
    return res.status(500).render("error", { errorMessage: "Server error" });
  
  }
});

// ✅ Logout route (Fix: Destroy session)
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.redirect("/");
    res.redirect("/home");
  });
});

// ✅ Google OAuth (Fix: Store user in session)
const client = new OAuth2Client("871822031113-ho69r854nh02adqpvne2q5ganld1hj9u.apps.googleusercontent.com");

router.post("/auth/google/callback", async (req, res) => {
  const { idToken } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: "871822031113-ho69r854nh02adqpvne2q5ganld1hj9u.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      let username = name.replace(/\s/g, "").toLowerCase();
      let existingUser = await User.findOne({ username });
      let counter = 1;
      let newUsername = username;

      while (existingUser) {
        newUsername = `${username}${counter}`;
        existingUser = await User.findOne({ username: newUsername });
        counter++;
      }

      user = new User({ googleId, email, username: newUsername });
      await user.save();
    }

    req.session.user = { id: user._id, username: user.username, email: user.email };
    res.status(200).json({ success: true, redirect: "/home" });
  } catch (error) {
    return res.status(400).render("error", { errorMessage: "Authentication failed" });
   
  }
});
// ✅ Facebook OAuth (Fix: Store user in session)
passport.use(
  new FacebookStrategy(
    {
      clientID: "448224624764815",
      clientSecret: "4342413b577e777576506e2012ed9e8f",
      callbackURL: "https://trendify-ecommerce-web.onrender.com//auth/facebook/callback",
      profileFields: ["id", "emails", "name"], // Ensure email is retrieved
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const email = profile.emails && profile.emails[0]?.value;
        if (!email) return done(new Error("Email not available from Facebook"), null);

        // Extract first character from email (lowercase)
        let baseUsername = email.charAt(0).toLowerCase();

        let user = await User.findOne({ email });

        if (!user) {
          let existingUser = await User.findOne({ username: baseUsername });
          let counter = 1;
          let newUsername = baseUsername;

          // Ensure unique username
          while (existingUser) {
            newUsername = `${baseUsername}${counter}`;
            existingUser = await User.findOne({ username: newUsername });
            counter++;
          }

          user = new User({
            facebookId: profile.id,
            email,
            username: newUsername, // Use first letter as username
          });
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        console.error("Facebook Auth Error:", err);
        return done(err, null);
      }
    }
  )
);


passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// 🔹 Facebook Login Routes
router.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.user = {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
    };
    res.redirect("/home");
  }
);



module.exports = router;
