const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
// const { protect } = require('../middleware/authMiddleware'); // Add if you use auth tokens

// This matches teamApi.getTeamDetails(id) calling GET /api/teams/:id
router.get('/:id', teamController.getTeamProfile);

module.exports = router;