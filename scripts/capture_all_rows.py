import os
import time
from playwright.sync_api import sync_playwright

def main():
    os.makedirs("docs/screenshots", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 1100})
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

        # Scroll so the entire table is in full view
        page.evaluate("window.scrollTo(0, 680)")
        page.wait_for_timeout(800)

        shot_all_rows = "docs/screenshots/nv-82-inventory-all-rows-clean.png"
        page.screenshot(path=shot_all_rows, full_page=False)
        print(f"Saved: {shot_all_rows}")

        browser.close()

if __name__ == "__main__":
    main()
