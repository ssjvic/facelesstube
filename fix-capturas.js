import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = 'multimedia';

async function processScreenshots() {
    if (!fs.existsSync(dir)) {
        console.log("⚠️ La carpeta multimedia no existe.");
        return;
    }

    const files = fs.readdirSync(dir);
    let count = 0;

    for (const file of files) {
        // Busca archivos que parezcan capturas (WhatsApp Image, Screenshot, etc.)
        if (
            (file.toLowerCase().includes('whatsapp') || 
             file.toLowerCase().includes('captura') || 
             file.toLowerCase().includes('screenshot') ||
             (file.toLowerCase().endsWith('.jpg') && !file.startsWith('1_') && !file.startsWith('2_') && !file.startsWith('3_') && !file.startsWith('4_')))
        ) {
            const inputPath = path.join(dir, file);
            const outputPath = path.join(dir, `captura_lista_${count + 1}.png`);
            
            try {
                // Resize y rellenar a 1080x1920 (formato 16:9 vertical exacto)
                await sharp(inputPath)
                    .resize({
                        width: 1080,
                        height: 1920,
                        fit: 'contain',
                        background: { r: 10, g: 10, b: 18, alpha: 1 } // Fondo de la app #0A0A12
                    })
                    .toFile(outputPath);
                console.log(`✅ Arreglada: ${file} -> captura_lista_${count + 1}.png`);
                count++;
            } catch (e) {
                console.error(`Error procesando ${file}:`, e);
            }
        }
    }
    
    if (count === 0) {
        console.log("\n⚠️ No encontré imágenes de WhatsApp en la carpeta 'multimedia'.");
        console.log("Por favor pega tus capturas ahí y vuelve a correr el comando.\n");
    } else {
        console.log(`\n🎉 ¡Listo! Tienes ${count} imágenes con el tamaño perfecto (1080x1920) para Google Play.`);
        console.log("Sube las que dicen 'captura_lista_1.png', etc.\n");
    }
}

processScreenshots();
