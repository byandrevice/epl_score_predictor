const express = require('express');
const router = express.Router();
const Standing = require('../models/Standing');

// GET request: /api/stats/table
router.get('/table', async (req, res) => {
  try {
    // Finds all standings, sorts by points descending (highest first)
    const table = await Standing.find({ season: "2025/26" }).sort({ pts: -1 });
    res.json(table);
  } catch (err) {
    res.status(500).json({ message: "Error fetching table" });
  }
});

module.exports = router;