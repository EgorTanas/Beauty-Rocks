const { Resend } = require('resend');
const { BRAND } = require('../config/brand');
const { buildCalendarAttachment } = require('../utils/calendar');

const isResendEnabled = () => Boolean(process.env.RESEND_API_KEY?.trim());
const isEnabled = () => isResendEnabled();

const log = (level, message, meta = {}) => {
  const payload = { scope: 'email', message, ...meta };
  if (level === 'error') console.error(JSON.stringify(payload));
  else console.log(JSON.stringify({ level, ...payload }));
};

const withTimeout = async (promise, timeoutMs, label) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
};

const createResendClient = () => {
  if (!isResendEnabled()) return null;
  return new Resend(process.env.RESEND_API_KEY.trim());
};

const verifyTransporter = async () => {
  if (!isResendEnabled()) {
    return { ok: false, skipped: true, reason: 'missing_configuration' };
  }

  try {
    const client = createResendClient();
    log('info', 'Resend verify started', { provider: 'resend' });
    const result = await withTimeout(
      client.domains.list(),
      Number(process.env.RESEND_VERIFY_TIMEOUT_MS) || 10000,
      'Resend verify'
    );
    if (result?.error) {
      throw new Error(result.error.message || 'Resend verification failed');
    }
    log('info', 'Resend authentication verified', { provider: 'resend', result });
    return { ok: true, provider: 'resend', result };
  } catch (error) {
    log('error', 'Resend authentication failed', {
      provider: 'resend',
      code: error?.code || null,
      command: error?.command || null,
      response: error?.response || null,
      stack: error?.stack || null,
      error: error?.message || 'Resend verify failed',
    });
    return { ok: false, error: error?.message || 'Resend verify failed' };
  }
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDate = (date) =>
  new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));

