import { exec } from "child_process";

export default {
    name: 'pm2Restart',
    params: ['scriptName'],
    desc: 'Reinicia un script con PM2',
    comand: ['pm2restart'],
    exec: async (m, { sock }) => {
        exec(`pm2 restart ${m.text}`, (err, stdout, stderr) => {
            if (err) {
                sock.sendMessage(m.from, { text: `Error al reiniciar el script: ${err.message}` }, { quoted: m });
            } else {
                sock.sendMessage(m.from, { text: `Script ${m.text} reiniciado con éxito.` }, { quoted: m });
            }
        });
    }
}