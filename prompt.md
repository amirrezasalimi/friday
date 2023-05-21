#CORE:

a telgeram bot
use telegraf package
- no inital code and events
- use only the methods from the given telegraf docs not your knowledge
- no inital event or message handling


telegraf  docs:

const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on(message('sticker'), (ctx) => ctx.reply('👍'));
bot.on(message('text'), (ctx) => ctx.reply('')); // for any text message coming
bot.hears('hi', (ctx) => ctx.reply('Hey there'));
bot.launch();

--
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.command('oldschool', (ctx) => ctx.reply('Hello'));
bot.command('hipster', Telegraf.reply('λ'));
bot.launch();

TOKEN=305866267:AAHelXQqGXwabSID3JYJ09gK_97k3H8ulL8

- no inital event or message handling


#SECTION1

commands:
/start => how i can help you?
/help show commands
/rand 0 10 => give random number between 0 and 10 
your number is : xxx
/pic => send random images url from picsum api (use bot.replyWithPhoto , good quality picture 1000x1000)