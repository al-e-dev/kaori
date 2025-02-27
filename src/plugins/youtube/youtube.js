import YouTube from "../../scraper/youtube.js"

export default {
    name: 'youtube',
    params: ['message'],
    description: 'Busca y descarga videos y audios de YouTube',
    comand: ['youtube', 'yt', 'play'],
    os: true,
    exec: async (m, { sock }) => {
        const videos = await YouTube.search(m.text)
        const video = videos[0]

        sock.sendMessage(m.from, {
            caption: `*Título:* ${video.title}\n*Duración:* ${video.duration}\n*Canal:* ${video.author}\n*Vistas:* ${video.viewers}\n*Subido:* ${video.published}\n\n_Tiempo limite para responder 5 minutos_\n_Solo el remitente puede responder._`,
            footer: _config.bot.name,
            image: { url: video.thumbnail },
            buttons: [
                { buttonId: '.ytmp3 ' + video.url, buttonText: { displayText: 'Audio' } },
                { buttonId: '.ytmp4 ' + video.url, buttonText: { displayText: 'Video' } }
            ],
            headerType: 6,
            viewOnce: true
        })
    }
}