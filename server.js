import express from 'express';
import mongoose from 'mongoose';
import got from 'got';
import cron from 'node-cron';
import {
  createProxyMiddleware,
  responseInterceptor,
} from 'http-proxy-middleware';

import 'dotenv/config';

import Player from './models/player.js';
import { parser } from './utils/index.js';
import { sendLeaderboard, sendFreeroll } from './services/index.js';

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

app.get('/players', (_, res) => {
  Player.find().then((players) => {
    res.status(200).json(players);
  });
});

app.get('/players/:id', (req, res) => {
  Player.findById(req.params.id).then((player) => {
    res.status(200).json(player);
  });
});

app.delete('/players/:id', (req, res) => {
  Player.findByIdAndDelete(req.params.id).then((result) => {
    res.status(200).json(result);
  });
});

app.post('/players', (req, res) => {
  const player = new Player(req.body);
  player.save().then((result) => {
    res.status(201).json(result);
  });
});

app.patch('/players/:id', (req, res) => {
  Player.findByIdAndUpdate(req.params.id, req.body).then((result) => {
    res.status(200).json(result);
  });
});

app.get('/current', async (_, res) => {
  got(process.env.CURRENT_LEADERBOARD).then((response) => {
    const XMLdata = parser.parse(response.body);
    return res.json(XMLdata);
  });
});

app.get('/previous', async (_, res) => {
  got(process.env.PREVIOUS_LEADERBOARD).then((response) => {
    const XMLdata = parser.parse(response.body);
    return res.json(XMLdata);
  });
});

cron.schedule('30 8,14,20 * * *', () => {
  sendLeaderboard();
});

cron.schedule('0 17 * * 5', () => {
  sendFreeroll();
});

app.use(express.static('public'));

app.use(
  createProxyMiddleware({
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
          .replaceAll(process.env.API_SERVICE_URL, process.env.PROXY_SERVER_URL)
          .replaceAll(process.env.API_URL, process.env.PROXY_SERVER_URL);
      }
    ),
  })
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`🟢 listening on => http://localhost:${PORT}`);
});
