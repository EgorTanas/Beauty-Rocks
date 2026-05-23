const express = require('express');
const router = express.Router();

const {
  getTeamMembers,
  getTeamMemberById,
  checkAvailability,
} = require('../controllers/Teamcontroller');

// GET /api/team              
router.get('/', getTeamMembers);

// GET /api/team/:id          
router.get('/:id', getTeamMemberById);

// GET /api/team/:id/availability/:date 
router.get('/:id/availability/:date', checkAvailability);

module.exports = router;