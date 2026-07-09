const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const fixtureRoutes = require("./routes/fixtureRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const demoRoutes = require("./routes/demoRoutes");
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middleware/errorHandler");

const teamRoutes = require('./routes/teamRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "EPL Score Predictor API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/fixtures", fixtureRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/demo", demoRoutes);

app.use('/api/teams', teamRoutes);

// Central error handler (must be last).
app.use(errorHandler);

module.exports = app;
