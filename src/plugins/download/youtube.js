import YouTube from "../../scraper/youtube.js";

export default {
    name: 'youtube',
    params: ['query'],
    description: 'Busca y descarga videos de YouTube',
    comand: ['youtube', 'yt'],
    exec: async (m, { sock }) => {
        const youtube = new YouTube();
        const video = await youtube.search(m.text);

        await sock.sendMessage(m.from, {
            caption: `*Título:* ${video.title}\n*Duración:* ${video.durationFormatted}\n*Canal:* ${video.channel.name}\n*Vistas:* ${video.views}\n*Subido:* ${video.uploadedAt}\n\n_Tiempo limite para responder 5 minutos_\n_Solo el remitente puede responder._`,
            footer: 'Bot',
            image: { url: video.thumbnail.url },
            buttons: [
                { buttonId: 'audio', buttonText: { displayText: 'Audio' }, type: 1 },
                { buttonId: 'video', buttonText: { displayText: 'Video' }, type: 1 }
            ],
            headerType: 6,
            viewOnce: true
        }, { quoted: m });

        const filter = response => response.key.remoteJid === m.from && response.key.participant === m.sender;
        const timeout = setTimeout(() => {
            sock.ev.off('messages.upsert', responseHandler);
        }, 5 * 60 * 1000);

        const responseHandler = async response => {
            if (response.messages[0].message && response.messages[0].message.buttonsResponseMessage && filter(response.messages[0])) {
                clearTimeout(timeout);
                sock.ev.off('messages.upsert', responseHandler);

                const type = response.messages[0].message.buttonsResponseMessage.selectedButtonId === 'audio' ? 'audio' : 'video';
                const downloadUrl = `https://api.botcahx.eu.org/api/download/get-YoutubeResult?url=https://youtu.be/${video.id}&type=${type}&xky=zMxPoM%C2%81S`;

                if (type === 'audio') {
                    await sock.sendMessage(m.from, { audio: { url: downloadUrl }, mimetype: 'audio/mp4' }, { quoted: m });
                } else {
                    await sock.sendMessage(m.from, { video: { url: downloadUrl }, caption: video.title }, { quoted: m });
                }
            }
        };

        sock.ev.on('messages.upsert', responseHandler);
    }
}