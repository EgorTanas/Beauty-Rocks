const { TELEGRAM_WEBHOOK_SECRET, handleTelegramUpdate, isEnabled } = require('../services/telegramService');

const handleTelegramWebhook = async (req, res) => {
  try {
    const payload = req.body || {};
    const kind = payload.callback_query ? 'callback_query' : payload.message ? 'message' : 'other';
    console.log(JSON.stringify({ scope: 'telegram-webhook', message: 'Webhook received', kind }));

    if (TELEGRAM_WEBHOOK_SECRET) {
      const secret = req.get('x-telegram-bot-api-secret-token') || '';
      if (secret !== TELEGRAM_WEBHOOK_SECRET) {
        console.error(JSON.stringify({ scope: 'telegram-webhook', message: 'Invalid webhook secret' }));
        return res.status(403).json({ ok: false, message: 'Invalid webhook secret' });
      }
    }

    if (!isEnabled()) {
      return res.status(200).json({ ok: true, skipped: true, reason: 'telegram_disabled' });
    }

    const result = await handleTelegramUpdate(payload);
    console.log(JSON.stringify({ scope: 'telegram-webhook', message: 'Webhook processed', kind, result: result?.ok !== false }));
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(JSON.stringify({ scope: 'telegram-webhook', message: 'Webhook failed', error: error.message }));
    return res.status(200).json({ ok: false });
  }
};

module.exports = {
  handleTelegramWebhook,
};
