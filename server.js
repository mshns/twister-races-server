import express from 'express';
import mongoose from 'mongoose';

import 'dotenv/config';

import { twisterRacesRoutes, raceChaseRoutes } from './src/routes/index.js';
import { cronJobs } from './src/services/index.js';
import { proxyConfig } from './src/utils/index.js';

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

app.use(express.static('public'));

app.use(proxyConfig);

cronJobs();

const PORT = process.env.PORT || 5000;
app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`🟢 listening on => http://localhost:${PORT}`);
});
