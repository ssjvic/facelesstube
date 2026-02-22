const fs = require('fs');
const path = require('path');

const sourceDir = 'C:/Users/ssjvi/.gemini/antigravity/brain/7fa57e7a-a2ce-4629-9ab6-c419f6cf63b6';
const destDir = 'C:/Users/ssjvi/.gemini/antigravity/scratch/facelesstube/public';

const files = [
    { src: 'uploaded_image_1767646925883.png', dst: 'logo.png' },
    { src: 'icon_512_1767646957786.png', dst: 'icon-512.png' },
    { src: 'watermark_1767646972966.png', dst: 'watermark.png' }
];

files.forEach(({ src, dst }) => {
    const srcPath = path.join(sourceDir, src);
    const dstPath = path.join(destDir, dst);
    try {
        fs.copyFileSync(srcPath, dstPath);
        console.log(`Copied: ${dst}`);
    } catch (err) {
        console.error(`Error copying ${dst}: ${err.message}`);
    }
});

console.log('Done!');
