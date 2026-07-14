const mongoose = require("mongoose");

const fixtureSchema = new mongoose.Schema(
  {
    externalId: { type: Number, unique: true, sparse: true }, // football-data.org match id, for safe re-imports
    home: { type: String, required: true },
    homeShort: { type: String },
    homeCrest: { type: String },
    away: { type: String, required: true },
    awayShort: { type: String },
    awayCrest: { type: String },
    date: { type: String }, // display date, e.g. "2026-05-18"
    time: { type: String }, // display time, e.g. "15:00"
    venue: { type: String },
    week: { type: String }, // e.g. "GW38"
    kickoff: { type: Date, required: true }, // used to lock predictions
    locked: { type: Boolean, default: false },
    finalHomeScore: { type: Number, default: null },
    finalAwayScore: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fixture", fixtureSchema);