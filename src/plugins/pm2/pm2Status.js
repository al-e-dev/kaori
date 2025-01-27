import { exec } from "child_process";

export default {
    name: 'pm2Status',
    params: [],
    desc: 'Obtiene el estado de los scripts activos con PM2',
    comand: ['pm2status'],
    exec: async (m, { sock }) => {
        exec(`pm2 jlist`, (err, stdout, stderr) => {
            if (err) {
                sock.sendMessage(m.from, { text: `Error al obtener el estado: ${err.message}` }, { quoted: m });
            } else {
                const processes = JSON.parse(stdout)
                const simplifiedOutput = processes.map(proc => {
                    return `Nombre: ${proc.name}\nID: ${proc.pm_id}\nEstado: ${proc.pm2_env.status}\nCPU: ${proc.monit.cpu}%\nMemoria: ${(proc.monit.memory / 1024 / 1024).toFixed(2)} MB`;
                }).join('\n\n')
                sock.sendMessage(m.from, { text: `Estado:\n${simplifiedOutput}` }, { quoted: m })
                sock.sendMessage(m.from, { text: JSON.stringify(JSON.parse(stdout), null, 2) }, { quoted: m })
            }
        })
    }
}
