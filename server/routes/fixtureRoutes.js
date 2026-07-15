const express = require("express");
const router = express.Router();
const Fixture = require("../models/Fixture");
const Prediction = require("../models/Prediction");
const authMiddleware = require("../middleware/auth");
const fixtureController = require("../controllers/fixtureController");

router.get("/upcoming", fixtureController.getUpcoming);
router.post("/sync", fixtureController.syncFromApi); // pulls real fixtures from football-data.org
router.get("/:id", fixtureController.getOne);

// Logged-in dashboard: fixtures merged with this user's prediction status
router.get("/", authMiddleware, async (req, res) => {
    try {
        const { week, year } = req.query;
        const query = { week };
        if (year) {
            // "year" is the season's start year — "2025" means the 2025/26 season,
            // which runs Aug 2025 through Jul 2026.
            const seasonStart = new Date(`${year}-08-01T00:00:00.000Z`);
            const seasonEnd = new Date(`${Number(year) + 1}-08-01T00:00:00.000Z`);
            query.kickoff = { $gte: seasonStart, $lt: seasonEnd };
        }
        const fixtures = await Fixture.find(query);
        const userPredictions = await Prediction.find({ user: req.user.id });

        const fixturesWithPredictions = fixtures.map(f => {
            const match = userPredictions.find(p => p.fixture.toString() === f._id.toString());
            return {
                ...f.toObject(),
                predicted: !!match,
                predictedHomeScore: match?.homeScore,
                predictedAwayScore: match?.awayScore
            };
        });

        res.json(fixturesWithPredictions || []);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;