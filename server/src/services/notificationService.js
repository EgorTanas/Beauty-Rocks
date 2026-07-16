const Appointment = require('../models/Appointment');
const TeamMember = require('../models/TeamMember');
const {
  bookingCreatedEmail,
  bookingStatusEmail,
  rescheduleRequestEmail,
  reminderEmail,
  sendEmail,
} = require('./emailService');
const {
  buildBookingMessage,
  buildInlineKeyboard,
  buildStatusMessage,
  editTelegramMessage,
  sendTelegramMessage,
  isEnabled: isTelegramEnabled,
} = require('./telegramService');

const log = (level, message, meta = {}) => {
  const payload = { scope: 'notifications', message, ...meta };
  if (level === 'error') console.error(JSON.stringify(payload));
  else console.log(JSON.stringify({ level, ...payload }));
};

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

const safeSendEmail = async (payload) =>
  retry(async () => {
    const result = await sendEmail(payload);
    if (result?.skipped) {
      return result;
    }
    if (!result?.ok) {
      throw new Error(result?.error || result?.reason || 'Email send failed');
    }
    return result;
  }).catch((error) => {
    log('error', 'Email notification failed after retries', { error: error.message, subject: payload.subject });
    return { ok: false, error: error.message };
  });

const safeSendTelegramMessage = async (text, options = {}) =>
  retry(async () => {
    const result = await sendTelegramMessage(text, options);
    if (result?.skipped) {
      return result;
    }
    if (!result?.ok) {
      throw new Error(result?.error || result?.reason || 'Telegram send failed');
    }
    return result;
  }).catch((error) => {
    log('error', 'Telegram notification failed after retries', { error: error.message });
    return { ok: false, error: error.message };
  });

const safeEditTelegramMessage = async (payload) =>
  retry(async () => {
    const result = await editTelegramMessage(payload);
    if (result?.skipped) {
      return result;
    }
    if (!result?.ok) {
      throw new Error(result?.error || result?.reason || 'Telegram edit failed');
    }
    return result;
  }).catch((error) => {
    log('error', 'Telegram edit failed after retries', { error: error.message });
    return { ok: false, error: error.message };
  });

const getAppointment = async (appointmentId) =>
  Appointment.findById(appointmentId)
    .select('+telegramMessageId +telegramChatId +reminder24hSentAt +reminder2hSentAt +rescheduleToken +rescheduleTokenExpiresAt +rescheduleTokenUsedAt')
    .populate('service', 'name price duration durationMinutes')
    .populate('teamMember', 'name role')
    .populate('user', 'username email phone');

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

const renderStatusEmail = (appointment, status, extra = {}) => {
  const title = {
    confirmed: 'Appointment confirmed',
    cancelled: 'Appointment cancelled',
    completed: 'Appointment completed',
    rescheduled: 'Appointment rescheduled',
  }[status];

  const eyebrow = {
    confirmed: 'Your booking has been approved',
    cancelled: 'We have updated your reservation',
    completed: 'Thank you for visiting Beauty Rocks',
    rescheduled: 'Your booking details changed',
  }[status];

  const message = {
    confirmed: 'Your appointment has been confirmed by our team.',
    cancelled: 'Your appointment has been cancelled. You can book another visit anytime.',
    completed: 'Thank you for visiting Beauty Rocks. We hope to see you again soon.',
    rescheduled: extra.emailHtml || 'Your appointment has been rescheduled.',
  }[status];

  return bookingStatusEmail(
    appointment,
    title,
    eyebrow,
    message,
    {
      confirmed: 'Your appointment is confirmed',
      cancelled: 'Your appointment has been cancelled',
      completed: 'Thank you for visiting Beauty Rocks',
      rescheduled: 'Your appointment has been updated',
    }[status]
  );
};

const notifyBookingCreated = async (appointmentId) => {
  const appointment = await getAppointment(appointmentId);
  if (!appointment) return { ok: false, error: 'Appointment not found' };

  const telegramResult = await safeSendTelegramMessage(
    buildBookingMessage(appointment, appointment.user),
    {
      reply_markup: buildInlineKeyboard(String(appointment._id)),
    }
  );

  if (telegramResult?.data?.message_id) {
    appointment.telegramMessageId = String(telegramResult.data.message_id);
    appointment.telegramChatId = String(process.env.TELEGRAM_CHAT_ID || '');
    await appointment.save({ validateBeforeSave: false });
  }

  const emailPayload = bookingCreatedEmail(appointment);
  const emailResult = await safeSendEmail({
    to: appointment.user?.email,
    subject: emailPayload.subject,
    html: emailPayload.html,
    attachments: emailPayload.attachments || [],
  });

  log('info', 'Booking created notification dispatched', { appointmentId });
  return { ok: true, telegramResult, emailResult };
};

