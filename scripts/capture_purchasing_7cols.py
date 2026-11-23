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

        print("1. Navigating to login page...")
        page.goto("http://localhost:3000/login")
        page.wait_for_selector("button:has-text('Đăng nhập')")
        page.locator("button:has-text('Đăng nhập')").first.click()
        page.wait_for_timeout(1000)

        print("2. Navigating to http://localhost:3000/modules/purchasing...")
        page.goto("http://localhost:3000/modules/purchasing")
        page.wait_for_selector(".data-table")
        page.wait_for_timeout(2000)

        # Scroll to table
        page.evaluate("window.scrollTo(0, 480)")
        page.wait_for_timeout(600)

        # 1. Page 1 overview
        shot_full = "docs/screenshots/nv-71-purchasing-7-cols-overview.png"
        page.screenshot(path=shot_full, full_page=False)
        print(f"Saved: {shot_full}")

        # 2. Click page 2 to see raw material rows (13.800 kg, 4.100 đ/kg)
        page2_btn = page.locator("button:text-is('2')").first
        if page2_btn.count() > 0:
            page2_btn.click()
            page.wait_for_timeout(800)

        shot_page2 = "docs/screenshots/nv-75-purchasing-page-2-raw-materials.png"
        page.screenshot(path=shot_page2, full_page=False)
        print(f"Saved: {shot_page2}")

        # 3. Animated GIF showing flow
        print("3. Capturing animated GIF frames...")
        frames = []
        frames.append(Image.open(io.BytesIO(page.screenshot())))

        # Back to page 1
        page1_btn = page.locator("button:text-is('1')").first
        if page1_btn.count() > 0:
            page1_btn.click()
            page.wait_for_timeout(600)
            frames.append(Image.open(io.BytesIO(page.screenshot())))

        # Hover on refresh button
        refresh_btn = page.locator("button[title='Tải lại danh sách']").first
        if refresh_btn.count() > 0:
            refresh_btn.hover()
            page.wait_for_timeout(300)
            frames.append(Image.open(io.BytesIO(page.screenshot())))

        # Hover on Chi tiet button
        detail_btn = page.locator("button:has-text('Chi tiết')").first
        if detail_btn.count() > 0:
            detail_btn.hover()
            page.wait_for_timeout(300)
            frames.append(Image.open(io.BytesIO(page.screenshot())))

        # Go to page 2 again
        if page2_btn.count() > 0:
            page2_btn.click()
            page.wait_for_timeout(600)
            frames.append(Image.open(io.BytesIO(page.screenshot())))

        gif_path = "docs/screenshots/nv-74-purchasing-table-flow.gif"
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