const baseLayout = ({ title, eyebrow, body, ctaLabel, ctaUrl, footer }) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body { margin: 0; background: #f7f1ef; font-family: Arial, Helvetica, sans-serif; }
        .shell { width: 100%; padding: 32px 16px; box-sizing: border-box; }
        .card { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(82, 39, 24, 0.12); }
        .hero { background: linear-gradient(135deg, #1f1715 0%, #7f5b45 100%); color: #fff; padding: 34px 34px 28px; }
        .brand { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; }
        .brand img { width: 56px; height: 56px; object-fit: cover; border-radius: 16px; background: rgba(255,255,255,.12); }
        .brand .fallback { width: 56px; height: 56px; border-radius: 16px; background: rgba(255,255,255,.12); display: flex; align-items: center; justify-content: center; font-weight: 800; letter-spacing: .14em; }
        .hero h1 { margin: 0; font-size: 30px; line-height: 1.1; }
        .hero p { margin: 8px 0 0; color: rgba(255,255,255,.82); }
        .content { padding: 34px; color: #2a201d; line-height: 1.7; font-size: 15px; }
        .details { width: 100%; border-collapse: collapse; margin: 22px 0; }
        .details td { padding: 11px 0; border-bottom: 1px solid #eee2dc; vertical-align: top; }
        .label { color: #8a6b5d; width: 170px; padding-right: 16px; font-size: 13px; text-transform: uppercase; letter-spacing: .08em; }
        .value { font-weight: 600; color: #2a201d; }
        .status { display: inline-block; margin-top: 6px; padding: 8px 14px; border-radius: 999px; background: #f3e5dd; color: #7a4e3d; font-weight: 700; }
        .cta { display: inline-block; margin-top: 10px; background: linear-gradient(135deg, #caa27f 0%, #8f6248 100%); color: #fff !important; text-decoration: none; font-weight: 700; padding: 14px 24px; border-radius: 999px; }
        .footer { background: #fcf8f5; padding: 22px 34px 30px; color: #7f6d66; font-size: 13px; }
        .footer a { color: #8f6248; text-decoration: none; }
        .social { margin-top: 14px; display: flex; flex-wrap: wrap; gap: 12px; }
        .social a { display: inline-block; padding: 7px 12px; border-radius: 999px; background: #fff; border: 1px solid #ead9cf; }
        @media (max-width: 560px) {
          .content, .hero, .footer { padding-left: 20px; padding-right: 20px; }
          .label { width: 120px; }
          .hero h1 { font-size: 24px; }
        }
      </style>
    </head>
    <body>
      <div class="shell">
        <div class="card">
          <div class="hero">
            <div class="brand">
              ${
                BRAND.logoUrl
                  ? `<img src="${escapeHtml(BRAND.logoUrl)}" alt="${escapeHtml(BRAND.shortName)} logo" />`
                  : `<div class="fallback">BR</div>`
              }
              <div>
                <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.8;">${escapeHtml(BRAND.shortName)}</div>
                <h1>${escapeHtml(title)}</h1>
              </div>
            </div>
            <p>${escapeHtml(eyebrow)}</p>
          </div>
          <div class="content">
            ${body}
            ${ctaLabel && ctaUrl ? `<a class="cta" href="${escapeHtml(ctaUrl)}">${escapeHtml(ctaLabel)}</a>` : ''}
          </div>
          <div class="footer">
            <div><strong>${escapeHtml(BRAND.name)}</strong></div>
            <div>${escapeHtml(BRAND.address)}</div>
            <div>Phone: <a href="tel:${escapeHtml(BRAND.phone)}">${escapeHtml(BRAND.phone)}</a></div>
            <div>Email: <a href="mailto:${escapeHtml(BRAND.email)}">${escapeHtml(BRAND.email)}</a></div>
            <div class="social">
              <a href="${escapeHtml(BRAND.websiteUrl)}">Website</a>
              <a href="${escapeHtml(BRAND.instagramUrl)}">Instagram</a>
              <a href="${escapeHtml(BRAND.facebookUrl)}">Facebook</a>
              <a href="${escapeHtml(BRAND.tiktokUrl)}">TikTok</a>
            </div>
            <div style="margin-top:14px;">${escapeHtml(footer || `© ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.`)}</div>
          </div>
        </div>
      </div>
    </body>
  </html>
`;

const retry = async (fn, { attempts = 3, delayMs = 300 } = {}) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  throw lastError;
};

const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  if (!isEnabled()) {
    log('info', 'Email skipped', { reason: 'missing_configuration', to, subject });
    return { ok: false, skipped: true, reason: 'missing_configuration' };
  }

  try {
    const client = createResendClient();
    const plainText = text || html.replace(/<[^>]*>/g, '');
    const from =
      process.env.RESEND_FROM ||
      `${BRAND.shortName} <${process.env.RESEND_FROM_ADDRESS || 'onboarding@resend.dev'}>`;

    const resendAttachments = attachments.map((attachment) => ({
      filename: attachment.filename,
      content: attachment.content,
      contentType: attachment.contentType,
    }));

    log('info', 'Email send started', { to, subject, from, provider: 'resend' });
    log('info', 'Resend send started', { to, subject, provider: 'resend' });

    const result = await retry(async () => {
      const response = await withTimeout(
        client.emails.send({
          from,
          to,
          subject,
          html,
          text: plainText,
          attachments: resendAttachments,
        }),
        Number(process.env.RESEND_SEND_TIMEOUT_MS) || 20000,
        'Resend send'
      );

      log('info', 'Resend send completed', {
        to,
        subject,
        messageId: response?.id || response?.data?.id || null,
        accepted: [to],
        rejected: [],
        response,
      });

      return response;
    });

    const messageId = result?.id || result?.data?.id || null;
    log('info', 'Email sent successfully', { to, subject, messageId, provider: 'resend' });
    return { ok: true, data: result };
  } catch (error) {
    log('error', 'Email failure', {
      to,
      subject,
      provider: 'resend',
      code: error?.code || null,
      command: error?.command || null,
      response: error?.response || null,
      stack: error?.stack || null,
      error: error?.message || 'Email send failed',
    });
    return { ok: false, error: error?.message || 'Email send failed' };
  }
};

const formatAppointmentDetails = (appointment) => ({
  clientName: appointment.user?.username || 'Unknown',
  clientEmail: appointment.user?.email || '',
  clientPhone: appointment.user?.phone || 'N/A',
  serviceName: appointment.service?.name || 'N/A',
  specialistName: appointment.teamMember?.name || 'N/A',
  dateLabel: formatDate(appointment.date),
  timeLabel: appointment.startTime || '—',
  statusLabel: appointment.status || 'pending',
});

const renderAppointmentTable = (appointment) => {
  const d = formatAppointmentDetails(appointment);
  return `
    <table class="details" role="presentation">
      <tr><td class="label">Service</td><td class="value">${escapeHtml(d.serviceName)}</td></tr>
      <tr><td class="label">Specialist</td><td class="value">${escapeHtml(d.specialistName)}</td></tr>
      <tr><td class="label">Date</td><td class="value">${escapeHtml(d.dateLabel)}</td></tr>
      <tr><td class="label">Time</td><td class="value">${escapeHtml(d.timeLabel)}</td></tr>
      <tr><td class="label">Booking status</td><td class="value"><span class="status">${escapeHtml(d.statusLabel)}</span></td></tr>
      <tr><td class="label">Phone</td><td class="value">${escapeHtml(d.clientPhone)}</td></tr>
      <tr><td class="label">Email</td><td class="value">${escapeHtml(d.clientEmail)}</td></tr>
    </table>
  `;
};

const bookingCreatedEmail = (appointment) => {
  const d = formatAppointmentDetails(appointment);
  return {
    subject: 'Your Beauty Rocks booking has been received',
    html: baseLayout({
      title: 'Booking received',
      eyebrow: 'We are preparing your visit with care',
      body: `
        <p>Hello <strong>${escapeHtml(d.clientName)}</strong>,</p>
        <p>Thank you for booking with Beauty Rocks. Here is your appointment confirmation.</p>
        ${renderAppointmentTable(appointment)}
        <p>We look forward to welcoming you to the studio.</p>
      `,
      ctaLabel: 'View my bookings',
      ctaUrl: `${process.env.CLIENT_URL || BRAND.websiteUrl}/profile`,
      footer: 'If you need to change anything, reply to this email or contact the studio.',
    }),
    attachments: [buildCalendarAttachment(appointment)],
  };
};

const bookingStatusEmail = (appointment, title, eyebrow, extraHtml, subject) => {
  const d = formatAppointmentDetails(appointment);
  return {
    subject,
    html: baseLayout({
      title,
      eyebrow,
      body: `
        <p>Hello <strong>${escapeHtml(d.clientName)}</strong>,</p>
        <p>${extraHtml}</p>
        ${renderAppointmentTable(appointment)}
      `,
      ctaLabel: 'View my bookings',
      ctaUrl: `${process.env.CLIENT_URL || BRAND.websiteUrl}/profile`,
      footer: 'You can manage your appointment anytime from your profile page.',
    }),
  };
};

const rescheduleRequestEmail = (appointment, token) => {
  const d = formatAppointmentDetails(appointment);
  const rescheduleUrl = `${process.env.CLIENT_URL || BRAND.websiteUrl}/reschedule/${token}`;
  return {
    subject: 'We sincerely apologize — we need to reschedule your appointment',
    html: baseLayout({
      title: 'We need to reschedule',
      eyebrow: 'A secure link is ready for you',
      body: `
        <p>Dear <strong>${escapeHtml(d.clientName)}</strong>,</p>
        <p>We sincerely apologize, but due to an unexpected scheduling issue we are unfortunately unable to keep your appointment at the originally scheduled date and time.</p>
        <p>We completely understand that this may be inconvenient and we truly appreciate your understanding.</p>
        <p>To make the process as simple as possible, we have reserved a secure page where you can choose another available appointment that works best for you.</p>
        <table class="details" role="presentation">
          <tr><td class="label">Service</td><td class="value">${escapeHtml(d.serviceName)}</td></tr>
          <tr><td class="label">Specialist</td><td class="value">${escapeHtml(d.specialistName)}</td></tr>
          <tr><td class="label">Date</td><td class="value">${escapeHtml(d.dateLabel)}</td></tr>
          <tr><td class="label">Time</td><td class="value">${escapeHtml(d.timeLabel)}</td></tr>
        </table>
        <p>Please click the button below to choose another available time.</p>
      `,
      ctaLabel: 'Choose New Appointment',
      ctaUrl: rescheduleUrl,
      footer: 'This secure link will remain valid for 24 hours. If you have any questions, please contact Beauty Rocks directly. Thank you for your patience and understanding. Beauty Rocks Team',
    }),
  };
};

const buildReminderBody = (appointment, reminderLabel) => {
  const d = formatAppointmentDetails(appointment);
  return baseLayout({
    title: `${reminderLabel} reminder`,
    eyebrow: 'Your Beauty Rocks visit is coming up',
    body: `
      <p>Hello <strong>${escapeHtml(d.clientName)}</strong>,</p>
      <p>This is a friendly reminder for your upcoming appointment.</p>
      ${renderAppointmentTable(appointment)}
      <p>Please arrive a few minutes early if possible. We will be ready for you.</p>
    `,
    ctaLabel: 'View my bookings',
    ctaUrl: `${process.env.CLIENT_URL || BRAND.websiteUrl}/profile`,
    footer: 'If you can no longer make it, please contact the studio as soon as possible.',
  });
};

const reminderEmail = (appointment, reminderLabel = '24-hour') => ({
  subject: `Reminder: your Beauty Rocks appointment in ${reminderLabel === '2-hour' ? '2 hours' : '24 hours'}`,
  html: buildReminderBody(appointment, reminderLabel),
  attachments: [buildCalendarAttachment(appointment)],
});

const summaryEmail = ({ title, eyebrow, body, subject }) => ({
  subject,
  html: baseLayout({
    title,
    eyebrow,
    body,
    footer: 'This is an operational summary for the Beauty Rocks team.',
  }),
});

module.exports = {
  bookingCreatedEmail,
  bookingStatusEmail,
  buildReminderBody,
  reminderEmail,
  rescheduleRequestEmail,
  sendEmail,
  isEnabled,
  summaryEmail,
  verifyTransporter,
  withTimeout,
  createResendClient,
  isResendEnabled,
};
