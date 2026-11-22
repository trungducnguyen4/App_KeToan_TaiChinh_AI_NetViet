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

        # 1. Sales Invoice Screen with Donut Chart (Overview)
        print("Capturing 1. Sales Donut Chart Overview...")
        await page.goto("http://localhost:3000/modules/sales", wait_until="networkidle")
        await page.wait_for_timeout(2500)
        await page.screenshot(path="docs/screenshots/nv-25-sales-donut-chart-overview.png", full_page=False)

        # 2. Hover on Oil Segment
        print("Capturing 2. Hover on Segment...")
        paths = await page.query_selector_all("svg path")
        if len(paths) > 0:
            await paths[0].hover()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="docs/screenshots/nv-26-sales-donut-chart-hover.png", full_page=False)

        # 3. Switch to Group View (Dầu Dừa vs Cám Dừa)
        print("Capturing 3. Group View...")
        await page.click("button:has-text('Nhóm Dầu vs Cám')")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="docs/screenshots/nv-27-sales-donut-chart-group-view.png", full_page=False)

        await browser.close()
        print("All Donut Chart screenshots captured successfully!")

asyncio.run(capture())
