const { TELEGRAM_WEBHOOK_SECRET, handleTelegramUpdate, isEnabled } = require('../services/telegramService');

const handleTelegramWebhook = async (req, res) => {
  try {
    if (TELEGRAM_WEBHOOK_SECRET) {
      const secret = req.get('x-telegram-bot-api-secret-token') || '';
      if (secret !== TELEGRAM_WEBHOOK_SECRET) {
        return res.status(403).json({ ok: false, message: 'Invalid webhook secret' });
      }
    }

    if (!isEnabled()) {
      return res.status(200).json({ ok: true, skipped: true, reason: 'telegram_disabled' });
    }

    await handleTelegramUpdate(req.body);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(JSON.stringify({ scope: 'telegram-webhook', message: 'Webhook received', error: error.message }));
    return res.status(200).json({ ok: false });
  }
};

module.exports = {
  handleTelegramWebhook,
};
