const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const leaderboardController = require("../controllers/leaderboardController");

router.get("/top", auth.optionalAuth, leaderboardController.getTop);
router.get("/", auth.optionalAuth, leaderboardController.getTop);


module.exports = router;
