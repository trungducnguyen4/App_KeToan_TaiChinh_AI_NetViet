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

        # 1. Go to Tab 2
        print("Navigating to Tab 2: Danh mục Máy móc & Khấu hao...")
        await page.goto("http://localhost:3000/modules/capital-investment", wait_until="networkidle")
        await page.wait_for_timeout(2000)

        buttons = await page.query_selector_all("button")
        for btn in buttons:
            text = await btn.inner_text()
            if "2. Danh mục Máy móc" in text:
                await btn.click()
                break

        await page.wait_for_timeout(1500)
        # Ensure scrollLeft is 0
        await page.evaluate("""() => {
            const el = document.querySelector('div[style*="calc(100vh - 280px)"]');
            if (el) el.scrollLeft = 0;
        }""")

        # 1. Normal View with Sum 1 Month
        print("Capturing 1. Table with SUM 1 Month...")
        await page.screenshot(path="docs/screenshots/nv-55-table-sum-month-clean.png", full_page=False)

        # 2. Click "Sửa" on row 2 (TSCD-DC01)
        print("Clicking Sửa for In-line Edit on TSCD-DC01...")
        edit_buttons = await page.query_selector_all("button:has-text('Sửa')")
        if len(edit_buttons) >= 2:
            await edit_buttons[1].click()
            await page.wait_for_timeout(800)
            await page.evaluate("""() => {
                const el = document.querySelector('div[style*="calc(100vh - 280px)"]');
                if (el) el.scrollLeft = 0;
            }""")
            print("Capturing 2. In-line Edit Active row (scrollLeft=0)...")
            await page.screenshot(path="docs/screenshots/nv-56-inline-edit-clean.png", full_page=False)

        # 3. Type some change (cost from 820M to 850M)
        print("Simulating typing in In-line Edit...")
        inputs = await page.query_selector_all("input[type='number']")
        if len(inputs) >= 1:
            await inputs[0].fill("850000000")
            await page.wait_for_timeout(800)
            print("Capturing 3. In-line Edit typing with live recalculation...")
            await page.screenshot(path="docs/screenshots/nv-57-inline-edit-typing-clean.png", full_page=False)

        await browser.close()
        print("All In-line Edit screenshots captured successfully!")

asyncio.run(capture())
