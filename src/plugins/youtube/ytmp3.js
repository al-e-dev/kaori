import Youtube from "../../scraper/youtube.js"

export default {
    name: 'ytmp3',
    params: ['query'],
    description: 'Busca y descarga audio de YouTube',
    comand: ['playmp3', 'ytaudio', 'ytmp3'],
    exec: async (m, { sock }) => {
        let result
        if (new URL(m.text).href) {
            result = await Youtube.getInfo(m.text)
        } else {
            const search = await Youtube.search(m.text)
            result = search[0]
        }

        const download = await Youtube.convert(result.url)

        await sock.sendMessage(m.from, {
            audio: { url: download.url },
            mimetype: 'audio/mpeg',
            ptt: true
        })
    }
}