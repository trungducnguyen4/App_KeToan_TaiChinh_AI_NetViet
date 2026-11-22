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

        # 1. Base Overview of Tab 1
        print("Capturing 1. Capital Dashboard Overview (Base Scenario)...")
        await page.goto("http://localhost:3000/modules/capital-investment", wait_until="networkidle")
        await page.wait_for_timeout(2500)
        await page.screenshot(path="docs/screenshots/nv-44-capital-dashboard-overview.png", full_page=False)

        # 2. Hover on Payback Curve Point
        print("Capturing 2. Hover on Payback Point...")
        circles = await page.query_selector_all("svg circle")
        if len(circles) >= 8:
            await circles[7].hover()
            await page.wait_for_timeout(800)
            await page.screenshot(path="docs/screenshots/nv-45-hover-payback-curve.png", full_page=False)

        # 3. Switch to Equity View Mode
        print("Capturing 3. Switch to Equity 3.5B View Mode...")
        buttons = await page.query_selector_all("button")
        for btn in buttons:
            text = await btn.inner_text()
            if "Theo Vốn Góp (3,50 Tỷ)" in text:
                await btn.click()
                break
        await page.wait_for_timeout(1000)
        await page.screenshot(path="docs/screenshots/nv-46-equity-payback-mode.png", full_page=False)

        # 4. Trigger Conservative Scenario Preset
        print("Capturing 4. Conservative What-If Scenario Preset...")
        buttons = await page.query_selector_all("button")
        for btn in buttons:
            text = await btn.inner_text()
            if "Thận trọng" in text:
                await btn.click()
                break
        await page.wait_for_timeout(1000)
        await page.screenshot(path="docs/screenshots/nv-47-conservative-scenario.png", full_page=False)

        # 5. Switch to CVP Break-even tab in Waterfall Card
        print("Capturing 5. CVP Break-even View...")
        for btn in buttons:
            text = await btn.inner_text()
            if "Hòa Vốn (CVP)" in text:
                await btn.click()
                break
        await page.wait_for_timeout(800)
        await page.screenshot(path="docs/screenshots/nv-48-cvp-breakeven-view.png", full_page=False)

        await browser.close()
        print("All Capital Dashboard screenshots captured successfully!")

asyncio.run(capture())
