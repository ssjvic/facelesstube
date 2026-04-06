import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = 'multimedia';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

// 1. Copiar el icono (ya es 512x512)
try {
    fs.copyFileSync('public/icon-512.png', 'multimedia/1_play_store_icono_512x512.png');
    console.log('✅ Copiado: 1_play_store_icono_512x512.png');
} catch (e) {
    console.log('⚠️ No se encontro public/icon-512.png');
}

// 2. Crear Gráfico de Funciones (1024x500) con el logo
async function createFeatureGraphic() {
  try {
    const bg = { r: 10, g: 10, b: 18, alpha: 1 }; // Color de fondo de FacelessTube (#0A0A12)
    
    // Redimensionar el logo para que encaje bien en el centro
    const logoBase = await sharp('public/logo.png')
      .resize({ width: 600, height: 300, fit: 'inside' })
      .toBuffer();

    await sharp({
      create: {
        width: 1024,
        height: 500,
        channels: 4,
        background: bg
      }
    })
    .composite([
      // Poner el logo centrado
      { input: logoBase, gravity: 'center' }
    ])
    .toFile('multimedia/2_grafico_funciones_1024x500.png');
    
    console.log('✅ Creado: 2_grafico_funciones_1024x500.png');

    // 3. Crear placeholders para Screenshots
    await sharp({
      create: {
        width: 1080,
        height: 1920,
        channels: 4,
        background: bg
      }
    })
    .composite([{
        input: Buffer.from(`<svg width="1080" height="1920">
            <rect x="0" y="0" width="1080" height="1920" fill="#0A0A12" />
            <text x="540" y="960" font-family="sans-serif" font-size="80" fill="#FFFFFF" text-anchor="middle">Sube captura 1 aquí</text>
        </svg>`),
    }])
    .toFile('multimedia/3_captura_pantalla_1.png');
    
    await sharp({
      create: {
        width: 1080,
        height: 1920,
        channels: 4,
        background: bg
      }
    })
    .composite([{
        input: Buffer.from(`<svg width="1080" height="1920">
            <rect x="0" y="0" width="1080" height="1920" fill="#0A0A12" />
            <text x="540" y="960" font-family="sans-serif" font-size="80" fill="#FFFFFF" text-anchor="middle">Sube captura 2 aquí</text>
        </svg>`),
    }])
    .toFile('multimedia/4_captura_pantalla_2.png');
    
    console.log('✅ Creados: Placeholders para capturas de pantalla (1080x1920)');
    
  } catch (e) {
    console.error('Error creando graficos:', e);
  }
}

createFeatureGraphic();
