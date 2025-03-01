import { parsePhoneNumber } from "awesome-phonenumber"
import fs from 'fs'
import { language, timezone } from "./_language.js";

export default async function database(m, { sock, db }) {

    const code = m.metadata ? await sock.groupInviteCode(m.from).catch(_ => null) : false
    let isNumber = v => typeof v == 'number' && !isNaN(v);
    let isBoolean = v => typeof v == 'boolean' && Boolean(v);

    let SET_DEFAULT_WELCOME = "*¤* Bienvenido a @group!\n\n_@action_\n\n*◈ Time:* @time\n\n@desc"
    let SET_DEFAULT_BYE = "*¤* Adiós @user!\n\n_@action_\n\n*◈ Time:* @time\n\n@desc"
    let SET_DEFAULT_DEMOTE = "*¤* Usuario degradado @user!\n\n_@action_\n\n*◈ Time:* @time\n*◈ Rol:* miembro\n\n@desc"
    let SET_DEFAULT_PROMOTE = "*¤* Usuario promovido @user!\n\n_@action_\n\n*◈ Time:* @time\n*◈ Rol:* administrador\n\n@desc"
    let SET_DEFAULT_MODIFY = "*¤* Grupo modificado!\n\n_@action_\n\n*◈ Time:* @time\n\n@desc"

    if (m.metadata && m.from.endsWith('@g.us')) {
        let chat = db.data.chats[m.from];
        if (typeof chat !== 'object') db.data.chats[m.from] = {};

        if (chat) {
            if (!('name' in chat)) chat.name = m.metadata.subject;
            if (!('code' in chat)) chat.code = m.isBotAdmin ? code : null;
            if (!('messages' in chat)) chat.messages = { add: 'Bienvenido!', remove: 'Adiós!', demote: 'Demote!', promote: 'Promote!', modify: 'Modify!' };
            if (!isBoolean(chat.mute)) chat.mute = false;
            if (!isBoolean(chat.notify)) chat.notify = false;
            if (!isBoolean(chat.welcome)) chat.welcome = false;
            if (!isBoolean(chat.antionce)) chat.antionce = false;
            if (!isBoolean(chat.antitoxic)) chat.antitoxic = false;
            if (!isBoolean(chat.antilink)) chat.antilink = false;
            if (!isBoolean(chat.antifake)) chat.antifake = false;
            if (!isBoolean(chat.antidelete)) chat.antidelete = false;
            if (typeof chat.link !== 'object') chat.link = [];
            if (typeof chat.fake !== 'object') chat.fake = [];
            if (typeof chat.antilink !== 'object'){
                chat.antilink = {
                    status: true,
                    links: {
                        Youtube: { allowed: true, domains: ["youtube.com", "youtu.be"] },
                        TikTok: { allowed: true, domains: ["tiktok.com", "vm.tiktok.com"] },
                        Instagram: { allowed: true, domains: ["instagram.com"] },
                        Twitter: { allowed: true, domains: ["twitter.com", "t.co", "x.com"] },
                        Twitch: { allowed: true, domains: ["twitch.tv"] },
                        Reddit: { allowed: true, domains: ["reddit.com"] },
                        Discord: { allowed: true, domains: ["discord.com", "discord.gg"] },
                        Facebook: { allowed: true, domains: ["facebook.com"] },
                        Pinterest: { allowed: true, domains: ["pinterest.com"] },
                        LinkedIn: { allowed: true, domains: ["linkedin.com"] }
                    }
                }
            }

        } else {
            db.data.chats[m.from] = {
                name: m.metadata.subject,
                code: m.isBotAdmin ? code : null,
                messages: { add: 'Bienvenido!', demote: 'Demote!', promote: 'Promote!', remove: 'Adiós!', modify: 'Modify!' },
                mute: false,
                notify: false,
                welcome: false,
                badword: false,
                antiViewOnce: false,
                antileg: false,
                antilink: {
                    status: true,
                    links: {
                        Youtube: { allowed: true, domains: ["youtube.com", "youtu.be"] },
                        TikTok: { allowed: true, domains: ["tiktok.com", "vm.tiktok.com"] },
                        Instagram: { allowed: true, domains: ["instagram.com"] },
                        Twitter: { allowed: true, domains: ["twitter.com", "t.co", "x.com"] },
                        Twitch: { allowed: true, domains: ["twitch.tv"] },
                        Reddit: { allowed: true, domains: ["reddit.com"] },
                        Discord: { allowed: true, domains: ["discord.com", "discord.gg"] },
                        Facebook: { allowed: true, domains: ["facebook.com"] },
                        Pinterest: { allowed: true, domains: ["pinterest.com"] },
                        LinkedIn: { allowed: true, domains: ["linkedin.com"] }
                    }
                },
                antifake: false,
                antidelete: false,
                link: [],
                fake: [],
            };
        }
    }

    if ((m.sender.endsWith('@s.whatsapp.net'))) {
        let user = db.data.users[m.sender];
        if (typeof user != 'object') db.data.users[m.sender] = {}

        const country = parsePhoneNumber(`+${m.sender.replace("@s.whatsapp.net", "")}`).regionCode

        if (user) {
            if (!('name' in user)) user.name = m.pushName
            if (!('number' in user)) user.number = m.sender
            if (!('language' in user)) user.language = language[country] || 'es'
            if (!('timezone' in user)) user.timezone = timezone[country] || 'America/Lima'
            if (!('country' in user)) user.country = country || 'PE'
            if (!('premium' in user) || typeof user.premium != 'object') user.premium = { level: 0, time: 0 }
            if (!isBoolean(user.registered)) user.registered = false
            if (!isBoolean(user.blacklist)) user.blacklist = false
            if (!isNumber(user.count)) user.count = 0
            if (!isNumber(user.level)) user.level = 1
            if (!isNumber(user.koins)) user.koins = 1000
            if (!isNumber(user.requests)) user.requests = 50
            if (!isNumber(user.warnings)) user.warnings = 0
            user.count += 1
        } else {
            db.data.users[m.sender] = {
                name: m.pushName,
                number: m.sender,
                language: language[country] || 'en',
                timezone: timezone[country],
                country: country,
                premium: {
                    level: 0,
                    time: 0,
                },
                registered: false,
                blacklist: false,
                count: 0,
                level: 1,
                koins: 1000,
                requests: 50,
                warnings: 0,
            }
        }
    }

    let bot = db.data.settings[sock.user.jid]
    if (typeof bot != 'object') db.data.settings[sock.user.jid] = {}

    if (bot) {
        if (!('name' in bot)) bot.name = sock.user.name || await sock.getName(sock.user.jid)
        if (!('language' in bot)) bot.language = 'en'
        if (!isBoolean(bot.private)) bot.private = false
        if (!isBoolean(bot.dev)) bot.dev = false
        if (!isBoolean(bot.autobio)) bot.autobio = false
        if (!isBoolean(bot.autorestart)) bot.autorestart = false
        if (typeof bot.prefix != 'object') bot.prefix = prefix
    } else {
        db.data.settings[sock.user.jid] = {
            name: sock.user.name || await sock.getName(sock.user.jid),
            language: 'en',
            private: false,
            dev: false,
            autobio: false,
            autorestart: false,
            prefix: _config.prefix,
        };
    }

    fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
}