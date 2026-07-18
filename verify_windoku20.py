import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("http://localhost:5173")

        await page.wait_for_timeout(2000)

        # Click search variants
        print("Finding input...")
        variant_input = page.locator('input[placeholder="Search variants..."]')
        await variant_input.wait_for(state="visible")

        print("Typing Windoku...")
        await variant_input.type('Windoku', delay=100)
        await page.wait_for_timeout(1000)

        print("Clicking search result...")
        await page.locator('.sv-item:has-text("Windoku")').click()
        await page.wait_for_timeout(2000)

        print("Checking if Windoku is in the Input modes box...")
        # Check if Windoku is in the Input modes box
        modes_text = await page.locator('.input-modes-container').inner_text()
        print("Input modes text:", modes_text)

        # Now click on "Windoku" inside the input modes box (if it exists)
        print("Clicking Windoku mode...")
        windoku_mode_btn = page.locator('button:has-text("Windoku")')
        if await windoku_mode_btn.count() > 0:
            await windoku_mode_btn.click()
            print("Clicked Windoku mode")
        else:
            print("Windoku mode button not found!")

        await page.wait_for_timeout(2000)

        print("Taking screenshot...")
        await page.screenshot(path='/home/jules/verification/verification20.png')
        await browser.close()

asyncio.run(main())
