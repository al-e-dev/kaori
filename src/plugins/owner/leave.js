export default {
    name: 'leave',
    params: [],
    desc: 'Salir del grupo',
    comand: ['leave', 'salir'],
    exec: async (m, { sock }) => {
        if (!m.isOwner) return sock.sendMessage(m.from, { text: 'Este comando solo puede ser usado por el propietario.' });
        const metadata = await sock.groupMetadata(m.from);
        await sock.sendMessage(m.from, { text: `Saliendo del grupo ${metadata.subject}...` });
        await delay(5000);
        await sock.groupLeave(m.from).then(async () => {
            await sock.sendMessage(m.sender, { text: `Has salido del grupo ${metadata.subject} exitosamente.` });
        }).catch(async () => {
            await sock.sendMessage(m.from, { text: 'Error al intentar salir del grupo.' });
        });
    },
    isOwner: true
};
