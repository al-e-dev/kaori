import { format } from "util"
import Twitter from "../../scraper/x.js"

export default {
    name: 'x',
    params: ['url'],
    description: 'Busca y descarga audio de x',
    comand: ['x', 'twitter'],
    exec: async (m, { sock }) => {
        await Twitter.download(m.text).then((data) => {
            m.reply(format(data))
        }).catch(err => m.reply(err.message))
    }
}