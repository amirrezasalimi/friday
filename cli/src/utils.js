import fs, { readFileSync } from "fs";

export function getPrompts(promptFile = "prompt") {
    const text = readFileSync(`../${promptFile}.md`);

    const regex = /#(CORE|SECTION\d)([\s\S]*?)(?=#SECTION\d|$)/g;
    let match;
    const coreContent = [];
    const sectionContents = {};

    while ((match = regex.exec(text))) {
        const sectionName = match[1];
        const sectionText = match[2].trim();

        if (sectionName === 'CORE') {
            coreContent.push(sectionText);
        } else {
            if (!sectionContents[sectionName]) {
                sectionContents[sectionName] = [];
            }
            sectionContents[sectionName].push(sectionText);
        }
    }
    const sections = [];
    for (const section in sectionContents) {
        sections.push(sectionContents[section]);
    }
    return {
        core: coreContent[0],
        sections,
    }
}

export function removeDirectory(directory) {
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

export function removeCodeSnippet(text) {
    // Remove leading newline characters if any
    text = text.replace(/^\n+/, '');

    // Remove ```javascript or ```js at the start
    text = text.replace(/^(```javascript|```js)/, '');

    // Remove ``` at the end
    text = text.replace(/```$/, '');
    text = text.replace(/```/, '');

    // Remove trailing newline characters if any
    text = text.replace(/\n+$/, '');

    return text;
}