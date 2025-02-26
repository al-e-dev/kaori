import Youtube from "../../scraper/youtube.js"

export default {
    name: 'ytmp4',
    params: ['message'],
    description: 'Busca y descarga videos de YouTube',
    comand: ['playmp4', 'ytvideo', 'ytmp4'],
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
            video: { url: download.url },
            caption: `Video de ${result.author} descargado con éxito`
        })
    }
}