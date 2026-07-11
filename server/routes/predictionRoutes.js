const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const predictionController = require("../controllers/predictionController");

// Predictions require a logged-in user.
router.post("/", auth, predictionController.submit);
router.get("/mine", auth, predictionController.getMine);

// Used by PredictPage.tsx (mounted at both /api/predictions and /api/predict — see app.js)
router.get("/fixtures", auth, predictionController.getPredictFixtures);
router.post("/submit-all", auth, predictionController.submitAll);

module.exports = router;