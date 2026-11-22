import asyncio
from playwright.async_api import async_playwright

async def capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path="C:/Program Files/Google/Chrome/Application/chrome.exe",
            headless=True
        )
        context = await browser.new_context(viewport={'width': 1440, 'height': 900})
        page = await context.new_page()

        # Auth
        await page.goto("http://localhost:3000/login", wait_until="networkidle")
        await page.evaluate("""() => {
            localStorage.setItem('workit_user', JSON.stringify({ username: 'admin1', role: 'admin', name: 'Quản trị Xưởng' }));
            localStorage.setItem('workit_token', 'demo_token_admin');
        }""")

        # 1. Sales Screen with Two Separate Donut Charts
        print("Capturing 1. Two Separate Donut Charts Overview...")
        await page.goto("http://localhost:3000/modules/sales", wait_until="networkidle")
        await page.wait_for_timeout(2500)
        await page.screenshot(path="docs/screenshots/nv-29-two-donut-charts-overview.png", full_page=False)

        # 2. Hover on Oil Donut Segment
        print("Capturing 2. Hover on Oil Segment...")
        paths = await page.query_selector_all("svg path")
        if len(paths) >= 2:
            await paths[0].hover()
            await page.wait_for_timeout(800)
            await page.screenshot(path="docs/screenshots/nv-30-hover-oil-donut.png", full_page=False)

        # 3. Hover on Meal Donut Segment
        print("Capturing 3. Hover on Meal Segment...")
        if len(paths) >= 4:
            await paths[3].hover()
            await page.wait_for_timeout(800)
            await page.screenshot(path="docs/screenshots/nv-31-hover-meal-donut.png", full_page=False)

        await browser.close()
        print("All Two Donut Charts screenshots captured successfully!")

asyncio.run(capture())
