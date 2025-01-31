export default {
    name: 'setmodify',
    params: ['message'],
    desc: 'Modificar el mensaje de modificación',
    comand: ['setmodify'],
    exec: async (m, { sock, db }) => {
        if (!m.isOwner) return sock.sendMessage(m.from, { text: 'Este comando solo puede ser usado por el propietario.' });
        const chat = db.data.chats[m.from];
        if (!chat) return sock.sendMessage(m.from, { text: 'Chat no encontrado.' });
        const message = m.text;
        if (!message) return sock.sendMessage(m.from, { text: 'Mensaje inválido.' });
        chat.messages.modify = message;
        await sock.sendMessage(m.from, { text: 'Mensaje de modificación actualizado.' });
    }
};
