const { sendEmail, verifyTransporter, isResendEnabled } = require('../services/emailService');

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
    const verifyResult = await verifyTransporter();
    log('info', 'Debug verify completed', { verifyResult, to });

    log('info', 'Debug sendMail started', { to, subject, provider: isResendEnabled() ? 'resend' : 'smtp' });
    const info = await sendEmail({
      to,
      subject,
      text,
      html: `<p>${text}</p>`,
    });

    if (!info?.ok) {
      return res.status(500).json({
        ok: false,
        to,
        subject,
        error: info?.error || 'Email send failed',
      });
    }

    log('info', 'Debug sendMail completed', {
      to,
      subject,
      messageId: info.data?.id || info.data?.messageId || info.data?.message_id || null,
      accepted: info.data?.accepted || [to],
      rejected: info.data?.rejected || [],
      response: info.data?.response || info.data,
    });

    return res.json({
      ok: true,
      to,
      subject,
      messageId: info.data?.id || info.data?.messageId || info.data?.message_id || null,
      accepted: info.data?.accepted || [to],
      rejected: info.data?.rejected || [],
      response: info.data?.response || info.data,
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
