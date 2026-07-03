const express = require("express");
const router = express.Router();
const fixtureController = require("../controllers/fixtureController");

router.get("/upcoming", fixtureController.getUpcoming);
router.get("/:id", fixtureController.getOne);

module.exports = router;
