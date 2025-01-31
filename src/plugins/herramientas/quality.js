
export default {
    name: 'quality',
    params: [],
    desc: 'Mejora la calidad de una imagen',
    comand: ['hd', 'quality'],
    media: ['image'],
    exec: async (m, { sock, v }) => {
        let download = await v.download()
        let img = await remini(download, 'enhance')
        sock.sendMessage(m.from, { image: img, caption: `Calidad mejorada` })
    }
}
