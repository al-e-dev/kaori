export default {
    name: 'sticker',
    params: ['media'],
    desc: 'Convierte imagenes/videos en stickers',
    comand: ['sticker', 's'],
    isMedia: true,
    exec: async (m, { sock, v }) => {
        await sock.sendSticker(m.from, {
            [v.type.replace('Message', '')]: await v.download(),
            packname: m.pushName || 'annonimous',
            author: sock.user.name
        }, { quoted: m })
    }
}