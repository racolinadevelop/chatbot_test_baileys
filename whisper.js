const { downloadMediaMessage } = require("@adiwajshing/baileys");
const { OpenAI } = require("openai");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
ffmpeg.setFfmpegPath(ffmpegPath);

const voiceToText = async (path) => {
    if (!fs.existsSync(path)) {
        throw new Error("No se encuentra el archivo");
    }
    try {
        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const transcription = await client.audio.transcriptions.create({
            file: fs.createReadStream(path),
            model: "gpt-4o-mini-transcribe",
        });
        return transcription.text;
    } catch (err) {
        console.log(err)
        console.log(err.response);
        return "ERROR";
    }
};

const convertOggMp3 = async (inputStream, outStream) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputStream)
            .audioQuality(96)
            .toFormat("mp3")
            .save(outStream)
            .on("progress", (p) => null)
            .on("end", () => {
                resolve(true);
            });
    });
};
const handlerAI = async (ctx) => {
    const buffer = await downloadMediaMessage(ctx, "buffer");
    const pathTmpOgg = `${process.cwd()}/tmp/voice-note-${Date.now()}.ogg`;
    const pathTmpMp3 = `${process.cwd()}/tmp/voice-note-${Date.now()}.mp3`;
    await fs.writeFileSync(pathTmpOgg, buffer);
    await convertOggMp3(pathTmpOgg, pathTmpMp3);
    const text = await voiceToText(pathTmpMp3);
    fs.unlink(pathTmpMp3, (error) => {
        if (error) throw error;
    });
    fs.unlink(pathTmpOgg, (error) => {
        if (error) throw error;
    });
    return text;
};
module.exports = { handlerAI };