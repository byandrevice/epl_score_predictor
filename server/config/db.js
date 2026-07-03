const mongoose = require("mongoose");

// Connects to MongoDB Atlas using MONGO_URI from the environment.
// Wired in server.js. Fails soft (logs) so non-DB routes still work in dev.
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }
};

module.exports = connectDB;
