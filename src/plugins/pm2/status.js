import { exec } from "child_process";

export default {
    name: 'pm2Status',
    params: [],
    desc: 'Obtiene el estado de los scripts activos con PM2',
    comand: ['pm2status'],
    exec: async (m, { sock }) => {
        exec(`pm2 jlist`, (err, stdout) => {
            if (err) {
                return sock.sendMessage(m.from, { text: `Error al obtener el estado: ${err.message}` }, { quoted: m });
            }

            const processes = JSON.parse(stdout);
            const detailedOutput = processes.map(({ name, pm_id, pid, pm2_env, monit }) => {
                const { status, node_version, version, pm_exec_path, versioning, pm_uptime, restart_time, error, axm_monitor } = pm2_env;
                const cpu = monit.cpu;
                const memory = (monit.memory / 1024 / 1024).toFixed(2);
                const uptime = ((Date.now() - pm_uptime) / 1000).toFixed(0);
                const eventLoopLatencyP50 = axm_monitor['Event Loop Latency']?.value || 'N/A';
                const eventLoopLatencyP95 = axm_monitor['Event Loop Latency p95']?.value || 'N/A';

                return `Nombre: ${name}\nID: ${pm_id}\nPID: ${pid}\nEstado: ${status}\nCPU: ${cpu}%\nMemoria: ${memory} MB\nTiempo de actividad: ${uptime} segundos\nReinicios: ${restart_time}\nVersión de Node.js: ${node_version}\nVersión de la aplicación: ${version}\nRuta del script: ${pm_exec_path}\nRepositorio: ${versioning.url}\nRama: ${versioning.branch}\nErrores recientes: ${error || 'Ninguno'}\nLatencia del Event Loop (p50): ${eventLoopLatencyP50} ms\nLatencia del Event Loop (p95): ${eventLoopLatencyP95} ms`;
            }).join('\n\n')

            sock.sendMessage(m.from, { text: `Estado:\n${detailedOutput}` }, { quoted: m });
        })
    },
    isOwner: true
}