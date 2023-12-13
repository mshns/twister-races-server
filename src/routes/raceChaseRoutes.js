import express from 'express';

import { Chase } from '../models/index.js';
import { updateChase } from '../services/index.js';

const router = express.Router();

router.get('/chase/:id', (req, res) => {
  Chase.findById(req.params.id).then((chase) => {
    res.status(200).json(chase);
  });
});

router.get('/chase-update/:id', (req, res) => {
  updateChase(req.params.id);
  res.json(`chase ${req.params.id} update request submitted`);
});

export default router;
