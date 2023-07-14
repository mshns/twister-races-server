import { bot } from '../utils/index.js';

export const sendFreeroll = () => {
  const sticker =
      'CAACAgIAAxkBAAEJq1ZkroMfJELP_Hp0EUfJX-OsFdW46gACNy8AAvJ7OUgJxNe8v9HCdC8E',
    notification =
      '⏰ Традиционный пятничный <b>ФРИРОЛЛ storo08 Heads-Up Challenge</b> на ' +
      '<a href="https://c.rsppartners.com/clickthrgh?btag=a_9631b_75l_9"><b>RedStar</b></a> стартует через час!\n\n' +
      'Регистрация на турнир уже открыта, не забудь зарегаться!';

  bot
    .sendSticker(process.env.CHAT_ID, sticker, { disable_notification: true })
    .then(() => {
      bot.sendMessage(process.env.CHAT_ID, notification, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Как найти фриролл в лобби?',
                url: 'https://t.me/storo08/833',
              },
            ],
            [
              {
                text: 'Расписание фрироллов и призы',
                url: 'https://www.vigorish.ru/section84/topic13421-640.html',
              },
            ],
          ],
        },
      });
    });
};
