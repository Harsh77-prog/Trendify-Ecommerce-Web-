const express = require("express");
const router = express.Router();
const ADMIN_CREDENTIALS = require("../models/AdminLogin");
const ExcelJS = require('exceljs');
const Order = require('../models/Order'); // your Order model

router.get("/admin-login", (req, res) => {
    res.render("admin-loginForm"); // Render the login page
});

router.post("/admin-login", (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        req.session.admin = true; // Store session
        return res.redirect("/admin");
    }
    return res.status(400).render("error", { errorMessage: "Invalid credentials. Try again." });
   
});

router.get("/admin", (req, res) => {
    if (!req.session.admin) {
        return res.redirect("/admin-loginForm"); // Redirect if not logged in
    }
    res.render("admin"); // Load the admin panel
});
router.get("/fashionProduct" , (req,res) => {
    res.render("fashionProduct");
});

router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/admin-loginForm"); // Redirect to login after logout
    });
});

module.exports = router;
