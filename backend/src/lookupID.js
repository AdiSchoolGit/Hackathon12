import fs from 'fs';
import puppeteer from 'puppeteer';

(async() => {
    // Load cookies
    const cookies = JSON.parse(fs.readFileSync('./cookies.json'));

    // Launch Puppeteer
    const browser = await puppeteer.launch({
        headless: false, // use false until you're sure it works
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

    // Add cookies
    await page.setCookie(...cookies);

    // Naviage directly to lookup page
    const url = 'https://cmsweb.cms.sdsu.edu/psc/CSDPRD/EMPLOYEE/SA/c/NUI_FRAMEWORK.PT_AGSTARTPAGE_NUI.GBL?CONTEXTIDPARAMS=TEMPLATE_ID%3aPTPPNAVCOL&scname=ADMN_SD_ID_LOOKUP&PTPPB_GROUPLET_ID=SD_CC_ID_LOOKUP&CRefName=SD_ID_LOOKUP1';

    console.log('Opening lookup page...');
    await page.goto(url, { waitUntil: 'networkidle2' });

    // WAIT for page content
    await page.waitForTimeout(3000);

    console.log('Page loaded. You should now be inside SDSU portal without login prompt.');

    // If you want, you can start automating form input here
    // Example:
    // await page.type('#REDID_FIELD_ID', '123456789')
    // await page.click('#SEARCH_BUTTON_ID')

})();