const axios = require('axios');

const TELEGRAM_API_BASE = 'https://api.telegram.org';

const hasTelegramConfig = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  return Boolean(token && chatId);
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const sendTelegramMessage = async (message) => {
  if (!hasTelegramConfig()) {
    return { ok: false, skipped: true, reason: 'missing_configuration' };
  }

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN.trim();
    const chatId = process.env.TELEGRAM_CHAT_ID.trim();

    await axios.post(
      `${TELEGRAM_API_BASE}/bot${token}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      },
      {
        timeout: 10000,
      }
    );

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      error: error?.response?.data?.description || error?.message || 'Telegram request failed',
    };
  }
};

module.exports = {
  escapeHtml,
  sendTelegramMessage,
};
