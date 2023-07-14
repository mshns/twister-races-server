import got from 'got';

import Player from '../models/player.js';
import { bot, parser } from '../utils/index.js';

export const sendLeaderboard = () => {
  const leaderboard = [
    `🏁 <b>Лидерборд</b> <a href="https://storo08.ru/twister-races"><b>storo08 Twister Races</b></a>`,
  ];

  Promise.all([
    Player.find().then((players) => {
      const playerList = [];
      players.map((player) =>
        playerList.push(player.nickname.current.toLowerCase())
      );

      return playerList;
    }),

    got(process.env.CURRENT_LEADERBOARD)
      .then((response) => parser.parse(response.body))
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

      const dateOptions = { month: 'long', day: 'numeric' },
        timeOptions = { hour: '2-digit', minute: '2-digit' },
        updateMSK = new Date(updateRace);

      updateMSK.setHours(updateMSK.getHours() + 3);
      const date = new Date(updateMSK).toLocaleString('ru', dateOptions),
        time = new Date(updateMSK).toLocaleString('ru', timeOptions);
      leaderboard.push(`<pre>Обновлено ${date} в ${time} по мск.</pre>\n`);

      topList.map((player) => {
        leaderboard.push(
          `${player.position}. <b>${player.nickname}</b> » ${player.points}`
        );
      });

      return leaderboard;
    })
    .then((leaderboard) => {
      bot
        .sendMessage(process.env.CHAT_ID, leaderboard.join('\n'), {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'Лидерборд', url: 'https://storo08.ru/twister-races' },
                {
                  text: 'Регистрация',
                  url: 'https://storo08.ru/twister-races/registration',
                },
                {
                  text: 'Призы',
                  url: 'https://storo08.ru/twister-races/prizes',
                },
              ],
            ],
          },
        })
        .then((message) => {
          const delay = 3.9 * 60 * 60 * 1000;

          setTimeout(() => {
            bot.deleteMessage(process.env.CHAT_ID, message.message_id);
          }, delay);
        });
    });
};
