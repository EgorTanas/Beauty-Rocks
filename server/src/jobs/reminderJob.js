const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const { emitReminderDue } = require('../events/bookingEvents');

const scheduleReminderJob = () => {
  if (process.env.REMINDER_JOB_DISABLED === 'true') {
    console.log(JSON.stringify({ scope: 'scheduler', message: 'Reminder job disabled' }));
    return null;
  }

  return cron.schedule('*/15 * * * *', async () => {
    try {
      const now = new Date();
      const ranges = [
        {
          reminderLabel: '24-hour',
          start: new Date(now.getTime() + 23 * 60 * 60 * 1000),
          end: new Date(now.getTime() + 25 * 60 * 60 * 1000),
          flagField: 'reminder24hSentAt',
        },
        {
          reminderLabel: '2-hour',
          start: new Date(now.getTime() + 110 * 60 * 1000),
          end: new Date(now.getTime() + 130 * 60 * 1000),
          flagField: 'reminder2hSentAt',
        },
      ];

      let total = 0;

      for (const range of ranges) {
        const appointments = await Appointment.find({
          status: { $in: ['pending', 'confirmed'] },
          [range.flagField]: null,
          date: { $gte: range.start, $lt: range.end },
        }).select('_id');

        for (const appointment of appointments) {
          emitReminderDue(String(appointment._id), range.reminderLabel);
        }

        total += appointments.length;
      }

      console.log(JSON.stringify({ scope: 'scheduler', message: 'Reminder scan executed', count: total }));
    } catch (error) {
      console.error(JSON.stringify({ scope: 'scheduler', message: 'Reminder scan failed', error: error.message }));
    }
  });
};

module.exports = { scheduleReminderJob };
