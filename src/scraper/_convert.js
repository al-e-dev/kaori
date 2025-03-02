import { createCanvas, loadImage, registerFont } from 'canvas'

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
            const img = await loadImage("https://files.catbox.moe/vkoaby.jpg")
            const canvas = createCanvas(img.width, img.height)
            const ctx = canvas.getContext('2d')
    
            ctx.drawImage(img, 0, 0, img.width, img.height)
    
            const paper_x = img.width * 0.285
            const paper_y = img.height * 0.42
            const paper_width = img.width * 0.42
            const paper_height = img.height * 0.32
    
            let font_size = Math.min(paper_width / 7.5, paper_height / 3.5)
            ctx.font = '${font_size}px Georgia'
            ctx.fillStyle = 'black'
    
            const max_width = paper_width * 0.88
            let words = text.split(' ')
            let lines = []
            let line = ''
    
            for (let word of words) {
                let test_line = line + (line ? ' ' : '') + word
                let test_width = ctx.measureText(test_line).width
    
                if (test_width > max_width && line) {
                    lines.push(line)
                    line = word
                } else {
                    line = test_line
                }
            }
            if (line) lines.push(line)
    
            while (lines.length * font_size > paper_height * 0.85) {
                font_size -= 2
                ctx.font = '${font_size}px Georgia'
    
                let tmp_lines = []
                let tmp_line = ''
                for (let word of words) {
                    let test_line = tmp_line + (tmp_line ? ' ' : '') + word
                    let test_width = ctx.measureText(test_line).width
    
                    if (test_width > max_width && tmp_line) {
                        tmp_lines.push(tmp_line)
                        tmp_line = word
                    } else {
                        tmp_line = test_line
                    }
                }
                if (tmp_line) tmp_lines.push(tmp_line)
                lines = tmp_lines
            }
    
            let line_height = font_size * 1.15
            let text_height = lines.length * line_height
    
            let textStartY = paper_y + (paper_height - text_height) / 2 + (lines.length > 2 ? 270 : 275)
    
            ctx.save()
            ctx.translate(paper_x + paper_width / 2 + 24, textStartY)
            ctx.rotate(0.12)
    
            ctx.textAlign = 'center'
    
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
            ctx.shadowBlur = 3
            ctx.shadowOffsetX = 2
            ctx.shadowOffsetY = 2
    
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], 0, i * line_height)
            }
            
            ctx.restore()    
            return canvas.toBuffer('image/png')
        } catch (error) {
            console.error('Error:', error);
        }
    }
}