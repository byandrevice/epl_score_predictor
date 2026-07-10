const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Prediction = require("../models/Prediction");
const authMiddleware = require("../middleware/auth");

const mongoose = require("mongoose");

// Route to get Profile
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id); // Find by specific ID
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
    } catch (err) { // <--- Correct syntax
        res.status(500).json({ message: "Server error" });
    }
});

// Route to get Stats
router.get("/stats", authMiddleware, async (req, res) => {
    try {
        // Cast ID to ObjectId for reliable database matching[cite: 3]
        const userId = new mongoose.Types.ObjectId(req.user.id); 

        const allPredictions = await Prediction.aggregate([
            { $group: { _id: "$user", totalPoints: { $sum: "$pointsAwarded" } } },
            { $sort: { totalPoints: -1 } }
        ]);

        const rankIndex = allPredictions.findIndex(p => p._id.toString() === req.user.id);
        const rank = rankIndex !== -1 ? rankIndex + 1 : "Unranked";

        const userPredictions = await Prediction.find({ user: userId }).sort({ createdAt: -1 });
        const totalPoints = userPredictions.reduce((sum, p) => sum + (p.pointsAwarded || 0), 0);
        const predictionsMade = userPredictions.length;
        const correctScores = userPredictions.filter(p => p.isCorrect).length;
        
        // Simple streak logic: count consecutive correct predictions
        let currentStreak = 0;
        for (let p of userPredictions) {
            if (p.isCorrect) currentStreak++;
            else break;
        }

        res.json({
            rank,
            points: totalPoints,
            accuracy: predictionsMade > 0 ? `${Math.round((correctScores / predictionsMade) * 100)}%` : "0%",
            streak: `${currentStreak}W` // Dynamic streak value[cite: 3]
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