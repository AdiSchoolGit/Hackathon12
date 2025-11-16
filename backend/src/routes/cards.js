/**
 * Cards API Routes
 *
 * ⚠️ CRITICAL: Optional chaining operator must be `?.` (NO SPACE) not `? .` (with space)
 *
 * This file uses optional chaining throughout - ensure no formatter adds spaces.
 *
 * To prevent syntax errors:
 * 1. VS Code settings are configured to disable auto-formatting
 * 2. Run `npm run check-syntax` before committing
 * 3. Never use `? .` or `. ?` - always use `?.` (no space)
 *
 * If you see "SyntaxError: Unexpected token '.'" - check for spaces in optional chaining!
 */
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
    createCard,
    findCardById,
    findCardByPickupCode,
    findCardByReferenceCode,
    updateCard,
    getAllCards
} from '../store/cardsStore.js';
import { extractInfoFromImage } from '../services/ocrService.js';
// Directory service import removed - directory lookup not yet implemented
// import { findUserByRedId, findUserByName } from '../services/directoryService.js';
import { notifyOwnerOfFoundCard } from '../services/notificationService.js';
import { getEmailByRedId, getAllMappings } from '../services/redIdEmailMap.js';

const router = express.Router();
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a pickup code using only digits 1, 2, 3, 4
 * @param {number} length - Length of the code (default: 4)
 * @returns {string} Pickup code
 */
function generatePickupCode(length = 4) {
    const allowedDigits = ['1', '2', '3', '4'];
    let code = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allowedDigits.length);
        code += allowedDigits[randomIndex];
    }
    return code;
}

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'card-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

/**
 * POST /api/found-card-photo
 * Used by React app (and future mobile app) when someone uploads a photo
 * Automatically processes image with OCR, finds owner, and sends email
 */
