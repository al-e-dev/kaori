import Twitter from "../../scraper/x.js"

export default {
    name: 'x',
    params: ['url'],
    description: 'Busca y descarga audio de x',
    comand: ['x', 'twitter'],
    exec: async (m, { sock }) => {
        const X = Twitter.download(m.text)
        m.reply(JSON.stringify(X, null, 2))
    }
}