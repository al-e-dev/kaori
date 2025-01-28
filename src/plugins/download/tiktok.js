import Tiktok from "../../scraper/tiktok.js"

export default {
    name: 'tiktok',
    params: ['query', 'url'],
    description: 'Descarga o busca videos de TikTok',
    comand: ['tiktok'],
    exec: async (m, { sock }) => {
        if (m.text.startsWith('https')) {
            Tiktok.download(m.text)
                .then(async ({ data }) => {
                    await sock.sendMessage(m.from, {
                        caption: data.title,
                        footer: _config.owner.name,
                        video: { url: data.media.nowatermark.play },
                        buttons: [
                            {
                                buttonId: "",
                                buttonText: {
                                    displayText: 'Audio'
                                },
                                type: 1
                            }
                        ],
                        headerType: 6,
                        viewOnce: true
                    }, { quoted: m });
                })
                .catch(error => console.error('Error capturado:', error));
        } else {
            Tiktok.search(m.text)
                .then(async ({ data }) => {
                    const video = data[0];
                    await sock.sendMessage(m.from, {
                        caption: video.title,
                        footer: _config.owner.name,
                        video: { url: video.media.nowatermark },
                        buttons: [
                            {
                                buttonId: "a",
                                buttonText: {
                                    displayText: 'Audio'
                                },
                            }
                        ],
                        headerType: 6,
                        viewOnce: true
                    }, { quoted: m });
                })
                .catch(error => console.error('Error capturado:', error))
        }
    }
}