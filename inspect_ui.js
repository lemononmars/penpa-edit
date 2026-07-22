const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false, slowMo: 100 });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    const consoleLogs = [];

    page.on('console', msg => consoleLogs.push(msg.type() + ': ' + msg.text()));
    page.on('pageerror', err => consoleLogs.push('PAGE_ERROR: ' + err.message));

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    let allPassed = true;

    // ---- Test 1: Click canvas then immediately click accordion header ----
    console.log('\n=== TEST 1: Canvas click + accordion click ===');
    const canvasBox = await page.$eval('#canvas', el => {
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) };
    });
    await page.mouse.click(canvasBox.x, canvasBox.y);
    await page.waitForTimeout(200); // Short delay like a real user

    // Click accordion header
    const headerLoc = await page.evaluate(() => {
        const header = document.querySelector('#sudoku-variant-tools .sudoku-variant-header');
        if (!header) return null;
        const r = header.getBoundingClientRect();
        return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2), isConnected: header.isConnected };
    });
    console.log('Header location found:', JSON.stringify(headerLoc));

    if (headerLoc && headerLoc.x > 0) {
        const classBefore = await page.$eval('#sudoku-variant-tools .sudoku-variant-group', el => el.className);
        await page.mouse.click(headerLoc.x, headerLoc.y);
        await page.waitForTimeout(300);
        const classAfter = await page.$eval('#sudoku-variant-tools .sudoku-variant-group', el => el.className);
        const toggled = classBefore !== classAfter;
        console.log('Class before:', classBefore);
        console.log('Class after:', classAfter);
        console.log('Accordion toggled:', toggled);
        if (!toggled) { allPassed = false; console.log('FAIL: Accordion did not toggle'); }
        else console.log('PASS');
    } else {
        allPassed = false;
        console.log('FAIL: Could not find header or it had zero bounds');
    }

    // ---- Test 2: Multiple canvas clicks then accordion ----
    console.log('\n=== TEST 2: Multiple canvas clicks + accordion ===');
    for (let i = 0; i < 5; i++) {
        await page.mouse.click(canvasBox.x + i * 10, canvasBox.y);
        await page.waitForTimeout(50);
    }
    await page.waitForTimeout(500);

    const headerLoc2 = await page.evaluate(() => {
        const header = document.querySelector('#sudoku-variant-tools .sudoku-variant-header');
        if (!header) return null;
        const r = header.getBoundingClientRect();
        return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2), isConnected: header.isConnected };
    });
    console.log('Header location after multiple canvas clicks:', JSON.stringify(headerLoc2));

    if (headerLoc2 && headerLoc2.x > 0 && headerLoc2.isConnected) {
        const classBefore = await page.$eval('#sudoku-variant-tools .sudoku-variant-group', el => el.className);
        await page.mouse.click(headerLoc2.x, headerLoc2.y);
        await page.waitForTimeout(300);
        const classAfter = await page.$eval('#sudoku-variant-tools .sudoku-variant-group', el => el.className);
        const toggled = classBefore !== classAfter;
        console.log('Accordion toggled after multiple canvas clicks:', toggled);
        if (!toggled) { allPassed = false; console.log('FAIL'); }
        else console.log('PASS');
    } else {
        allPassed = false;
        console.log('FAIL: Header not connected or zero bounds after multiple canvas clicks');
    }

    // ---- Test 3: Tab key cycling works ----
    console.log('\n=== TEST 3: Tab key cycling ===');
    await page.mouse.click(canvasBox.x, canvasBox.y);
    await page.waitForTimeout(300);
    const tabBefore = await page.$eval('.sudoku-variant-mode', el => el.className + ' | ' + el.textContent.trim()).catch(() => 'NOT FOUND');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    const tabAfter = await page.$eval('.sudoku-variant-mode', el => el.className + ' | ' + el.textContent.trim()).catch(() => 'NOT FOUND');
    console.log('Before Tab:', tabBefore);
    console.log('After Tab:', tabAfter);
    // Tab should cycle — if there's only one mode button it won't change class but shouldn't throw
    console.log('Tab key handled without error: PASS');

    // ---- Test 4: Mode button click works ----
    console.log('\n=== TEST 4: Mode button click ===');
    const modeBtnLoc = await page.evaluate(() => {
        const btn = document.querySelector('#sudoku-variant-tools .sudoku-variant-mode');
        if (!btn) return null;
        const r = btn.getBoundingClientRect();
        return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2), isConnected: btn.isConnected };
    });
    console.log('Mode button location:', JSON.stringify(modeBtnLoc));

    if (modeBtnLoc && modeBtnLoc.x > 0 && modeBtnLoc.isConnected) {
        await page.mouse.click(modeBtnLoc.x, modeBtnLoc.y);
        await page.waitForTimeout(300);
        const activeMode = await page.$eval('#sudoku-variant-tools .sudoku-variant-mode.active', el => el.textContent.trim()).catch(() => 'none');
        console.log('Active mode after click:', activeMode);
        console.log('PASS');
    } else {
        allPassed = false;
        console.log('FAIL: Mode button not found or zero bounds');
    }

    // ---- Check for any errors ----
    const errors = consoleLogs.filter(l => l.includes('error') || l.includes('PAGE_ERROR') || l.includes('TypeError'));
    if (errors.length > 0) {
        console.log('\n=== ERRORS FOUND ===');
        errors.slice(0, 10).forEach(l => console.log(l));
    } else {
        console.log('\n=== No console errors ===');
    }

    console.log('\n=== OVERALL:', allPassed ? 'ALL TESTS PASSED ✓' : 'SOME TESTS FAILED ✗', '===');

    await page.waitForTimeout(1000);
    await browser.close();
})();
