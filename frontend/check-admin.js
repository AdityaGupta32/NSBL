const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User"); 
const connectDB = require("./config/db");

// Load Config
dotenv.config();

const checkAdmin = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    console.log("---------------------------------------");
    console.log("🔍 Searching for Admin User...");

    // 2. Find the user with the admin email
    const admin = await User.findOne({ email: "admin@nsbl.com" });

    if (admin) {
      console.log("✅ Admin Found!");
      console.log("---------------------------------------");
      console.log("🆔 ID:       ", admin._id);
      console.log("👤 Name:     ", admin.name);
      console.log("📧 Email:    ", admin.email);
      console.log("🔑 Password: ", admin.password); // Shows the password stored in DB
      console.log("🛡️  Is Admin: ", admin.isAdmin);
      console.log("---------------------------------------");
    } else {
      console.log("❌ No Admin user found with email 'admin@nsbl.com'");
    }

    process.exit();
  } catch (error) {
    console.error("❌ Error fetching data:", error.message);
    process.exit(1);
  }
};

checkAdmin();
