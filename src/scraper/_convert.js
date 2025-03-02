import { createCanvas, loadImage, registerFont } from 'canvas'
import jimp from 'jimp'

registerFont('./src/font/arialnarrow.ttf', { family: 'ArialNarrow' })

export default new class Convert {
    async spotify(tituloMusica, autor, imagenCover) {
        try {
            const fondo = await loadImage("./src/media/spotify.png"),
                canvas = createCanvas(fondo.width, fondo.height),
                ctx = canvas.getContext('2d');
            ctx.drawImage(fondo, 0, 0);
            const drawTextWithSpacing = (ctx, text, x, y, spacing) => {
                let currentX = x;
                for (const char of text) {
                    ctx.fillText(char, currentX, y);
                    currentX += ctx.measureText(char).width + spacing;
                }
            };
            ctx.font = 'bold 18.5px "Franklin Gothic Medium", Arial, sans-serif';
            ctx.fillStyle = '#000000';
            const spacing = 2,
                textWidthTitle = [...tituloMusica].reduce((w, c) => w + ctx.measureText(c).width + spacing, -spacing);
            drawTextWithSpacing(ctx, tituloMusica, 624 - textWidthTitle / 2, 205.5, spacing);
            ctx.font = '12.1px Georgia';
            const textWidthAuthor = [...autor].reduce((w, c) => w + ctx.measureText(c).width + spacing, -spacing);
            drawTextWithSpacing(ctx, autor, 624 - textWidthAuthor / 2, 221.5, spacing);
            const cover = await loadImage(imagenCover),
                imagex = 553.4,
                imagey = 45.1,
                imagesize = 140,
                borderRadius = 15;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(imagex + borderRadius, imagey);
            ctx.lineTo(imagex + imagesize - borderRadius, imagey);
            ctx.quadraticCurveTo(imagex + imagesize, imagey, imagex + imagesize, imagey + borderRadius);
            ctx.lineTo(imagex + imagesize, imagey + imagesize - borderRadius);
            ctx.quadraticCurveTo(imagex + imagesize, imagey + imagesize, imagex + imagesize - borderRadius, imagey + imagesize);
            ctx.lineTo(imagex + borderRadius, imagey + imagesize);
            ctx.quadraticCurveTo(imagex, imagey + imagesize, imagex, imagey + imagesize - borderRadius);
            ctx.lineTo(imagex, imagey + borderRadius);
            ctx.quadraticCurveTo(imagex, imagey, imagex + borderRadius, imagey);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(cover, imagex, imagey, imagesize, imagesize);
            ctx.restore();
            return canvas.toBuffer('image/png')
        } catch (error) {
            console.error('Error:', error);
        }
    }
    async brat(text) {
        try {
            const canvas = createCanvas(512, 512)
            const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#fff'
            ctx.fillRect(0, 0, 512, 512)

            const findFontSize = (t, w, h) => {
                let size = 170, lines = []
                while (size > 0) {
                    lines = []; let line = [], width = 0
                    ctx.font = `500 ${size}px "Arial Narrow"`
                    for (const word of t.split(' ')) {
                        const wordWidth = ctx.measureText(word + ' ').width
                        if (width + wordWidth <= w) line.push(word), width += wordWidth
                        else { lines.push(line); line = [word]; width = wordWidth; }
                    }
                    if (line.length) lines.push(line)
                    if (lines.length * size <= h) break
                    size -= 2
                }
                return { size, lines }
            };

            let padding = 20
            let maxWidth = canvas.width - padding * 2
            let maxHeight = canvas.height - padding * 2
            const { size, lines } = findFontSize(text, maxWidth, maxHeight)

            ctx.fillStyle = '#000000'
            ctx.font = `500 ${size}px "Arial Narrow"`
            ctx.textBaseline = 'top'
            ctx.textAlign = 'left'

            let lineHeight = size + 10
            let totalHeight = lines.length * lineHeight
            let startY = (canvas.height - totalHeight) / 2 + size / 2

            lines.forEach((line, i) => {
                if (line.length === 1) ctx.fillText(line.join(' '), padding, startY + i * lineHeight)
                else {
                    const wordsWidth = line.reduce((acc, word) => acc + ctx.measureText(word).width, 0)
                    const space = (512 - wordsWidth) / (line.length - 1)
                    let x = padding
                    line.forEach(word => { ctx.fillText(word, x, startY + i * lineHeight); x += ctx.measureText(word).width + space; })
                }
            })

            let buffer = canvas.toBuffer()
            let image = await jimp.read(buffer)
            image.blur(3)

            return image.getBufferAsync(jimp.MIME_PNG)
        } catch (e) {
            return `Error: ${e.message}`
        }
    }
}