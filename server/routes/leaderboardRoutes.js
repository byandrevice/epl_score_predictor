const express = require("express");
const router = express.Router();
const leaderboardController = require("../controllers/leaderboardController");

router.get("/top", leaderboardController.getTop);
router.get("/", leaderboardController.getTop);


module.exports = router;
