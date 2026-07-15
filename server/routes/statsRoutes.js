// /server/routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const Standing = require('../models/Standing');

router.get('/table', async (req, res) => {
  try {
    const { week, season } = req.query;
    
    const queryWeek = week || 'GW38';
    
    // Convert incoming year strings to standard "YYYY/YY" season formats
    let querySeason = '2025/26';
    if (season === '2026') {
      querySeason = '2026/27';
    } else if (season === '2025') {
      querySeason = '2025/26';
    } else if (season === '2024') {
      querySeason = '2024/25';
    } else if (season) {
      querySeason = season; // Fallback if already formatted
    }

    console.log(`[API] Fetching table for Week: ${queryWeek}, Season: ${querySeason}`);

    const standings = await Standing.find({ week: queryWeek, season: querySeason })
      .sort({ pts: -1, gd: -1, gf: -1 });

    console.log(`[API] Found ${standings.length} team standings.`);

    const formattedTable = standings.map((doc, index) => ({
      pos: index + 1,
      name: doc.teamName,
      short: doc.teamName ? doc.teamName.substring(0, 3).toUpperCase() : "TEAM",
      crest: doc.crest || "⚽",
      played: doc.played || 0,
      won: doc.won || 0,
      drawn: doc.drawn || 0,
      lost: doc.lost || 0,
      gf: doc.gf || 0,
      ga: doc.ga || 0,
      gd: doc.gd || 0,
      pts: doc.pts || 0,
      form: doc.form || [],
      trend: doc.trend || "same"
    }));

    res.json(formattedTable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;