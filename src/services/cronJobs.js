import cron from 'node-cron';

import {
  sendFreeroll,
  sendLeaderboard,
  updateChase,
} from './index.js';

const cronJobs = () => {
  // Run every 30 minutes
  cron.schedule('*/30 * * * *', () => {
    const date = new Date().toISOString().slice(0, 10);
    updateChase(date);
  });

  // Run at 11:55 AM every day
  cron.schedule('55 11 * * *', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = yesterday.toISOString().slice(0, 10);
    updateChase(date);
  });

  // Run at 8:30 AM, 2:30 PM, and 8:30 PM every day
  cron.schedule('30 8,14,20 * * *', () => {
    sendLeaderboard();
  });

  // Run at 5:00 PM on Fridays
  cron.schedule('0 17 * * 5', () => {
    sendFreeroll();
  });
};

export default cronJobs;
