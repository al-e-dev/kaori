import Threads from "../../scraper/threads.js"

export default {
    name: 'threads',
    params: ['url'],
    description: 'Busca y descarga audio de threads',
    comand: ['threads', 'thread'],
    exec: async(m, { sock }) => {
        const thread = Threads.download(m.text)

        if (thread.download.length > 0) {
            await sock.sendAlbumMessage(
                m.from,
                thread.download.map((img) => ({
                    type: img.type,
                    data: { url: img.url }
                })),
                {
                    caption: `Creador: ${thread.author.username}`,
                    delay: 3000
                }
            )
        } else {
            await sock.sendMessage(m.from, { [thread.download.type]: { url: thread.download.download }, caption: thread.author.username });
        }

    }
}