const puppeteer = require('puppeteer');

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        // Pass browser console logs to node console
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            if (type === 'error' || type === 'warning' || type === 'info' || type === 'log') {
                // Ignore general log, output later via evaluate
            }
        });

        // Expose a function to be called from the browser when tests are done
        await page.exposeFunction('testCompleted', (passes, failures, errors) => {
            console.log(`\nTests completed: ${passes} passed, ${failures} failed.`);
            if (failures > 0) {
                console.error("Test failures:");
                errors.forEach(e => console.error(e));
                process.exit(1);
            } else {
                process.exit(0);
            }
        });

        // Navigate to the test page
        await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });

        // Wait for iframe to load its content
        await page.waitForFunction(() => {
            const iframe = document.getElementById('penpa');
            return iframe && iframe.contentWindow && iframe.contentWindow.encrypt_data;
        }, { timeout: 10000 }).catch(e => {
            console.log("Waiting for iframe timed out, continuing anyway...");
        });

        // Ensure window.mocha is defined before we try to hook it
        await page.waitForFunction(() => typeof window.mocha !== 'undefined', { timeout: 10000 });

        // Inject script to override mocha run to get a callback when it's done
        await page.evaluate(() => {
            const originalRun = window.mocha.run.bind(window.mocha);
            window.mocha.run = () => {
                const runner = originalRun();
                const errors = [];
                runner.on('fail', (test, err) => {
                    errors.push(`${test.fullTitle()}: ${err.message}`);
                });
                runner.on('end', () => {
                    window.testCompleted(runner.stats.passes, runner.stats.failures, errors);
                });
            };
        });

        // Run only the new test for now, to ensure our general.js tests pass
        await page.evaluate(() => {
            window.mocha.grep("general.js");
        });

        // Trigger the tests
        await page.click('#run-tests');

        // Wait indefinitely until the testCompleted callback exits the process
        await new Promise(() => {});

    } catch (e) {
        console.error("Error running tests via puppeteer:", e);
        process.exit(1);
    } finally {
        if (browser) await browser.close();
    }
})();
