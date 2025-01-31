export default {
    name: 'notify',
    params: ['activar', 'desactivar', 'on', 'off'],
    desc: 'Activa o desactiva las notificaciones en el grupo',
    comand: ['notify'],
    exec: async (m, { sock, db }) => {
        const [action] = m.args;
        if (!['activar', 'desactivar', 'on', 'off'].includes(action)) {
            return sock.sendMessage(m.from, { text: 'Uso: .notify <activar|desactivar|on|off>' }, { quoted: m });
        }

        const chat = db.data.chats[m.from];
        chat.notify = action === 'activar' || action === 'on' ? true : false;
        await sock.sendMessage(m.from, { text: `Notificaciones ${chat.notify ? 'activadas' : 'desactivadas'}` }, { quoted: m });
    }
};
