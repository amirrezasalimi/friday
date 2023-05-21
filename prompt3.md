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

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

pocketbase docs (a firebase like service):

import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

note: dont set id , it is auto generated column , so no need to set it or create an id for it.

// fetch a paginated records list
const resultList = await pb.collection('chat').getList(1, 50, {
    filter: 'created >= "2022-01-01 00:00:00" && someField1 != someField2',
});

// you can also fetch all records at once via getFullList
const records = await pb.collection('chat').getFullList({
    sort: '-created',
});
// full list response is like(if success):
{
 
    "items": [
        {
            "id": "RECORD_ID",
            "collectionId": "zhedtpmk14cgaib",
            "collectionName": "chat",
            "created": "2022-01-01 01:00:00.123Z",
            "updated": "2022-01-01 23:59:59.456Z",
            "text": "test",
            "chat_id": "test",
            "user_id": "test"
        }
    ]
    
}
// or fetch only the first record that matches the specified filter
const record = await pb.collection('chat').getFirstListItem('someField="test"', {
    expand: 'relField1,relField2.subRelField',
});

// list response is like(if success):
{
    "page": 1,
    "perPage": 30,
    "totalPages": 1,
    "totalItems": 2,
    "items": [
      {
        "id": "RECORD_ID",
        "collectionId": "zhedtpmk14cgaib",
        "collectionName": "chat",
        "created": "2022-01-01 01:00:00.123Z",
        "updated": "2022-01-01 23:59:59.456Z",
        "text": "test",
        "chat_id": "test",
        "user_id": "test"
      },
      {
        "id": "RECORD_ID",
        "collectionId": "zhedtpmk14cgaib",
        "collectionName": "chat",
        "created": "2022-01-01 01:00:00.123Z",
        "updated": "2022-01-01 23:59:59.456Z",
        "text": "test",
        "chat_id": "test",
        "user_id": "test"
      }
    ]
  }

  if 400:
  {
    "code": 400,
    "message": "Something went wrong while processing your request. Invalid filter.",
    "data": {}
  }



// view single

const record = await pb.collection('chat').getOne('RECORD_ID', {
    expand: 'relField1,relField2.subRelField',
});

response is like(if success):
{
    "id": "RECORD_ID",
    "collectionId": "zhedtpmk14cgaib",
    "collectionName": "chat",
    "created": "2022-01-01 01:00:00.123Z",
    "updated": "2022-01-01 23:59:59.456Z",
    "text": "test",
    "chat_id": "test",
    "user_id": "test"
  }

// example create data
const data = {
    "text": "test",
    "chat_id": "test",
    "user_id": "test"
};

const record = await pb.collection('chat').create(data);
// create response is like "view single" section

// example update data
const data = {
    "text": "test",
    "chat_id": "test",
    "user_id": "test"
};

const record = await pb.collection('chat').update('RECORD_ID', data);

// update response is like "view single" section

// delete record
await pb.collection('chat').delete('RECORD_ID');


TOKEN=305866267:AAHelXQqGXwabSID3JYJ09gK_97k3H8ulL8


+ no inital event or message handling


#SECTION1

commands:
/start => how i can help you?
/help show commands
/rand 0 10 => give random number between 0 and 10 
your number is : xxx

// end of commands
note: dont use library for random number




this is our pocketbase collection:

chat:
id: auto will add
user_id: string
chat_id: string
text: string

instruction:
log all ai and user texts comes,  in the chat collection with pocketbase


this is open ai api for chat with ai:
sample api curl:
curl https://api.cattto.repl.co/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer catto_key_YWYTDkpnOpYK9CqpqOa9jm1g" \
  -d '{
     "model": "gpt-3.5-turbo",
     "messages": [{"role": "user", "content": "Say this is a test!"}],
     "temperature": 0.7
   }'

api response interface is like this if 200:

{
    choices:[
        {
            "message":{
                "content":"test",
                "role":"user or assistant"
            }
        }
    ]
}
use this to answer any users text messages with ai
you should include last 5 text of user and ai in api from (new to old) (from pocketbase chat collection , filter by chat_id and user_id)
