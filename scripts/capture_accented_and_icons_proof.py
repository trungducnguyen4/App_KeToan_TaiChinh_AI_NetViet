import os
import time
from playwright.sync_api import sync_playwright
from PIL import Image

def main():
    os.makedirs("docs/screenshots", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("1. Navigating to login page...")
        page.goto("http://localhost:3000/login")
        page.wait_for_selector("button:has-text('Đăng nhập')")
        page.locator("button:has-text('Đăng nhập')").first.click()
        page.wait_for_timeout(1000)

        # 2. Go to Cash Receipts (/modules/cash/receipts)
        print("2. Navigating to http://localhost:3000/modules/cash/receipts...")
        page.goto("http://localhost:3000/modules/cash/receipts")
        page.wait_for_selector(".workspace")
        page.wait_for_timeout(1500)

        path_receipts = "docs/screenshots/nv-62-cash-receipts-accented.png"
        page.screenshot(path=path_receipts, full_page=False)
        print(f"Saved: {path_receipts}")

        # Closeup of form + control panel
        path_form = "docs/screenshots/nv-63-cash-form-and-control-accented.png"
        page.screenshot(path=path_form, clip={"x": 240, "y": 280, "width": 1180, "height": 580})
        print(f"Saved: {path_form}")

        # 3. Go to Capital Investment (/modules/capital-investment)
        print("3. Navigating to http://localhost:3000/modules/capital-investment...")
        page.goto("http://localhost:3000/modules/capital-investment")
        page.wait_for_selector(".workspace")
        page.wait_for_timeout(1500)

        # Scroll to What-If & Detailed Table button
        page.evaluate("window.scrollTo(0, 520)")
        page.wait_for_timeout(800)

        path_whatif = "docs/screenshots/nv-64-capital-whatif-svg-icons.png"
        page.screenshot(path=path_whatif, clip={"x": 230, "y": 0, "width": 1200, "height": 720})
        print(f"Saved: {path_whatif}")

        # Click Tab 2: Danh mục Máy móc & Khấu hao
        tab_assets = page.locator("button:has-text('Danh mục Máy móc')")
        if tab_assets.count() > 0:
            tab_assets.first.click()
            page.wait_for_timeout(1000)
            path_assets = "docs/screenshots/nv-65-capital-assets-table-icons.png"
            page.screenshot(path=path_assets, full_page=False)
            print(f"Saved: {path_assets}")

        # 4. Generate animated GIF demonstrating seamless interaction
        print("4. Generating verification GIF...")
        frames = []
        page.goto("http://localhost:3000/modules/cash/receipts")
        page.wait_for_timeout(1000)
        shot1 = page.screenshot()
        frames.append(Image.open(io.BytesIO(shot1)))

        page.goto("http://localhost:3000/modules/capital-investment")
        page.wait_for_timeout(1000)
        shot2 = page.screenshot()
        frames.append(Image.open(io.BytesIO(shot2)))

        page.evaluate("window.scrollTo(0, 500)")
        page.wait_for_timeout(800)
        shot3 = page.screenshot()
        frames.append(Image.open(io.BytesIO(shot3)))

        gif_path = "docs/screenshots/nv-66-i18n-icons-verification-flow.gif"
        frames[0].save(
            gif_path,
            save_all=True,
            append_images=frames[1:],
            optimize=True,
            duration=1400,
            loop=0
        )
        print(f"Saved: {gif_path}")

        browser.close()
        print("All visual proofs captured successfully!")

if __name__ == "__main__":
    import io
    main()
