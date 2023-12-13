import express from 'express';
import mongoose from 'mongoose';

import 'dotenv/config';

import { twisterRacesRoutes, raceChaseRoutes } from './src/routes/index.js';
import { cronJobs } from './src/services/index.js';
import { noCORS, proxyConfig } from './src/utils/index.js';

const app = express();

app.use(express.json());

app.use(noCORS);

app.use('/', twisterRacesRoutes);
app.use('/', raceChaseRoutes);

app.use(express.static('public'));

app.use(proxyConfig);

cronJobs();

mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log('✅ connected to database'))
  .catch((error) => console.log(`❌ database connection error: ${error}`));

const PORT = process.env.PORT || 5000;
app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`🟢 listening on => http://localhost:${PORT}`);
});
