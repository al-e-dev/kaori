import Youtube from "../../scraper/youtube.js"

export default {
    name: 'ytmp4',
    params: ['url'],
    description: 'Busca y descarga videos de YouTube',
    comand: ['playmp4', 'ytvideo', 'ytmp4'],
    exec: async (m, { sock }) => {
        let result

        let url = new URL(m.text).href
        if (url) {
            result = await Youtube.getInfo(m.text)
        } else {
            const search = await Youtube.search(m.text)
            result = search[0]
        }
        console.log(result)
        const download = await Youtube.convert(result.url, 360)
        console.log(download)

        await sock.sendMessage(m.from, {
            video: { url: download.url },
            caption: `Video de ${result.author} descargado con éxito`
        })
    }
}