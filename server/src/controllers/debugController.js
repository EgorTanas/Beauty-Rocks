const nodemailer = require('nodemailer');
const { createTransporter, withTimeout } = require('../services/emailService');

const log = (level, message, meta = {}) => {
  const payload = { scope: 'debug-email', message, ...meta };
  if (level === 'error') console.error(JSON.stringify(payload));
  else console.log(JSON.stringify({ level, ...payload }));
};

const debugEmail = async (req, res) => {
  const to = String(req.body?.to || process.env.EMAIL_DEBUG_TO || process.env.SMTP_USER || '').trim();
  const subject = String(req.body?.subject || 'Beauty Rocks SMTP debug test').trim();
  const text = String(req.body?.text || 'Beauty Rocks SMTP debug test email.').trim();

  if (!to) {
    return res.status(400).json({ ok: false, message: 'Missing recipient email' });
  }

  try {
    const transporter = createTransporter();
    const transportConfig = {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS) || 10000,
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS) || 10000,
      socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS) || 10000,
    };

    log('info', 'Debug SMTP verify started', { transportConfig, to });
    const verifyResult = await withTimeout(
      transporter.verify(),
      Number(process.env.SMTP_VERIFY_TIMEOUT_MS) || 10000,
      'SMTP verify'
    );
    log('info', 'Debug SMTP verify completed', { verifyResult, to });

    log('info', 'Debug sendMail started', { to, subject, transportConfig });
    const info = await withTimeout(
      transporter.sendMail({
        from: process.env.SMTP_FROM || `"${process.env.EMAIL_FROM_NAME || 'Beauty Rocks'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html: `<p>${text}</p>`,
      }),
      Number(process.env.SMTP_SEND_TIMEOUT_MS) || 20000,
      'SMTP sendMail'
    );

    log('info', 'Debug sendMail completed', {
      to,
      subject,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

    return res.json({
      ok: true,
      to,
      subject,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });
  } catch (error) {
    log('error', 'Debug SMTP failed', {
      to,
      subject,
      code: error?.code || null,
      command: error?.command || null,
      response: error?.response || null,
      stack: error?.stack || null,
      error: error?.message || 'SMTP debug failed',
    });

    return res.status(500).json({
      ok: false,
      to,
      subject,
      error: error?.message || 'SMTP debug failed',
      code: error?.code || null,
      command: error?.command || null,
      response: error?.response || null,
    });
  }
};

module.exports = { debugEmail };
