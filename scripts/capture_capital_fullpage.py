import asyncio
from playwright.async_api import async_playwright

async def capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path="C:/Program Files/Google/Chrome/Application/chrome.exe",
            headless=True
        )
        context = await browser.new_context(viewport={'width': 1440, 'height': 1100})
        page = await context.new_page()

        # Auth
        await page.goto("http://localhost:3000/login", wait_until="networkidle")
        await page.evaluate("""() => {
            localStorage.setItem('workit_user', JSON.stringify({ username: 'admin1', role: 'admin', name: 'Quản trị Xưởng' }));
            localStorage.setItem('workit_token', 'demo_token_admin');
        }""")

        # 1. Full Page Screenshot of Complete 4-Layer Dashboard
        print("Capturing Full Page Dashboard...")
        await page.goto("http://localhost:3000/modules/capital-investment", wait_until="networkidle")
        await page.wait_for_timeout(2500)
        await page.screenshot(path="docs/screenshots/nv-49-capital-dashboard-fullpage.png", full_page=True)

        # 2. Scroll to Layer 4 (Tables)
        print("Capturing Layer 4 (Detailed Tables)...")
        await page.evaluate("window.scrollTo(0, 650)")
        await page.wait_for_timeout(800)
        await page.screenshot(path="docs/screenshots/nv-50-capital-detailed-tables.png", full_page=False)

        await browser.close()
        print("Full page and table screenshots captured successfully!")

asyncio.run(capture())
