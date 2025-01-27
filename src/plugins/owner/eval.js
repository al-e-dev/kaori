import { format } from "util"

export default {
    name: 'eval',
    params: ['eval', '%eval'],
    desc: 'eval',
    isOwner: true,
    comand:  /^[_]/i,
    exec: async (m, { sock }) => {
        let evan
        let text = /await|return/gi.test(m.body) ? `(async () => { ${m.body.slice(1)} })()` : `${m.body.slice(1)}`
        try {
            evan = await eval(text)
        } catch (e) {
            evan = e
        } finally {
            sock.sendMessage(m.from, { text: format(evan) }, { quoted: m })
        }
    }
}