const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
require("dotenv").config

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
// const MockAdapter = require('@bot-whatsapp/database/mock')
const MonggoAdapter = require('@bot-whatsapp/database/mongo')
const { delay } = require('@whiskeysockets/baileys')
const { handlerAI } = require('./whisper')

const path = require('path');
const fs = require('fs');
const chat = require("./chatGPT")

const menuPath = path.join(__dirname, "messages", "menu.txt")
const menu = fs.readFileSync(menuPath, "utf-8")

const requestPath = path.join(__dirname, "messages", "prompRequest.txt")
const prompRequest = fs.readFileSync(requestPath, "utf-8")


const flowVoice = addKeyword(EVENTS.VOICE_NOTE).addAnswer("Esta es una nota de voz", null, async (ctx, ctxFn) => {
    const text = await handlerAI(ctx);
    const prompt = prompRequest
    const consulta = text
    const answer = await chat(prompt, consulta)
    await ctxFn.flowDynamic(answer.content)
});


const flowMenu = addKeyword(EVENTS.ACTION)
    .addAnswer('Este es el menu', {
        media: "https://www.avalongolfclub.net/media/attachments/2025/05/02/linksdinner4.18.25.pdf"
    })

const flowReservar = addKeyword(EVENTS.ACTION)
    .addAnswer('Este es el flow reservas')

const flowConsultas = addKeyword(EVENTS.ACTION)
    .addAnswer('Este es el flow consultas')
    .addAnswer("Hace tu consulta", { capture: true }, async (ctx, ctxFn) => {
        const prompt = prompRequest
        const consulta = ctx.body
        const answer = await chat(prompt, consulta)
        console.log(answer)
        await ctxFn.flowDynamic(answer.content)
    })


// const flowWelcome = addKeyword(EVENTS.WELCOME)
//     .addAnswer("Este es el flujo welcome",{
//         delay:100,
//     },
//         async (ctx, ctxFn) => {
//             console.log(ctx.body)
//         }) 

const menuFlow = addKeyword("Menu").addAnswer(
    menu,
    { capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        if (!['1', '2', '3', '0'].includes(ctx.body)) {
            return fallBack(
                'Respuesta no valida, por favor selecciona una de las opciones.'
            );
        }
        switch (ctx.body) {
            case '1':
                return gotoFlow(flowMenu);
            case '2':
                return gotoFlow(flowReservar);
            case '3':
                return gotoFlow(flowConsultas);

            case '0':
                return await flowDynamic(
                    "Saliendo... Puedes volver a acceder a este menu escribiendo '*Menu*'"
                );
        }
    }
)


const main = async () => {
    const adapterDB = new MonggoAdapter({
        dbUri: process.env.MONGO_DB_URI,
        dbName: "WhatsappTest"
    })
    const adapterFlow = createFlow([menuFlow, flowMenu, flowReservar, flowConsultas, flowVoice])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
