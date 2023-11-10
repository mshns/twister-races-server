import * as fs from 'fs/promises';

const currentDate = new Date();

if (currentDate.getHours() === 1) {
  currentDate.setDate(currentDate.getDate() - 1);
}

const date = currentDate.toISOString().slice(0, 10);

export const downloadChase = () => {
  fetch(`${process.env.CHASE}?date=${date}`, {
    headers: {
      'X-Affiliate-Key': process.env.AFFILIATE_KEY,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      fs.writeFile(`public/chase/${date}.json`, JSON.stringify(data));
    })
    .catch(() => console.log('error'));
};
