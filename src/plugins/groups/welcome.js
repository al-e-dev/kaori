export default {
    name: 'welcome',
    params: ['activar', 'desactivar', 'on', 'off'],
    desc: 'Activa o desactiva la bienvenida en el grupo',
    comand: ['welcome'],
    exec: async (m, { sock, db }) => {
        const [action] = m.args;
        if (!['activar', 'desactivar', 'on', 'off'].includes(action)) {
            return sock.sendMessage(m.from, { text: 'Uso: .welcome <activar|desactivar|on|off>' }, { quoted: m });
        }

        const chat = db.data.chats[m.from];
        chat.welcome = action === 'activar' || action === 'on' ? true : false;
        await sock.sendMessage(m.from, { text: `Bienvenida ${chat.welcome ? 'activada' : 'desactivada'}` }, { quoted: m });
    }
};
