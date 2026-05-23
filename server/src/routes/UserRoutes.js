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
  getFavorites,
  addFavorite,
  removeFavorite,
} = require('../controllers/Usercontroller');

router.use(protect);

router.get('/profile', getProfile);

router.patch('/profile', updateProfile);

router.post('/avatar', uploadSingle('avatar', 'default'), uploadAvatar);

router.delete('/avatar', deleteAvatar);

router.get('/appointments/stats', getAppointmentStats); 
router.get('/appointments', getMyAppointments);

router.patch('/password', changePassword);

router.delete('/account', deleteAccount);

// ─── Favorites ───────────────────────────────────────────────────────────────
router.get('/favorites', getFavorites);
router.post('/favorites', addFavorite);
router.delete('/favorites/:serviceId', removeFavorite);

module.exports = router;
