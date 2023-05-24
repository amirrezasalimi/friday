import fetch from "node-fetch";

// supported models: gpt-3.5-turbo, gpt-4 , gpt-4-32k
class AiService {
    async generate({ messages = [], config}) {
        const _config = {
            model: "gpt-4",
            temperature: 0.7,
            ...config
        }
        switch (_config.model) {
            case "gpt-4":
            case "gpt-4-32k":
            case "gpt-3.5-turbo":
                return this.gptChatReq({config,messages});
        }
    }
    gptChatReq({ config, messages }) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        };

        const data = {
            "model": config.model,
            "messages": messages,
            "temperature": config.temperature
        };

        return new Promise((resolve, reject) => {
            return fetch(`${config.endPoint}/chat/completions`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            })
                .then((res)=>res.json())
                .then(res => {
                    console.log(JSON.stringify(res,1,1));
                    return resolve(res);
                })
                .catch(error => {
                    console.log(error);
                    return reject(error);
                });
        })
    }

}
export default AiService;