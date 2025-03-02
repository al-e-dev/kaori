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
            // Crear canvas de 500x500
            const canvas = createCanvas(500, 500);
            const ctx = canvas.getContext('2d');

            // Fondo blanco
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Aplicar filtro de desenfoque para todo lo que se dibuje a continuación
            ctx.filter = 'blur(2px)';
            // Aplicar opacidad al 80%
            ctx.globalAlpha = 0.8;

            // Función para encontrar el tamaño óptimo de fuente y separar el texto en líneas
            const findOptimalFontSize = (text, maxWidth, maxHeight) => {
                let fontSize = 170; // Tamaño inicial según CSS
                let lines = [];
                const words = text.split(' ');

                while (fontSize > 0) {
                    lines = [];
                    let currentLine = [];
                    let currentWidth = 0;
                    ctx.font = `500 ${fontSize}px "Arial Narrow"`;

                    for (const word of words) {
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

                    const lineHeight = fontSize; // Usamos line-height igual al tamaño de fuente
                    const totalHeight = lines.length * lineHeight;
                    if (totalHeight <= maxHeight) break;
                    fontSize -= 2;
                }
                return { fontSize, lines };
            };

            const maxWidth = canvas.width;
            const maxHeight = canvas.height;
            const { fontSize, lines } = findOptimalFontSize(text, maxWidth, maxHeight);

            // Configurar color y fuente (el color en rgba asegura que se respete la opacidad)
            ctx.fillStyle = `rgba(0, 0, 0, 0.8)`;
            ctx.font = `500 ${fontSize}px "Arial Narrow"`;
            // Usar textBaseline 'middle' para facilitar el centrado vertical
            ctx.textBaseline = 'middle';

            const lineHeight = fontSize; // Igual al tamaño de fuente
            const totalTextHeight = lines.length * lineHeight;
            // Calcular la posición Y para centrar verticalmente:
            const startY = (canvas.height - totalTextHeight) / 2 + lineHeight / 2;

            // Dibujar cada línea
            lines.forEach((line, i) => {
                const y = startY + i * lineHeight;
                if (line.length === 1) {
                    // Si es una sola palabra, centrar horizontalmente
                    ctx.textAlign = 'center';
                    const x = canvas.width / 2;
                    ctx.fillText(line.join(' '), x, y);
                } else {
                    // Para líneas con varias palabras, justificar el texto
                    ctx.textAlign = 'left';
                    const wordsWidth = line.reduce((acc, word) => acc + ctx.measureText(word).width, 0);
                    const totalSpacing = canvas.width - wordsWidth;
                    const spaceBetween = line.length > 1 ? totalSpacing / (line.length - 1) : 0;
                    let x = 0;
                    line.forEach((word) => {
                        ctx.fillText(word, x, y);
                        x += ctx.measureText(word).width + spaceBetween;
                    });
                }
            });

            // Restaurar filtro y opacidad para futuras operaciones (opcional)
            ctx.filter = 'none';
            ctx.globalAlpha = 1;

            return canvas.toBuffer('image/png');
        } catch (e) {
            console.error(e);
            await m.reply(`Terjadi kesalahan saat membuat stiker: ${e.message}`);
        }
    }
}