import TelegramBot from 'node-telegram-bot-api';

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: false });

export const getLeaderboard = () => {
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
    .then((leaderboard) => {
      console.log('w');
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
      });
    });
};
