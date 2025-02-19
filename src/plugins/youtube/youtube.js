import YouTube from "../../scraper/youtube.js"
const log = console.log
console.log = () => {}

const { ytmp4, ytmp3 } = require('@hiudyy/ytdl')

export default {
    name: 'youtube',
    params: ['message'],
    description: 'Busca y descarga videos y audios de YouTube',
    comand: ['youtube', 'yt', 'play'],
    os: true,
    exec: async (m, { sock }) => {
        const videos = await YouTube.search(m.text);
        const video = videos[0];

        sock.sendMessage(m.from, {
            caption: `*Título:* ${video.title}\n*Duración:* ${video.duration}\n*Canal:* ${video.author}\n*Vistas:* ${video.viewers}\n*Subido:* ${video.published}\n\n_Tiempo limite para responder 5 minutos_\n_Solo el remitente puede responder._`,
            footer: _config.bot.name,
            image: { url: video.thumbnail },
            buttons: [
                { buttonId: 'audio', buttonText: { displayText: 'Audio' } },
                { buttonId: 'video', buttonText: { displayText: 'Video' } }
            ],
            headerType: 6,
            viewOnce: true
        });

        const filter = response => response.key.remoteJid === m.from && response.key.participant === m.sender;
        const timeout = setTimeout(() => {
            sock.ev.off('messages.upsert', responseHandler);
        }, 5 * 60 * 1000);

        const responseHandler = async response => {
            if (response.messages[0].message && response.messages[0].message.buttonsResponseMessage && filter(response.messages[0])) {
                clearTimeout(timeout);
                sock.ev.off('messages.upsert', responseHandler);

                const type = response.messages[0].message.buttonsResponseMessage.selectedButtonId === 'audio' ? 'audio' : 'video';

                if (type === 'audio') {
                    const audioBuffer = await ytmp3(video.url)
                    await sock.sendMessage(m.from, {
                        audio: audioBuffer,
                        mimetype: 'audio/mpeg',
                        ptt: false,
                        contextInfo: {
                            externalAdReply: {
                                mediaType: 1,
                                renderLargerThumbnail: false,
                                sourceUrl: video.url,
                                thumbnailUrl: video.thumbnail,
                                body: video.title
                            }
                        }
                    })
                } else if (type === 'video') {
                    await sock.sendMedia(m.from, await ytmp4(video.url), { caption: video.title });
                }
            }
        };

        sock.ev.on('messages.upsert', responseHandler)
    }
}

console.log = log