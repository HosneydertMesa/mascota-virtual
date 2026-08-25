"""
Quick visual smoke test: open the cat-walk-preview.html, apply the walking
state, take 2 screenshots ~400ms apart, and assert that the leg SVG elements
have a non-identity computed transform (i.e. the CSS animation is actually
swinging the legs).

This is the "runtime evidence" the renderer fix needs — node:test alone can't
prove the browser-side CSS animation runs. The structural test (pet-assets)
ensures the classes exist; this script proves the animation produces motion.
"""
import sys
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

REPO = Path(__file__).resolve().parent.parent.parent
PREVIEW = REPO / "test" / "preview" / "cat-walk-preview.html"
OUT_DIR = REPO / "docs" / "walk-screenshots"


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 900, "height": 1400})
        page.goto(f"file://{PREVIEW.as_posix()}")
        page.wait_for_load_state("networkidle")

        # Click play on both cycles
        page.click("#cat-walk-play")
        page.click("#dog-walk-play")

        # First capture — t=0
        cat_t0 = page.locator("#cat-walk-stage .back-foot-left").first.evaluate(
            "el => getComputedStyle(el).transform"
        )
        page.screenshot(path=str(OUT_DIR / "walk-t0.png"), full_page=True)

        # Wait 400ms — half a cat cycle (0.65s) so the leg should have swung
        # significantly. 400ms / 650ms = 0.615 of a cycle, so we should be
        # near the opposite extreme.
        page.wait_for_timeout(400)
        cat_t1 = page.locator("#cat-walk-stage .back-foot-left").first.evaluate(
            "el => getComputedStyle(el).transform"
        )
        page.screenshot(path=str(OUT_DIR / "walk-t400.png"), full_page=True)

        # Dog sample
        dog_t0 = page.locator("#dog-walk-stage .back-foot-left").first.evaluate(
            "el => getComputedStyle(el).transform"
        )
        page.wait_for_timeout(300)
        dog_t1 = page.locator("#dog-walk-stage .back-foot-left").first.evaluate(
            "el => getComputedStyle(el).transform"
        )

        # Read the body bobbing too (cat-walk .walking-bob) for extra signal
        cat_body_t0 = page.locator("#cat-walk-stage.walking-bob").first.evaluate(
            "el => getComputedStyle(el).transform"
        )
        page.wait_for_timeout(300)
        cat_body_t1 = page.locator("#cat-walk-stage.walking-bob").first.evaluate(
            "el => getComputedStyle(el).transform"
        )

        browser.close()

    print("=== computed transform over time ===")
    print(f"cat back-foot-left  t=0:    {cat_t0}")
    print(f"cat back-foot-left  t=400:  {cat_t1}")
    print(f"dog back-foot-left  t=0:    {dog_t0}")
    print(f"dog back-foot-left  t=300:  {dog_t1}")
    print(f"cat walking-bob     t=0:    {cat_body_t0}")
    print(f"cat walking-bob     t=300:  {cat_body_t1}")

    # Assertions — the transforms must NOT all be "none" or identical.
    # If the CSS animation runs, at least some computed transforms should be
    # non-identity AND different between samples.
    samples = {
        "cat back-foot-left": (cat_t0, cat_t1),
        "dog back-foot-left": (dog_t0, dog_t1),
        "cat walking-bob": (cat_body_t0, cat_body_t1),
    }
    failures = []
    for name, (a, b) in samples.items():
        if a == "none" and b == "none":
            failures.append(f"{name}: transform is 'none' at both samples — animation not running")
        if a == b and a != "none":
            failures.append(f"{name}: transform identical between samples — animation not progressing")

    if failures:
        print()
        print("FAIL:")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    else:
        print()
        print(f"PASS — legs are animating. Screenshots in {OUT_DIR}/")


if __name__ == "__main__":
    main()
