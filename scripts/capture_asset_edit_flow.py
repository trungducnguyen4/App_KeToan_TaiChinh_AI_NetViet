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

        # 1. Go to Capital Investment page and switch to Tab 2
        print("Navigating to Tab 2: Danh mục Máy móc & Khấu hao...")
        await page.goto("http://localhost:3000/modules/capital-investment", wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # Click Tab 2
        buttons = await page.query_selector_all("button")
        for btn in buttons:
            text = await btn.inner_text()
            if "2. Danh mục Máy móc" in text:
                await btn.click()
                break

        await page.wait_for_timeout(1500)
        print("Capturing 1. Table with SUM 1 Month and Action Edit column...")
        await page.screenshot(path="docs/screenshots/nv-52-assets-table-with-sum-month.png", full_page=False)

        # 2. Click "Sửa" button on row 2 (TSCD-DC01)
        print("Clicking Edit button on asset TSCD-DC01...")
        edit_buttons = await page.query_selector_all("button:has-text('Sửa')")
        if len(edit_buttons) >= 2:
            await edit_buttons[1].click()
            await page.wait_for_timeout(1000)
            print("Capturing 2. Edit Asset Modal...")
            await page.screenshot(path="docs/screenshots/nv-53-edit-asset-modal.png", full_page=False)

        await browser.close()
        print("All asset table and edit screenshots captured successfully!")

asyncio.run(capture())
