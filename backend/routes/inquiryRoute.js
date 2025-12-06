const express = require("express");
const router = express.Router();
const Inquiry = require("../models/Inquiry");

// 1. POST: User submits a form (Public)
router.post("/", async (req, res) => {
  try {
    const { name, phone, address, requirement } = req.body;
    const newInquiry = new Inquiry({ name, phone, address, requirement });
    await newInquiry.save();
    res.status(201).json({ message: "Application submitted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit inquiry" });
  }
});

// 2. GET: Admin sees all inquiries (Protected)
router.get("/", async (req, res) => {
  try {
    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});

module.exports = router;