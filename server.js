import express from 'express';
import mongoose from 'mongoose';
import cron from 'node-cron';

import 'dotenv/config';

import {
  sendFreeroll,
  sendLeaderboard,
  updateChase,
} from './src/services/index.js';

import twisterRacesRoutes from './src/routes/twisterRacesRoutes.js';
import raceChaseRoutes from './src/routes/raceChaseRoutes.js';

import proxyMiddleware from './src/utils/proxyConfig.js';

const app = express();

app.use(express.json());

app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/', twisterRacesRoutes);
app.use('/', raceChaseRoutes);

mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log('✅ connected to database'))
  .catch((error) => console.log(`❌ database connection error: ${error}`));

cron.schedule('*/10 * * * *', () => {
  const date = new Date().toISOString().slice(0, 10);
  updateChase(date);
});

cron.schedule('55 11 * * *', () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = yesterday.toISOString().slice(0, 10);
  updateChase(date);
});

cron.schedule('30 8,14,20 * * *', () => {
  sendLeaderboard();
});

cron.schedule('0 17 * * 5', () => {
  sendFreeroll();
});

app.use(express.static('public'));

app.use(proxyMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`🟢 listening on => http://localhost:${PORT}`);
});
