const cron = require('node-cron');
const { notifyDailySummary, notifyWeeklySummary } = require('../services/notificationService');
const { BRAND } = require('../config/brand');

const scheduleSummaryJobs = () => {
  const jobs = [];

  jobs.push(
    cron.schedule('0 8 * * *', async () => {
      try {
        await notifyDailySummary();
        console.log(JSON.stringify({ scope: 'scheduler', message: 'Daily summary sent' }));
      } catch (error) {
        console.error(JSON.stringify({ scope: 'scheduler', message: 'Daily summary failed', error: error.message }));
      }
    }, { timezone: BRAND.timezone })
  );

  jobs.push(
    cron.schedule('0 8 * * 1', async () => {
      try {
        await notifyWeeklySummary();
        console.log(JSON.stringify({ scope: 'scheduler', message: 'Weekly summary sent' }));
      } catch (error) {
        console.error(JSON.stringify({ scope: 'scheduler', message: 'Weekly summary failed', error: error.message }));
      }
    }, { timezone: BRAND.timezone })
  );

  return jobs;
};

module.exports = { scheduleSummaryJobs };
