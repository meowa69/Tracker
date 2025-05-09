const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const images = [
  'cdo_logo.png',
  'goldenfriendship_logo.png',
  'bagongpilipinas_logo.png',
  'CityC_Logo.png',
];

// Array to store the export statements
const exportStatements = [];

async function optimizeAndConvertImages() {
  for (const imageName of images) {
    try {
      const imagePath = path.join(__dirname, 'src/assets/Images', imageName);
      
      // Check if the file exists
      if (!fs.existsSync(imagePath)) {
        throw new Error(`File does not exist at path: ${imagePath}`);
      }

      // Optimize the image using sharp
      const optimizedImageBuffer = await sharp(imagePath)
        .resize({ width: 83, height: 83, fit: 'inside', withoutEnlargement: true }) // Match the 83px size in your React component
        .png({ quality: 80, compressionLevel: 9 }) // High compression, good quality
        .toBuffer();

      // Convert optimized image to Base64
      const base64Image = `data:image/png;base64,${optimizedImageBuffer.toString('base64')}`;
      const exportName = imageName.replace(/\..*/, ''); // Remove file extension

      // Log and store the export statement
      console.log(`// Optimized Base64 string for ${imageName}`);
      console.log(`export const ${exportName}Base64 = '${base64Image}';\n`);

      exportStatements.push(`// Optimized Base64 string for ${imageName}`);
      exportStatements.push(`export const ${exportName}Base64 = '${base64Image}';\n`);
    } catch (error) {
      console.error(`Error processing ${imageName}:`, error.message);
    }
  }

  // Write the export statements to a file if there are any
  if (exportStatements.length > 0) {
    const outputFilePath = path.join(__dirname, 'src/utils/logoImages.js');
    fs.writeFileSync(outputFilePath, exportStatements.join('\n'), 'utf8');
    console.log(`Optimized Base64 strings have been written to ${outputFilePath}`);
  } else {
    console.error('No Base64 strings were generated. Check the errors above.');
  }
}

// Run the optimization and conversion
optimizeAndConvertImages().catch((err) => {
  console.error('An error occurred during processing:', err);
});