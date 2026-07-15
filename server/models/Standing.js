const mongoose = require('mongoose');

const StandingSchema = new mongoose.Schema({
  teamName: String,
  crest: String, // Add this if you want crest URLs stored per team in standings
  played: Number,
  won: Number,
  drawn: Number,
  lost: Number,
  gf: Number,
  ga: Number,
  gd: Number,
  pts: Number,
  form: [String], // Array of strings (e.g., ["W", "D", "W", "L", "W"])
  trend: { type: String, enum: ['up', 'down', 'same'], default: 'same' },
  week: { type: String, required: true }, // e.g., "GW37"
  season: { type: String, default: "2025/26" }
});

module.exports = mongoose.model('Standing', StandingSchema);