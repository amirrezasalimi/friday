import fetch from "node-fetch";

// supported models: gpt-3.5-turbo, gpt-4 , gpt-4-32k
class AiService {
    async generate({ messages = [], config = {
        apiKey,
        endPoint,
    } }) {
        const _config = {
            model: "gpt-4",
            temperature: 0.7,
            ...config
        }
        switch (model) {
            case "gpt-4":
            case "gpt-4-32k":
            case "gpt-3.5-turbo":
                return gptChatReq(_config);
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
            return fetch(config.endPoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(result => {
                    return resolve(result);
                })
                .catch(error => {
                    return reject(error);
                });
        })
    }

}
export default AiService;