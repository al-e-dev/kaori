export default {
    name: 'antilink',
    params: ['on/off'],
    description: 'Habilitar o deshabilitar antilink',
    comand: ['antilink'],
    exec: async (m, { sock, db }) => {
        if (!m.isOwner) return sock.sendMessage(m.from, { text: 'Este comando solo puede ser usado por el propietario.' });
        const chat = db.data.chats[m.from];
        if (!chat) return sock.sendMessage(m.from, { text: 'Chat no encontrado.' });
        const action = m.args[0]?.toLowerCase();
        if (action === 'on') {
            if (chat.antilink) return sock.sendMessage(m.from, { text: 'Antilink ya está habilitado.' });
            chat.antilink = true;
            await sock.sendMessage(m.from, { text: 'Antilink habilitado.' });
        } else if (action === 'off') {
            if (!chat.antilink) return sock.sendMessage(m.from, { text: 'Antilink ya está deshabilitado.' });
            chat.antilink = false;
            await sock.sendMessage(m.from, { text: 'Antilink deshabilitado.' });
        } else {
            await sock.sendMessage(m.from, { text: 'Opción inválida.' });
        }
    },
    isAdmin: true,
    isGroup: true
}