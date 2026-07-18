import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("http://localhost:5173")

        await page.wait_for_timeout(3000)

        print("Clicking Search variants...")
        # Just click the variant select element directly
        await page.locator('.sv-control').click()
        await page.wait_for_timeout(1000)

        print("Typing Windoku...")
        await page.keyboard.type("Windoku", delay=100)
        await page.wait_for_timeout(1000)

        print("Pressing Enter...")
        await page.keyboard.press("Enter")
        await page.wait_for_timeout(2000)

        # Check if Windoku is now under variant rule
        rule_text = await page.locator('.variant-rule-container').inner_text()
        print("Rule text container:", rule_text)

        # Check if Windoku is in the Input modes box
        modes_text = await page.locator('.input-modes-container').inner_text()
        print("Input modes text:", modes_text)

        # Now click on "Windoku" inside the input modes box (if it exists)
        print("Clicking Windoku mode...")
        windoku_mode_btn = page.locator('button:has-text("Windoku")')
        if await windoku_mode_btn.count() > 0:
            await windoku_mode_btn.click()
            print("Clicked Windoku mode")
            await page.wait_for_timeout(500)

            # Click Sudoku mode again to see if Windoku shading goes away
            print("Taking screenshot with Windoku active...")
            await page.screenshot(path='/home/jules/verification/verification21_active.png')

            # Deselect Windoku
            print("Clicking classic Sudoku mode...")
            await page.locator('button:has-text("Sudoku")').click()
            await page.wait_for_timeout(500)
            print("Taking screenshot with Windoku inactive...")
            await page.screenshot(path='/home/jules/verification/verification21_inactive.png')
        else:
            print("Windoku mode button not found!")
            await page.screenshot(path='/home/jules/verification/verification21_error.png')

        await browser.close()

asyncio.run(main())
