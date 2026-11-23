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

        print("2. Navigating to http://localhost:3000/modules/inventory...")
        page.goto("http://localhost:3000/modules/inventory")
        page.wait_for_selector(".data-table")
        page.wait_for_timeout(2000)

        # Scroll to Batches Table
        page.evaluate("window.scrollTo(0, 520)")
        page.wait_for_timeout(800)

        # 1. Overview of batches table
        shot_overview = "docs/screenshots/nv-79-inventory-7-cols-overview.png"
        page.screenshot(path=shot_overview, full_page=False)
        print(f"Saved: {shot_overview}")

        # 2. Close-up of rows
        shot_detail = "docs/screenshots/nv-80-inventory-7-cols-detail.png"
        page.screenshot(path=shot_detail, clip={"x": 230, "y": 80, "width": 1190, "height": 600})
        print(f"Saved: {shot_detail}")

        # 3. Animated GIF showing interactions
        print("3. Capturing animated GIF frames...")
        frames = []
        frames.append(Image.open(io.BytesIO(page.screenshot())))

        # Hover on clamped notes with tooltip
        row4_note = page.locator("td:has-text('19.677')").first
        if row4_note.count() > 0:
            row4_note.hover()
            page.wait_for_timeout(400)
            frames.append(Image.open(io.BytesIO(page.screenshot())))

        # Click page 2
        p2_btn = page.locator(".pagination button:text-is('2')").first
        if p2_btn.count() > 0:
            p2_btn.hover()
            page.wait_for_timeout(300)
            frames.append(Image.open(io.BytesIO(page.screenshot())))
            p2_btn.click()
            page.wait_for_timeout(600)
            frames.append(Image.open(io.BytesIO(page.screenshot())))

        # Click page 1
        p1_btn = page.locator(".pagination button:text-is('1')").first
        if p1_btn.count() > 0:
            p1_btn.click()
            page.wait_for_timeout(600)
            frames.append(Image.open(io.BytesIO(page.screenshot())))

        gif_path = "docs/screenshots/nv-81-inventory-table-flow.gif"
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