router.post('/found-card-photo', upload.single('cardImage'), async(req, res) => {
    try {
        const { finderContact, locationDescription, boxId, manualRedId } = req.body;
        const imagePath = req.file ? req.file.path : null;

        console.log('[Route] Received form data:', {
            finderContact,
            locationDescription,
            boxId,
            manualRedId,
            hasImage: !!imagePath
        });

        if (!imagePath) {
            console.error('[Route] ❌ No image file in request');
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Check if uploaded file exists
        if (!fs.existsSync(imagePath)) {
            console.error(`[Route] ❌ Uploaded file not found: ${imagePath}`);
            return res.status(400).json({ error: 'Uploaded file not found on server' });
        }

        // Generate a pickup code if box is assigned (using only digits 1, 2, 3, 4)
        const pickupCode = boxId ? generatePickupCode(4) : null;

        // Create card record first
        // Status is 'waiting_for_email' - admin will manually look up email in MySDSU
        const card = createCard({
            source: 'web',
            finderContact: finderContact || null,
            locationDescription: locationDescription || null,
            boxId: boxId || null,
            pickupCode: pickupCode,
            status: 'waiting_for_email'
        });


        // Extract information from image using OCR
        let extractedInfo = null;
        let emailSentStatus = false; // Initialize to false
        let emailAddress = null; // Initialize to null
        let redIdToUse = null; // Declare outside try block so it's accessible later

        // Debug: Log initial state
        console.log('[Route] 📋 Initial state:', {
            emailSentStatus: emailSentStatus,
            emailAddress: emailAddress,
            emailSentStatusType: typeof emailSentStatus,
            emailAddressType: typeof emailAddress
        });

        try {
            extractedInfo = await extractInfoFromImage(imagePath);
            console.log('[Route] Extracted info from image:', extractedInfo);
        } catch (ocrError) {
            console.error('[Route] Error during OCR:', ocrError);
            // Continue even if OCR fails - we might have manual RedID
        }

        // Use manual RedID if provided, otherwise use OCR extracted RedID
        // Do this OUTSIDE the OCR try block so it works even if OCR fails
        redIdToUse = manualRedId ? .trim() || extractedInfo ? .redId;

        console.log('[Route] RedID to use:', {
            manualRedId: manualRedId ? .trim(),
            extractedRedId: extractedInfo ? .redId,
            finalRedId: redIdToUse,
            redIdType: typeof redIdToUse,
            redIdLength: redIdToUse ? .length
        });

        // Update card with extracted info
        if (redIdToUse || extractedInfo ? .fullName) {
            updateCard(card.id, {
                redId: redIdToUse || null,
                fullName: extractedInfo ? .fullName || null
            });
        }

        // Look up email from hardcoded RedID mapping
        // Do this OUTSIDE the OCR try block so it always runs
        let owner = null;
        if (redIdToUse) {
            // Normalize RedID - remove any whitespace and ensure it's a string
            const normalizedRedId = String(redIdToUse).trim().replace(/\s+/g, '');
            console.log(`[Route] 🔍 Looking up email for RedID: "${normalizedRedId}" (original: "${redIdToUse}", type: ${typeof redIdToUse}, length: ${normalizedRedId?.length})`);

            const email = getEmailByRedId(normalizedRedId);
            console.log(`[Route] getEmailByRedId("${normalizedRedId}") returned: ${email}`);

            if (email) {
                console.log(`[Route] ✅ Found email for RedID ${normalizedRedId}: ${email}`);
                owner = {
                    email: email,
                    fullName: extractedInfo ? .fullName || null,
                    redId: normalizedRedId
                };
            } else {
                console.log(`[Route] ❌ No email found for RedID "${normalizedRedId}"`);
                // Test the mapping directly
                const allMappings = getAllMappings();
                console.log(`[Route] Available RedID keys in map:`, Object.keys(allMappings));
                console.log(`[Route] Checking if "${normalizedRedId}" === "132264610":`, normalizedRedId === '132264610');
                console.log(`[Route] Checking if "${normalizedRedId}" == "132264610":`, normalizedRedId == '132264610');
                console.log(`[Route] RedID value inspection:`, JSON.stringify(normalizedRedId));
                console.log(`[Route] RedID char codes:`, normalizedRedId.split('').map(c => c.charCodeAt(0)));
                console.log(`[Route] Direct map access test:`, allMappings[normalizedRedId]);
            }
        } else {
            console.log(`[Route] ⚠️ redIdToUse is falsy: ${redIdToUse}`);
        }

        // Send email notification if owner found
        // Do this OUTSIDE the OCR try block so it always runs
        if (owner && owner.email) {
            try {
                // Get the latest card state (with all updates) before sending email
                const currentCard = findCardById(card.id);
                console.log(`[Route] Sending email with card data:`, {
                    cardId: currentCard.id,
                    boxId: currentCard.boxId,
                    pickupCode: currentCard.pickupCode,
                    locationDescription: currentCard.locationDescription,
                    finderContact: currentCard.finderContact
                });

                emailAddress = owner.email; // Always set emailAddress if we found it
                console.log(`[Route] Attempting to send email to: ${emailAddress}`);
                const emailSent = await notifyOwnerOfFoundCard(owner, currentCard);
                console.log(`[Route] SendGrid returned: ${emailSent}`);
                if (emailSent) {
                    updateCard(card.id, {
                        status: 'email_sent',
                        email: owner.email,
                        fullName: owner.fullName || extractedInfo ? .fullName || null
                    });
                    emailSentStatus = true; // Only set to true if email actually sent
                    console.log(`[Route] ✅ Email sent successfully to ${owner.email} for RedID ${redIdToUse}`);
                } else {
                    // Email failed but card is updated with owner info
                    // emailAddress is already set, but emailSentStatus stays false
                    updateCard(card.id, {
                        email: owner.email,
                        fullName: owner.fullName || extractedInfo ? .fullName || null
                    });
                    console.log(`[Route] ❌ Email failed to send, but owner info saved for RedID ${redIdToUse}`);
                    console.log(`[Route] Email address found: ${emailAddress}, but SendGrid returned false`);
                }
            } catch (emailError) {
                console.error('[Route] ❌ Error sending email notification:', emailError);
                console.error('[Route] Error stack:', emailError.stack);
                // Continue - card is still created even if email fails
                // Still save owner info if available
                // emailAddress is already set, but emailSentStatus stays false
                if (owner.email) {
                    updateCard(card.id, {
                        email: owner.email,
                        fullName: owner.fullName || extractedInfo ? .fullName || null
                    });
                }
                console.log(`[Route] Email address was: ${emailAddress}, but exception occurred`);
            }
        } else {
            console.log(`[Route] ⚠️ No owner found - email lookup failed or owner.email is missing`);
            console.log(`[Route] redIdToUse: "${redIdToUse}"`);
            console.log(`[Route] owner:`, owner);
            console.log(`[Route] owner?.email:`, owner ? .email);
            console.log(`[Route] emailAddress is: ${emailAddress}, emailSentStatus is: ${emailSentStatus}`);
            // Explicitly set to null if no owner found (should already be null, but be explicit)
            emailAddress = null;
            emailSentStatus = false;
            console.log(`[Route] After setting defaults - emailAddress: ${emailAddress}, emailSentStatus: ${emailSentStatus}`);
        }

        // Get the final card state (after updates) - do this BEFORE using it
        const finalCard = findCardById(card.id);

        // Generate user-friendly message with reference code and box info
        const referenceCode = card.id.substring(0, 8).toUpperCase();
        let message = 'Thanks! Your report has been recorded.';

        // Use redIdToUse if available, otherwise fall back to finalCard.redId
        // This ensures we use the most up-to-date RedID value
        const redIdForMessage = redIdToUse || finalCard.redId;

        if (extractedInfo && (extractedInfo.redId || extractedInfo.fullName)) {
            message = 'Thanks! We extracted information from the card.';
        }

        // Add RedID to message if available
        if (redIdForMessage) {
            message += ` Your RedID is ${redIdForMessage}.`;
        }

        // Add box and pickup code info to message
        if (finalCard.boxId && finalCard.pickupCode) {
            message += ` The card is stored at ${finalCard.boxId}. Pickup code: ${finalCard.pickupCode}.`;
        }

        // Add reference code to message
        message += ' Your reference ID is ' + referenceCode + '.';

        // Debug: Log response data
        console.log('[Route] 📤 Final response data:', {
            emailSent: emailSentStatus,
            emailAddress: emailAddress,
            redId: redIdForMessage || finalCard.redId,
            redIdToUse: redIdToUse,
            finalCardRedId: finalCard.redId,
            boxId: finalCard.boxId,
            pickupCode: finalCard.pickupCode
        });

        const emailSentValue = emailSentStatus === true;
        const emailAddressValue = emailAddress || null;

        console.log('[Route] 📋 Before building response:', {
            emailSentStatus: emailSentStatus,
            emailSentValue: emailSentValue,
            emailAddress: emailAddress,
            emailAddressValue: emailAddressValue,
            redIdToUse: redIdToUse,
            owner: owner,
            ownerEmail: owner ? .email,

            hasOwner: !!owner,
            hasOwnerEmail: !!(owner && owner.email)
        });

        const responseData = {
            cardId: finalCard.id,
            referenceCode: referenceCode,
            message: message,
            boxId: finalCard.boxId || null,
            pickupCode: finalCard.pickupCode || null,
            redId: redIdForMessage || finalCard.redId || null, // Include RedID in response
            extractedInfo: extractedInfo || null,
            emailSent: emailSentValue, // Explicitly set boolean (never undefined)
            emailAddress: emailAddressValue // Explicitly set string or null (never undefined)
        };

        // Final safety check - ensure these are never undefined
        if (responseData.emailSent === undefined) {
            console.warn('[Route] ⚠️ emailSent was undefined, setting to false');
            responseData.emailSent = false;
        }
        if (responseData.emailAddress === undefined) {
            console.warn('[Route] ⚠️ emailAddress was undefined, setting to null');
            responseData.emailAddress = null;
        }

        // Debug: Verify values before sending
        console.log('[Route] 📤 Response values check:', {
            emailSent: responseData.emailSent,
            emailAddress: responseData.emailAddress,
            emailSentType: typeof responseData.emailSent,
            emailAddressType: typeof responseData.emailAddress
        });

        console.log('[Route] 📤 Sending response:', JSON.stringify(responseData, null, 2));
        res.json(responseData);
    } catch (error) {
        console.error('[Route] ❌ Error processing found card photo:', error);
        console.error('[Route] Error stack:', error.stack);
        console.error('[Route] Error details:', {
            message: error.message,
            name: error.name,
            code: error.code
        });

        // Provide more detailed error message
        let errorMessage = 'Failed to process card photo';
        if (error.message) {
            errorMessage += `: ${error.message}`;
        }

        res.status(500).json({
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * POST /api/found-card-redid
 * Used by Arduino box (and for manual testing) when a card is scanned
 */
router.post('/found-card-redid', async(req, res) => {
    try {
        const { redId, boxId } = req.body;

        if (!redId || !boxId) {
            return res.status(400).json({ error: 'redId and boxId are required' });
        }

        // Generate a pickup code using only digits 1, 2, 3, 4
        const pickupCode = generatePickupCode(4);

        // Create card record
        // Status is 'waiting_for_email' - admin will manually look up email in MySDSU
        const card = createCard({
            redId,
            source: 'box',
            boxId,
            pickupCode,
            status: 'waiting_for_email'
        });

        // Look up email from hardcoded RedID mapping
        let owner = null;
        const email = getEmailByRedId(redId);
        if (email) {
            console.log(`[Route] Found email for RedID ${redId}: ${email}`);
            owner = {
                email: email,
                fullName: null,
                redId: redId
            };
        } else {
            console.log(`[Route] No email mapping found for RedID ${redId}`);
        }

        // Send email notification if owner found
        if (owner && owner.email) {
            try {
                const emailSent = await notifyOwnerOfFoundCard(owner, card);
                if (emailSent) {
                    updateCard(card.id, {
                        status: 'email_sent',
                        email: owner.email,
                        fullName: owner.fullName || null
                    });
                    console.log(`[Route] Email sent to ${owner.email} for RedID ${redId} with pickupCode ${pickupCode}`);
                } else {
                    // Email failed but card is updated with owner info
                    updateCard(card.id, {
                        email: owner.email,
                        fullName: owner.fullName || null
                    });
                    console.log(`[Route] Email failed to send, but owner info saved for RedID ${redId}`);
                }
            } catch (emailError) {
                console.error('[Route] Error sending email notification:', emailError);
                // Continue - card is still created even if email fails
                // Still save owner info if available
                if (owner.email) {
                    updateCard(card.id, {
                        email: owner.email,
                        fullName: owner.fullName || null
                    });
                }
            }
        } else {
            console.log(`[Route] No email found for RedID ${redId}, card status: waiting_for_email`);
        }

        res.json({
            cardId: card.id,
            pickupCode
        });
    } catch (error) {
        console.error('Error processing found card by RedID:', error);
        res.status(500).json({ error: 'Failed to process card' });
    }
});

/**
 * POST /api/pickup-request
 * Used by box and app when someone wants to claim the card
 */
router.post('/pickup-request', async(req, res) => {
    try {
        const { pickupCode, boxId } = req.body;

        if (!pickupCode || !boxId) {
            return res.status(400).json({ error: 'pickupCode and boxId are required' });
        }

        const card = findCardByPickupCode(pickupCode, boxId);

        if (!card) {
            return res.json({ ok: false, reason: 'invalid_code' });
        }

        if (card.status === 'picked_up') {
            return res.json({ ok: false, reason: 'already_picked_up' });
        }

        // Mark as picked up (taken out)
        updateCard(card.id, {
            status: 'picked_up',
            pickedUpAt: new Date()
        });

        res.json({
            ok: true,
            message: 'Card has been taken out successfully',
            cardId: card.id
        });
    } catch (error) {
        console.error('Error processing pickup request:', error);
        res.status(500).json({ error: 'Failed to process pickup request' });
    }
});

/**
 * GET /api/cards/:id
 * Get card details by ID or reference code (for debugging and web app status page)
 * Supports both full card ID and reference code (first 8 chars)
 */
router.get('/cards/:id', (req, res) => {
    try {
        const { id } = req.params;

        // Try to find by full ID first
        let card = findCardById(id);

        // If not found and ID is 8 characters, try reference code lookup
        if (!card && id.length === 8) {
            card = findCardByReferenceCode(id);
        }

        // If still not found, try case-insensitive reference code lookup
        if (!card) {
            card = findCardByReferenceCode(id);
        }

        if (!card) {
            return res.status(404).json({ error: 'Card not found. Please check your reference code.' });
        }

        // Return card without sensitive internal fields if needed
        res.json(card);
    } catch (error) {
        console.error('Error fetching card:', error);
        res.status(500).json({ error: 'Failed to fetch card' });
    }
});

/**
 * GET /api/cards
 * Get all cards (for admin - supports filtering by status)
 * Query params: ?status=waiting_for_email
 */
router.get('/cards', (req, res) => {
    try {
        const { status } = req.query;
        const filters = status ? { status } : {};
        const cards = getAllCards(filters);
        res.json(cards);
    } catch (error) {
        console.error('Error fetching cards:', error);
        res.status(500).json({ error: 'Failed to fetch cards' });
    }
});

/**
 * POST /api/cards/:id/set-email
 * Admin endpoint: Manually set email address and send notification
 * This is called after admin looks up email in MySDSU manually
 */
router.post('/cards/:id/set-email', async(req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email address is required' });
        }

        const card = findCardById(id);

        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        if (card.status !== 'waiting_for_email') {
            return res.status(400).json({
                error: `Card is not waiting for email. Current status: ${card.status}`
            });
        }

        // Generate pickup code if box is assigned but code doesn't exist yet (using only digits 1, 2, 3, 4)
        let pickupCode = card.pickupCode;
        if (card.boxId && !pickupCode) {
            pickupCode = generatePickupCode(4);
            updateCard(card.id, { pickupCode });
        }

        // Update card with email
        updateCard(card.id, { email });

        // Get updated card
        const updatedCard = findCardById(id);

        // Create owner object for notification
        const owner = {
            email: email,
            fullName: updatedCard.fullName || 'Student'
        };

        // Send email notification via SendGrid
        console.log(`[Admin] Sending email to ${email} for card ${id}`);
        const emailSent = await notifyOwnerOfFoundCard(owner, updatedCard);

        if (emailSent) {
            // Update status to email_sent
            updateCard(card.id, {
                status: 'email_sent'
            });

            res.json({
                success: true,
                message: 'Email sent successfully',
                card: findCardById(id)
            });
        } else {
            // Email failed but card is updated with email
            res.status(500).json({
                success: false,
                message: 'Email address saved but failed to send email. Check SendGrid configuration.',
                card: findCardById(id),
                sendGridConfigured: !!process.env.SENDGRID_API_KEY
            });
        }
    } catch (error) {
        console.error('Error setting email and sending notification:', error);
        res.status(500).json({
            error: 'Failed to set email and send notification',
            message: error.message
        });
    }
});

/**
 * POST /api/test-sendgrid
 * Test endpoint to verify SendGrid email functionality
 */
router.post('/test-sendgrid', async(req, res) => {
    try {
        const { toEmail, testName } = req.body;

        if (!toEmail) {
            return res.status(400).json({ error: 'Please provide toEmail in request body' });
        }

        // Import notification service (already imported at top of file)
        // Create a test owner and card
        const testOwner = {
            email: toEmail,
            fullName: testName || 'Test User'
        };

        const testCard = {
            id: 'test-' + Date.now(),
            boxId: 'BOX_1',
            pickupCode: '123456',
            locationDescription: 'Test Location - SendGrid Test',
            finderContact: null,
            status: 'notified_owner'
        };

        console.log('[Test] Attempting to send test email to:', toEmail);
        const emailSent = await notifyOwnerOfFoundCard(testOwner, testCard);

        if (emailSent) {
            res.json({
                success: true,
                message: 'Test email sent successfully!',
                recipient: toEmail,
                card: testCard
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send test email. Check server logs and SendGrid configuration.',
                recipient: toEmail,
                sendGridConfigured: !!process.env.SENDGRID_API_KEY
            });
        }
    } catch (error) {
        console.error('[Test] Error testing SendGrid:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to test SendGrid',
            message: error.message,
            sendGridConfigured: !!process.env.SENDGRID_API_KEY
        });
    }
});

export default router;