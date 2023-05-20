
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();

const bot = new Telegraf(process.env.TOKEN);

// Add missing commands
bot.start((ctx) => ctx.reply('How can I help you?'));
bot.help((ctx) => ctx.reply('Commands:\n/start\n/help\n/hi\n/rand'));
bot.command('hi', (ctx) => ctx.reply('Hi'));
bot.command('rand', (ctx) => {
  const args = ctx.message.text.split(' ');
  const min = parseInt(args[1] || 0, 10);
  const max = parseInt(args[2] || 10, 10);
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  ctx.reply(`Your number is: ${randomNumber}`);
});
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));