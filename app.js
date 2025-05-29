const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const authRoutes = require("./Routes/auth-Routes.js");
const passwordRoutes = require("./Routes/password-Routes.js");
const cartRoutes = require("./Routes/cart-Routes.js");
const orderRoutes = require("./Routes/Order-Routes.js");
const adminRoutes = require("./Routes/AdminRoutes.js");
const paymentRoutes = require("./Routes/Payment-Routes.js");
const Product = require("./models/product.js"); // Ensure correct path
const Order = require("./models/Order.js"); // Ensure correct path
const axios = require("axios");
const passport = require("passport"); // Import passport
const ExcelJS = require('exceljs');
require('dotenv').config();



const app = express();
// ✅ Authentication Middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
};



// ✅ Session middleware (Improved security settings)

app.use(session({
  secret: "your-secret-key", // Use a strong secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 } // Keep session active for 1 hour
}));

app.use(passport.initialize());
app.use(passport.session());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ✅ View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// ✅ Middleware to make `username` available in all views
app.use((req, res, next) => {
  req.user = req.session.user || null; // Ensure user data is accessible
  res.locals.username = req.user ? req.user.username : null;
  next();
});

// ✅ Routes
app.use(authRoutes);
app.use(passwordRoutes);
app.use(cartRoutes);
app.use(orderRoutes);
app.use(adminRoutes);
app.use(paymentRoutes);



app.get("/Welcome", (req, res) => {
  res.render("welcome");
});

app.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    const username = req.session.user ? req.session.user.username : null;

    console.log("🔍 Checking user:", username);

    res.render("welcome", { products, username });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.render("welcome", { products: [], username: null });
  }
});

// Home page ("/home") - Similar logic to "/"
app.get("/home", async (req, res) => {
  try {
    const products = await Product.find();
    const username = req.session.user ? req.session.user.username : null;

   
    console.log("🔍 Checking user:", username);

    res.render("index", { products, username });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.render("index", { products: [], username: null });
  }
});

// ✅ Product Page
app.get("/product", (req, res) => {
  res.render("product", { username: res.locals.username });
});

// ✅ All Products Page

// ✅ Search Products
app.get("/SearchProduct", (req, res) => {
  res.render("search", { username: res.locals.username });
});

// ✅ Search Functionality
app.get("/search", async (req, res) => {
  const query = req.query.q;
  try {
    const products = await Product.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });
    res.render("product", { products, username: res.locals.username });
  } catch (err) {
    console.error("❌ Search Error:", err);
    res.status(500).send("Error during search.");
  }
});

// ✅ Admin Page (Protected)
app.get("/admin-Form",  (req, res) => {
  res.render("admin-loginForm.ejs");
});

app.get("/admin", (req, res) => {
  res.render("admin");
});








// ✅ Helper function: Shuffle array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
};


app.post("/add-product", async (req, res) => {
  try {
    const { 
      title, description, imageUrl, imageUrl2, imageUrl3, imageUrl4, 
      colorImages, price, stock, category, sizes 
    } = req.body;

    // Ensure required fields are provided
    if (!title || !description || !imageUrl || !price || !stock || !category || !sizes) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    // Ensure colorImages is an array (optional)
    const colorImagesArray = colorImages ? (Array.isArray(colorImages) ? colorImages : [colorImages]) : [];

    // Check if sizes is an array (no need to parse if it's already an array)
    if (!Array.isArray(sizes) || sizes.length === 0) {
      return res.status(400).json({ error: "At least one size must be specified." });
    }

    sizes.forEach(sizeObj => {
      if (!sizeObj.size || !sizeObj.stock) {
        return res.status(400).json({ error: "Each size must have a size and stock value." });
      }
    });

    // Create a new product
    const newProduct = new Product({
      title,
      description,
      imageUrl,
      imageUrl2,
      imageUrl3,
      imageUrl4,
      colorImages: colorImagesArray,  // Save array of color image URLs
      price,
      stock,  // Main stock (fallback, not used if sizes are provided)
      category,
      reviews: [], // Explicitly initializing reviews as an empty array
      sizes,  // Directly save the sizes array to the database
    });

    await newProduct.save();
    
    res.redirect("/admin");
  } catch (err) {
    console.error("❌ Error adding product:", err);
    res.status(500).send("Error adding product.");
  }
});

