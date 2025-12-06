const mongoose = require("mongoose");
const MONGO_URI = "mongodb+srv://aditya22:aditya123@nsbl2.f5wxidl.mongodb.net/nsbl2?appName=nsbl2&retryWrites=true&w=majority";
connectDB = async () => {
    try {
      // We connect directly using the hardcoded string
      const conn = await mongoose.connect(MONGO_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`❌ Database Connection Error: ${error.message}`);
      process.exit(1);
    }
  };
  

  module.exports = connectDB;
