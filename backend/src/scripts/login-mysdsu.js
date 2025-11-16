#!/usr/bin/env node

/**
 * One-time MySDSU Login Script
 * 
 * This script helps you login to MySDSU once manually (including Duo 2FA),
 * then saves your session cookies for automatic lookups.
 * 
 * Run this script when:
 * - You first set up the system
 * - Your cookies expire (you'll get an error about invalid cookies)
 * 
 * Usage: node src/scripts/login-mysdsu.js
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const cookiesPath = path.join(__dirname, '../../cookies.json');

async function loginAndSaveCookies() {
    console.log('🚀 Starting MySDSU login process...');
    console.log('');
    console.log('📋 Instructions:');
    console.log('   1. A browser window will open');
    console.log('   2. Login to MySDSU with your credentials');
    console.log('   3. Complete Duo 2FA authentication');
    console.log('   4. Navigate to the RedID Lookup page');
    console.log('   5. Once you see the lookup page, come back here');
    console.log('   6. Press Enter in this terminal to save cookies');
    console.log('');
    console.log('⚠️  Keep the browser window open until you press Enter!');
    console.log('');

    // Launch browser in non-headless mode so user can interact
    const browser = await puppeteer.launch({
        headless: false, // Show browser so user can login
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    const page = await browser.newPage();

    // Set Chrome user-agent
    await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    );

    // Set viewport
    await page.setViewport({
        width: 1728,
        height: 1117
    });

    try {
        // Navigate to MySDSU login page
        console.log('🌐 Opening MySDSU login page...');
        await page.goto('https://cmsweb.cms.sdsu.edu', { waitUntil: 'domcontentloaded' });

        console.log('');
        console.log('✅ Browser opened! Please:');
        console.log('   1. Login with your SDSU credentials');
        console.log('   2. Complete Duo 2FA');
        console.log('   3. Navigate to: RedID Lookup page');
        console.log('   4. Wait for the page to fully load');
        console.log('   5. Press Enter here to save cookies');
        console.log('');

        // Wait for user to press Enter
        await new Promise((resolve) => {
            process.stdin.once('data', () => {
                resolve();
            });
        });

        console.log('');
        console.log('💾 Saving cookies...');

        // Get all cookies
        const cookies = await page.cookies();

        // Filter to only relevant MySDSU cookies
        const relevantCookies = cookies.filter(cookie =>
            cookie.domain.includes('sdsu.edu') ||
            cookie.domain.includes('cms.sdsu.edu')
        );

        // Save cookies to file
        fs.writeFileSync(cookiesPath, JSON.stringify(relevantCookies, null, 2));

        console.log(`✅ Cookies saved to: ${cookiesPath}`);
        console.log(`📊 Saved ${relevantCookies.length} cookies`);
        console.log('');
        console.log('🎉 Login complete! Your cookies are now saved.');
        console.log('   The system will use these cookies for automatic lookups.');
        console.log('   You won\'t need to login again until the cookies expire.');
        console.log('');

        // Verify cookies work by checking if we can access the lookup page
        console.log('🔍 Verifying cookies...');
        const lookupUrl = 'https://cmsweb.cms.sdsu.edu/psc/CSDPRD/EMPLOYEE/SA/c/NUI_FRAMEWORK.PT_AGSTARTPAGE_NUI.GBL?CONTEXTIDPARAMS=TEMPLATE_ID%3aPTPPNAVCOL&scname=ADMN_SD_ID_LOOKUP&PTPPB_GROUPLET_ID=SD_CC_ID_LOOKUP&CRefName=SD_ID_LOOKUP1';

        await page.goto(lookupUrl, { waitUntil: 'networkidle2' });
        await page.waitForTimeout(2000);

        // Check if we're on a login page
        const loginSelectorCandidates = ['input#userid', 'input[name="userid"]', 'input[type="password"]'];
        const foundLogin = await page.evaluate((sels) =>
            sels.some(sel => !!document.querySelector(sel)),
            loginSelectorCandidates
        );

        if (foundLogin) {
            console.log('⚠️  Warning: Cookies may not be valid. You might need to login again.');
        } else {
            console.log('✅ Cookies verified! You can access the lookup page.');
        }

    } catch (error) {
        console.error('❌ Error during login process:', error.message);
        console.error('   Please try again.');
    } finally {
        console.log('');
        console.log('🔒 Closing browser...');
        await browser.close();
        process.exit(0);
    }
}

// Run the login script
loginAndSaveCookies().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});