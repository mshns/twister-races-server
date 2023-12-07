import { Chase } from '../models/index.js';

export const updateChase = (date) => {
  fetch(`${process.env.CHASE}?date=${date}`, {
    headers: {
      'X-Affiliate-Key': process.env.AFFILIATE_KEY,
    },
  })
    .then((response) => response.json())
    .then((report) => {
      const chase = {
        _id: date,
        data: report.data,
      };

      const options = { upsert: true };

      return Chase.findByIdAndUpdate(date, chase, options);
    })
    .then(() => console.log(`chase ${date} updated`))
    .catch(() => console.log('error'));
};
