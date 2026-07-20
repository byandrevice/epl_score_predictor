const dns = require("dns");
// Render's outbound IPv6 routing is unreliable; Gmail's SMTP host resolves to
// both address families, and picking IPv6 causes ENETUNREACH/timeout on send.
dns.setDefaultResultOrder("ipv4first");

const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");
const watchFixtures = require("./services/fixtureWatcher");

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();

    console.log("MongoDB connected");

    // Start watching fixture changes after DB connection
    watchFixtures();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();