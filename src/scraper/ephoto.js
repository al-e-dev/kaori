import axios from 'axios'
import * as cheerio from 'cheerio'
import FormData from 'form-data';
import { format } from 'util';

export default new class Ephoto {
    constructor() {
        this.ephoto = 'https://en.ephoto360.com/create-text-effects-in-the-style-of-the-deadpool-logo-818.html'
    }

    async create(url, text) {
        if (/https?:\/\/(ephoto360|photooxy|textpro)\/\.(com|me)/i.test(url)) throw new Error("URL Invalid")
        try {
            let a = await axios.get(url, {
                headers: {
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "Origin": (new URL(url)).origin,
                    "Referer": url,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188"
                }
            })
            let $ = cheerio.load(a.data)
            let server = $('#build_server').val()
            let serverId = $('#build_server_id').val()
            let token = $('#token').val()
            let submit = $('#submit').val()
            let types = []
            $('input[name="radio0[radio]"]').each((i, elem) => {
                types.push($(elem).attr("value"))
            })
            let post
            if (types.length != 0) {
                post = {
                    'radio0[radio]': types[Math.floor(Math.random() * types.length)],
                    'submit': submit,
                    'token': token,
                    'build_server': server,
                    'build_server_id': Number(serverId)
                };
            }
            else {
                post = {
                    'submit': submit,
                    'token': token,
                    'build_server': server,
                    'build_server_id': Number(serverId)
                }
            }
            let form = new FormData()
            for (let i in post) {
                form.append(i, post[i])
            }
            if (typeof text == "string") text = [text]
            for (let i of text) form.append("text[]", i)
            let b = await axios.post(url, form, {
                headers: {
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "Origin": (new URL(url)).origin,
                    "Referer": url,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188",
                    "Cookie": a.headers.get("set-cookie").join("; "),
                    ...form.getHeaders()
                }
            })
            $ = cheerio.load(b.data)
            let out = ($('#form_value').first().text() || $('#form_value_input').first().text() || $('#form_value').first().val() || $('#form_value_input').first().val())
            let c = await axios.post((new URL(url)).origin + "/effect/create-image", format(out), {
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "Origin": (new URL(url)).origin,
                    "Referer": url,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188",
                    "Cookie": a.headers.get("set-cookie").join("; ")
                }
            })
            return { status: c.data?.success, image: server + (c.data?.fullsize_image || c.data?.image || ""), session: c.data?.session_id }
        } catch (e) {
            throw e
        }
    }
}