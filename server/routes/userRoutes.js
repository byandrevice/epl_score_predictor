const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Ensure you have this import

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
            // Fallback to a default date if createdAt is missing
            memberSince: user.createdAt || new Date().toISOString() 
        };

        res.json(profileData);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Route to get Stats
router.get("/stats", async (req, res) => {
    try {
        res.json({
            rank: "N/A",
            points: 0,
            accuracy: "100%",           
            correctScores: 0,         
            predictionsMade: 0       
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/dashboard-meta", async (req, res) => {
    res.json({ success: true, message: "Dashboard metadata loaded" });
});

module.exports = router;