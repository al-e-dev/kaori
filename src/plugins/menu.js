export default {
    name: 'menu',
    params: ['random', '%comand'],
    desc: 'Carga el menu de comandos',
    comand: ['menu'],
    exec: async (m, { sock }) => {
        await sock.sendMessage(m.from, { text: 'menu de comandos' }, { quoted: m })
    }
}