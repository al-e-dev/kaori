export default {
    name: 'setpromote',
    params: ['message'],
    desc: 'Modificar el mensaje de promoción',
    comand: ['setpromote'],
    exec: async (m, { sock, db }) => {
        if (!m.isOwner) return sock.sendMessage(m.from, { text: 'Este comando solo puede ser usado por el propietario.' });
        const chat = db.data.chats[m.from];
        if (!chat) return sock.sendMessage(m.from, { text: 'Chat no encontrado.' });
        const message = m.text;
        if (!message) return sock.sendMessage(m.from, { text: 'Mensaje inválido.' });
        chat.messages.promote = message;
        await sock.sendMessage(m.from, { text: 'Mensaje de promoción actualizado.' });
    }
};
