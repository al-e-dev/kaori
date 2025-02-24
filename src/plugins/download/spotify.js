import Spotify from "../../scraper/spotify.js"
import Convert from "../../scraper/_convert.js"

export default {
    name: 'spotify',
    params: ['query'],
    description: 'Busca y descarga audio de spotify',
    comand: ['spotify'],
    exec: async (m, { sock }) => {
        const results = await Spotify.search(m.text)

        const track = results[0]
        Spotify.download(track.url).then(async ({ download }) => {

            await sock.sendMessage(m.from, {
                image: { url: await Convert.spotify(track.title, track.artist.map(a => a.name).join(', '), track.thumbnail) },
                caption: `*Title:* ${track.title}\n*Artist:* ${track.artist.map(a => a.name).join(', ')}\n*Duration:* ${track.duration}\n*Popularity:* ${track.popularity}\n*Release Date:* ${track.date}`
            })

            await sock.sendMessage(m.from, {
                audio: { url: download },
                mimetype: 'audio/mp4',
                fileName: `${track.title}.mp3`
            })
        })

    }
}