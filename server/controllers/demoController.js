// Demo simulation flow: admin creates a fixture -> users predict -> lock ->
// enter final score -> calculate points -> update leaderboard.
// TODO(Gia): implement using services/demoSimulationService.

const demoSimulationService = require("../services/demoSimulationService");
const Fixture = require("../models/Fixture");
const Prediction = require("../models/Prediction");
const User = require("../models/User");

// ------------------------------------
// Create fixture
// POST /api/demo/fixture
// ------------------------------------
exports.createFixture = async (req, res, next) => {
  try {

    const fixture = await demoSimulationService.createFixture(
      req.body
    );

    res.status(201).json({
      success: true,
      fixture
    });

  } catch (err) {
    next(err);
  }
};

// ------------------------------------
// Lock fixture
// POST /api/demo/lock
// ------------------------------------
exports.lockFixture = async (req, res, next) => {
  try {

    const fixture = await demoSimulationService.lockFixture(
      req.body.fixtureId
    );

    res.status(200).json({
      success: true,
      fixture
    });

  } catch (err) {
    next(err);
  }
};

// ------------------------------------
// Set final score
// POST /api/demo/final-score
// ------------------------------------
exports.setFinalScore = async (req, res) => {
  try {
    const { fixtureId, homeScore, awayScore } = req.body;

    const fixture = await Fixture.findById(fixtureId);

    if (!fixture) {
      return res.status(404).json({
        message: "Fixture not found"
      });
    }

    fixture.finalHomeScore = homeScore;
    fixture.finalAwayScore = awayScore;

    await fixture.save();

    res.json({
      success: true,
      fixture
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};

// ------------------------------------
// Calculate points
// POST /api/demo/calculate
// ------------------------------------
exports.calculatePoints = async (req, res, next) => {
  try {

    const result = await demoSimulationService.calculatePoints(
      req.body.fixtureId
    );

    res.status(200).json({
      success: true,
      result
    });

  } catch (err) {
    next(err);
  }
};
