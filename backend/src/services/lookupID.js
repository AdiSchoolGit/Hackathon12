import fs from 'fs';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

export async function lookupByRedId(redId) {
    // Load cookies
    const __filename = fileURLToPath(
        import.meta.url);
    const __dirname = path.dirname(__filename);
    const cookiesPath = path.join(__dirname, '../cookies.json');

    // Check if cookies file exists
    if (!fs.existsSync(cookiesPath)) {
        console.error(`[Lookup] cookies.json not found at ${cookiesPath}.`);
        console.error('[Lookup] Please run: node src/scripts/login-mysdsu.js to login and save cookies.');
        return {
            email: null,
            fullName: null,
            error: 'NO_COOKIES',
            message: 'No cookies found. Please run the login script to authenticate with MySDSU.'
        };
    }

    let cookies;
    try {
        cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf8'));
        if (!Array.isArray(cookies) || cookies.length === 0) {
            console.error('[Lookup] cookies.json is empty or invalid format.');
            console.error('[Lookup] Please run: node src/scripts/login-mysdsu.js to login and save cookies.');
            return {
                email: null,
                fullName: null,
                error: 'INVALID_COOKIES',
                message: 'Cookies file is invalid. Please run the login script to authenticate with MySDSU.'
            };
        }
    } catch (error) {
        console.error('[Lookup] Error reading cookies.json:', error.message);
        console.error('[Lookup] Please run: node src/scripts/login-mysdsu.js to login and save cookies.');
        return {
            email: null,
            fullName: null,
            error: 'INVALID_COOKIES',
            message: 'Could not read cookies file. Please run the login script to authenticate with MySDSU.'
        };
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({
        headless: process.env.PUPPETEER_HEADLESS === 'true',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    const page = await browser.newPage();

    // Set Chrome user-agent (important to match your real browser)
    await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    );

    // Set viewport to match your SDSU PeopleSoft PS_DEVICEFEATURE cookie
    await page.setViewport({
        width: 1728,
        height: 1117
    });

    try {
        console.log('[Lookup] Visiting base domain to apply cookies...');
        await page.goto('https://cmsweb.cms.sdsu.edu', { waitUntil: 'domcontentloaded' });

        console.log('[Lookup] Setting cookies:', cookies.map(c => `${c.name}@${c.domain}`).join(', '));
        await page.setCookie(...cookies);

        // Navigate directly to lookup page
        const url = 'https://cmsweb.cms.sdsu.edu/psc/CSDPRD/EMPLOYEE/SA/c/NUI_FRAMEWORK.PT_AGSTARTPAGE_NUI.GBL?CONTEXTIDPARAMS=TEMPLATE_ID%3aPTPPNAVCOL&scname=ADMN_SD_ID_LOOKUP&PTPPB_GROUPLET_ID=SD_CC_ID_LOOKUP&CRefName=SD_ID_LOOKUP1';

        console.log('[Lookup] Opening lookup page...');
        await page.goto(url, { waitUntil: 'networkidle2' });

        // short buffer to allow any dynamic loads
        await page.waitForTimeout(1500);

        console.log('[Lookup] Page loaded:', await page.url());

        // Detect if this is a login page by checking for common login inputs
        const loginSelectorCandidates = ['input#userid', 'input[name="userid"]', 'input[type="password"]'];
        const foundLogin = await page.evaluate((sels) => sels.some(sel => !!document.querySelector(sel)), loginSelectorCandidates);
        if (foundLogin) {
            console.warn('[Lookup] Login page detected. Cookies likely invalid/expired.');
            console.warn('[Lookup] Please run: node src/scripts/login-mysdsu.js to login again.');
            await safeDebugArtifacts(page, __dirname, 'login_detected');
            return {
                email: null,
                fullName: null,
                error: 'COOKIES_EXPIRED',
                message: 'MySDSU cookies have expired. Please run the login script to refresh cookies.'
            };
        }

        // Proceed with form input
        console.log('[Lookup] Typing RedID and clicking Search...');
        // Type RedID into the provided input field and submit
        const inputSelector = '#SD_LOOKUP_WRK_DESCR254';
        await page.waitForSelector(inputSelector, { timeout: 10000 });
        await page.click(inputSelector, { clickCount: 3 });
        await page.type(inputSelector, redId, { delay: 20 });

        // Click the explicit Search button
        const searchBtnSelector = '#SD_LOOKUP_WRK_SEARCH';
        await page.waitForSelector(searchBtnSelector, { timeout: 10000 });
        // Try to wait for navigation or network idle after clicking
        try {
            await Promise.all([
                page.click(searchBtnSelector),
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 })
            ]);
        } catch {
            // If no navigation occurs, wait for network idle as a fallback
            try {
                await page.waitForNetworkIdle({ idleTime: 1000, timeout: 10000 });
            } catch {
                // As last resort, short delay
                await page.waitForTimeout(2000);
            }
        }

        // Extract email from known selector; if absent, treat as no results
        const emailSelector = '#SD_LOOKUP_WRK_SD_PERS_SDSUID';
        let email = null;
        const emailEl = await page.$(emailSelector);
        if (emailEl) {
            email = await page.$eval(emailSelector, el => (el.textContent || '').trim());
            console.log('[Lookup] Found email:', email);
        } else {
            console.warn('[Lookup] Email selector not found. Taking debug artifacts...');
            await safeDebugArtifacts(page, __dirname, 'no_email_selector');
        }

        return { email, fullName: null };
    } catch (err) {
        console.error('[Lookup] Unexpected error during lookup:', err);
        try { await safeDebugArtifacts(page, __dirname, 'unexpected_error'); } catch {}
        return { email: null, fullName: null };
    } finally {
        await browser.close();
    }
}

async function safeDebugArtifacts(page, baseDir, tag) {
    try {
        const outDir = path.join(baseDir, '../../debug');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        const url = await page.url();
        console.log(`[Lookup][Debug] URL @ ${tag}:`, url);
        await page.screenshot({ path: path.join(outDir, `${ts}-${tag}.png`), fullPage: true });
        const html = await page.content();
        fs.writeFileSync(path.join(outDir, `${ts}-${tag}.html`), html, 'utf8');
        console.log(`[Lookup][Debug] Saved screenshot and HTML to ${outDir}`);
    } catch (e) {
        console.warn('[Lookup][Debug] Failed to save debug artifacts:', e.message);
    }
}