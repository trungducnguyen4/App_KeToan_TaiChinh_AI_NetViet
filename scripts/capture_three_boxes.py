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

        # 1. 3 Boxes in a Single Row (Overview)
        print("Capturing 1. 3 Boxes Row Overview (33.33% each)...")
        await page.goto("http://localhost:3000/modules/sales", wait_until="networkidle")
        await page.wait_for_timeout(2500)
        await page.screenshot(path="docs/screenshots/nv-40-three-boxes-row-overview.png", full_page=False)

        # 2. Hover on Oil Mini Donut
        print("Capturing 2. Hover on Oil Mini Donut...")
        paths = await page.query_selector_all("svg path")
        if len(paths) >= 2:
            await paths[0].hover()
            await page.wait_for_timeout(800)
            await page.screenshot(path="docs/screenshots/nv-41-hover-oil-mini-donut.png", full_page=False)

        # 3. Hover on Meal Mini Donut
        print("Capturing 3. Hover on Meal Mini Donut...")
        if len(paths) >= 4:
            await paths[3].hover()
            await page.wait_for_timeout(800)
            await page.screenshot(path="docs/screenshots/nv-42-hover-meal-mini-donut.png", full_page=False)

        await browser.close()
        print("All 3 Boxes Row screenshots captured successfully!")

asyncio.run(capture())
