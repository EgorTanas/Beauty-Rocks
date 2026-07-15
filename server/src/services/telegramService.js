const axios = require('axios');
const Appointment = require('../models/Appointment');

const TELEGRAM_API_BASE = 'https://api.telegram.org';
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET?.trim() || '';

const isEnabled = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  return Boolean(token && chatId);
};

const log = (level, message, meta = {}) => {
  const payload = { scope: 'telegram', message, ...meta };
  if (level === 'error') console.error(JSON.stringify(payload));
  else console.log(JSON.stringify({ level, ...payload }));
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const sendTelegramMessage = async (text, options = {}) => {
  if (!isEnabled()) {
    return { ok: false, skipped: true, reason: 'missing_configuration' };
  }

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN.trim();
    const chatId = options.chatId || process.env.TELEGRAM_CHAT_ID.trim();
    const response = await axios.post(
      `${TELEGRAM_API_BASE}/bot${token}/sendMessage`,
      {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: options.reply_markup,
      },
      { timeout: 10000 }
    );

    log('info', 'Telegram success', { chatId, messageId: response.data?.result?.message_id });
    return {
      ok: true,
      data: response.data?.result,
    };
  } catch (error) {
    log('error', 'Telegram failure', {
      error: error?.response?.data?.description || error?.message || 'Telegram request failed',
    });
    return {
      ok: false,
      skipped: false,
      error: error?.response?.data?.description || error?.message || 'Telegram request failed',
    };
  }
};

const editTelegramMessage = async ({ chatId, messageId, text, reply_markup }) => {
  if (!isEnabled() || !chatId || !messageId) {
    return { ok: false, skipped: true, reason: 'missing_configuration_or_message' };
  }

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN.trim();
    const response = await axios.post(
      `${TELEGRAM_API_BASE}/bot${token}/editMessageText`,
      {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup,
      },
      { timeout: 10000 }
    );
    log('info', 'Telegram message edited', { chatId, messageId });
    return { ok: true, data: response.data?.result };
  } catch (error) {
    log('error', 'Telegram edit failure', {
      error: error?.response?.data?.description || error?.message || 'Telegram edit failed',
    });
    return {
      ok: false,
      error: error?.response?.data?.description || error?.message || 'Telegram edit failed',
    };
  }
};

const answerCallbackQuery = async ({ callbackQueryId, text, show_alert = false }) => {
  if (!isEnabled() || !callbackQueryId) {
    return { ok: false, skipped: true };
  }

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN.trim();
    await axios.post(
      `${TELEGRAM_API_BASE}/bot${token}/answerCallbackQuery`,
      { callback_query_id: callbackQueryId, text, show_alert },
      { timeout: 10000 }
    );
    return { ok: true };
  } catch (error) {
    log('error', 'Telegram callback answer failure', {
      error: error?.response?.data?.description || error?.message || 'Callback answer failed',
    });
    return { ok: false, error: error?.response?.data?.description || error?.message || 'Callback answer failed' };
  }
};

const formatDate = (date) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));

const formatTime = (time) => time || '—';

let notificationService;
const getNotificationService = () => {
  if (!notificationService) {
    notificationService = require('./notificationService');
  }
  return notificationService;
};

const buildBookingMessage = (appointment, user) => {
  const lines = [
    '💅 <b>New Booking</b>',
    `Booking ID: <code>${escapeHtml(appointment._id)}</code>`,
    `Client: ${escapeHtml(user?.username || 'Unknown')}`,
    `Phone: ${escapeHtml(user?.phone || 'N/A')}`,
    `Email: ${escapeHtml(user?.email || 'N/A')}`,
    `Service: ${escapeHtml(appointment.service?.name || 'N/A')}`,
    `Specialist: ${escapeHtml(appointment.teamMember?.name || 'N/A')}`,
    `Date: ${escapeHtml(formatDate(appointment.date))}`,
    `Time: ${escapeHtml(formatTime(appointment.startTime))}`,
    `Notes: ${escapeHtml(appointment.notes || 'No notes')}`,
    `Status: ${escapeHtml(appointment.status || 'pending')}`,
  ];
  return lines.join('\n');
};

const buildStatusMessage = (title, appointment, user, extraLines = []) => {
  const lines = [
    title,
    `Booking ID: <code>${escapeHtml(appointment._id)}</code>`,
    `Client: ${escapeHtml(user?.username || 'Unknown')}`,
    `Phone: ${escapeHtml(user?.phone || 'N/A')}`,
    `Email: ${escapeHtml(user?.email || 'N/A')}`,
    `Service: ${escapeHtml(appointment.service?.name || 'N/A')}`,
    `Specialist: ${escapeHtml(appointment.teamMember?.name || 'N/A')}`,
    `Date: ${escapeHtml(formatDate(appointment.date))}`,
    `Time: ${escapeHtml(formatTime(appointment.startTime))}`,
    `Notes: ${escapeHtml(appointment.notes || 'No notes')}`,
    ...extraLines,
  ];
  return lines.join('\n');
};

