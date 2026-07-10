const express = require("express");
const router = express.Router();
const Fixture = require("../models/Fixture");
const Prediction = require("../models/Prediction"); 
const authMiddleware = require("../middleware/auth"); 

router.get("/", authMiddleware, async (req, res) => {
    try {
        const { week } = req.query;
        console.log("Querying database for week:", week); // Debug log

        const fixtures = await Fixture.find({ week: week }); 
        console.log("Fixtures found:", fixtures.length); // Debug log
        
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