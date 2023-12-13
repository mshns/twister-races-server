import express from 'express';

import { Player } from '../models/index.js';
import { parser } from '../utils/index.js';

const router = express.Router();

router.get('/players', (_, res) => {
  Player.find().then((players) => {
    res.status(200).json(players);
  });
});

router.get('/players/:id', (req, res) => {
  Player.findById(req.params.id).then((player) => {
    res.status(200).json(player);
  });
});

router.delete('/players/:id', (req, res) => {
  Player.findByIdAndDelete(req.params.id).then((result) => {
    res.status(200).json(result);
  });
});

router.post('/players', (req, res) => {
  const player = new Player(req.body);
  player.save().then((result) => {
    res.status(201).json(result);
  });
});

router.patch('/players/:id', (req, res) => {
  Player.findByIdAndUpdate(req.params.id, req.body).then((result) => {
    res.status(200).json(result);
  });
});

router.get('/current', async (_, res) => {
  fetch(process.env.CURRENT_LEADERBOARD)
    .then((response) => response.text())
    .then((data) => {
      const XMLdata = parser.parse(data);
      return res.json(XMLdata);
    });
});

router.get('/previous', async (_, res) => {
  fetch(process.env.PREVIOUS_LEADERBOARD)
    .then((response) => response.text())
    .then((data) => {
      const XMLdata = parser.parse(data);
      return res.json(XMLdata);
    });
});

export default router;
