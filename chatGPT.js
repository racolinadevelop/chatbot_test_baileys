const { OpenAI } = require("openai");
require("dotenv").config();

const chat = async (prompt, text) => {
    try {
        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: text},
        ],
        });
        return  completion.choices[0].message;


        // const configuration = new OpenAI({
        //     apiKey: process.env.OPENAI_API_KEY,
        // });
        // const openai = new OpenAIApi(configuration);
        // const completion = await openai.createChatCompletion({
        //     model: "gpt-4o-mini",
        //     messages:[
        //         { role: "system", content: prompt },
        //         { role: "user", content: text },
        //     ]
        // });
        // console.log(completion.data.choices[0].message)
        // return  completion.data.choices[0].message;
    } catch (err) {
        console.log("Error al conectar con OpenAI:",err);
        return "ERROR"
    }
};

module.exports = chat;