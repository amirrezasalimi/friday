import { Configuration, OpenAIApi } from "openai"
import fs from 'fs';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);

console.log("friday v1.0")

function removeCodeSnippet(text) {
    // Remove leading newline characters if any
    text = text.replace(/^\n+/, '');

    // Remove ```javascript or ```js at the start
    text = text.replace(/^(```javascript|```js)/, '');

    // Remove ``` at the end
    text = text.replace(/```$/, '');

    // Remove trailing newline characters if any
    text = text.replace(/\n+$/, '');

    return text;
}

// just for test if you want
/* const basePrompt = `
an expressjs app
+ no inital route
`

const subPormpts = [
    `
routes needed:

/chat?chat_id=xxx&q=
to answer questions with this api :
save conversations in json file : /chats/[chat_id].json (create file or directory if not exists with [] content )
note: (save ai and user messages)
and when there is new request mix messages with old saved messages
+ each request message should saved in that json file , so when there is new conversation it should continue from old messages ofthat chat_id

response should like:
{
    'message':"..."
}


sample api curl:
curl https://api.cattto.repl.co/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer catto_key_YWYTDkpnOpYK9CqpqOa9jm1g" \
  -d '{
     "model": "gpt-3.5-turbo",
     "messages": [{"role": "user", "content": "Say this is a test!"}],
     "temperature": 0.7
   }'

ai api response interface is like this if 200:

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

+ make another api /chat_msgs?chat_id=xxx 
read from /chats/[chat_id].json in this format:
[
    {
      "role": "user",
      "content": "who r u"
    },
]
note:
- dont use old or depracted package
`
] */

const basePrompt = `
a telgeram bot
use telegraf package
- no inital code and events
- read docs and do with new methods
telegraf simple docs:

const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on(message('sticker'), (ctx) => ctx.reply('👍'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));
bot.launch();

another doc:
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.command('oldschool', (ctx) => ctx.reply('Hello'));
bot.command('hipster', Telegraf.reply('λ'));
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

TOKEN=305866267:AAHelXQqGXwabSID3JYJ09gK_97k3H8ulL8
+ no inital event
`

const subPormpts = [
    `
commands:
/start => how i can help you?
/help show commands
/hi say , reply hi 
/rand 0 10 => give random number between 0 and 10 
your number is : xxx
`
]

// 

const configuration = new Configuration({
    apiKey: "catto_key_YWYTDkpnOpYK9CqpqOa9jm1g",
    basePath: "https://api.cattto.repl.co/v1",
});
const ai = new OpenAIApi(configuration);

async function main() {
    const data = {
        base: "",
        codes: [],
        env: "",
        imports: [],
        packages: []
    };
    try {
        // step1 request for packages need
        const res1 = await ai.createChatCompletion({
            model: "gpt-4",
            messages: [
                {
                    "role": "user",
                    "content": `
you are an js developer , according to the prompt , give used packages in a json string list with their version if needed , choose a test package(from the prompt context) if need, sample:

a discord bot:
["discord.js@latest"]

prompt:
${basePrompt}

answer in this format(json string list for each ):
packages:
[]
test packages:
[]

---`
                }
            ],
            temperature: 1
        });
        const msg1 = res1.data.choices[0].message.content;
        const regex = /packages:([\s\S]*?)test packages:([\s\S]*)/;
        const matches = regex.exec(msg1);

        // console.log(res1);
        // console.log(msg);
        if (matches) {
            const packagesSection = JSON.parse(matches[1].trim())
            const testPackagesSection = JSON.parse(matches[2].trim())
            // console.log(packagesSection, testPackagesSection);

            data.packages = [
                ...packagesSection,
                ...testPackagesSection
            ]
            console.log("step1 ✅");
        } else {
            throw `step 1 error\n${msg1}`;
        }

        data.packages.push("dotenv@latest")
        // step 2 (request for base code)
        const res2 = await ai.createChatCompletion({
            model: "gpt-4",
            messages: [
                {
                    "role": "user",
                    "content": `
according to my context  i give you the used packages names with their version , then you should implement a very basic index.js file codes in es6 js , attention to roles
roles
- use context just for making base, no extra talk and codes
- there should no action in the code
- use dotenv package anyway
- don't override the "DONT_TOUCH_THIS" 
- sample:
context: 
a simple discord bot
packages names: discord.js@latest

.env: 
TOKEN=xx
index.js:
import { Client, GatewayIntentBits } from 'discord.js';
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

{DONT_TOUCH_THIS}
client.login(process.env.TOKEN);

context:
${basePrompt}
packages used:
${data.packages.join(",")}

answer in this format:

.env:

index.js

`
                }
            ],
            temperature: 1
        });

        const msg2 = res2.data.choices[0].message.content;
        const regex2 = /.env:([\s\S]*?)index.js:([\s\S]*)/;
        const matches2 = regex2.exec(msg2);


        console.log(matches2[1], "\n", matches2[2]);
        data.base = removeCodeSnippet(matches2[2]);
        data.env = matches2[1]
        console.log("step2 ✅");

        // step 3 | generate sub tasks
        for (const taskPrompt of subPormpts) {

            const taskRes = await ai.createChatCompletion({
                model: "gpt-4",
                messages: [
                    {
                        "role": "user",
                        "content": `
you are an expert es6 developer , i give you a needed section and please give me the missing codes only.

index.js instruction:
${basePrompt}
packages names: ${data.packages.join(",")}

index.js codes:
${data.base}

needed section instruction:
${taskPrompt}

+ roles 
- only give missing codes not complete
- attention to the needed section instruction , and write only needed codes not any more
don't write codes that not requested in needed section
only give missing codes without talk
- if no any new package added just use empty [] in there
- if no need to any imports just  let empty that section
- packages used is a string array , if u want provide version use this pattern : package@version

answer in this format:
packages used:


imports:


new codes:


---
`
                    }
                ],
                temperature: 1
            });

            const taskMsg = taskRes.data.choices[0].message.content;

            console.log("step3: ", taskMsg);
            const packagesRegex = /packages used:\n?([\s\S]*?)(?=\n\n|$)/;
            const importsRegex = /imports:\n([\s\S]*?)(?=\n\n|$)/;
            const newCodesRegex = /new codes:\n([\s\S]*)/;

            const packagesMatch = taskMsg.match(packagesRegex);
            const importsMatch = taskMsg.match(importsRegex);
            const newCodesMatch = taskMsg.match(newCodesRegex);

            const packagesUsed = packagesMatch ? packagesMatch[1].trim() : '[]';
            const imports = importsMatch ? importsMatch[1].trim() : '';
            const newCodes = newCodesMatch ? newCodesMatch[1].trim() : '';

            const pkgsUsed = JSON.parse(packagesUsed);
            data.packages = [
                ...data.packages,
                ...pkgsUsed
            ]
            data.imports = [
                ...data.imports,
                removeCodeSnippet(imports)
            ]
            data.codes.push(removeCodeSnippet(newCodes));
            console.log("step3 ✅");
        }
    } catch (e) {
        console.log("e: ", e.message, e);
    }
    console.log(data);

    // bundle project ans save

    function removeDirectory(directory) {
        if (fs.existsSync(directory)) {
            fs.readdirSync(directory).forEach((file) => {
                const fullPath = `${directory}/${file}`;
                if (fs.lstatSync(fullPath).isDirectory()) {
                    removeDirectory(fullPath);
                } else {
                    fs.unlinkSync(fullPath);
                }
            });
            fs.rmdirSync(directory);
        }
    }

    async function createProjectFiles(projectObject) {
        try {
            // Create the "project" directory if it doesn't exist
            if (fs.existsSync('project')) {
                removeDirectory("project");
            }
            if (!fs.existsSync('project')) {
                fs.mkdirSync('project');
            }

            // Navigate into the "project" directory
            process.chdir('project');

            // Create package.json file with required packages
            const packageJson = {
                name: 'project',
                version: '1.0.0',
                scripts: {
                    "start": "esbuild index.js --platform=node  --format=cjs  --bundle --outdir=dist && node dist/index.js"
                },
                dependencies: {}
            };
            const pkgs = [
                "esbuild@latest",
                ...projectObject.packages
            ]
            const unique_pkgs = [...new Set(pkgs)];

            for (const pkg of unique_pkgs) {
                const [packageName, packageVersion] = pkg.split('@');
                packageJson.dependencies[packageName] = packageVersion || "latest";
            }

            await writeFileAsync('package.json', JSON.stringify(packageJson, null, 2));

            let base = `${projectObject.imports.join("\n")}\n${projectObject.base}`
            // Replace the merged codes in the base content
            let mergedContent = base.replace(
                '{DONT_TOUCH_THIS}',
                projectObject.codes.join('\n')
            );

            // Create index.js file with the merged content and imports
            await writeFileAsync('index.js', mergedContent);

            // Create .env file with env content
            await writeFileAsync('.env', projectObject.env.trim());

            console.log('Project files created successfully.');
        } catch (error) {
            console.error('Error creating project files:', error);
        }
    }
    createProjectFiles(data)

}
main();