const buildInlineKeyboard = (appointmentId) => ({
  inline_keyboard: [
    [
      { text: '✅ Confirm', callback_data: `booking:confirm:${appointmentId}` },
      { text: '❌ Cancel', callback_data: `booking:cancel:${appointmentId}` },
    ],
    [
      { text: '📅 Reschedule', callback_data: `booking:reschedule:${appointmentId}` },
    ],
  ],
});

const listAppointmentsForDate = async (dateOffsetDays = 0, statusFilter = null) => {
  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  dayStart.setUTCDate(dayStart.getUTCDate() + dateOffsetDays);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const query = {
    date: { $gte: dayStart, $lt: dayEnd },
  };

  if (statusFilter) {
    query.status = statusFilter;
  } else {
    query.status = { $in: ['pending', 'confirmed'] };
  }

  return Appointment.find(query)
    .populate('service', 'name')
    .populate('teamMember', 'name')
    .populate('user', 'username phone email')
    .sort({ startTime: 1 });
};

const getDashboardSummary = async () => {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);
  const dayAfterTomorrowStart = new Date(tomorrowStart);
  dayAfterTomorrowStart.setUTCDate(dayAfterTomorrowStart.getUTCDate() + 1);

  const [todayCount, tomorrowCount, pendingCount, confirmedCount, completedCount, cancelledCount] = await Promise.all([
    Appointment.countDocuments({ date: { $gte: todayStart, $lt: tomorrowStart } }),
    Appointment.countDocuments({ date: { $gte: tomorrowStart, $lt: dayAfterTomorrowStart } }),
    Appointment.countDocuments({ status: 'pending' }),
    Appointment.countDocuments({ status: 'confirmed' }),
    Appointment.countDocuments({ status: 'completed' }),
    Appointment.countDocuments({ status: 'cancelled' }),
  ]);

  return {
    todayCount,
    tomorrowCount,
    pendingCount,
    confirmedCount,
    completedCount,
    cancelledCount,
  };
};

const buildAppointmentsList = async (dateOffsetDays, label) => {
  const appointments = await listAppointmentsForDate(dateOffsetDays);
  if (!appointments.length) {
    return `${label}\nNo bookings found.`;
  }

  const lines = appointments.map((a) => `${a.startTime} ${a.user?.username || 'Unknown'} · ${a.service?.name || 'N/A'} · ${a.teamMember?.name || 'N/A'}`);
  return `${label}\n${lines.join('\n')}`;
};

const buildStatusList = async (status, label) => {
  const appointments = await Appointment.find({ status })
    .populate('service', 'name')
    .populate('teamMember', 'name')
    .populate('user', 'username')
    .sort({ date: 1, startTime: 1 });

  if (!appointments.length) {
    return `${label}\nNo bookings found.`;
  }

  const lines = appointments.map(
    (a) => `${formatDate(a.date)} ${a.startTime} · ${a.user?.username || 'Unknown'} · ${a.service?.name || 'N/A'} · ${a.teamMember?.name || 'N/A'}`
  );
  return `${label}\n${lines.join('\n')}`;
};

const buildStatsMessage = async () => {
  const summary = await getDashboardSummary();
  return [
    '📊 <b>Salon Stats</b>',
    `Today: ${summary.todayCount}`,
    `Tomorrow: ${summary.tomorrowCount}`,
    `Pending: ${summary.pendingCount}`,
    `Confirmed: ${summary.confirmedCount}`,
    `Completed: ${summary.completedCount}`,
    `Cancelled: ${summary.cancelledCount}`,
  ].join('\n');
};

