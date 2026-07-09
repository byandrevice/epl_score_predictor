// Prediction endpoints. TODO(Gia): implement using models/Prediction.
const Prediction = require("../models/Prediction");
const Fixture = require("../models/Fixture");

exports.submit = async (req, res, next) => {
  // TODO: upsert prediction for req.user; reject if fixture is locked / past kickoff
  try {
    const userId = req.user.id; // set by the auth middleware after verifying the JWT - never trust a userId from the body
    const { fixtureId, homeScore, awayScore } = req.body;

    if (fixtureId === undefined || homeScore === undefined || awayScore === undefined) {
      return res.status(400).json({ success: false, message: "fixturedId, homeScore, awayScore are required." });
    }
    
    const home = Number(homeScore);
    const away = Number(awayScore);
    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) {
      return res.status(400).json({ success: false, message: "Score must be non-negative whole numbers." });
    }

    const fixture = await Fixture.findById(fixtureId);
    if (!fixture) {
      return res.status(404).json({ success: false, message: "Fixture not found." });
    }

    if (fixture.locked || fixture.kickoff.getTime() <= Date.now()) {
      return res.status(403).json({ success: false, message: "Prediction are closed for this fixture."});
    }

    // upsert: update if this user already predicted this fixture, otherwise create a new one
    const prediction = await Prediction.findOneAndUpdate(
      { user: userId, fixture: fixtureId },
      { user: userId, fixture: fixtureId, homeScore: home, awayScore: away},
      { new: true, upsert: true, setDefaultsOnInsert: true}
    );

    return res.status(200).json({
      success: true,
      message: "Prediction saved.",
      prediction: {
        id: prediction._id.toString(),
        fixtureId: prediction.fixture.toString(), // still just an ObjectId here, not a full fixture
        homeScore: prediction.homScore,
        awayScore: prediction.awayScore,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMine = async (req, res) => {
  // TODO: return the logged-in user's predictions
  try {
    // get every prediction belonging to the logged-in user,
    // .populate("fixture") swaps the stored fixture ID for the real Fixture document
    const predictions = await Prediction.find({ user: req.user.id }).populate("fixture");

    return res.status(200).json(
      predictions.map((p) => ({
        id: p._id.toString(),
        fixtureId: p.fixture._id.toString(), // available because of populate()
        homeScore: p.homeScore,
        awayScore: p.awayScore,
        pointsAwarded: p.pointsAwarded, // ) until a fixture is graded
      }))
    );
  } catch (err) {
    next(err);
  }
};
