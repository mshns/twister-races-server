import express from 'express';
import 'dotenv/config';

import { twisterRacesRoutes, raceChaseRoutes } from './src/routes/index.js';
import { cronJobs } from './src/services/index.js';
import { connectDatabase, noCORS, proxyConfig } from './src/utils/index.js';

const app = express();

app.use(express.json());

app.use(noCORS);

app.use('/', twisterRacesRoutes);
app.use('/', raceChaseRoutes);

app.use(express.static('public'));

app.use(proxyConfig);

// cronJobs();

// connectDatabase();

const PORT = process.env.PORT || 5000;
app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`🟢 listening on => http://localhost:${PORT}`);
});
