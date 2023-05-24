import fs from "fs"
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