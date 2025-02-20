import Req from "./request.js"
import fs from "fs"

export default new class Facebook {
    constructor() {
        this.parse = (str) => JSON.parse(`{"text": "${str}"}`).text
    }
    async download(url) {
        return new Promise((resolve, reject) => {
            if (!url?.trim() || !["facebook.com", "fb.watch"].some(domain => url.includes(domain))) {
                return reject("Please enter a valid Facebook URL")
            }
            
            Req.axios.get(url, {
                headers: {
                    "sec-fetch-user": "?1",
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-site": "none",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "cache-control": "max-age=0",
                    authority: "www.facebook.com",
                    "upgrade-insecure-requests": "1",
                    "accept-language": "en-GB,en;q=0.9,tr-TR;q=0.8,tr;q=0.7,en-US;q=0.6",
                    "sec-ch-ua": '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
                    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    cookie: "sb=Rn8BYQvCEb2fpMQZjsd6L382; datr=Rn8BYbyhXgw9RlOvmsosmVNT; c_user=100003164630629; _fbp=fb.1.1629876126997.444699739; wd=1920x939; spin=r.1004812505_b.trunk_t.1638730393_s.1_v.2_; xs=28%3A8ROnP0aeVF8XcQ%3A2%3A1627488145%3A-1%3A4916%3A%3AAcWIuSjPy2mlTPuZAeA2wWzHzEDuumXI89jH8a_QIV8; fr=0jQw7hcrFdas2ZeyT.AWVpRNl_4noCEs_hb8kaZahs-jA.BhrQqa.3E.AAA.0.0.BhrQqa.AWUu879ZtCw",
                }
            }).then(({ data }) => {
                const clean = data.replace(/&quot;/g, '"').replace(/&amp;/g, "&")
                
                let result = {}
                let match = clean.match(/"all_subattachments":\{"count":(\d+),"nodes":\[(.*?)\]\}/)
                
                if (match) {
                    const images = (match[2].match(/"image":\{"uri":"(.*?)"/g) || [])
                        .map(img => this.parse(img.match(/"image":\{"uri":"(.*?)"/)[1]))
                    
                    result = {
                        url,
                        type: "image",
                        images,
                        creation: new Date(parseInt(data.match(/"creation_time":(\d+)/)?.[1]) * 1000).toLocaleString(),
                        author: this.parse(clean.match(/"actors":\[.*?"name":"(.*?)"/)?.[1] || "Unknown"),
                        title: this.parse(clean.match(/"story":\{"message":\{"text":"(.*?)"/)?.[1] || "Unknown")
                    }
                } else {
                    match = clean.match(/"image":\{"uri":"(.*?)"/)
                    if (match) {
                        result = {
                            url,
                            type: "image",
                            download: this.parse(match[1]),
                            creation: new Date(parseInt(data.match(/"creation_time":(\d+)/)?.[1]) * 1000).toLocaleString(),
                            author: this.parse(clean.match(/"actors":\[.*?"name":"(.*?)"/)?.[1] || clean.match(/"owning_profile":\{"__typename":"User","name":"(.*?)","id":"(.*?)"\}/)?.[1] || "Unknown"),
                            title: this.parse(clean.match(/"story":\{"message":\{"text":"(.*?)"/)?.[1] || clean.match(/"message_preferred_body":\{"__typename":"TextWithEntities".*?"text":"(.*?)"/)?.[1] || clean.match(/"message":\{"text":"(.*?)"/)?.[1] || "Facebook Post")
                        }
                    }
                }
                
                // fs.writeFileSync("resultado.txt", clean, "utf8")
                
                match = clean.match(/"browser_native_sd_url":"(.*?)"/) || clean.match(/"playable_url":"(.*?)"/) || clean.match(/sd_src\s*:\s*"([^"]*)"/) || clean.match(/(?<="src":")[^"]*(https:\/\/[^\"]*)/)
                        
                if (match) {
                    result = {
                        url,
                        type: "video",
                        duration: Number(clean.match(/"playable_duration_in_ms":(\d+)/)?.[1] || 0),
                        download: clean.match(/"browser_native_hd_url":"(.*?)"/)?.[1] ? this.parse(clean.match(/"browser_native_hd_url":"(.*?)"/)?.[1] || "") : this.parse(match[1]),
                        thumbnail: this.parse(clean.match(/"preferred_thumbnail":\{"image":\{"uri":"(.*?)"/)?.[1] || ""),
                        ...result
                    }
                }
                
                return Object.keys(result).length ? resolve({ status: true, ...result }) : reject("Unable to fetch video information at this time. Please try again")
            }).catch(err => {
                reject(`Unable to fetch video information. Axios Error: ${err}`)
            })
        })
    }
}