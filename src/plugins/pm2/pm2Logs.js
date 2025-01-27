import { exec } from "child_process";

export default {
    name: 'pm2Logs',
    params: ['scriptName'],
    desc: 'Obtiene los logs de un script con PM2',
    comand: ['pm2logs'],
    exec: async (m, { sock }) => {
        exec(`pm2 logs ${m.text}`, (err, stdout, stderr) => {
            if (err) {
                sock.sendMessage(m.from, { text: `Error al obtener los logs: ${err.message}` }, { quoted: m });
            } else {
                const simplifiedLogs = stdout.split('\n').slice(-10).join('\n');
                sock.sendMessage(m.from, { text: `Logs de ${m.text}:\n${simplifiedLogs}` }, { quoted: m });
            }
        });
    }
}
