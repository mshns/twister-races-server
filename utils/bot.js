import TelegramBot from 'node-telegram-bot-api';

const token = process.env.BOT_TOKEN;

export const bot = new TelegramBot(token, { polling: false });
