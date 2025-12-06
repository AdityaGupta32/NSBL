const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

// CREATE PRODUCT (Admin Only)
router.post("/", async (req, res) => {
  try {
    const { name, category, weight, purity, price } = req.body;
    const product = new Product({
      name,
      category,
      weight,
      purity,
      price,
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: "Invalid product data" });
  }
});

// ✅ THIS LINE IS CRITICAL
module.exports = router;