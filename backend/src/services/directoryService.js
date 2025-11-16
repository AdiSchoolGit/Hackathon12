import { lookupByRedId as mysdsuLookup } from './lookupID.js';

/**
 * Directory Service - Looks up student information from MySDSU
 * Uses Puppeteer to automate MySDSU RedID lookup
 */

/**
 * Find user by RedID using MySDSU lookup
 * @param {string} redId - Student RedID (9 digits)
 * @returns {Promise<Object|null>} User object with email and fullName, or null if not found
 */
export async function findUserByRedId(redId) {
    if (!redId || !/^\d{9}$/.test(redId)) {
        console.log('[Directory] Invalid RedID format:', redId);
        return null;
    }

    try {
        console.log(`[Directory] Looking up RedID ${redId} in MySDSU...`);
        const result = await mysdsuLookup(redId);

        // Check for cookie expiration errors
        if (result && result.error) {
            if (result.error === 'COOKIES_EXPIRED' || result.error === 'NO_COOKIES' || result.error === 'INVALID_COOKIES') {
                console.error(`[Directory] ${result.message}`);
                console.error(`[Directory] Action required: Run 'node src/scripts/login-mysdsu.js' to login again.`);
                // Return null so the system continues (card is still created, just no email lookup)
                return null;
            }
        }

        if (result && result.email) {
            console.log(`[Directory] Found email for RedID ${redId}: ${result.email}`);
            return {
                email: result.email,
                fullName: result.fullName || null,
                redId: redId
            };
        } else {
            console.log(`[Directory] No email found for RedID ${redId}`);
            return null;
        }
    } catch (error) {
        console.error(`[Directory] Error looking up RedID ${redId}:`, error.message);
        return null;
    }
}

/**
 * Find user by name (not implemented - MySDSU lookup only supports RedID)
 * @param {string} fullName - Student full name
 * @returns {Promise<Object|null>} Always returns null (name lookup not supported)
 */
export async function findUserByName(fullName) {
    // MySDSU lookup only supports RedID, not name lookup
    console.log('[Directory] Name lookup not supported - use RedID instead');
    return null;
}