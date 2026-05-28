const express = require('express');
const router = express.Router();
const { getPublicSiteSettings } = require('../controllers/siteSettingsController');

router.get('/', getPublicSiteSettings);

module.exports = router;
