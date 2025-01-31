import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    name: 'menu',
    params: ['random', '%comand'],
    desc: 'Carga el menu de comandos',
    comand: ['menu'],
    exec: async (m, { sock }) => {
        const categories = fs.readdirSync(__dirname).filter(f => fs.statSync(path.join(__dirname, f)).isDirectory());
        const menuText = (await Promise.all(categories.map(async cat => {
            const cmds = await Promise.all(fs.readdirSync(path.join(__dirname, cat))
                .filter(f => f.endsWith('.js'))
                .map(async f => {
                    const { default: cmd } = await import(pathToFileURL(path.join(__dirname, cat, f)).href);
                    const paramCount = cmd.params?.length || 0;
                    const params = paramCount ? (paramCount >= 2 ? '<query/url>' : '<query>') : '';
                    return `.${cmd.name}${params ? ' ' + params : ''}`;
                }));
            return cmds.length ? `${cat}:\n${cmds.join('\n')}\n` : '';
        }))).filter(Boolean).join('\n');
        
        await sock.sendMessage(m.from, { text: `Menu de comandos:\n\n${menuText}` }, { quoted: m });
    }
};