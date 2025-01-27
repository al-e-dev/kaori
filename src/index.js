import "../src/config.js"
import baileys, {
    DisconnectReason,
    makeInMemoryStore,
    useMultiFileAuthState,
    generateWAMessageFromContent,
    makeCacheableSignalKeyStore,
    Browsers
} from "@al-e-dev/baileys"

import pino from "pino"
import readline from 'readline'
import moment from 'moment'

import { exec } from "child_process"

import { _prototype } from "../lib/_whatsapp.js"
import { _content } from "../lib/_content.js"

import database from "../lib/_database.js"

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = text => new Promise(resolve => rl.question(text, resolve))

const start = async () => {
    const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) })
    const { state, saveCreds } = await useMultiFileAuthState('./auth/session')
    const sock = _prototype({
        version: [2, 3000, 1017531287],
        logger: pino({ level: "silent" }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        browser: Browsers.ubuntu('Chrome'),
        printQRInTerminal: false
    })

    store.bind(sock.ev)
    sock.ev.on("creds.update", saveCreds)

    if (!sock.authState.creds.registered) {
        const number = await question("Ingresa tu número de WhatsApp activo: ")
        const code = await sock.requestPairingCode(number)
        console.log(`Emparejamiento con este código: ${code}`)
    }

    sock.ev.on("connection.update", m => {
        const { connection, lastDisconnect } = m

        if (connection === "close") {
            const reconect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Error en la conexión ', lastDisconnect.error, 'Reconectando', reconect)
            if (reconect) {
                start()
            } else {
                exec("rm -rf session", (err, stdout, stderr) => {
                    if (err) {
                        console.error("Error al eliminar el archivo de sesión:", err)
                    } else {
                        console.error("Conexión con WhatsApp cerrada. Escanee nuevamente el código QR!")
                        start()
                    }
                })
            }
        } else if (connection === "open") {
            console.log('Conexión con WhatsApp establecida')
        }
    })

    sock.ev.on("group-participants.update", async (change) => {
        const { id, author, participants, action } = change
        if (!action || author.endsWith("@lid")) return

        const chat = db.data.chats[id]
        if (!chat?.welcome) return

        const actions = {
            add: () => author ? `Fuiste añadido por @${author.split('@')[0]}.` : `Te has unido mediante el enlace de invitación.`,
            remove: (p) => author === p ? `Ha salido del grupo.` : `Ha sido eliminado por @${author.split('@')[0]}.`,
            promote: () => `Fuiste promovido a administrador por @${author.split('@')[0]}.`,
            demote: () => `Fuiste degradado a miembro por @${author.split('@')[0]}.`,
            modify: () => `Ha modificado la configuración del grupo.`,
        }
        const { subject, desc } = await sock.groupMetadata(id)

        for (const p of participants) {
            const date = actions[action]?.(p)
            const message = chat.messages[action]
                .replace("@group", `@${id}`)
                .replace("@action", date)
                .replace("@user", `@${p.split("@")[0]}`)
                .replace("@time", new Date().toLocaleString())
                .replace("@desc", desc)
            const image = await sock.profilePictureUrl(p, 'image')
                .catch(async () => await sock.profilePictureUrl(id, image))
                .catch(() => "./nazi.jpg")
            if (date) sock.sendMessage(id, { image: { url: image }, caption: message, contextInfo: { mentionedJid: [p, author], groupMentions: [{ groupJid: id, groupSubject: subject }] } })
        }
    })

    sock.ev.on("groups.update", async (changes) => {
        for (const { id, author, ...props } of changes) {
            const chat = db.data.chats[id]
            if (!chat?.notify) continue

            const messages = {
                restrict: v => v ? "ha restringido los permisos del grupo. Ahora solo los administradores pueden editar la información." : "ha permitido que todos los miembros editen la información del grupo.",
                announce: v => v ? "ha cerrado el grupo. Solo los administradores pueden enviar mensajes." : "ha abierto el grupo. Ahora todos los miembros pueden enviar mensajes.",
                memberAddMode: v => v ? "ha habilitado que todos los miembros puedan añadir nuevos participantes al grupo." : "ha deshabilitado que los miembros puedan añadir participantes al grupo.",
                joinApprovalMode: v => v ? "ha activado la aprobación de solicitudes para unirse al grupo. Ahora los administradores deben aprobar las solicitudes de nuevos miembros." : "ha desactivado la aprobación de solicitudes. Ahora cualquiera puede unirse al grupo sin aprobación.",
                desc: v => `ha actualizado la descripción del grupo: "${v}"`,
                subject: v => `ha cambiado el nombre del grupo a: "${v}"`,
            };

            for (const [key, value] of Object.entries(props)) {
                if (!messages[key] || value === undefined) continue
                const { subject } = await sock.groupMetadata(id)
                const image = await sock.profilePictureUrl(author, "image").catch(() => "./nazi.jpg")

                sock.sendMessage(id, { image: { url: image }, caption: `@${author.split("@")[0]} ${messages[key](value)}`, contextInfo: { mentionedJid: [author], groupMentions: [{ groupJid: id, groupSubject: subject }] } })
            }
        }
    })

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        for (let i = 0; i < messages.length; i++) {
            if (!messages[i].message) continue;
            if (type === 'notify') {
                let m = await _content(sock, messages[i]);

                if (!m.isMe && m.message) {
                    if (m.id.startsWith("ALE-DEV") || m.id.startsWith("BAE5")) return;
                    const chat = db.data.chats[m.from];
                    if (chat?.antidelete) {
                        if (!chat.cache) chat.cache = [];
                        chat.cache.push({ key: m.key, message: m.message, timestamp: Date.now() });
                        chat.cache = chat.cache.filter(item => Date.now() - item.timestamp < 20 * 60 * 1000);
                    }
                }
                for (const plugin of global.plugins) {
                    const isCommand = !plugin.disable && plugin.comand ? (Array.isArray(plugin.comand) ? plugin.comand.includes(m.command) : plugin.comand.test(m.body)) : undefined

                    if (plugin.isOwner && !m.isOwner) continue

                    try {
                        if (plugin.exec && typeof plugin.exec === 'function' && isCommand) {
                            let args = { sock, db, v: m.quoted ? m.quoted : m }

                            await database(m, { sock, db })
                            await plugin.exec.call(plugin, m, args)
                        }
                    } catch (error) {
                        sock.sendMessage(m.from, { text: `Error en el plugin ${plugin.name}: ${error.message}` })
                    }
                }
            }
        }
    })

    sock.ev.on('message.delete', async ({ key: { remoteJid, id, participant } }) => {
        const chat = db.data.chats[remoteJid]
        if (chat?.antidelete && chat.cache) {
            const cache = chat.cache.find((item) => item.key.id === id)
            if (cache) {
                await sock.sendMessage(remoteJid, { text: `Mensaje eliminado por @${participant.split('@')[0]}`, contextInfo: { mentionedJid: [participant] } })

                const message = generateWAMessageFromContent(remoteJid, cache.message, { userJid: sock.user.id })
                await sock.relayMessage(remoteJid, message.message, { messageId: message.key.id })
            }
        }
    })

    return sock
}

start()