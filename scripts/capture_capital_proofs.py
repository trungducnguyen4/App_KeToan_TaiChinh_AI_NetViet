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

        # Login first or set localStorage
        print("Navigating to login to set localStorage auth...")
        await page.goto("http://localhost:3000/login", wait_until="networkidle")
        await page.evaluate("""() => {
            localStorage.setItem('workit_user', JSON.stringify({ username: 'admin1', role: 'admin', name: 'Quản trị Xưởng' }));
            localStorage.setItem('workit_token', 'demo_token_admin');
        }""")

        # 1. Tab Feasibility
        print("Capturing 1. Feasibility...")
        await page.goto("http://localhost:3000/modules/capital-investment", wait_until="networkidle")
        await page.wait_for_timeout(2500)
        await page.screenshot(path="docs/screenshots/nv-16-capital-feasibility.png", full_page=False)

        # 2. Tab Machinery Assets
        print("Capturing 2. Machinery Assets...")
        await page.click("button:has-text('2. Danh mục Máy móc')")
        await page.wait_for_timeout(1500)
        await page.screenshot(path="docs/screenshots/nv-17-capital-assets.png", full_page=False)

        # 3. Tab Shareholders
        print("Capturing 3. Shareholders...")
        await page.click("button:has-text('3. Cơ cấu Cổ đông')")
        await page.wait_for_timeout(1500)
        await page.screenshot(path="docs/screenshots/nv-18-capital-shareholders.png", full_page=False)

        # 4. Tab Contributions
        print("Capturing 4. Contributions...")
        await page.click("button:has-text('4. Lịch sử Rót vốn')")
        await page.wait_for_timeout(1500)
        await page.screenshot(path="docs/screenshots/nv-19-capital-contributions.png", full_page=False)

        await browser.close()
        print("All screenshots captured successfully!")

asyncio.run(capture())
