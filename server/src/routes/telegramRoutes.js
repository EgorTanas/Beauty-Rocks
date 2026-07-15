const express = require('express');
const { handleTelegramWebhook } = require('../controllers/telegramController');

const router = express.Router();

router.post('/', handleTelegramWebhook);

module.exports = router;
