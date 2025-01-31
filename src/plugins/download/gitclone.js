export default {
    name: 'gitclone',
    params: ['<url>'],
    desc: 'Clona un repositorio de GitHub',
    comand: ['gitclone'],
    exec: async (m, { sock }) => {
        const url = m.text

        const [user, repo] = url.match(/(?:https|git)(?::\/\/|@)github\.com[:\/](.+?)\/(.+?)(?:\.git|$)/i) || []
        const gitUrl = `https://api.github.com/repos/${user}/${repo.replace('.git', '')}/zipball`
        const { headers } = await fetch(gitUrl, { method: 'HEAD' })
        const filename = headers.get('content-disposition')?.match(/filename=(.*)/)[1]

        await sock.sendMessage(m.from, {
            document: { url: gitUrl },
            fileName: `${filename}.zip`,
            mimetype: 'application/zip'
        }, { quoted: m })

    }
}