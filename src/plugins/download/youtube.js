
export default {
    name: 'youtube',
    params: ['query'],
    description: 'Busca y descarga videos de YouTube',
    comand: ['youtube'],
    exec: async (m, { sock }) => {
        if (!m.text) return sock.sendMessage(m.from, { text: "No se proporcionó una búsqueda." }, { quoted: m })

        const video = await YouTube.searchOne(m.text)
        if (!video) return sock.sendMessage(m.from, { text: "No se encontraron resultados." }, { quoted: m })

        await sock.sendMessage(m.from, {
            caption: `*Título:* ${video.title}\n*Duración:* ${video.durationFormatted}\n*Canal:* ${video.channel.name}\n*Vistas:* ${video.views}\n*Subido:* ${video.uploadedAt}\n\n_Tiempo limite para responder 5 minutos_\n_Solo el remitente puede responder._`,
            footer: _config.owner.name,
            image: { url: video.thumbnail.url },
            buttons: [
                { buttonId: 'audio', buttonText: { displayText: 'Audio' }, type: 1 },
                { buttonId: 'video', buttonText: { displayText: 'Video' }, type: 1 }
            ],
            headerType: 6,
            viewOnce: true
        }, { quoted: m })

        const filter = msg => msg.key.remoteJid === m.from && msg.key.participant === m.sender
        const timeout = setTimeout(() => sock.ev.off('messages.upsert', response), 5 * 60 * 1000)

        const response = async ({ messages }) => {
            for (let msg of messages) {
                if (msg.message?.buttonsResponseMessage && filter(msg)) {
                    clearTimeout(timeout)
                    sock.ev.off('messages.upsert', response)

                    const type = msg.message.buttonsResponseMessage.selectedButtonId === 'audio' ? 'audio' : 'video'
                    const url = `https://api.botcahx.eu.org/api/download/get-YoutubeResult?url=https://youtu.be/${video.id}&type=${type}&xky=zMxPoM%C2%81S`

                    await sock.sendMessage(m.from, type === 'audio' ? { audio: { url }, mimetype: 'audio/mp4' } : { video: { url }, caption: video.title }, { quoted: m })
                }
            }
        }

        sock.ev.on('messages.upsert', response)
    }
}