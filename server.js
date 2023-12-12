import express from 'express';
import mongoose from 'mongoose';

import cron from 'node-cron';
import {
  createProxyMiddleware,
  responseInterceptor,
} from 'http-proxy-middleware';

import 'dotenv/config';

import { Player, Chase } from './src/models/index.js';

import {
  sendFreeroll,
  sendLeaderboard,
  updateChase,
} from './src/services/index.js';

import twisterRacesRoutes from './src/routes/twisterRacesRoutes.js';

const app = express();
app.use(express.json());

app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log('✅ connected to database'))
  .catch((error) => console.log(`❌ database connection error: ${error}`));

app.use('/', twisterRacesRoutes);

app.get('/chase/:id', (req, res) => {
  Chase.findById(req.params.id).then((chase) => {
    res.status(200).json(chase);
  });
});

app.get('/chase-update/:id', (req, res) => {
  updateChase(req.params.id);
  res.json(`chase ${req.params.id} update request submitted`);
});

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

app.use(
  createProxyMiddleware(
    ['/api', '/assets', '/embed', '/favicon', '/static', '/styles', '/ws'],
    {
      target: process.env.API_SERVICE_URL,
      router: {
        '/api': process.env.API_BACKEND_URL,
        '/ws': process.env.API_BACKEND_WS,
      },
      changeOrigin: true,
      ws: true,
      selfHandleResponse: true,

      onProxyRes: responseInterceptor(
        async (responseBuffer, proxyRes, req, res) => {
          const response = responseBuffer.toString('utf8');
          return response
            .replace(process.env.API_BACKEND_URL, process.env.PROXY_SERVER_URL)
            .replace(process.env.API_BACKEND_WS, process.env.PROXY_SERVER_WS)
            .replaceAll(
              process.env.API_SERVICE_URL,
              process.env.PROXY_SERVER_URL
            )
            .replaceAll(process.env.API_URL, process.env.PROXY_SERVER_URL)
            .replaceAll('rel="preload', 'rel="prefetch');
        }
      ),
    }
  )
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`🟢 listening on => http://localhost:${PORT}`);
});
