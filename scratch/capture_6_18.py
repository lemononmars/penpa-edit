import asyncio
from playwright.async_api import async_playwright

async def run():
    url = "https://swaroopg92.github.io/penpa-edit/?m=solve&p=1ZdLbuNGE8f3OgXRwOwaBh+iHtw5nnEwgEefE3kyMQTBaEkcizBFOiQ1DzqeTTbZZ5vdd45cJhfIFaaqmjT7ZSCLZBFIarV+LHb/q8gqFeufjqJKeeDzIObRjMM3vMZhwONJAGDM55EPVL6usiZPE2/ZiOaYepeiuuOnx2ZfVol3sfTiGedwqNiJaqfaeNUxT2tP3N/nn0+8090ua7KyEHn++UV45tXlIfU2udjeedus2pJllXq52KR5nu5OvKt96tV7cZ9627JoRFZkxa0nngy0c73DsW68vfiQgsVBNNs9GpPpyYvwJbzPr1/jrg0uKmBnWrmWpzxBOgHNwBmieVncppU0wBP6JTqeNXW3Cf/fgr8XeZ2OVj6PMWjr0YoFjLMQPgFbf2mXX1aM8WA9emi/Tx7am2S1fuTt22G6TB5gXCQPLPJZsmI/Mz6Fc3225iyamGQWIHmtkCAYI/rrj99VGM8R/vnr/1U4iQn+8hu8VT4bVhhzFktGtgbr5QxkapL5zD5vTmI0Fvq9swMh1zQSPjkxsMjBSD8EZSCkXiUBraVrCGgtg9FaqoqA1tIIxUHXEFAkDEax0FRQJFQSUhz6azJgCoaJpzIimuKpjIjOpEKDkUKDkULFt6lUqJJOoerZtJOnMXn76utHZGcw8kHdISIPNEJXwVhf3r06Iz+VeE4j8lIj5KMVykhmiIYhEQNKx+s+HUPOZK25eYNZDCmJWm2KOmyKW1h0iv7bFL2zKWq3KBUBi8pC4MAYERvTZXVgp39B7HRQlhkbT5wuyvpjYyo/gOW/082yx521iTslJu68NDCVIwfudOtYFiUH7uJt4s5LE3cRNLHTS1mpbEzlyoHda/dX3sTPrO2MoKxgDuyMoKxkNu7vKhM7IyjLmQM7vZRFzYGdumVpc2CnblnkHNituy8NJn7G2u1lX0lM7LyWsvo5sDsmVAUd2B2Tvk6pGIrgOZXCkMYraFZ4G9H4kkafxpjGC7J5ReM7Gs9oHNM4IZtZ3/I8jkYr6DKx89Rf8X+PYbu3PFbvxTaFhm9xPGygP1yU1UHk8HuJzSOD1o/VZX5Td3ZJUx1TCDaggk5gCfWQEuVleZ9nBZgpMLstyip1HkKY7m5d9puy2hmrf4Q+XAPykmtIVmcNNVWm/RZVVX7UCHTfew1sRANPD/U+u9dXSotGF9AIXaK4E8Zuh8HnxxH7xOgD92sIFyTCxnqetKe8/Rb+zpXWm7ffwR33JmkX2GNjEz6jO5WMQpi+Gqbv6DjOziQMfJgvYB5DawDTa5hq/1rtZbJqrzjDfb6hs3HKDuUHkCp14O9tediAMyumhEMeqY+78u7Y2VK6nUq5y14u7tLJjQa5OJVycWbKhYaeT3W9F9Kxf1TvHLMYr4L/Nx5rqJX7UXneoBaDXStkTK3jW+s5Z6ESauzOFTKns7RnIZ+auh9UNKb271J7DiJJEJgOqW3fv1n3PnWVoKyGYqDc54AdBQGoM/E7buU+cCvLcUM70YE6ch2ome6A7IwHaCU9sGfyHlc1Ux9VmdmPW1kFALdSa8BqPQp9eKgI/a8=&a=VY2xEcQgEAN7IXYA6O8OamHcfxv26iPPMBsgre6cNnpv10vB8TMLTv/PYU7Tnbmg/B9/pmkrnMaG6TTtpt2Ml2LYvohEIg6LHTEg/KDnPQ8lleRIoRVTRbpIF+5C26Q72n2dz7sf"
    param = url.split("?")[1]
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path="C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
            headless=True
        )
        page = await browser.new_page()
        await page.goto("file:///C:/coding%20projects/penpa-edit/docs/index.html")
        await page.wait_for_function("typeof window.load === 'function'")
        await page.evaluate("(p) => window.load(p)", param)
        await page.wait_for_timeout(1000)
        canvas = await page.query_selector("#canvas")
        await canvas.screenshot(path="scratch/penpa_canvas_6_18.png")
        print("Captured scratch/penpa_canvas_6_18.png!")
        await browser.close()

asyncio.run(run())