app.get("/products/:category", async (req, res) => {
  try {
    const { category } = req.params;
    if (!["fashion", "electronics", "home", "beauty", "sports", "books"].includes(category.toLowerCase())) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const products = await Product.find({ category: category.toLowerCase() });
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).send("Error fetching products.");
  }
});


app.get("/fetch-products", async (req, res) => {
  try {
    const response = await axios.get("https://dummyjson.com/products?limit=500");
    const products = response.data.products;

    // ✅ Allowed categories
    const validCategories = ["fashion", "electronics", "home", "beauty", "sports", "books"];

    // ❌ Ignore products with invalid categories
    const filteredProducts = products.filter(prod => 
      prod.category && validCategories.includes(prod.category.toLowerCase())
    );

    let addedCount = 0;
    let updatedCount = 0;

    for (let prod of filteredProducts) {
      const existingProduct = await Product.findOne({ title: prod.title });

      if (existingProduct) {
        // ✅ Update existing product while preserving its reviews
        existingProduct.description = prod.description;
        existingProduct.imageUrl = prod.thumbnail;
        existingProduct.imageUrl2 = prod.images[1] || null;
        existingProduct.imageUrl3 = prod.images[2] || null;
        existingProduct.imageUrl4 = prod.images[3] || null;
        existingProduct.imageUrlColor1 = prod.images[4] || null;
        existingProduct.imageUrlColor2 = prod.images[5] || null;
        existingProduct.imageUrlColor3 = prod.images[6] || null;
        existingProduct.price = prod.price;
        existingProduct.stock = prod.stock || 10; // ✅ Default stock if missing
        existingProduct.category = prod.category.toLowerCase();
        existingProduct.updatedAt = new Date();

        await existingProduct.save();
        updatedCount++;
      } else {
        // ✅ Add new product
        const newProduct = new Product({
          title: prod.title,
          description: prod.description,
          imageUrl: prod.thumbnail, 
          imageUrl2: prod.images[1] || null,
          imageUrl3: prod.images[2] || null,
          imageUrl4: prod.images[3] || null,
          imageUrlColor1: prod.images[4] || null,
          imageUrlColor2: prod.images[5] || null,
          imageUrlColor3: prod.images[6] || null,
          price: prod.price,
          stock: prod.stock || 10, // ✅ Default stock for new products
          category: prod.category.toLowerCase(),
          createdAt: new Date(),
          reviews: [] // ✅ Ensure reviews start as an empty array
        });

        await newProduct.save();
        addedCount++;
      }
    }

    res.json({ message: `✅ ${addedCount} new products added, ${updatedCount} existing products updated!` });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ message: "❌ Failed to fetch products", error: error.message });
  }
});


app.get("/related-products/:category", async (req, res) => {
  try {
    const category = req.params.category.toLowerCase();
    
    // Fetch related products excluding the current product
    const relatedProducts = await Product.find({ category }).limit(10);

    res.json({ products: relatedProducts });
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ message: "Failed to fetch related products" });
  }
});
// POST Route for Adding/Updating a Review
// Update Review Route

