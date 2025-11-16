/**
 * Quick test script to verify Google Vision API integration
 * Run with: node test-google-vision.js
 */

import dotenv from 'dotenv';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// Check if credentials are set
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('❌ GOOGLE_APPLICATION_CREDENTIALS not found in .env file');
    console.log('Make sure you have: GOOGLE_APPLICATION_CREDENTIALS=./path/to/your-key.json');
    process.exit(1);
}

// Check if the credentials file exists
const credsPath = path.resolve(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS);
if (!fs.existsSync(credsPath)) {
    console.error('❌ Credentials file not found:', credsPath);
    console.log('Please check the path in your .env file');
    process.exit(1);
}

console.log('🔍 Testing Google Vision API...');
console.log('Credentials file:', credsPath);

try {
    // Initialize the client
    const client = new ImageAnnotatorClient({
        keyFilename: credsPath
    });

    console.log('✅ Google Vision client initialized successfully!');
    console.log('\n📝 To fully test OCR, you would need to:');
    console.log('   1. Upload an image of an ID card');
    console.log('   2. Call extractInfoFromImage() from ocrService.js');
    console.log('   3. Check the extracted RedID and name');
    console.log('\n✅ Google Vision API is configured and ready to use!');

} catch (error) {
    console.error('❌ Error initializing Google Vision client:');
    console.error(error.message);

    if (error.message.includes('ENOENT')) {
        console.error('\n💡 The credentials file path might be incorrect');
    } else if (error.message.includes('invalid')) {
        console.error('\n💡 The credentials file might be invalid or corrupted');
    }

    process.exit(1);
}