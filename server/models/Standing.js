const mongoose = require('mongoose');

const StandingSchema = new mongoose.Schema({
  teamName: String,
  played: Number,
  won: Number,
  drawn: Number,
  lost: Number,
  gf: Number,
  ga: Number,
  gd: Number,
  pts: Number,
  season: { type: String, default: "2025/26" }
});

// IMPORTANT: Ensure you export it as a model
module.exports = mongoose.model('Standing', StandingSchema);