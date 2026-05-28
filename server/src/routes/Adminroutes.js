const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(protect);
router.use(restrictTo('admin'));

// Admin services routes
const adminServicesRouter = require('./admin/Adminserviceroutes');
router.use('/services', adminServicesRouter);

// Admin team routes
const adminTeamRouter = require('./admin/Adminteamroutes');
router.use('/team', adminTeamRouter);

// Admin appointment routes
const adminAppointmentRouter = require('./admin/adminAppointmentRoutes');
router.use('/appointments', adminAppointmentRouter);

const { updateSiteSettings } = require('../controllers/siteSettingsController');
router.put('/site-settings', updateSiteSettings);

module.exports = router;