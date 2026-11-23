import io
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

        print("Navigating to login page...")
        page.goto("http://localhost:3000/login")
        page.wait_for_selector("button:has-text('Đăng nhập')")

        # Click login button
        page.locator("button:has-text('Đăng nhập')").first.click()
        page.wait_for_timeout(1000)

        # Now go to inventory
        print("Navigating to http://localhost:3000/modules/inventory...")
        page.goto("http://localhost:3000/modules/inventory")
        page.wait_for_selector(".kpi-grid")
        page.wait_for_timeout(1500)

        # 1. Full page screenshot
        full_path = "docs/screenshots/nv-58-inventory-kpi-breakdown-full.png"
        page.screenshot(path=full_path)
        print(f"Saved: {full_path}")

        # 2. KPI Cards specific element screenshot
        kpi_grid = page.locator(".kpi-grid").first
        cards_path = "docs/screenshots/nv-59-kpi-cards-breakdown.png"
        kpi_grid.screenshot(path=cards_path)
        print(f"Saved: {cards_path}")

        # 3. Tab 3: "Tồn Kho Thực Tế"
        tab_buttons = page.locator("button:has-text('Tồn Kho')")
        if tab_buttons.count() > 0:
            tab_buttons.first.click()
            page.wait_for_timeout(800)
            stock_path = "docs/screenshots/nv-60-inventory-stock-breakdown.png"
            page.screenshot(path=stock_path)
            print(f"Saved: {stock_path}")

            # Switch back to Tab 1
            page.locator("button:has-text('Mẻ Ép & Lọc Dầu')").first.click()
            page.wait_for_timeout(800)

        # 4. Period switching sequence for GIF
        gif_frames = []
        for period in ["3 Tháng", "1 Tháng", "6 Tháng", "Toàn bộ", "3 Tháng"]:
            btn = page.locator(f"button:has-text('{period}')")
            if btn.count() > 0:
                btn.first.click()
                page.wait_for_timeout(600)
                # Take screenshot of upper half (header + kpi grid)
                shot = page.screenshot(clip={"x": 235, "y": 80, "width": 1180, "height": 380})
                img = Image.open(io.BytesIO(shot))
                # Add duplicate frames for pause
                for _ in range(5):
                    gif_frames.append(img)

        if gif_frames:
            gif_path = "docs/screenshots/nv-61-kpi-breakdown-flow.gif"
            gif_frames[0].save(
                gif_path,
                save_all=True,
                append_images=gif_frames[1:],
                optimize=True,
                duration=350,
                loop=0
            )
            print(f"Saved: {gif_path}")

        browser.close()

if __name__ == "__main__":
    main()
