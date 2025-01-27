import fs from 'fs'
import ff from 'fluent-ffmpeg'
import webp from 'node-webpmux'

export const byteToSize = (bytes) => {
    const sizes = ['bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1000))
    return (bytes / Math.pow(1000, i)).toFixed(2) + ' ' + sizes[i]
}

export const convertTimeOut = (ms) => {
    const timeUnits = [
        { label: 'semana', value: Math.floor(ms / 604800000) }, // 7 días
        { label: 'día', value: Math.floor((ms % 604800000) / 86400000) }, // 1 día
        { label: 'hora', value: Math.floor((ms % 86400000) / 3600000) }, // 1 hora
        { label: 'minuto', value: Math.floor((ms % 3600000) / 60000) }, // 1 minuto
        { label: 'segundo', value: Math.floor((ms % 60000) / 1000) } // 1 segundo
    ];

    return timeUnits.filter(unit => unit.value > 0).map(unit => `${unit.value} ${unit.label}${unit.value > 1 ? 's' : ''}`).join(', ')
}

function getRandom (ext, num = 10) {
    let code = ''
    for (let i = 0; i < num; i++) {
       const indice = Math.floor(Math.random() * num)
       code += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(indice)
    }
    return code + ext 
}

export async function image(media) {
    const input = getRandom('.jpeg')
    const output = getRandom('.webp')

    fs.writeFileSync(input, media);

    await new Promise((resolve, reject) => {
        ff(input)
            .on('error', (error) => {
                reject(error)
            })
            .on('end', () => {
                resolve(true)
            })
            .addOutputOptions([
                "-vcodec",
                "libwebp",
                "-vf",
                "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
            ])
            .toFormat('webp')
            .save(output);
    })
    const buff = fs.readFileSync(output)
    fs.unlinkSync(output)
    fs.unlinkSync(input)
    return buff
}

export async function video(media) {
    const input = getRandom('.jpeg')
    const output = getRandom('.webp')

    fs.writeFileSync(input, media);

    await new Promise((resolve, reject) => {
        ff(input)
            .on('error', (err) => {
                reject(err);
            })
            .on('end', () => {
                resolve(true);
            })
            .addOutputOptions([
                "-vcodec",
                "libwebp",
                "-vf",
                "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
                "-loop",
                "0",
                "-ss",
                "00:00:00",
                "-t",
                "00:00:05",
                "-preset",
                "default",
                "-an",
                "-vsync",
                "0"
            ])
            .toFormat('webp')
            .save(output);
    });

    const buff = await fs.readFileSync(output)
    fs.unlinkSync(output)
    fs.unlinkSync(input)
    return buff
}

export async function write(metadata) {
    const webpBuffer = metadata.sticker ? metadata.sticker : metadata.image ? await image(metadata.image) : await video(metadata.video)

    const input = getRandom('.webp')
    const output = getRandom('.webp')

    fs.writeFileSync(input, webpBuffer);

    if (metadata.packname || metadata.author) {
        const json = {
            'android-app-store-link': 'https://play.google.com/store/apps/details?id=com.snowcorp.stickerly.android',
            "sticker-pack-id": 'Pixie - Bot',
            "sticker-pack-name": metadata.packname || 'annonymous',
            "sticker-pack-publisher": metadata.author || 'annonymous',
            "emojis": metadata.categories || ["👻"]
        };
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
        const exif = Buffer.concat([exifAttr, jsonBuff]);
        exif.writeUIntLE(jsonBuff.length, 14, 4);
        const img = new webp.Image();
        await img.load(input);
        fs.unlinkSync(input);
        img.exif = exif;

        await img.save(output)
        const finalStickerBuffer = fs.readFileSync(output)
        fs.unlinkSync(output);
        return finalStickerBuffer
    }
    fs.unlinkSync(input)
    fs.unlinkSync(output)
    return webpBuffer
}