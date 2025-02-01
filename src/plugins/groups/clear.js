export default {
    name: 'clear cache',
    params: ['random', '%comand'],
    description: 'Carga el menu de comandos',
    comand: ['clear'],
    exec: async (m, { sock, db }) => {
        const chat = db.data.chats[m.from]
        if (chat?.cache) {
            chat.cache = []
            await sock.sendMessage(m.from, { text: "La caché de mensajes eliminados ha sido limpiada." })
        } else {
            await sock.sendMessage(m.from, { text: "No hay caché de mensajes eliminados para limpiar." })
        }
    },
    isAdmin: true,
    isGroup: true
}