const notifyBookingStatus = async (appointmentId, status, extra = {}) => {
  const appointment = await getAppointment(appointmentId);
  if (!appointment) return { ok: false, error: 'Appointment not found' };

  const statusTitle = {
    confirmed: '✅ <b>Booking confirmed</b>',
    cancelled: '❌ <b>Booking cancelled</b>',
    completed: '🏁 <b>Booking completed</b>',
    rescheduled: '📅 <b>Booking rescheduled</b>',
  }[status] || 'ℹ️ <b>Booking updated</b>';

  if (appointment.telegramMessageId && appointment.telegramChatId && isTelegramEnabled()) {
    await safeEditTelegramMessage({
      chatId: appointment.telegramChatId,
      messageId: appointment.telegramMessageId,
      text: buildStatusMessage(statusTitle, appointment, appointment.user, extra.telegramLines || []),
    });
  }

  const emailPayload = renderStatusEmail(appointment, status, extra);
  await safeSendEmail({
    to: appointment.user?.email,
    subject: emailPayload.subject,
    html: emailPayload.html,
    attachments: emailPayload.attachments || [],
  });

  return { ok: true };
};

const notifyRescheduleRequested = async (appointmentId, token) => {
  const appointment = await getAppointment(appointmentId);
  if (!appointment) return { ok: false, error: 'Appointment not found' };

  if (appointment.telegramMessageId && appointment.telegramChatId && isTelegramEnabled()) {
    await safeEditTelegramMessage({
      chatId: appointment.telegramChatId,
      messageId: appointment.telegramMessageId,
      text: buildStatusMessage(
        '📅 <b>Reschedule request sent</b>',
        appointment,
        appointment.user,
        ['The client has been asked to choose a new appointment.']
      ),
    });
  }

  const emailPayload = rescheduleRequestEmail(appointment, token);
  await safeSendEmail({
    to: appointment.user?.email,
    subject: emailPayload.subject,
    html: emailPayload.html,
    attachments: emailPayload.attachments || [],
  });

  return { ok: true };
};

const notifyReminder = async (appointmentId, reminderLabel = '24-hour') => {
  const appointment = await getAppointment(appointmentId);
  if (!appointment) return { ok: false, error: 'Appointment not found' };

  const reminderContent = reminderEmail(appointment, reminderLabel);
  await safeSendEmail({
    to: appointment.user?.email,
    subject: reminderContent.subject,
    html: reminderContent.html,
    attachments: reminderContent.attachments || [],
  });

  if (isTelegramEnabled()) {
    await safeSendTelegramMessage(
      [
        reminderLabel === '2-hour' ? '⏰ <b>2-hour reminder</b>' : '⏰ <b>24-hour reminder</b>',
        `Client: ${appointment.user?.username || 'Unknown'}`,
        `Phone: ${appointment.user?.phone || 'N/A'}`,
        `Email: ${appointment.user?.email || 'N/A'}`,
        `Service: ${appointment.service?.name || 'N/A'}`,
        `Specialist: ${appointment.teamMember?.name || 'N/A'}`,
        `Date: ${new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(appointment.date))}`,
        `Time: ${appointment.startTime || '—'}`,
        `Booking ID: ${appointment._id}`,
      ].join('\n')
    );
  }

  if (reminderLabel === '2-hour') {
    appointment.reminder2hSentAt = new Date();
  } else {
    appointment.reminder24hSentAt = new Date();
  }
  await appointment.save({ validateBeforeSave: false });

  return { ok: true };
};

const getAppointmentsForRange = async (start, end) =>
  Appointment.find({
    date: { $gte: start, $lt: end },
    status: { $in: ['pending', 'confirmed'] },
  })
    .populate('service', 'name price durationMinutes')
    .populate('teamMember', 'name role')
    .populate('user', 'username email phone')
    .sort({ startTime: 1 });

