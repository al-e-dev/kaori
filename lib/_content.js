import baileys, {
	jidNormalizedUser,
	getContentType,
	extractMessageContent
} from "@al-e-dev/baileys"

export const _content = async(sock, m) => {

    let Proto = baileys.proto.WebMessageInfo.fromObject
    m.message = (Object.keys(m.message)[0] == "ephemeralMessage") ? m.message["ephemeralMessage"].message : (Object.keys(m.message)[0] == "viewOnceMessageV2") ? m.message["viewOnceMessageV2"].message : (Object.keys(m.message)[0] == "documentWithCaptionMessage") ? m.message["documentWithCaptionMessage"].message : (Object.keys(m.message)[0] == "ptvMessage") ? { videoMessage: m.message["ptvMessage"] } : m.message;

    if (m.key) {
        m.id = m.key.id
        if (m.id.startsWith("ALE-DEV")) return

        m.device = m.id.length > 28 ? 'android' : m.id.substring(0, 2) === '3A' ? 'ios' : m.id.startsWith("BAE5") ? 'baileys' : m.id.startsWith("3EB0") ? 'web' : 'desconocido';
        m.isBot = (m.id.startsWith("3EB0") && m.id.length == 12) || (m.id.startsWith("BAE5") && m.id.length == 16)
        m.from = m.key.remoteJid
        m.isMe = m.key.fromMe
        m.isGroup = m.from.endsWith("@g.us")
        m.isChat = m.from.endsWith("@s.whatsapp.net")
        m.sender = jidNormalizedUser(m.key.participant || m.key.remoteJid)
        m.number = m.sender.replace("@s.whatsapp.net", "")
        m.pushName = m.pushName || "Sin Nombre"
        m.isOwner = m.isMe || (m.number === _config.owner.number) || _config.mods.some(i => i === m.number)
        m.data = (id) => global.db.data.chats[id] || global.db.data.settings[id] || global.db.data.users[id]
        if (m.isGroup) {
            m.metadata = await sock.groupMetadata(m.from);
            m.admins = m.metadata.participants.filter(i => i.admin == "admin" || i.admin == "superadmin").map(i => i.id);
            m.isAdmin = m.admins.includes(m.sender);
            m.isBotAdmin = m.admins.includes(sock.user.jid);
        }
    };

    if (m.message) {
        m.type = getContentType(m.message)
        m.msg = extractMessageContent(m.message?.[m.type])
        m.isViewOnce = m?.msg?.viewOnce ? m?.msg?.viewOnc : false
        m.isMedia = ["image", "sticker", "video", "audio"].some(i => i == m.type.replace("Message", ""))
        m.body = typeof sock.getMessageBody(m.type, m.msg) === 'string' ? sock.getMessageBody(m.type, m.msg) : ''
        m.cmd =  _config.prefix.some(i => m.body.toLowerCase().startsWith(i))
        m.command = m.cmd ? m.body.slice(1).trim().split(' ')[0].toLowerCase() : m.body.trim().split(' ')[0].toLowerCase()
        m.args = (m.isCmd && m.command) ? (m.body?.trim()?.split(/ +/)?.splice(1) || []) :  (m.body?.trim()?.split(/ +/) || [])
        m.text = m.args.join(" ")

        let quotedMention = m.msg?.contextInfo != null ? m.msg.contextInfo?.participant : ''
        let tagMention = m.msg?.contextInfo != undefined ? m.msg.contextInfo?.mentionedJid : []
        let mention = typeof(tagMention) == 'string' ? [tagMention] : tagMention
        mention != undefined ? mention.push(quotedMention) : []

        m.mentionedJid = mention != undefined ? mention.filter(x => x) : []
        m.delete = () => sock.sendMessage(m.from, { delete: m.key })
        m.react = emoji => sock.sendMessage(m.from, { react: { text: emoji, key: m.key }})
        m.download = () => sock.downloadMediaMessage(m.message[m.type], m.type.replace('Message', ''))

        m.quoted = (m.msg?.contextInfo && Object.keys(m.msg.contextInfo).some(i => i == "quotedMessage")) ? Proto({ key: { remoteJid: m.from || m.key.remoteJid, fromMe: (m.msg.contextInfo.participant == sock.user.jid), id: m.msg.contextInfo.stanzaId, participant: m.msg.contextInfo.participant }, message: m.msg.contextInfo.quotedMessage }) : false;

        if (m.quoted) {
            if (m.quoted.key) {
                m.quoted.id = m.quoted.key.id
                m.quoted.device = m.quoted.id.length > 28 ? 'android' : m.quoted.id.substring(0, 2) === '3A' ? 'ios' : m.quoted.id.startsWith("BAE5") ? 'baileys' : m.quoted.id.startsWith("3EB0") ? 'web' : 'desconocido'
                m.quoted.isBot = (m.quoted.id.startsWith("3EB0") && m.quoted.id.length == 12) || (m.quoted.id.startsWith("BAE5") && m.quoted.id.length == 16)
                m.quoted.isMe = m.quoted.key.fromMe
                m.quoted.sender = jidNormalizedUser(m.quoted.key.participant || m.quoted.key.remoteJid)
                m.quoted.number = m.quoted.sender.replace("@s.whatsapp.net", "")
                m.quoted.isOwner = m.quoted.isMe || (m.quoted.number == _config.owner.number) || _config.mods.some(i => i == m.quoted.number)
                m.quoted.isAdmin = m.admins ? m.admins.includes(m.quoted.sender) : false
            }

            m.quoted.message = (Object.keys(m.quoted.message)[0] == "ephemeralMessage") ? m.quoted.message["ephemeralMessage"].message : (Object.keys(m.quoted.message)[0] == "viewOnceMessageV2") ? m.quoted.message["viewOnceMessageV2"].message : (Object.keys(m.quoted.message)[0] == "documentWithCaptionMessage") ? m.quoted.message["documentWithCaptionMessage"].message : (Object.keys(m.quoted.message)[0] == "ptvMessage") ? { videoMessage: m.quoted.message["ptvMessage"] } : m.quoted.message

            if (m.quoted.message) {
                m.quoted.type = getContentType(m.quoted.message)
                m.quoted.msg = extractMessageContent(m.quoted.message)
                m.quoted.isViewOnce = m?.quoted?.msg?.viewOnce ? m?.quoted?.msg?.viewOnce : false
                m.quoted.isMedia = ["image", "sticker", "video", "audio"].some(i => i == m.quoted.type.replace("Message", ""))
                m.quoted.body = sock.getMessageBody(m.quoted.type, m.quoted.msg) || ''
                m.quoted.isCmd = m.quoted && typeof m.quoted.body === 'string' ? _config.prefix.some(i => m.quoted.body.startsWith(i)) : false
                m.quoted.command = m.quoted.isCmd ? m.quoted.body.slice(1).trim().split(/ +/).shift().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : false
                m.quoted.args = (m.quoted.isCmd && m.quoted.command) ? (typeof m.quoted.body === 'string' ? m.quoted.body.trim().split(/ +/).splice(2) : []) : (typeof m.quoted.body === 'string' ? m.quoted.body.trim().split(/ +/) : [])
                m.quoted.text = m.quoted.args.join(" ")
            }

            m.quoted.delete = () => sock.sendMessage(m.from, { delete: m.quoted.key })
            m.quoted.react = emoji => sock.sendMessage(m.from, { react: { text: emoji, key: m.quoted.key }})
            m.quoted.download = () => sock.downloadMediaMessage(m.quoted.message[m.quoted.type], m.quoted.type.replace('Message', ''))
        }
    }
    return m
}