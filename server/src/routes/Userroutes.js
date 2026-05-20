const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

const {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  getMyAppointments,
  getAppointmentStats,
  changePassword,
  deleteAccount,
} = require('../controllers/UserController');

router.use(protect);

router.get('/profile', getProfile);

router.patch('/profile', updateProfile);

router.post('/avatar', uploadSingle('avatar', 'default'), uploadAvatar);

router.delete('/avatar', deleteAvatar);

router.get('/appointments/stats', getAppointmentStats); 
router.get('/appointments', getMyAppointments);

router.patch('/password', changePassword);

router.delete('/account', deleteAccount);

module.exports = router;