const handleCallbackQuery = async (update) => {
  const callback = update.callback_query;
  if (!callback?.data) return { ok: false };

  const parts = callback.data.split(':');
  if (parts.length !== 3 || parts[0] !== 'booking') return { ok: false };

  const [, action, appointmentId] = parts;
  if (!appointmentId || !/^[a-f\d]{24}$/i.test(appointmentId)) {
    return { ok: false, error: 'Invalid appointment id' };
  }

  const appointment = await Appointment.findById(appointmentId)
    .populate('service', 'name')
    .populate('teamMember', 'name')
    .populate('user', 'username email phone');

  if (!appointment) {
    await answerCallbackQuery({ callbackQueryId: callback.id, text: 'Booking not found.', show_alert: true });
    return { ok: false, error: 'Booking not found' };
  }

  if (action === 'reschedule') {
    appointment.notes = `${appointment.notes ? `${appointment.notes}\n` : ''}Reschedule requested by admin via Telegram.`;
    appointment.status = 'pending';
    await appointment.save();
    await answerCallbackQuery({ callbackQueryId: callback.id, text: 'Reschedule requested.' });
    void getNotificationService().notifyBookingStatus(String(appointment._id), 'rescheduled', {
      emailHtml: 'An admin requested a reschedule. Our team will contact you with the next available time.',
      telegramLines: ['Action: Reschedule requested by admin'],
    });
    return { ok: true, action: 'reschedule' };
  }

  if (action === 'confirm') {
    if (appointment.status === 'confirmed') {
      await answerCallbackQuery({ callbackQueryId: callback.id, text: 'Already confirmed.' });
      return { ok: true, action: 'confirm', unchanged: true };
    }
    appointment.status = 'confirmed';
    await appointment.save();
    await answerCallbackQuery({ callbackQueryId: callback.id, text: 'Booking confirmed.' });
    void getNotificationService().notifyBookingStatus(String(appointment._id), 'confirmed');
    return { ok: true, action: 'confirm' };
  }

  if (action === 'cancel') {
    if (appointment.status === 'cancelled') {
      await answerCallbackQuery({ callbackQueryId: callback.id, text: 'Already cancelled.' });
      return { ok: true, action: 'cancel', unchanged: true };
    }
    appointment.status = 'cancelled';
    await appointment.save();
    await answerCallbackQuery({ callbackQueryId: callback.id, text: 'Booking cancelled.' });
    void getNotificationService().notifyBookingStatus(String(appointment._id), 'cancelled');
    return { ok: true, action: 'cancel' };
  }

  return { ok: false, error: 'Unknown action' };
};

const handleTelegramUpdate = async (update) => {
  if (!update) return { ok: false };

  if (update.callback_query) {
    return handleCallbackQuery(update);
  }

  const message = update.message;
  const text = String(message?.text || '').trim();
  const chatId = String(message?.chat?.id || '');
  if (!text || !chatId) return { ok: false };

  if (text === '/start' || text === '/help') {
    return sendTelegramMessage(
      [
        '💅 <b>Beauty Rocks Assistant</b>',
        'Commands:',
        '/today - today\'s bookings',
        '/tomorrow - tomorrow\'s bookings',
        '/pending - pending bookings',
        '/confirmed - confirmed bookings',
        '/completed - completed bookings',
        '/cancelled - cancelled bookings',
        '/stats - salon stats',
        '/revenue - revenue summary',
        '/help - show this message',
      ].join('\n'),
      { chatId }
    );
  }

  if (text === '/today') return sendTelegramMessage(await buildAppointmentsList(0, "📅 <b>Today's bookings</b>"), { chatId });
  if (text === '/tomorrow') return sendTelegramMessage(await buildAppointmentsList(1, '📅 <b>Tomorrow</b>'), { chatId });
  if (text === '/pending') return sendTelegramMessage(await buildStatusList('pending', '🟠 <b>Pending bookings</b>'), { chatId });
  if (text === '/confirmed') return sendTelegramMessage(await buildStatusList('confirmed', '🟢 <b>Confirmed bookings</b>'), { chatId });
  if (text === '/completed') return sendTelegramMessage(await buildStatusList('completed', '✅ <b>Completed bookings</b>'), { chatId });
  if (text === '/cancelled') return sendTelegramMessage(await buildStatusList('cancelled', '❌ <b>Cancelled bookings</b>'), { chatId });
  if (text === '/stats') return sendTelegramMessage(await buildStatsMessage(), { chatId });
  if (text === '/revenue') {
    const completed = await Appointment.find({ status: 'completed' }).populate('service', 'price');
    const revenue = completed.reduce((sum, appt) => sum + Number(appt.service?.price || 0), 0);
    return sendTelegramMessage(`💰 <b>Revenue summary</b>\nCompleted appointments revenue: $${revenue.toFixed(2)}`, { chatId });
  }

  return sendTelegramMessage('Unknown command. Use /help.', { chatId });
};

module.exports = {
  TELEGRAM_WEBHOOK_SECRET,
  buildBookingMessage,
  buildInlineKeyboard,
  buildStatusMessage,
  editTelegramMessage,
  listAppointmentsForDate,
  answerCallbackQuery,
  handleTelegramUpdate,
  isEnabled,
  sendTelegramMessage,
  escapeHtml,
};
