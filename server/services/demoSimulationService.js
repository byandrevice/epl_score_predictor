// services/demoSimulationService.js

const Fixture = require("../models/Fixture");
const Prediction = require("../models/Prediction");

const { calculatePoints } = require("./scoringService");

// ------------------------------------
// Create a new fixture for the demo
// ------------------------------------
exports.createFixture = async (fixtureData) => {

  const fixture = await Fixture.create(fixtureData);

  return fixture;
};

// ------------------------------------
// Lock fixture
// After this, users cannot submit
// predictions anymore
// ------------------------------------
exports.lockFixture = async (fixtureId) => {

  const fixture = await Fixture.findById(fixtureId);

  if (!fixture) {
    throw new Error("Fixture not found");
  }

  fixture.locked = true;

  await fixture.save();

  return fixture;
};

// ------------------------------------
// Enter final match score
// Example:
// Arsenal 2 - 1 Chelsea
// ------------------------------------
exports.setFinalScore = async (
  fixtureId,
  finalHomeScore,
  finalAwayScore
) => {

  const fixture = await Fixture.findById(fixtureId);

  if (!fixture) {
    throw new Error("Fixture not found");
  }

  fixture.finalHomeScore = finalHomeScore;
  fixture.finalAwayScore = finalAwayScore;

  await fixture.save();

  return fixture;
};

// ------------------------------------
// Calculate points for all predictions
// after match is completed
// ------------------------------------
exports.calculatePoints = async (fixtureId) => {

  const fixture = await Fixture.findById(fixtureId);

  if (!fixture) {
    throw new Error("Fixture not found");
  }

  // Make sure final score exists
  if (
    fixture.finalHomeScore === null ||
    fixture.finalAwayScore === null
  ) {
    throw new Error("Final score has not been entered");
  }

  // Find everyone who predicted this match
  const predictions = await Prediction.find({
    fixture: fixtureId
  });

  // Calculate points for each prediction
  for (const prediction of predictions) {

    const points = calculatePoints(
      prediction,
      fixture.finalHomeScore,
      fixture.finalAwayScore
    );

    prediction.pointsAwarded = points;

    await prediction.save();
  }

  return {
    fixtureId,
    predictionsUpdated: predictions.length
  };
};