app.post("/product/:id/review", isAuthenticated, async (req, res) => {
  try {
    const { rating, comment, productId, userId } = req.body;
    const UserName = req.user.username;
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid user or product ID" });
    }

    // Fetch the product by ID (assuming you're working with a product review)
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Get the order details (assuming you have an Order model)
    const order = await Order.findOne({ product: productId, user: userId }); // Fetch the order related to the user and product
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the user has already reviewed
    const existingReviewIndex = product.reviews.findIndex((review) => review.user && review.user.toString() === userId.toString());

    if (existingReviewIndex !== -1) {
      // Update the existing review
      product.reviews[existingReviewIndex].rating = parseInt(rating);
      product.reviews[existingReviewIndex].comment = comment;
    } else {
      // Add the new review
      product.reviews.push({
        username: UserName,
        user: userId,
        rating: parseInt(rating),
        comment: comment,
      });
    }

    await product.save();
    
    res.redirect('/my-orders');

  } catch (error) {
    console.error("Error adding/updating review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.get("/api/products", async (req, res) => {
  try {
    const { category, maxPrice, minRating, search, sort } = req.query;
    const filter = {};

    if (category) filter.category = category.toLowerCase();
    if (maxPrice) filter.price = { $lte: parseFloat(maxPrice) };
    if (search) filter.title = { $regex: search, $options: "i" };

    let products = await Product.find(filter);

    // 🟡 Now apply minRating AFTER other filters, but keep price etc. intact
    if (minRating) {
      const min = parseFloat(minRating);
      products = products.filter(p => {
        const highestRating = p.reviews.length > 0 
          ? Math.max(...p.reviews.map(r => r.rating)) 
          : 0;
        return highestRating >= min;
      });
    }

    // 🔵 Apply sorting if requested
    if (sort === "price-asc") products.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") products.sort((a, b) => b.price - a.price);
    else if (sort === "rating-desc") {
      products.sort((a, b) => {
        const aRating = a.reviews.length > 0 ? Math.max(...a.reviews.map(r => r.rating)) : 0;
        const bRating = b.reviews.length > 0 ? Math.max(...b.reviews.map(r => r.rating)) : 0;
        return bRating - aRating;
      });
    }

    res.json(products);
  } catch (err) {
    console.error("❌ Error filtering products:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});



// Generate Excel Sheet (Reusable function)
async function generateExcelSheet(orders) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Orders');

  // Add headers
  worksheet.columns = [
    { header: 'Order ID', key: 'id', width: 30 },
    { header: 'User Full Name', key: 'fullName', width: 20 },
    { header: 'Phone', key: 'phone', width: 20 },
    { header: 'Street', key: 'street', width: 80 },
    { header: 'City', key: 'city', width: 20 },
    { header: 'State', key: 'state', width: 20 },
    { header: 'Zip Code', key: 'zipCode', width: 15 },
    { header: 'Country', key: 'country', width: 20 },
    { header: 'Product', key: 'product', width: 80 },
    { header: 'Quantity', key: 'quantity', width: 10 },
    { header: 'Size', key: 'selectedSize', width: 10 },
    { header: 'Total Price', key: 'totalPrice', width: 15 },
    { header: 'Payment Method', key: 'paymentMethod', width: 20 },
    { header: 'Status', key: 'status', width: 15 }
  ];

  // Add rows
  orders.forEach(order => {
    worksheet.addRow({
      id: order._id.toString(),
      fullName: order.address.fullName,
      phone: order.address.phone,
      street: order.address.street,
      city: order.address.city,
      state: order.address.state,
      zipCode: order.address.zipCode,
      country: order.address.country,
      product: order.product?.title || 'Product Deleted',
      quantity: order.quantity,
      selectedSize: order.selectedSize || 'N/A',
      totalPrice: order.totalPrice,
      paymentMethod: order.paymentMethod,
      status: order.status
    });
  });

  return workbook;
}

// Route: View Excel Sheet in browser (download as .xlsx but opens)
app.get('/admin/orders/excel/view', async (req, res) => {
  const orders = await Order.find({}).populate('product');
  const workbook = await generateExcelSheet(orders);

  res.setHeader(
    'TrendifyOrders',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'inline; filename=orders.xlsx');

  await workbook.xlsx.write(res);
  res.end();
});
















const port = 3000;
app.listen(port, () => {
  
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Press CTRL + C to stop the server`);
})