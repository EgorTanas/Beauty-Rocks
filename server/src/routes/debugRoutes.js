const express = require('express');
const { debugEmail } = require('../controllers/debugController');

const router = express.Router();

router.post('/email', debugEmail);

module.exports = router;
