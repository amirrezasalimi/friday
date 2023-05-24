import express from 'express';
import bodyParser from "body-parser";
import { config } from "dotenv";
import cors from "cors"
import { FridayNodeJs } from '../../../core/src';
config();

const app = express();
const port = 3000;
app.use(cors())

app.use(bodyParser.json());
app.post('/gen', async (req, res) => {
    const { core, sections } = req.body;
    console.log(core, req.body, sections);

    const fr = new FridayNodeJs({
        aiConfig: {
            apiKey: process.env.AI_TOKEN,
            endPoint: process.env.AI_ENDPOINT,
            model: "gpt-4-32k"
        }
    })
    const fridayRes = await fr.generate(core, sections);
    console.log(fridayRes);
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked',
    });

    res.flushHeaders();

    let isDone = false;
    for await (const data of fridayRes) {
        res.write(JSON.stringify(data));
        console.log(data);
        if (data.done) {
            isDone = true;
            console.log(`generate time: ${data.time / 1000} sec`);
        }
    }

    if (isDone) {
        const dir = "../../projects/last"
        await fr.createProject(dir, fr.data);
    }
    res.end();
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});