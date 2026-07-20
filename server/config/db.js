const mongoose = require("mongoose");
const dns = require("dns");

// Some hosting platforms don't support outbound IPv6, but Node can still
// resolve Atlas's SRV hosts to an IPv6 (AAAA) address and try that first,
// causing "connect ENETUNREACH ...". Forcing IPv4-first resolution avoids it.
dns.setDefaultResultOrder("ipv4first");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      family: 4, // force IPv4 for the actual driver socket connections too
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err; // important: let server.js handle failure
  }
};

module.exports = connectDB;