import fs from 'fs';
import sharp from 'sharp';

async function fixIcon() {
  try {
    const inputPath = 'multimedia/1_play_store_icono_512x512.png';
    const tempPath = 'multimedia/temp_icon.png';
    
    // Resize to exactly 512x512
    await sharp(inputPath)
      .resize(512, 512)
      .toFile(tempPath);
      
    // Replace the original with the correctly sized one
    fs.renameSync(tempPath, inputPath);
    console.log('✅ EXITO: El icono ahora mide exactamente 512x512 pixeles.');
  } catch (error) {
    console.error('Error al redimensionar:', error);
  }
}

fixIcon();
