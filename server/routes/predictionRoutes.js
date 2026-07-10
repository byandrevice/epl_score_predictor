const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const predictionController = require("../controllers/predictionController");

// Predictions require a logged-in user.
router.post("/", auth, predictionController.submit);
router.get("/mine", auth, predictionController.getMine);
router.get('/fixtures', predictionController.getMine);

module.exports = router;
