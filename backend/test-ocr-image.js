/**
 * Test Google Vision OCR with an actual image
 * Usage: node test-ocr-image.js <path-to-image>
 */

import dotenv from 'dotenv';
import { extractInfoFromImage } from './src/services/ocrService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// Get image path from command line or use a test image
const imagePath = process.argv[2];

if (!imagePath) {
    console.log('📷 Usage: node test-ocr-image.js <path-to-image>');
    console.log('\nExample:');
    console.log('  node test-ocr-image.js ./test-images/id-card.jpg');
    console.log('\nOr provide a full path:');
    console.log('  node test-ocr-image.js /Users/adityajasti/Downloads/id-card.jpg');
    process.exit(1);
}

// Check if image exists
const fullPath = path.isAbsolute(imagePath) ? imagePath : path.resolve(__dirname, imagePath);

if (!fs.existsSync(fullPath)) {
    console.error('❌ Image file not found:', fullPath);
    process.exit(1);
}

console.log('🔍 Testing Google Vision OCR...');
console.log('Image:', fullPath);
console.log('');

// Test OCR extraction
try {
    const result = await extractInfoFromImage(fullPath);

    console.log('✅ OCR Processing Complete!');
    console.log('');
    console.log('📋 Extracted Information:');
    console.log('  RedID:', result.redId || '(not found)');
    console.log('  Full Name:', result.fullName || '(not found)');
    console.log('');

    if (result.redId || result.fullName) {
        console.log('✅ Successfully extracted information from the image!');
    } else {
        console.log('⚠️  No RedID or name was extracted. This could mean:');
        console.log('   - The image doesn\'t contain clear text');
        console.log('   - The text format doesn\'t match expected patterns');
        console.log('   - The image quality is too low');
    }

} catch (error) {
    console.error('❌ Error during OCR processing:');
    console.error(error.message);
    if (error.stack) {
        console.error('\nStack trace:');
        console.error(error.stack);
    }
    process.exit(1);
}