// backend/models/Team.js
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  shortName: { type: String, required: true },
  stadium: { type: String, required: true },
  logoUrl: { type: String, required: true },
  manager: { type: String, default: "TBD" },
  primaryColor: { type: String, default: "#22c55e" }, 
  capacity: { type: String, default: "N/A" }, 
  topScorers: [Object],
  statsSummary: [Object]
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);