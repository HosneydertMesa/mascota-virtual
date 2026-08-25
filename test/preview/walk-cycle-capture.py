"""
Capture the current walk cycle at multiple time points to see how it
looks. Used to evaluate what "natural cat walk" improvements are needed.

Strategy: pause the walk animation between samples (CSS animation-play-state)
so the element is stable for screenshots.
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

REPO = Path(__file__).resolve().parent.parent.parent
OUT_DIR = REPO / "docs" / "walk-screenshots"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 900, "height": 1800})
        page.goto(f"file://{(REPO / 'test' / 'preview' / 'cat-walk-preview.html').as_posix()}")
        page.wait_for_load_state("networkidle")

        page.click("#cat-walk-play")
        page.click("#dog-walk-play")

        # Strategy: pause the CSS animation at specific points by setting
        # animation-delay to a negative value (advances to that point) and
        # animation-play-state to paused.
        # For cat: 0.65s cycle, 6 points
        # For dog: 0.48s cycle, 6 points
        cat_points = [0.0, 0.108, 0.217, 0.325, 0.433, 0.542]  # 0, 1/6, 2/6, 3/6, 4/6, 5/6 of 0.65s
        dog_points = [0.0, 0.080, 0.160, 0.240, 0.320, 0.400]  # 0, 1/6, 2/6, 3/6, 4/6, 5/6 of 0.48s

        # Apply animation-delay to each frame. We re-render the same SVG
        # but with a different animation-delay on the stage.
        for i, t in enumerate(cat_points):
            page.evaluate(
                "([t]) => {"
                "  const stage = document.getElementById('cat-walk-stage');"
                "  stage.style.animation = 'none';"
                "  stage.offsetHeight;"  # reflow
                "  stage.style.animation = `catBodyWalk 0.65s -${t}s infinite ease-in-out paused`;"
                "}",
                [t]
            )
            page.wait_for_timeout(50)
            box = page.locator("#cat-walk-stage").bounding_box()
            if box:
                page.screenshot(
                    path=str(OUT_DIR / f"walk-cycle-cat-{i}.png"),
                    clip={"x": box["x"], "y": box["y"], "width": box["width"], "height": box["height"]},
                )

        for i, t in enumerate(dog_points):
            page.evaluate(
                "([t]) => {"
                "  const stage = document.getElementById('dog-walk-stage');"
                "  stage.style.animation = 'none';"
                "  stage.offsetHeight;"
                "  stage.style.animation = `dogBodyWalk 0.48s -${t}s infinite ease-in-out paused`;"
                "}",
                [t]
            )
            page.wait_for_timeout(50)
            box = page.locator("#dog-walk-stage").bounding_box()
            if box:
                page.screenshot(
                    path=str(OUT_DIR / f"walk-cycle-dog-{i}.png"),
                    clip={"x": box["x"], "y": box["y"], "width": box["width"], "height": box["height"]},
                )

        browser.close()
    print(f"Captured 6 cat + 6 dog walk frames in {OUT_DIR}/")


if __name__ == "__main__":
    main()
