import axios from 'axios';

import { config } from 'dotenv';
config();

import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.TOKEN);

bot.start((ctx) => ctx.reply('How can I help you?'));
bot.help((ctx) => ctx.reply('/start\n/help\n/rand 0 10\n/pic'));

bot.command('rand', (ctx) => {
  const args = ctx.message.text.split(' ');
  const min = parseInt(args[1], 10);
  const max = parseInt(args[2], 10);
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  ctx.reply(`Your number is: ${randomNumber}`);
});

bot.command('pic', async (ctx) => {
  const response = await axios.get('https://picsum.photos/1000/1000');
  ctx.replyWithPhoto({ url: response.request.res.responseUrl });
});

bot.launch();