const getDailySummaryData = async () => {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const appointments = await getAppointmentsForRange(start, end);
  const pendingCount = appointments.filter((appointment) => appointment.status === 'pending').length;
  const revenueForecast = appointments.reduce(
    (sum, appointment) => sum + Number(appointment.service?.price || 0),
    0
  );
  const busySpecialists = [...new Set(appointments.map((appointment) => appointment.teamMember?.name).filter(Boolean))];

  const allActiveMembers = await TeamMember.find({ isActive: true }).select('name workingHours daysOff');
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(start).toLowerCase();
  const availableSpecialists = allActiveMembers
    .filter((member) => {
      const hours = member.workingHours?.[dayName];
      if (!hours?.start || !hours?.end) return false;
      const today = new Date(start);
      today.setHours(0, 0, 0, 0);
      const isDayOff = (member.daysOff || []).some((dayOff) => {
        const off = new Date(dayOff);
        off.setHours(0, 0, 0, 0);
        return off.getTime() === today.getTime();
      });
      return !isDayOff && !busySpecialists.includes(member.name);
    })
    .map((member) => member.name);

  return {
    appointments,
    pendingCount,
    revenueForecast,
    busySpecialists,
    availableSpecialists,
  };
};

const notifyDailySummary = async () => {
  const summary = await getDailySummaryData();
  const todayLabel = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date());

  const text = [
    `🌅 <b>Daily summary - ${todayLabel}</b>`,
    `Today’s bookings: ${summary.appointments.length}`,
    `Pending bookings: ${summary.pendingCount}`,
    `Revenue forecast: ${formatMoney(summary.revenueForecast)}`,
    `Busy specialists: ${summary.busySpecialists.length ? summary.busySpecialists.join(', ') : 'None'}`,
    `Available specialists: ${summary.availableSpecialists.length ? summary.availableSpecialists.join(', ') : 'All busy'}`,
  ].join('\n');

  return safeSendTelegramMessage(text);
};

const getWeeklySummaryData = async () => {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const day = start.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setUTCDate(start.getUTCDate() + diffToMonday);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);

  const appointments = await Appointment.find({ date: { $gte: start, $lt: end } })
    .populate('service', 'name price')
    .populate('teamMember', 'name')
    .sort({ date: 1, startTime: 1 });

  const completed = appointments.filter((appointment) => appointment.status === 'completed');
  const cancelled = appointments.filter((appointment) => appointment.status === 'cancelled');
  const revenue = completed.reduce((sum, appointment) => sum + Number(appointment.service?.price || 0), 0);
  const serviceStats = new Map();
  const specialistStats = new Map();

  appointments.forEach((appointment) => {
    const serviceName = appointment.service?.name || 'Unknown';
    const specialistName = appointment.teamMember?.name || 'Unknown';
    serviceStats.set(serviceName, (serviceStats.get(serviceName) || 0) + 1);
    specialistStats.set(specialistName, (specialistStats.get(specialistName) || 0) + 1);
  });

  const mostBookedService = [...serviceStats.entries()].sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
  const mostBookedSpecialist = [...specialistStats.entries()].sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
  const completionRate = appointments.length ? ((completed.length / appointments.length) * 100).toFixed(1) : '0.0';
  const cancellationRate = appointments.length ? ((cancelled.length / appointments.length) * 100).toFixed(1) : '0.0';

  return {
    appointments,
    revenue,
    mostBookedService,
    mostBookedSpecialist,
    completionRate,
    cancellationRate,
  };
};

const notifyWeeklySummary = async () => {
  const summary = await getWeeklySummaryData();
  const text = [
    '📆 <b>Weekly summary</b>',
    `Bookings this week: ${summary.appointments.length}`,
    `Revenue: ${formatMoney(summary.revenue)}`,
    `Most booked service: ${summary.mostBookedService[0]} (${summary.mostBookedService[1]})`,
    `Most booked specialist: ${summary.mostBookedSpecialist[0]} (${summary.mostBookedSpecialist[1]})`,
    `Completion rate: ${summary.completionRate}%`,
    `Cancellation rate: ${summary.cancellationRate}%`,
  ].join('\n');

  return safeSendTelegramMessage(text);
};

module.exports = {
  notifyBookingCreated,
  notifyBookingStatus,
  notifyRescheduleRequested,
  notifyReminder,
  notifyDailySummary,
  notifyWeeklySummary,
};
