"""
Runtime evidence for walk v2 with frame-swap disabled.

Mirrors what the renderer does after the v2.3.0 walk fix:
- Keep ONE SVG frame in the DOM (no innerHTML swap)
- Let the CSS animations (sideWalkSwing*, body bob, tail sway) run
  uninterrupted
- Verify the full 50deg+ swing range is observed

This is the proof that the CSS keyframes + transform-origin fix
actually produce a full-range swing when the innerHTML swap is
disabled (the renderer no longer swaps during walk).
"""
import sys
import math
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

REPO = Path(__file__).resolve().parent.parent.parent
OUT_DIR = REPO / "docs" / "walk-screenshots"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def matrix_to_degrees(matrix_str):
    m = re.match(r"matrix\(([^)]+)\)", matrix_str)
    if not m:
        return None
    parts = [float(x.strip()) for x in m.group(1).split(",")]
    if len(parts) < 4:
        return None
    a, b = parts[0], parts[1]
    return math.degrees(math.atan2(b, a))


HTML = r"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="../../src/styles/dashboard.css">
  <style>
    body { background: #0a0f1a; padding: 30px; }
    .stage { background: #1a2030; padding: 30px; display: inline-block; }
    .stage svg { width: 240px; height: 240px; }
  </style>
</head>
<body>
  <h2 style="color: #e9ecef; font-family: sans-serif;">Walk v2 - frame swap disabled (CSS-driven)</h2>
  <div class="stage walking-bob cat-walk" id="cat-stage"></div>
  <div class="stage walking-bob dog-walk" id="dog-stage"></div>
  <script src="../../src/assets/cat.js"></script>
  <script src="../../src/assets/dog.js"></script>
  <script>
    // Render ONE frame and DO NOT swap. This is what the renderer does
    // for walk state after the v2.3.0 fix.
    document.getElementById('cat-stage').innerHTML = window.catWalk1SVG;
    document.getElementById('dog-stage').innerHTML = window.dogWalk1SVG;
  </script>
</body>
</html>
"""


def main():
    html_path = OUT_DIR / "_walk-no-swap.html"
    html_path.write_text(HTML, encoding="utf-8")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 700, "height": 900})
        page.goto(f"file://{html_path.as_posix()}")
        page.wait_for_load_state("networkidle")

        # Sample back-foot-left at 20ms intervals across 1.5 cycles
        cat_samples = []
        for i in range(40):  # 40 * 20ms = 800ms = ~1.2 cat cycles
            page.wait_for_timeout(20)
            t = page.locator("#cat-stage .back-foot-left").first.evaluate(
                "el => getComputedStyle(el).transform"
            )
            deg = matrix_to_degrees(t) if t and t != "none" else None
            cat_samples.append((i * 20, deg))

        dog_samples = []
        for i in range(30):  # 30 * 20ms = 600ms = ~1.25 dog cycles
            page.wait_for_timeout(20)
            t = page.locator("#dog-stage .back-foot-left").first.evaluate(
                "el => getComputedStyle(el).transform"
            )
            deg = matrix_to_degrees(t) if t and t != "none" else None
            dog_samples.append((i * 20, deg))

        page.screenshot(path=str(OUT_DIR / "walk-v2-no-swap.png"), full_page=True)
        browser.close()

    cat_degrees = [d for _, d in cat_samples if d is not None]
    dog_degrees = [d for _, d in dog_samples if d is not None]

    print("=== walk v2 runtime evidence (frame swap disabled) ===")
    print(f"cat back-foot-left: {len(cat_degrees)} samples")
    print(f"  range: {min(cat_degrees):.1f} to {max(cat_degrees):.1f} = {max(cat_degrees)-min(cat_degrees):.1f}deg")
    print(f"dog back-foot-left: {len(dog_degrees)} samples")
    print(f"  range: {min(dog_degrees):.1f} to {max(dog_degrees):.1f} = {max(dog_degrees)-min(dog_degrees):.1f}deg")

    failures = []
    if not cat_degrees:
        failures.append("no valid cat samples")
    else:
        cat_range = max(cat_degrees) - min(cat_degrees)
        if cat_range < 50:
            failures.append(f"cat swing range {cat_range:.1f}deg < 50deg")
    if not dog_degrees:
        failures.append("no valid dog samples")
    else:
        dog_range = max(dog_degrees) - min(dog_degrees)
        if dog_range < 50:
            failures.append(f"dog swing range {dog_range:.1f}deg < 50deg")

    if failures:
        print()
        print("FAIL:")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    else:
        print()
        cat_range = max(cat_degrees) - min(cat_degrees)
        dog_range = max(dog_degrees) - min(dog_degrees)
        print(f"PASS — full swing range observed: cat={cat_range:.1f}deg, dog={dog_range:.1f}deg")
        print(f"  (compared to ~22deg/31deg with frame swap enabled — the v2 fix unlocked the full CSS cycle)")


if __name__ == "__main__":
    main()
