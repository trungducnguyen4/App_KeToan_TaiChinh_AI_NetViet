import os
import io
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

        print("2. Navigating to http://localhost:3000/dashboard...")
        page.goto("http://localhost:3000/dashboard")
        page.wait_for_selector(".workspace")
        page.wait_for_timeout(1800)

        # 1. Full dashboard overview
        shot_full = "docs/screenshots/nv-67-dashboard-color-refinement.png"
        page.screenshot(path=shot_full, full_page=False)
        print(f"Saved: {shot_full}")

        # 2. Closeup of Topbar & 4 KPIs
        shot_kpi = "docs/screenshots/nv-68-kpi-and-logout-refined.png"
        page.screenshot(path=shot_kpi, clip={"x": 240, "y": 0, "width": 1180, "height": 380})
        print(f"Saved: {shot_kpi}")

        # 3. Closeup of the 3 Insight Panels
        shot_insights = "docs/screenshots/nv-69-three-insight-panels-refined.png"
        page.screenshot(path=shot_insights, clip={"x": 240, "y": 380, "width": 1180, "height": 450})
        print(f"Saved: {shot_insights}")

        # 4. Animated GIF of hover and interactions
        frames = []
        frames.append(Image.open(io.BytesIO(page.screenshot())))

        # Hover on logout button
        logout_btn = page.locator(".btn-logout").first
        if logout_btn.count() > 0:
            logout_btn.hover()
            page.wait_for_timeout(400)
            frames.append(Image.open(io.BytesIO(page.screenshot())))

        # Hover back to dashboard
        page.hover(".kpi-card:last-child")
        page.wait_for_timeout(400)
        frames.append(Image.open(io.BytesIO(page.screenshot())))

        gif_path = "docs/screenshots/nv-70-dashboard-colors-flow.gif"
        frames[0].save(
            gif_path,
            save_all=True,
            append_images=frames[1:],
            optimize=True,
            duration=1200,
            loop=0
        )
        print(f"Saved: {gif_path}")

        browser.close()
        print("All dashboard refinement screenshots captured successfully!")

if __name__ == "__main__":
    main()
