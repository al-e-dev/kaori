import Req from "./_request.js"
import fs from "fs"

export default class Threads {
    constructor() {
        this.parse = (str) => JSON.parse(`{"text": "${str}"}`).text
    }

    download(url) {
        return new Promise((resolve, reject) => {
            Req.axios.get(url, {
                headers: {
                    "sec-fetch-user": "?1",
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-site": "none",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "cache-control": "max-age=0",
                    authority: "www.threads.net",
                    "upgrade-insecure-requests": "1",
                    "accept-language": "en-GB,en;q=0.9,tr-TR;q=0.8,tr;q=0.7,en-US;q=0.6",
                    "sec-ch-ua": '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
                    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
                }
            }).then(({ data }) => {
                const cleaned = data.replace(/&quot;/g, '"').replace(/&amp;/g, "&")
                fs.writeFileSync("resultado.txt", cleaned, "utf8")

                let result = {
                    title: this.parse(cleaned.match(/"caption":\{"text":"(.*?)"/)?.[1] || "Threads Post"),
                    likes: this.parse(cleaned.match(/"like_count":\s*(\d+)/)?.[1]),
                    repost: this.parse(cleaned.match(/"repost_count":\s*(\d+)/)?.[1]),
                    reshare: this.parse(cleaned.match(/"reshare_count":\s*(\d+)/)?.[1]),
                    comments: this.parse(cleaned.match(/"direct_reply_count":\s*(\d+)/)?.[1]),
                    creation: this.parse(cleaned.match(/"taken_at":\s*(\d+)/)?.[1]),
                    author: {
                        username: this.parse(cleaned.match(/"username":"(.*?)"/)?.[1]),
                        profile: this.parse(cleaned.match(/"profile_pic_url":"(.*?)"/)?.[1])
                    }
                }

                const isCarousel = ((m) => m ? JSON.parse(m[1]).length > 0 : false)(cleaned.match(/"carousel_media":\s*(\[[\s\S]*?\])\s*(,|$)/))
                const isVideo = ((m) => m ? JSON.parse(m[1]).length > 0 : false)(cleaned.match(/"video_versions":\s*(\[[\s\S]*?\])\s*(,|$)/))
                const isImage = ((m) => m ? m[1].trim() !== "null" : false)(cleaned.match(/"image_versions2":\s*(null|\{[\s\S]*?\})/))
                const isAudio = ((m) => m && m[1].trim() !== "null" ? JSON.parse(m[1]) : null)(cleaned.match(/"audio":\s*(null|\{[\s\S]*?\})/))

                const hasAudio = ((m) => m ? m[1] === "true" ? true : m[1] === "false" ? false : null : null)(cleaned.match(/"has_audio":\s*(true|false|null)/))

                if (isVideo && hasAudio) {
                    const video = cleaned.match(/"video_versions":\s*\[\s*\{\s*"type":\d+,\s*"url":"([^"]+)"/)?.[1]
                    return resolve({
                        ...result,
                        download: {
                            type: "video",
                            width: +this.parse(cleaned.match(/"original_width":\s*(\d+)/)?.[1]),
                            height: +this.parse(cleaned.match(/"original_height":\s*(\d+)/)?.[1]),
                            url: this.parse(video)
                        }
                    })
                }

                if (isAudio) {
                    return resolve({
                        ...result,
                        download: {
                            type: "audio",
                            url: this.parse(isAudio.audio_src)
                        }
                    })
                }

                if (isCarousel) {
                    const carousel = cleaned.match(/"carousel_media":\s*(\[[\s\S]*?\])\s*(,|$)/) || cleaned.match(/"carousel_media":\s*(\[[^\]]+\])/)
                    const array = JSON.parse(carousel[1]);
                    if (Array.isArray(array)) {
                        const images = array.map(item => {
                            const candidates = item?.image_versions2?.candidates;
                            if (Array.isArray(candidates)) {
                                const best = candidates.reduce((max, candidate) => candidate.width * candidate.height > max.width * max.height ? candidate : max, candidates[0])
                                console.log(best)
                                return {
                                    type: "image",
                                    width: +best.width,
                                    height: +best.height,
                                    url: best.url.replace(/\\/g, "")
                                }
                            }
                            return null
                        }).filter(Boolean)
                        return resolve({ ...result, download: images })
                    }
                }

                if (isImage) {
                    const image = cleaned.match(/"image_versions2":\s*{"candidates":\s*\[(.*?)\]/s);
                    const img = [...image[1].matchAll(/{"height":(\d+),"url":"(.*?)","width":(\d+)}/g)]
                        .map(e => ({
                            height: +e[1],
                            width: +e[3],
                            url: e[2].replace(/\\/g, "")
                        }))
                        .reduce((max, img) => (img.height * img.width > max.height * max.width ? img : max));

                    return resolve({
                        ...result,
                        download: {
                            type: "image",
                            width: img.width,
                            height: img.height,
                            url: img.url
                        }
                    });
                }

                

            }).catch(err => {
                console.log(err)
                reject(`Unable to fetch video information. Error: ${err.message}`)
            })
        })
    }
}

const th = new Threads()
th.download("https://www.threads.net/@cbssportsgolazo/post/DGRlw2ZMv3Z?xmt=AQGzFMmLKSttkZtDs2r9awVNmWIUDIJm75q8fYZfcb4eJA").then(console.log).catch(console.error)