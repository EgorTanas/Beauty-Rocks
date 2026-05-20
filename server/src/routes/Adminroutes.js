const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(protect);
router.use(restrictTo('admin'));

// Admin services routes
const adminServicesRouter = require('./admin/adminServiceRoutes');
router.use('/services', adminServicesRouter);

// Admin team routes
const adminTeamRouter = require('./admin/adminTeamRoutes');
router.use('/team', adminTeamRouter);

module.exports = router;