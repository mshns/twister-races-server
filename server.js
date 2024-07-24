import express from 'express';
import 'dotenv/config';

import { proxyConfig } from './src/utils/index.js';

const app = express();

app.use(express.json());

app.use(express.static('public'));

app.use(proxyConfig);

const PORT = process.env.PORT || 5000;
app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`🟢 listening on => http://localhost:${PORT}`);
});
