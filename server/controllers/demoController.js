// Demo simulation flow: admin creates a fixture -> users predict -> lock ->
// enter final score -> calculate points -> update leaderboard.
// TODO(Gia): implement using services/demoSimulationService.

const demoSimulationService = require("../services/demoSimulationService");

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
exports.setFinalScore = async (req, res, next) => {
  try {

    const {
      fixtureId,
      finalHomeScore,
      finalAwayScore
    } = req.body;

    const fixture = await demoSimulationService.setFinalScore(
      fixtureId,
      finalHomeScore,
      finalAwayScore
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
