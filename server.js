import express from 'express';
import mongoose from 'mongoose';
import got from 'got';
import { XMLParser } from 'fast-xml-parser';
import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';

import 'dotenv/config';

import Player from './models/player.js';
import { getLeaderboard } from './helpers/getLeaderboard.js';

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

const parser = new XMLParser({
  attributeNamePrefix: '',
  ignoreAttributes: false,
  updateTag(_tagName, _jPath, attrs) {
    delete attrs['name'];
    delete attrs['id'];
  },
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

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

cron.schedule('* * * * *', () => {
  console.log('cron working');
  const leaderboard = [
    `🏁 <b>Лидерборд</b> <a href="https://storo08.ru/twister-races"><b>storo08 Twister Races</b></a>`,
  ];

  Promise.all([
    fetch(`${process.env.SERVER_URL}/players`)
      .then((response) => response.json())
      .then((players) => {
        const playerList = [];
        players.map((player) =>
          playerList.push(player.nickname.current.toLowerCase())
        );

        return playerList;
      }),

    fetch(`${process.env.SERVER_URL}/current`)
      .then((response) => response.json())
      .then((playerListXML) => {
        const networkPlayerList = [],
          updateRace = playerListXML.report.updated_at;
        playerListXML.report.row.map((row) => {
          const nickname = row.column[1],
            points = row.column[2];
          if (points > 0) {
            networkPlayerList.push({
              nickname: nickname.toString(),
              points: points,
            });
          }
        });

        return { updateRace, networkPlayerList };
      }),
  ])
    .then(([playerList, { updateRace, networkPlayerList }]) => {
      const topList = [];
      let position = 1;

      networkPlayerList.map((player) => {
        const isAffiliate = playerList.includes(player.nickname.toLowerCase());

        if (isAffiliate && position < 56) {
          topList.push({
            position: position,
            nickname: player.nickname,
            points: player.points,
          });
          position++;
        }
      });

      const timeOptions = {
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        },
        update = new Date(updateRace).toLocaleTimeString('ru-RU', timeOptions);

      leaderboard.push(`<pre>Обновлено ${update} по мск.</pre>\n`);

      topList.map((player) => {
        leaderboard.push(
          `${player.position}. <b>${player.nickname}</b> » ${player.points}`
        );
      });

      return leaderboard;
    })
    .then((leaderboard) =>
      bot.sendMessage(-1001193009028, leaderboard.join('\n'), {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Лидерборд', url: 'https://storo08.ru/twister-races' },
              {
                text: 'Регистрация',
                url: 'https://storo08.ru/twister-races/registration',
              },
              { text: 'Призы', url: 'https://storo08.ru/twister-races/prizes' },
            ],
          ],
        },
      })
    );
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`🟢 listening on => http://localhost:${PORT}`);
});
