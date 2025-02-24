import Req from "./_request.js"
import fs from "fs"

export default class X {
    constructor() {
        this.parse = (str) => JSON.parse(`{"text": "${str}"}`).text
    }

    download(url) {
        return new Promise((resolve, reject) => {
            Req.axios.get(url, {
                headers: {
                    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'accept-language': 'en,es-PE;q=0.9,es-419;q=0.8,es;q=0.7,pt;q=0.6',
                    'cache-control': 'max-age=0',
                    cookie: 'guest_id_marketing=v1%3A174020268648400457; guest_id_ads=v1%3A174020268648400457; guest_id=v1%3A174020268648400457; personalization_id="v1_E2umXtDAejsLGQTRTYn+ug=="; gt=1893173694530256917',
                    priority: 'u=0, i',
                    referer: 'https://twitter.com/',
                    'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133")',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'same-origin',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': '1',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
                },
                data: {
                    mx: 2
                }
            }).then(({ data }) => {
                /* const cleaned =  (() => {
                    const start = data.indexOf('"thread_items":');
                    if (start === -1) return null;
                    const a = data.indexOf('[', start);
                    let c = 1, i = a + 1;
                    while (i < data.length && c) {
                        c += data[i] === '[' ? 1 : data[i] === ']' ? -1 : 0;
                        i++;
                    }
                    return data.slice(a, i);
                })()

                const threads = (JSON.parse(cleaned))[0].post */

                fs.writeFileSync("resultado.html", data, "utf8")


                resolve({ status: false, url })
            }).catch(err => { reject(err) })
        })
    }
}

const x = new X()
x.download("https://x.com/JcSyncc/status/1892798725103223073").then(console.log).catch(console.error)