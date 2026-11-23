import os
import io
import time
from playwright.sync_api import sync_playwright
from PIL import Image

def main():
    os.makedirs("docs/screenshots", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 960})
        page = context.new_page()

        print("1. Logging in...")
        page.goto("http://localhost:3000/login")
        page.wait_for_selector("button:has-text('Đăng nhập')")
        page.locator("button:has-text('Đăng nhập')").first.click()
        page.wait_for_timeout(1000)

        print("2. Navigating to http://localhost:3000/modules/sales...")
        page.goto("http://localhost:3000/modules/sales")
        page.wait_for_selector(".data-table")
        page.wait_for_timeout(2000)

        # 1. Full view of sales screen
        shot_sales_full = "docs/screenshots/nv-76-sales-7-cols-overview.png"
        page.screenshot(path=shot_sales_full, full_page=False)
        print(f"Saved: {shot_sales_full}")

        # 2. Close-up of sales table
        page.evaluate("window.scrollTo(0, 220)")
        page.wait_for_timeout(600)
        shot_sales_table = "docs/screenshots/nv-77-sales-7-cols-detail.png"
        page.screenshot(path=shot_sales_table, full_page=False)
        print(f"Saved: {shot_sales_table}")

        # 3. Animated GIF showing sales pagination and hover
        frames = []
        frames.append(Image.open(io.BytesIO(page.screenshot())))

        # Hover on action button
        action_btn = page.locator("button:has-text('Thu tiền'), button:has-text('Thu tiếp')").first
        if action_btn.count() > 0:
            action_btn.hover()
            page.wait_for_timeout(300)
            frames.append(Image.open(io.BytesIO(page.screenshot())))

        # Click page 2
        p2_btn = page.locator(".pagination button:text-is('2')").first
        if p2_btn.count() > 0:
            p2_btn.click()
            page.wait_for_timeout(600)
            frames.append(Image.open(io.BytesIO(page.screenshot())))

        # Click page 1
        p1_btn = page.locator(".pagination button:text-is('1')").first
        if p1_btn.count() > 0:
            p1_btn.click()
            page.wait_for_timeout(600)
            frames.append(Image.open(io.BytesIO(page.screenshot())))

        gif_path = "docs/screenshots/nv-78-sales-table-flow.gif"
        frames[0].save(
            gif_path,
            save_all=True,
            append_images=frames[1:],
            duration=900,
            loop=0
        )
        print(f"Saved: {gif_path}")

        browser.close()

if __name__ == "__main__":
    main()
