const { EventEmitter } = require('events');
const {
  notifyBookingCreated,
  notifyBookingStatus,
  notifyReminder,
  notifyRescheduleRequested,
} = require('../services/notificationService');

const bookingEvents = new EventEmitter();
bookingEvents.setMaxListeners(50);

bookingEvents.on('bookingCreated', async ({ appointmentId }) => {
  try {
    await notifyBookingCreated(appointmentId);
  } catch (error) {
    console.error(JSON.stringify({ scope: 'events', event: 'bookingCreated', error: error.message }));
  }
});

bookingEvents.on('bookingConfirmed', async ({ appointmentId }) => {
  try {
    await notifyBookingStatus(appointmentId, 'confirmed');
  } catch (error) {
    console.error(JSON.stringify({ scope: 'events', event: 'bookingConfirmed', error: error.message }));
  }
});

bookingEvents.on('bookingCancelled', async ({ appointmentId }) => {
  try {
    await notifyBookingStatus(appointmentId, 'cancelled');
  } catch (error) {
    console.error(JSON.stringify({ scope: 'events', event: 'bookingCancelled', error: error.message }));
  }
});

bookingEvents.on('bookingRescheduled', async ({ appointmentId, oldDateTime, newDateTime, meta = {} }) => {
  try {
    await notifyBookingStatus(appointmentId, 'rescheduled', meta.finalized
      ? {
          emailHtml: meta.emailHtml || 'Appointment successfully rescheduled.',
          telegramLines: meta.telegramLines || [
            '✅ Client selected a new appointment.',
            `Old: ${oldDateTime || 'N/A'}`,
            `New: ${newDateTime || 'N/A'}`,
          ],
        }
      : {
          emailHtml: `Your appointment was rescheduled from <strong>${oldDateTime || 'N/A'}</strong> to <strong>${newDateTime || 'N/A'}</strong>.`,
          telegramLines: [
            `Old: ${oldDateTime || 'N/A'}`,
            `New: ${newDateTime || 'N/A'}`,
          ],
        });
  } catch (error) {
    console.error(JSON.stringify({ scope: 'events', event: 'bookingRescheduled', error: error.message }));
  }
});

bookingEvents.on('bookingCompleted', async ({ appointmentId }) => {
  try {
    await notifyBookingStatus(appointmentId, 'completed');
  } catch (error) {
    console.error(JSON.stringify({ scope: 'events', event: 'bookingCompleted', error: error.message }));
  }
});

bookingEvents.on('bookingRescheduleRequested', async ({ appointmentId, token }) => {
  try {
    await notifyRescheduleRequested(appointmentId, token);
  } catch (error) {
    console.error(JSON.stringify({ scope: 'events', event: 'bookingRescheduleRequested', error: error.message }));
  }
});

bookingEvents.on('bookingReminderDue', async ({ appointmentId, reminderLabel }) => {
  try {
    await notifyReminder(appointmentId, reminderLabel);
  } catch (error) {
    console.error(JSON.stringify({ scope: 'events', event: 'bookingReminderDue', error: error.message }));
  }
});

module.exports = {
  bookingEvents,
  emitBookingCreated: (appointmentId) => bookingEvents.emit('bookingCreated', { appointmentId }),
  emitBookingConfirmed: (appointmentId) => bookingEvents.emit('bookingConfirmed', { appointmentId }),
  emitBookingCancelled: (appointmentId) => bookingEvents.emit('bookingCancelled', { appointmentId }),
  emitBookingRescheduled: (appointmentId, oldDateTime, newDateTime, meta = {}) =>
    bookingEvents.emit('bookingRescheduled', { appointmentId, oldDateTime, newDateTime, meta }),
  emitBookingCompleted: (appointmentId) => bookingEvents.emit('bookingCompleted', { appointmentId }),
  emitBookingRescheduleRequested: (appointmentId, token) =>
    bookingEvents.emit('bookingRescheduleRequested', { appointmentId, token }),
  emitReminderDue: (appointmentId, reminderLabel) => bookingEvents.emit('bookingReminderDue', { appointmentId, reminderLabel }),
};
