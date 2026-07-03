const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fixture: { type: mongoose.Schema.Types.ObjectId, ref: "Fixture", required: true },
    homeScore: { type: Number, required: true },
    awayScore: { type: Number, required: true },
    pointsAwarded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One prediction per user per fixture.
predictionSchema.index({ user: 1, fixture: 1 }, { unique: true });

module.exports = mongoose.model("Prediction", predictionSchema);
