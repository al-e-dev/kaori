import Facebook from "../../scraper/facebook.js"

export default {
    name: 'facebook',
    params: ['url'],
    description: 'Busca y descarga audio de Facebook',
    comand: ['facebook', 'fb'],
    exec: async (m, { sock }) => {
        const fb = await Facebook.download(m.text)

        console.log(fb)
        if (fb) {
            await sock.sendMessage(m.from, { [fb.type]: { url: fb.download, caption: fb.author } })
        } else {
            await sock.sendAlbumMessage(m.from, fb.images.map(img => ({ type: "image", data: { url: img } })), { caption: fb.author })
        }
    }
}