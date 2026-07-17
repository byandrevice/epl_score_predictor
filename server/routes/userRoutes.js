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
            predictionsPublic: !!user.predictionsPublic,
            memberSince: user.createdAt
        };

        res.json(profileData);
    } catch (err) { // <--- Correct syntax
        res.status(500).json({ message: "Server error" });
    }
});

// Route to update Profile (also used to opt in/out of a public prediction history)
router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const editable = [
            "firstName",
            "lastName",
            "username",
            "email",
            "favoriteTeam",
            "emailNotifications",
            "reminderNotifications",
            "predictionsPublic",
        ];

        const updates = {};
        for (const key of editable) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        const user = await User.findByIdAndUpdate(req.user.id, updates, {
            new: true,
            runValidators: true,
        });
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            favoriteTeam: user.favoriteTeam || "",
            emailNotifications: user.emailNotifications,
            reminderNotifications: user.reminderNotifications,
            predictionsPublic: !!user.predictionsPublic,
            memberSince: user.createdAt,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Route to view another predictor's public profile (leaderboard click-through).
// Rank/points/accuracy are always shown; the graded prediction history is only
// included if that user has opted in via predictionsPublic.
router.get("/:userId/public", authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const userPredictions = await Prediction.find({ user: userId }).populate("fixture");
        const totalPoints = userPredictions.reduce((sum, p) => sum + (p.pointsAwarded || 0), 0);
        const predictionsMade = userPredictions.length;
        const correctScores = userPredictions.filter((p) => p.isCorrect).length;

        // Same ranking approach as /stats: rank by total points across all users.
        const allTotals = await Prediction.aggregate([
            { $group: { _id: "$user", totalPoints: { $sum: "$pointsAwarded" } } },
            { $sort: { totalPoints: -1 } },
        ]);
        const rankIndex = allTotals.findIndex((p) => p._id.toString() === userId);
        const rank = rankIndex !== -1 ? rankIndex + 1 : "Unranked";

        const profile = {
            userId: user._id.toString(),
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            favoriteTeam: user.favoriteTeam || "",
            memberSince: user.createdAt,
            rank,
            points: totalPoints,
            accuracy: predictionsMade > 0 ? `${Math.round((correctScores / predictionsMade) * 100)}%` : "0%",
            predictionsMade,
            correctScores,
            predictionsPublic: !!user.predictionsPublic,
            predictions: null,
        };

        if (user.predictionsPublic) {
            const graded = userPredictions.filter(
                (p) => p.fixture && p.fixture.finalHomeScore !== null && p.fixture.finalAwayScore !== null
            );
            const outcome = (h, a) => (h > a ? "HOME" : h < a ? "AWAY" : "DRAW");

            profile.predictions = graded
                .map((p) => {
                    const f = p.fixture;
                    const isExact = p.homeScore === f.finalHomeScore && p.awayScore === f.finalAwayScore;
                    const sameOutcome =
                        outcome(p.homeScore, p.awayScore) === outcome(f.finalHomeScore, f.finalAwayScore);
                    const result = isExact ? "correct_score" : sameOutcome ? "correct_outcome" : "wrong";

                    return {
                        id: p._id.toString(),
                        homeTeam: f.home,
                        awayTeam: f.away,
                        homeCrest: f.homeCrest,
                        awayCrest: f.awayCrest,
                        finalHome: f.finalHomeScore,
                        finalAway: f.finalAwayScore,
                        predHome: p.homeScore,
                        predAway: p.awayScore,
                        result,
                        points: p.pointsAwarded,
                        matchDate: f.kickoff,
                    };
                })
                .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());
        }

        res.json(profile);
    } catch (err) {
        console.error(err);
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
            streak: `${currentStreak}W`, // Dynamic streak value[cite: 3]
            correctScores,
            predictionsMade
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

function ordinalSuffix(n) {
    const j = n % 10, k = n % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
}

router.get("/dashboard-meta", authMiddleware, async (req, res) => {
    try {
        const Fixture = require("../models/Fixture");
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Same "find the next gameweek" pattern used in predictionController.getPredictFixtures
        const nextFixture = await Fixture.findOne({ kickoff: { $gte: new Date() } }).sort({ kickoff: 1 });

        let gameweekNumber = 0;
        let gameweekIsOpen = false;
        let deadlineText = "TBD";

        if (nextFixture) {
            gameweekNumber = parseInt(nextFixture.week.replace(/\D/g, ""), 10) || 0;

            const weekFixtures = await Fixture.find({ week: nextFixture.week }).sort({ kickoff: 1 });
            const earliestKickoff = weekFixtures[0]?.kickoff;
            gameweekIsOpen = earliestKickoff ? earliestKickoff.getTime() > Date.now() : false;

            if (earliestKickoff) {
                const d = new Date(earliestKickoff);
                const weekday = d.toLocaleDateString("en-GB", { weekday: "short" });
                const month = d.toLocaleDateString("en-GB", { month: "short" });
                const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
                deadlineText = `${weekday} ${d.getDate()} ${month} · ${time}`;
            }
        }

        // Same ranking logic already used by /stats, just reused here
        const allPredictions = await Prediction.aggregate([
            { $group: { _id: "$user", totalPoints: { $sum: "$pointsAwarded" } } },
            { $sort: { totalPoints: -1 } }
        ]);
        const rankIndex = allPredictions.findIndex(p => p._id.toString() === userId);
        const globalRank = rankIndex !== -1 ? `${rankIndex + 1}${ordinalSuffix(rankIndex + 1)}` : "Unranked";

        const initials =
            ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() ||
            (user.username || "??").slice(0, 2).toUpperCase();

        res.json({
            username: user.username,
            avatarInitials: initials,
            globalRank,
            gameweekNumber,
            gameweekIsOpen,
            deadlineText,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;