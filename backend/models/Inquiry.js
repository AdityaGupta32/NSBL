const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    requirement: { type: String, required: true },
    status: { type: String, default: "New" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
