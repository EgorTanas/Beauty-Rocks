const { BRAND } = require('./brand');

const validateNotificationConfig = () => {
  const warnings = [];

  if (!process.env.CLIENT_URL) warnings.push('CLIENT_URL is missing; email buttons will fall back to localhost.');
  if (!process.env.RESEND_API_KEY) warnings.push('Email notifications are disabled until RESEND_API_KEY is configured.');
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    warnings.push('Telegram notifications are disabled until TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are configured.');
  }
  if (!process.env.BUSINESS_TIMEZONE) warnings.push(`BUSINESS_TIMEZONE is missing; using ${BRAND.timezone}.`);

  if (warnings.length) {
    console.log(JSON.stringify({ scope: 'config', message: 'Notification config validation', warnings }));
  } else {
    console.log(JSON.stringify({ scope: 'config', message: 'Notification config validation passed' }));
  }
};

module.exports = { validateNotificationConfig };
