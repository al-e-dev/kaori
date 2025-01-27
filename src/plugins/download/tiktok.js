import Tiktok from "../../scraper/tiktok.js"

export default {
    name: 'tiktok',
    params: ['query'],
    description: 'Descarga o busca videos de TikTok',
    comand: ['tiktok'],
    exec: async (m, { sock }) => {
        Tiktok.download(m.text)
            .then(async ({ data }) => {
                await sock.sendMessage(m.from, {
                    caption: 'Video de TikTok',
                    footer: _config.owner.name,
                    video: { url: data.media.nowatermark.play },
                    buttons: [
                        {
                            buttonId: data.music.play,
                            buttonText: {
                                displayText: 'Audio'
                            },
                        }
                    ],
                    headerType: 6,
                    viewOnce: true
                }, { quoted: m })
            })
            .catch(error => console.error('Error capturado:', error))
    }
}