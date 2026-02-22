const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, 'public', 'logo.png');
const androidResPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

// Android icon sizes for mipmap folders
const iconSizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
};

// Foreground icon sizes (larger for adaptive icons)
const foregroundSizes = {
    'mipmap-mdpi': 108,
    'mipmap-hdpi': 162,
    'mipmap-xhdpi': 216,
    'mipmap-xxhdpi': 324,
    'mipmap-xxxhdpi': 432
};

async function generateIcons() {
    console.log('🎨 Generando íconos de Android desde logo.png...\n');

    // Check if logo exists
    if (!fs.existsSync(logoPath)) {
        console.error('❌ No se encontró logo.png en la carpeta public');
        process.exit(1);
    }

    const logo = sharp(logoPath);

    for (const [folder, size] of Object.entries(iconSizes)) {
        const outputDir = path.join(androidResPath, folder);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Generate ic_launcher.png (regular icon) - transparent background
        await logo.clone()
            .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(path.join(outputDir, 'ic_launcher.png'));

        // Generate ic_launcher_round.png (round icon)
        const roundMask = Buffer.from(
            `<svg width="${size}" height="${size}">
                <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
            </svg>`
        );

        await logo.clone()
            .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .composite([{ input: roundMask, blend: 'dest-in' }])
            .png()
            .toFile(path.join(outputDir, 'ic_launcher_round.png'));

        console.log(`✅ ${folder}: ic_launcher.png (${size}x${size})`);
    }

    // Generate foreground icons for adaptive icons
    console.log('\n🎨 Generando íconos foreground para adaptive icons...\n');

    for (const [folder, size] of Object.entries(foregroundSizes)) {
        const outputDir = path.join(androidResPath, folder);
        const padding = Math.floor(size * 0.25); // 25% padding for safe zone
        const logoSize = size - (padding * 2);

        await logo.clone()
            .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .extend({
                top: padding,
                bottom: padding,
                left: padding,
                right: padding,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toFile(path.join(outputDir, 'ic_launcher_foreground.png'));

        console.log(`✅ ${folder}: ic_launcher_foreground.png (${size}x${size})`);
    }

    console.log('\n✨ ¡Todos los íconos generados exitosamente!');
    console.log('\n📱 Próximo paso: Ejecuta "npx cap sync android" y luego construye el APK/AAB');
}

generateIcons().catch(err => {
    console.error('❌ Error generando íconos:', err);
    process.exit(1);
});
