const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        await page.goto('http://localhost:3000/find-company', {
            waitUntil: 'networkidle2',
            timeout: 10000
        });

        // Give it a second extra for react renders
        await new Promise(resolve => setTimeout(resolve, 2000));

        const details = await page.evaluate(() => {
            const results = document.getElementById('search-results');
            return results ? results.innerText : 'No search results block found';
        });

        console.log('--- PAGE CONTENTS ---');
        console.log(details);

        const consoleLog = await page.evaluate(() => {
            return window.lastConsoleLogs || 'No logs captured';
        });
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await browser.close();
    }
})();
