import { bot } from '../utils/index.js';

export const sendFreeroll = () => {
  const sticker =
      'CAACAgIAAxkBAAEJq1ZkroMfJELP_Hp0EUfJX-OsFdW46gACNy8AAvJ7OUgJxNe8v9HCdC8E',
    notification =
      '⏰ Традиционный пятничный <b>ФРИРОЛЛ storo08 Heads-Up Challenge</b> на RedStar стартует через час!\n\n' +
      'Регистрация на турнир уже открыта, не забудь зарегаться!';

  bot
    .sendSticker(process.env.CHAT_ID, sticker, { disable_notification: true })
    .then(() => {
      bot.sendMessage(process.env.CHAT_ID, notification, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Как найти фриролл?', url: 'https://t.me/storo08/833' }],
          ],
        },
      });
    });
};
