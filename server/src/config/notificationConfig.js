const { BRAND } = require('./brand');

const validateNotificationConfig = () => {
  const warnings = [];

  if (!process.env.CLIENT_URL) warnings.push('CLIENT_URL is missing; email buttons will fall back to localhost.');
  if (process.env.SMTP_HOST && !process.env.SMTP_PORT) warnings.push('SMTP_PORT is missing; defaulting to 587.');
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    warnings.push('Telegram notifications are disabled until TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are configured.');
  }
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    warnings.push('SMTP notifications are disabled until SMTP_HOST, SMTP_USER and SMTP_PASS are configured.');
  }
  if (!process.env.BUSINESS_TIMEZONE) warnings.push(`BUSINESS_TIMEZONE is missing; using ${BRAND.timezone}.`);

  if (warnings.length) {
    console.log(JSON.stringify({ scope: 'config', message: 'Notification config validation', warnings }));
  } else {
    console.log(JSON.stringify({ scope: 'config', message: 'Notification config validation passed' }));
  }
};

module.exports = { validateNotificationConfig };
