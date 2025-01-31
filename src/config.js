import { fileURLToPath } from "url"
import Plugins from "../lib/_plugins.js"
import path from "path"
import fs from "fs"

global.origen = path.dirname(fileURLToPath(import.meta.url))
global._config = {
    owner: {
        number: "573234097278",
        name: "Ale Devs"
    },
    bot: {
        name: "Dev's Ofc",
        image: "./nazi.jpg",
        hd: "https://files.catbox.moe/kkdvjl.jpg"
    },
    mods: ['51968374620', '51979549311', '573013116003'],
    prefix: ['!', '?', '/', '.', '#'],
    react: {
        setting: '⚙️',
        wait: '⏳',
        global: '✨',
        error: '❌'
    },
}

global.plugins = []
const plugin = new Plugins('plugins')
plugin.readPlugin(plugin.folder)
global.plugins = Object.values(plugin.plugins)

global.node_path = 'db.json';

if (!fs.existsSync(node_path)) {
    fs.writeFileSync(node_path, JSON.stringify({ data: { users: {}, chats: {}, settings: {} } }, null, 2));
}

global.db = JSON.parse(fs.readFileSync(node_path, 'utf-8'))
