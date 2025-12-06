const mongoose = require("mongoose");

connectDB = async () => {
    try {
      // We connect directly using the hardcoded string
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`❌ Database Connection Error: ${error.message}`);
      process.exit(1);
    }
  };
  
  module.exports = connectDB;
