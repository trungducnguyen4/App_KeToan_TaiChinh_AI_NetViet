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

        # 1. Sales Invoice Modal with Auto-fill MST (Vinamilk: 0300588569)
        print("Capturing 1. Sales Invoice Modal...")
        await page.goto("http://localhost:3000/modules/sales", wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # Click button to open modal
        await page.click("button:has-text('+ Lập Hóa Đơn Bán Hàng')")
        await page.wait_for_timeout(1000)

        # Type tax code 0300588569 (Vinamilk)
        tax_input = page.locator("input[placeholder*='0300588569']")
        await tax_input.fill("0300588569")
        await page.wait_for_timeout(3000)
        await page.screenshot(path="docs/screenshots/nv-21-sales-modal-tax-autofill.png", full_page=False)

        # 2. Purchasing Screen with Auto-fill MST (MISA: 0101243150)
        print("Capturing 2. Purchasing Screen...")
        await page.goto("http://localhost:3000/modules/purchasing", wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # Click tab button "Hóa đơn VAT chi phí"
        await page.click("button:has-text('Hóa đơn VAT chi phí')")
        await page.wait_for_timeout(1000)

        # Fill tax code 0101243150 (MISA)
        purchasing_tax = page.locator("input[placeholder='1300123456']")
        await purchasing_tax.fill("0101243150")
        await page.wait_for_timeout(3000)
        await page.screenshot(path="docs/screenshots/nv-22-purchasing-tax-autofill.png", full_page=False)

        # 3. Ben Tre Local Enterprise Auto-fill (1300994511 - Lương Quới Vietcoco)
        print("Capturing 3. Local Ben Tre Enterprise Auto-fill...")
        await purchasing_tax.fill("1300994511")
        await page.wait_for_timeout(3000)
        await page.screenshot(path="docs/screenshots/nv-23-bentre-tax-autofill.png", full_page=False)

        await browser.close()
        print("All visual proof screenshots captured successfully!")

asyncio.run(capture())
