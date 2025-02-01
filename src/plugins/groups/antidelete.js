export default {
    name: 'antidelete',
    params: ['on/off'],
    description: 'Habilitar o deshabilitar antidelete',
    comand: ['antidelete'],
    exec: async (m, { sock, db }) => {
        if (!m.isOwner) return sock.sendMessage(m.from, { text: 'Este comando solo puede ser usado por el propietario.' });
        const chat = db.data.chats[m.from];
        if (!chat) return sock.sendMessage(m.from, { text: 'Chat no encontrado.' });
        const action = m.args[0]?.toLowerCase();
        if (action === 'on') {
            if (chat.antidelete) return sock.sendMessage(m.from, { text: 'Antidelete ya está habilitado.' });
            chat.antidelete = true;
            await sock.sendMessage(m.from, { text: 'Antidelete habilitado.' });
        } else if (action === 'off') {
            if (!chat.antidelete) return sock.sendMessage(m.from, { text: 'Antidelete ya está deshabilitado.' });
            chat.antidelete = false;
            await sock.sendMessage(m.from, { text: 'Antidelete deshabilitado.' });
        } else {
            await sock.sendMessage(m.from, { text: 'Opción inválida.' });
        }
    },
    isAdmin: true,
    isGroup: true
}
