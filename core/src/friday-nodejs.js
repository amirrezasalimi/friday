import AiService from "./ai-chat";
import { removeCodeSnippet, removeDirectory } from "./utils";
import fs from 'fs';

class FridayNodeJs {
    aiConfig
    data = {
        base_code: "",
        codes: [],
        env: "",
        imports: [],
        packages: []
    }
    constructor({ aiConfig }) {
        this.aiConfig = aiConfig;
    }
    async *generate({
        basePrompt, sections,
    }) {
        const data = this.data;

        const startTime = process.hrtime();
        const aiChat = new AiService();
        try {
            yield this.res({
                title: "Detecting Needed Packages",
                step: 1,
                done: false
            });
            // step1 request for packages need
            const res1 = await aiChat.generate({
                config: this.aiConfig,
                messages: [
                    {
                        "role": "user",
                        "content": `
+ you are an expert nodejs es6 developer.
+ according to the prompt context and used packages in it , give used packages in a json list format : []
+ if packages versions not known use @latest on end of them

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
            });

            const msg1 = res1.choices[0].message.content;
            const regex = /packages:([\s\S]*?)test packages:([\s\S]*)/;
            const matches = regex.exec(msg1);

            if (matches) {
                const packagesSection = JSON.parse(matches[1].trim())
                const testPackagesSection = JSON.parse(matches[2].trim())

                data.packages = [
                    ...packagesSection,
                    ...testPackagesSection
                ]
            }

            data.packages.push("dotenv@latest")
            // step 2 (request for base code)
            yield this.res({
                title: "Generating index.js + .env",
                step: 2,
                done: false
            });

            const res2 = await aiChat.generate({
                config: this.aiConfig,
                messages: [
                    {
                        "role": "user",
                        "content": `
according to my context , i give you the used packages names with their version , then you should implement a very basic index.js file codes in es6 js , attention to roles.
roles:
- use context just for making base code, no extra talk and comments
- there should no action or any comment in the code
- use dotenv package anyway
- don't override the "DONT_TOUCH_THIS" 
- don't use markdown for codes
- packages imports should be all in es6 format

- sample:
context: 
a simple discord bot
use discord.js@latest and ...

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

            });

            const msg2 = res2.choices[0].message.content;
            const regex2 = /.env:([\s\S]*?)index.js:([\s\S]*)/;
            const matches2 = regex2.exec(msg2);

            data.base_code = removeCodeSnippet(matches2[2]);
            data.env = matches2[1]

            // step 3 | generate sections codes
            let i = 1;
            for (const taskPrompt of sections) {
                const taskRes = await aiChat.generate({
                    config: {
                        temperature: 0.5,
                        ...this.aiConfig
                    },
                    messages: [
                        {
                            "role": "user",
                            "content": `
you are an expert nodejs es6 developer , i give you needed section and please give me the missing codes only.

index.js description:
${basePrompt}
used packages: ${data.packages.join(",")}

index.js codes:
${data.base_code}

needed section instruction:
${taskPrompt}

+ roles 
- only give missing codes not complete
- attention to the needed section instruction , and write only needed codes not any more
don't write codes that not requested in needed section
only give missing codes without talk
- if no need to any imports just let empty that section

- if imports exists in the index.js codes , do not add it imports . 
- don't use markdown for new codes and imports in answer
- your codes has no any bugs or syntax problems

- search for all used packages in new codes and list them in "used packages" section , like sample.


answer exactly in this format:

imports:
import x from 'y'


new codes:


used packages:
["test@latest"]
`
                        }
                    ]
                });

                const text = taskRes.choices[0].message.content;


                console.log(text);

                // Extract "used packages"
                const usedPackagesRegex = /used packages:\n(\[.*?\])/s;
                const usedPackagesMatch = text.match(usedPackagesRegex);
                const usedPackages = usedPackagesMatch ? JSON.parse(usedPackagesMatch[1]) : [];

                console.log('Used Packages:', usedPackages);

                // Extract "new codes"
                const newCodesRegex = /new codes:\n+([\s\S]*?)(?=\n\nused packages:|$)/i
                const newCodesMatch = text.match(newCodesRegex);
                const newCodes = newCodesMatch ? newCodesMatch[1].trim() : '';

                console.log('New Codes:', newCodes);

                // Extract "imports"
                const importsRegex = /imports:(.*?)new codes:/ims;
                const importsMatch = text.match(importsRegex);
                const imports = importsMatch ? importsMatch[1].trim() : '';

                console.log('Imports:', imports);


                data.packages = [
                    ...data.packages,
                    ...usedPackages
                ]
                data.imports = [
                    ...data.imports,
                    removeCodeSnippet(imports)
                ]
                data.codes.push(removeCodeSnippet(newCodes));

                yield this.res({
                    title: `Generating section ${i}`,
                    step: 3,
                    done: false
                });
                i++;
            }
            await new Promise(r => setTimeout(r, 200));

            // Calculate the elapsed time
            const endTime = process.hrtime(startTime);

            // Convert the elapsed time to milliseconds
            const runtimeMs = endTime[0] * 1000 + endTime[1] / 1000000;

            yield this.res({
                title: `Done`,
                step: 4,
                done: true,
                time: runtimeMs
            });
        } catch (e) {
            yield this.res({
                title: `Error happend\n:${e.message}`,
                step: 4,
                done: false,
                error: e.message,
                full_error: e
            });
        }
    }
    res(_data) {
        return _data;
    }
    async createProject(projecDir, data) {
        try {
            // Create the project directory if it doesn't exist
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
                name: "project",
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

            fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

            let base = `${data.imports.join("\n")}\n${data.base_code}`
            // Replace the merged codes in the base context
            let mergedContent = base.replace(
                '{DONT_TOUCH_THIS}',
                data.codes.join('\n')
            );

            // Create index.js file with the merged content and imports
            fs.writeFileSync('index.js', mergedContent);

            // Create .env file with env content
            fs.writeFileSync('.env', data.env.trim());

            console.log('Project files created successfully.');
        } catch (error) {
            console.error('Error creating project files:', error);
        }
    }
}
export default FridayNodeJs;