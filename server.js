import express from 'express';
import mongoose from 'mongoose';
import got from 'got';

import 'dotenv/config';

import Player from './models/player.js';

const app = express();

app.use(express.json());

app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET,HEAD,OPTIONS,PATCH,POST,PUT,DELETE'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log('✅ connected to database'))
  .catch((error) => console.log(`❌ database connection error: ${error}`));

app.options('/*', (_, res) => {
  res.sendStatus(200);
});

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
  try {
    const response = await got(process.env.CURRENT_LEADERBOARD);
    res.json(response.body);
  } catch (error) {
    console.log(error);
  }
});

app.get('/previous', async (_, res) => {
  try {
    const response = await got(process.env.PREVIOUS_LEADERBOARD);
    res.json(response.body);
  } catch (error) {
    console.log(error);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`🟢 listening on => http://localhost:${PORT}`);
});
