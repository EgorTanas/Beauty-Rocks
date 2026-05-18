const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);
router.use(restrictTo('admin'));

const adminServicesRouter = require('./admin/adminServiceRoutes');
router.use('/services', adminServicesRouter);


module.exports = router;