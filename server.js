import express from 'express';
import mongoose from 'mongoose';
import got from 'got';
import cron from 'node-cron';

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`🟢 listening on => http://localhost:${PORT}`);
});
