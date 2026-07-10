const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Prediction = require("../models/Prediction");

// Route to get Profile
router.get("/profile", async (req, res) => {
    try {
        const user = await User.findOne();
        if (!user) return res.status(404).json({ message: "User not found" });

        // Manually map the data
        const profileData = {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            favoriteTeam: user.favoriteTeam || "",
            emailNotifications: user.emailNotifications,
            reminderNotifications: user.reminderNotifications,
            memberSince: user.createdAt
        };

        res.json(profileData);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Route to get Stats
router.get("/stats", async (req, res) => {
    try {
        // 1. Get the current user (Note: Ensure your auth middleware is used)
        // For testing, if you don't have auth middleware, use a specific ID:
        const userId = "6a500d4c962b5ac47ddfb113"; 

        // 2. Fetch all predictions for this user
        const predictions = await Prediction.find({ user: userId });

        // 3. Calculate metrics
        const totalPoints = predictions.reduce((sum, p) => sum + (p.pointsAwarded || 0), 0);
        const predictionsMade = predictions.length;
        const correctScores = predictions.filter(p => p.isCorrect).length;
        const accuracy = predictionsMade > 0 
            ? `${Math.round((correctScores / predictionsMade) * 100)}%` 
            : "0%";

        // 4. Return the dynamic data
        res.json({
            rank: "1", // You can later implement a rank calculation
            points: totalPoints,
            accuracy: accuracy,
            correctScores: correctScores,
            predictionsMade: predictionsMade
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/dashboard-meta", async (req, res) => {
    res.json({ success: true, message: "Dashboard metadata loaded" });
});

module.exports = router;