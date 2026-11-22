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

        print("Capturing Sales page with cleaned dropdowns...")
        await page.goto("http://localhost:3000/modules/sales", wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # 1. 4 Boxes in a Single Row
        await page.screenshot(path="docs/screenshots/nv-33-four-boxes-row-overview.png", full_page=False)

        # 2. Open Product Filter dropdown
        select_filter = page.locator("select").nth(1)
        await select_filter.click()
        await page.wait_for_timeout(500)
        await page.screenshot(path="docs/screenshots/nv-37-filter-dropdown-3-meals.png", full_page=False)

        # 3. Open Modal and check product options
        await page.click("button:has-text('+ Lập Hóa Đơn Bán Hàng')")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="docs/screenshots/nv-38-modal-dropdown-3-meals.png", full_page=False)

        await browser.close()
        print("Screenshots captured successfully!")

asyncio.run(capture())
