const express = require('express');
const router = express.Router();

const {
  getAllTeamMembersAdmin,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  toggleTeamMemberActive,
  toggleTeamHomepage,
  uploadTeamAvatar,
} = require('../../controllers/teamController');

const { uploadSingle } = require('../../middleware/uploadMiddleware');

// GET /api/admin/team             
router.get('/', getAllTeamMembersAdmin);

// POST /api/admin/team/upload-image 
router.post('/upload-image', uploadSingle('image', 'staff'), uploadTeamAvatar);

// POST /api/admin/team            
router.post('/', createTeamMember);

// PUT /api/admin/team/:id         
router.put('/:id', updateTeamMember);

// DELETE /api/admin/team/:id       
router.delete('/:id', deleteTeamMember);

// PATCH /api/admin/team/:id/toggle  
router.patch('/:id/toggle', toggleTeamMemberActive);

router.patch('/:id/homepage', toggleTeamHomepage);

module.exports = router;