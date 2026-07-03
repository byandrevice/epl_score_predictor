const express = require("express");
const router = express.Router();
const demoController = require("../controllers/demoController");

router.post("/fixture", demoController.createFixture);
router.post("/lock", demoController.lockFixture);
router.post("/final-score", demoController.setFinalScore);
router.post("/calculate", demoController.calculatePoints);

module.exports = router;
