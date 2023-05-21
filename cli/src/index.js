import { Configuration, OpenAIApi } from "openai"
import fs from 'fs';
import { promisify } from 'util';
import { getPrompts, removeCodeSnippet, removeDirectory } from "./utils";

const writeFileAsync = promisify(fs.writeFile);

console.log("friday v1.0")

const _prompt = getPrompts()
console.log(_prompt);
const basePrompt = _prompt.core;

const subPormpts = _prompt.sections;

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
you are an expert nodejs developer , according to the prompt , give used packages in a json string list with their version if needed , choose a test package(from the prompt context) if need,
use @latest in the end of them if needed.

prompt:
${basePrompt}

answer in this format(json string list for each ):
packages:
["test@latest"]
test packages:
[]
`
                }
            ],
            temperature: 1
        });
        const msg1 = res1.data.choices[0].message.content;
        const regex = /packages:([\s\S]*?)test packages:([\s\S]*)/;
        const matches = regex.exec(msg1);

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
- use context just for making base code, no extra talk and comments
- there should no action or any comment in the code
- use dotenv package anyway
- don't override the "DONT_TOUCH_THIS" 
- don't use markdown for codes
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
- use dotenv package 

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

        data.base = removeCodeSnippet(matches2[2]);
        data.env = matches2[1]
        console.log("step2 ✅");

        // step 3 | generate sub tasks
        let i = 0;
        for (const taskPrompt of subPormpts) {

            const taskRes = await ai.createChatCompletion({
                model: "gpt-4",
                messages: [
                    {
                        "role": "user",
                        "content": `
you are an expert nodejs es6 developer , i give you needed section and please give me the missing codes only.

index.js description:
${basePrompt}
used packages: ${data.packages.join(",")}

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

- list all used packages of new codes  in packages used section .
- packages used is a string array , if u want provide version use this pattern : package@version
- if used packages and imports exists in the index.js codes , do not add it to current packages used and imports list. 
- don't use markdown for new codes and imports in answer
- your codes has no any bugs or syntax problems

answer in this format(exactly in this format):
packages used:
["test@latest"]

imports:
import x from 'y'

new codes:

`
                    }
                ],
                temperature: 0.5
            });

            const taskMsg = taskRes.data.choices[0].message.content;

            const packagesRegex = /packages used:\s*([\s\S]*?)(?=\n\n|\n*$)/g;
            const importsRegex = /imports:\s*([\s\S]*?)(?=\n\n|\n*$)/g;
            const newCodesRegex = /new codes:\s*([\s\S]*)/g;

            const packagesMatch = taskMsg.match(packagesRegex);
            const importsMatch = taskMsg.match(importsRegex);
            const newCodesMatch = taskMsg.match(newCodesRegex);

            // normalize
            const imports = importsMatch[0].trim().replace("imports:", "")
            const packagesUsed = packagesMatch ?
                packagesMatch[0].replace("packages used:", "")
                : '[]';
            const newCodes = newCodesMatch[0].trim().replace("new codes:", "")



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

            console.log(`step3 - ${i} ✅`);
            i++;
        }
    } catch (e) {
        console.log("e: ", e.message, e);
    }

    // bundle project and save


    const projecDir = "project";
    try {
        // Create the "project" directory if it doesn't exist
        if (fs.existsSync(projecDir)) {
            removeDirectory(projecDir);
        }
        if (!fs.existsSync(projecDir)) {
            fs.mkdirSync(projecDir);
        }

        // Navigate into the "project" directory
        process.chdir(projecDir);

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
            ...data.packages
        ]
        const unique_pkgs = [...new Set(pkgs)];

        for (const pkg of unique_pkgs) {
            const [packageName, packageVersion] = pkg.split('@');
            packageJson.dependencies[packageName] = packageVersion || "latest";
        }

        await writeFileAsync('package.json', JSON.stringify(packageJson, null, 2));

        let base = `${data.imports.join("\n")}\n${data.base}`
        // Replace the merged codes in the base content
        let mergedContent = base.replace(
            '{DONT_TOUCH_THIS}',
            data.codes.join('\n')
        );

        // Create index.js file with the merged content and imports
        await writeFileAsync('index.js', mergedContent);

        // Create .env file with env content
        await writeFileAsync('.env', data.env.trim());

        console.log('Project files created successfully.');
    } catch (error) {
        console.error('Error creating project files:', error);
    }


}
main();