import Tiktok from "../../scraper/tiktok.js"

export default {
    name: 'tiktoksearch',
    params: ['query'],
    description: 'Busca videos de TikTok y muestra 10 resultados',
    comand: ['tiktoksearch'],
    exec: async (m, { sock }) => {
        Tiktok.search(m.text)
            .then(async ({ data }) => {
                const buttons = data.map((item, index) => ({
                    buttonId: `tiktok_${index}`,
                    buttonText: { displayText: item.title },
                    type: 1
                }))

                await sock.sendMessage(m.from, {
                    text: 'Resultados de búsqueda de TikTok:',
                    buttons: buttons,
                    headerType: 1
                }, { quoted: m })

                sock.ev.on('messages.upsert', async ({ messages }) => {
                    for (let msg of messages) {
                        const selectedButtonId = msg.message?.buttonsResponseMessage?.selectedButtonId
                        if (selectedButtonId && selectedButtonId.startsWith('tiktok_')) {
                            const index = parseInt(selectedButtonId.split('_')[1])
                            const selectedVideo = data[index]

                            await sock.sendMessage(m.from, {
                                caption: selectedVideo.title,
                                footer: _config.owner.name,
                                video: { url: selectedVideo.media.nowatermark },
                                buttons: [
                                    {
                                        buttonId: "audio",
                                        buttonText: {
                                            displayText: 'Audio'
                                        }
                                    }
                                ],
                                headerType: 6,
                                viewOnce: true
                            }, { quoted: m })

                            sock.ev.on('messages.upsert', async ({ messages }) => {
                                for (let msg of messages) {
                                    if (msg.message?.buttonsResponseMessage?.selectedButtonId === 'audio') {
                                        await sock.sendMessage(m.from, {
                                            audio: { url: selectedVideo.music.play },
                                            mimetype: 'audio/mp4'
                                        }, { quoted: m })
                                    }
                                }
                            })
                        }
                    }
                })
            })
            .catch(error => console.error('Error capturado:', error))
    }
}
