import { createCanvas, loadImage, registerFont } from 'canvas'

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
            // Crear canvas con dimensiones según CSS
            const canvas = createCanvas(350, 510);
            const ctx = canvas.getContext('2d');

            // Fondo blanco
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Aplicar filtro de desenfoque
            ctx.filter = 'blur(2px)';

            // Función para encontrar el tamaño óptimo de fuente y separar en líneas
            const findOptimalFontSize = (text, maxWidth, maxHeight) => {
                let fontSize = 170; // Comenzamos con texto grande
                let lines = [];
                const words = text.split(' ');

                while (fontSize > 0) {
                    lines = [];
                    let currentLine = [];
                    let currentWidth = 0;
                    ctx.font = `500 ${fontSize}px "Arial Narrow"`;
                    for (const word of words) {
                        // Considera el ancho de la palabra más un espacio
                        const wordWidth = ctx.measureText(word + ' ').width;
                        if (currentWidth + wordWidth <= maxWidth) {
                            currentLine.push(word);
                            currentWidth += wordWidth;
                        } else {
                            if (currentLine.length > 0) lines.push(currentLine);
                            currentLine = [word];
                            currentWidth = wordWidth;
                        }
                    }
                    if (currentLine.length > 0) lines.push(currentLine);

                    // Usamos el tamaño de fuente como altura de línea (line-height igual a font-size)
                    const lineHeight = fontSize;
                    const totalHeight = lines.length * lineHeight;
                    if (totalHeight <= maxHeight) break;
                    fontSize -= 2;
                }
                return { fontSize, lines };
            };

            // Definir área de dibujo completa (sin padding, de acuerdo al CSS)
            const maxWidth = canvas.width;
            const maxHeight = canvas.height;
            const { fontSize, lines } = findOptimalFontSize(text, maxWidth, maxHeight);

            // Configurar fuente y color para el texto
            ctx.fillStyle = '#000000';
            ctx.font = `500 ${fontSize}px "Arial Narrow"`;

            // Calcular la posición vertical para centrar el texto
            const lineHeight = fontSize; // line-height igual a fontSize
            const totalTextHeight = lines.length * lineHeight;
            const startY = (canvas.height - totalTextHeight) / 2 + fontSize / 2;

            // Dibujar cada línea con justificación
            lines.forEach((line, i) => {
                const y = startY + i * lineHeight;
                if (line.length === 1) {
                    // Si la línea tiene solo una palabra, centrar horizontalmente
                    ctx.textAlign = 'center';
                    const x = canvas.width / 2;
                    ctx.fillText(line.join(' '), x, y);
                } else {
                    // Para múltiples palabras, distribuir espacios para justificar la línea
                    const wordsWidth = line.reduce((acc, word) => acc + ctx.measureText(word).width, 0);
                    const totalSpacing = canvas.width - wordsWidth;
                    const spaceBetween = totalSpacing / (line.length - 1);
                    let x = 0;
                    ctx.textAlign = 'left';
                    line.forEach((word, index) => {
                        ctx.fillText(word, x, y);
                        x += ctx.measureText(word).width + spaceBetween;
                    });
                }
            });

            // Restaurar el filtro (opcional)
            ctx.filter = 'none';

            return canvas.toBuffer('image/png');
        } catch (e) {
            console.error(e);
            await m.reply(`Terjadi kesalahan saat membuat stiker: ${e.message}`);
        }
    }
}