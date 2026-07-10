// backend/models/Team.js
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g., "ARS"
  name: { type: String, required: true },
  shortName: { type: String, required: true },
  stadium: { type: String, required: true },
  logoUrl: { type: String, required: true },
  // Adding UI fields required by your TeamProfilePage
  manager: { type: String, default: "TBD" },
  primaryColor: { type: String, default: "#22c55e" }, 
  capacity: { type: String, default: "N/A" }
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);