import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    name: 'menu',
    params: [],
    description: 'Carga el menu de comandos',
    comand: ['menu'],
    exec: async (m, { sock }) => {
        const categories = fs.readdirSync(__dirname).filter(f => fs.statSync(path.join(__dirname, f)).isDirectory())
        const menuText = (await Promise.all(categories.map(async cat => {
            const cmds = await Promise.all(fs.readdirSync(path.join(__dirname, cat))
                .filter(f => f.endsWith('.js'))
                .map(async f => {
                    const { default: cmd } = await import(pathToFileURL(path.join(__dirname, cat, f)).href)
                    return `.${cmd.name}`
                }));
            return cmds.length ? `${cat}:\n${cmds.join('\n')}\n` : ''
        }))).filter(Boolean).join('\n')
        
        await sock.sendMessage(m.from, { text: `Menu de comandos:\n\n${menuText}` }, { quoted: m })
    }
};