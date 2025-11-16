/**
 * OCR Service - Extracts text from student ID card images using Google Vision API
 */

import { ImageAnnotatorClient } from '@google-cloud/vision';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables (in case they're not loaded yet)
dotenv.config();

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

let visionClient = null;

// Initialize Google Vision client if credentials are provided
const googleCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (googleCredentialsPath) {
    try {
        // Resolve path - handle both relative and absolute paths
        let credentialsPath = googleCredentialsPath;
        if (!path.isAbsolute(credentialsPath)) {
            // If relative, resolve from backend directory
            credentialsPath = path.resolve(__dirname, '..', '..', credentialsPath);
        }

        // Check if file exists
        if (!fs.existsSync(credentialsPath)) {
            console.error(`[OCR Service] Credentials file not found: ${credentialsPath}`);
            visionClient = null;
        } else {
            // Initialize with credentials file path
            visionClient = new ImageAnnotatorClient({
                keyFilename: credentialsPath
            });
            console.log('[OCR Service] Google Vision API client initialized with credentials:', credentialsPath);
        }
    } catch (error) {
        console.error('[OCR Service] Failed to initialize Google Vision client:', error.message);
        visionClient = null;
    }
} else {
    console.log('[OCR Service] Google Vision API not configured. OCR will return null. Set GOOGLE_APPLICATION_CREDENTIALS to enable.');
}

/**
 * Extract information from a card image using Google Vision OCR
 * @param {string} imagePath - Path to the uploaded image file
 * @returns {Promise<Object>} Object with redId and fullName (or null if not found)
 */
export async function extractInfoFromImage(imagePath) {
    console.log(`[OCR Service] Processing image: ${imagePath}`);

    // If Google Vision is not configured, return null
    if (!visionClient) {
        console.warn('[OCR Service] Google Vision API not configured. Set GOOGLE_APPLICATION_CREDENTIALS env var.');
        return {
            redId: null,
            fullName: null
        };
    }

    try {
        // Check if image file exists
        if (!fs.existsSync(imagePath)) {
            console.error(`[OCR Service] Image file not found: ${imagePath}`);
            return {
                redId: null,
                fullName: null
            };
        }

        // Read the image file
        const imageBuffer = fs.readFileSync(imagePath);

        // Check if image buffer is valid
        if (!imageBuffer || imageBuffer.length === 0) {
            console.error(`[OCR Service] Image file is empty or invalid: ${imagePath}`);
            return {
                redId: null,
                fullName: null
            };
        }

        console.log(`[OCR Service] Image file size: ${imageBuffer.length} bytes`);

        // Perform text detection
        const [result] = await visionClient.textDetection({
            image: { content: imageBuffer }
        });

        const detections = result.textAnnotations;

        if (!detections || detections.length === 0) {
            console.log('[OCR Service] No text detected in image');
            return {
                redId: null,
                fullName: null
            };
        }

        // The first detection contains all text, subsequent ones are individual words with bounding boxes
        const fullText = detections[0].description || '';
        console.log('[OCR Service] Detected text:', fullText);

        // Get image dimensions from the first detection's bounding box
        const imageBounds = detections[0].boundingPoly?.vertices || [];
        let imageWidth = 0;
        let imageHeight = 0;

        if (imageBounds.length > 0) {
            // Calculate image dimensions from bounding box
            const xCoords = imageBounds.map(v => v.x || 0);
            const yCoords = imageBounds.map(v => v.y || 0);
            imageWidth = Math.max(...xCoords);
            imageHeight = Math.max(...yCoords);
        }

        // If we don't have bounding box info, try to estimate from other detections
        if (imageWidth === 0 || imageHeight === 0) {
            for (const detection of detections.slice(1)) {
                if (detection.boundingPoly?.vertices) {
                    const vertices = detection.boundingPoly.vertices;
                    const xCoords = vertices.map(v => v.x || 0);
                    const yCoords = vertices.map(v => v.y || 0);
                    imageWidth = Math.max(imageWidth, ...xCoords);
                    imageHeight = Math.max(imageHeight, ...yCoords);
                }
            }
        }

        console.log(`[OCR Service] Image dimensions: ${imageWidth}x${imageHeight}`);

        // Define regions: bottom right (for RedID) and bottom left (for name)
        // Bottom right: right 30% of image, bottom 30%
        // Bottom left: left 30% of image, bottom 30%
        const bottomRightThresholdX = imageWidth * 0.7; // Right 30%
        const bottomRightThresholdY = imageHeight * 0.7; // Bottom 30%
        const bottomLeftThresholdX = imageWidth * 0.3; // Left 30%
        const bottomLeftThresholdY = imageHeight * 0.7; // Bottom 30%

        let redId = null;
        let fullName = null;

        // Collect all potential RedIDs in bottom right region
        // The red RedID is typically the rightmost/bottommost number
        const potentialRedIds = [];

        // Process individual text detections (skip first one which is full text)
        for (const detection of detections.slice(1)) {
            if (!detection.boundingPoly?.vertices) continue;

            const vertices = detection.boundingPoly.vertices;
            const text = detection.description || '';

            // Calculate center point and bounds of the text bounding box
            const xCoords = vertices.map(v => v.x || 0);
            const yCoords = vertices.map(v => v.y || 0);
            const centerX = xCoords.reduce((a, b) => a + b, 0) / xCoords.length;
            const centerY = yCoords.reduce((a, b) => a + b, 0) / yCoords.length;
            const rightmostX = Math.max(...xCoords);
            const bottommostY = Math.max(...yCoords);

            // Check if text is in bottom right region (RedID area)
            if (centerX >= bottomRightThresholdX && centerY >= bottomRightThresholdY) {
                // Look for 9-digit RedID pattern
                const redIdMatch = text.match(/\b\d{9}\b/);
                if (redIdMatch) {
                    // Store potential RedID with its position info
                    // The red RedID is typically the rightmost/bottommost
                    potentialRedIds.push({
                        redId: redIdMatch[0],
                        centerX,
                        centerY,
                        rightmostX,
                        bottommostY,
                        distanceFromCorner: Math.sqrt(
                            Math.pow(imageWidth - rightmostX, 2) +
                            Math.pow(imageHeight - bottommostY, 2)
                        )
                    });
                    console.log(`[OCR Service] Found potential RedID in bottom right: ${redIdMatch[0]} at (${centerX}, ${centerY}), rightmost: ${rightmostX}, bottommost: ${bottommostY}`);
                }
            }

            // Check if text is in bottom left region (Name area)
            if (centerX <= bottomLeftThresholdX && centerY >= bottomLeftThresholdY) {
                // Look for name pattern (2-4 capitalized words)
                const words = text.trim().split(/\s+/);
                if (words.length >= 2 && words.length <= 4) {
                    const allCapitalized = words.every(w => /^[A-Z][a-z]+$/.test(w));
                    if (allCapitalized && !fullName) {
                        fullName = words.join(' ');
                        console.log(`[OCR Service] Found name in bottom left: ${fullName} at (${centerX}, ${centerY})`);
                    }
                }
            }
        }

        // Select the RedID that is closest to the bottom-right corner
        // This should be the red RedID (rightmost/bottommost)
        if (potentialRedIds.length > 0) {
            // Sort by distance from bottom-right corner (closest first)
            potentialRedIds.sort((a, b) => a.distanceFromCorner - b.distanceFromCorner);
            redId = potentialRedIds[0].redId;
            console.log(`[OCR Service] Selected RedID (closest to bottom-right corner): ${redId} from ${potentialRedIds.length} candidates`);

            // Log all candidates for debugging
            if (potentialRedIds.length > 1) {
                console.log('[OCR Service] All RedID candidates:', potentialRedIds.map(p => ({
                    redId: p.redId,
                    distance: p.distanceFromCorner.toFixed(0),
                    rightmost: p.rightmostX,
                    bottommost: p.bottommostY
                })));
            }
        }

        // Fallback: if position-based extraction didn't work, try pattern matching on full text
        if (!redId) {
            const redIdMatch = fullText.match(/\b\d{9}\b/);
            redId = redIdMatch ? redIdMatch[0] : null;
            if (redId) {
                console.log('[OCR Service] Found RedID via fallback pattern matching');
            }
        }

        if (!fullName) {
            // Try common name patterns
            const namePatterns = [
                /(?:Name|NAME|Student Name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
                /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m,
            ];

            for (const pattern of namePatterns) {
                const match = fullText.match(pattern);
                if (match) {
                    fullName = match[1] || match[0];
                    console.log('[OCR Service] Found name via fallback pattern matching');
                    break;
                }
            }
        }

        console.log('[OCR Service] Extracted:', { redId, fullName });

        return {
            redId,
            fullName: fullName || null
        };
    } catch (error) {
        console.error('[OCR Service] ❌ Error processing image:', error);
        console.error('[OCR Service] Error stack:', error.stack);
        console.error('[OCR Service] Error details:', {
            message: error.message,
            name: error.name,
            code: error.code,
            imagePath: imagePath
        });
        return {
            redId: null,
            fullName: null
        };
    }
}