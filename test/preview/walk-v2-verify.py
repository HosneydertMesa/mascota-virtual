"""
Runtime evidence for walk v2 enhancement.

Verifies the new amplitudes in the live browser (not just static CSS
inspection) by sampling the computed transform of .back-foot-left
at multiple time points across one cycle and checking that the
swing range is >= 50deg.
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

REPO = Path(__file__).resolve().parent.parent.parent
OUT_DIR = REPO / "docs" / "walk-screenshots"


def matrix_to_degrees(matrix_str):
    """Extract the rotation angle (in degrees) from a CSS matrix() string.

    matrix(a, b, c, d, tx, ty) represents the 2D transformation
        [a c tx]
        [b d ty]
        [0 0  1]

    For pure rotation: a = cos(θ), b = sin(θ). θ = atan2(b, a).
    For rotation + scale, the matrix is the product, but for our
    case (CSS rotate on a leg) it's pure rotation so this is exact.
    """
    import math
    import re
    m = re.match(r"matrix\(([^)]+)\)", matrix_str)
    if not m:
        return None
    parts = [float(x.strip()) for x in m.group(1).split(",")]
    if len(parts) < 4:
        return None
    a, b = parts[0], parts[1]
    return math.degrees(math.atan2(b, a))


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 900, "height": 1800})
        page.goto(f"file://{(REPO / 'test' / 'preview' / 'cat-walk-preview.html').as_posix()}")
        page.wait_for_load_state("networkidle")

        page.click("#cat-walk-play")
        page.click("#dog-walk-play")

        # Sample the computed transform of .back-foot-left over one full
        # cat cycle (0.65s) at 50ms intervals = 14 samples
        samples = []
        for i in range(14):
            page.wait_for_timeout(50)
            t = page.locator("#cat-walk-stage .back-foot-left").first.evaluate(
                "el => getComputedStyle(el).transform"
            )
            deg = matrix_to_degrees(t) if t and t != "none" else None
            samples.append((i * 50, deg))

        # Sample dog too
        dog_samples = []
        for i in range(12):
            page.wait_for_timeout(40)
            t = page.locator("#dog-walk-stage .back-foot-left").first.evaluate(
                "el => getComputedStyle(el).transform"
            )
            deg = matrix_to_degrees(t) if t and t != "none" else None
            dog_samples.append((i * 40, deg))

        browser.close()

    # Compute the swing range
    cat_degrees = [d for _, d in samples if d is not None]
    dog_degrees = [d for _, d in dog_samples if d is not None]

    print("=== walk v2 runtime evidence ===")
    print(f"cat back-foot-left samples ({len(cat_degrees)} valid):")
    for t, d in samples:
        print(f"  t={t}ms: {d}deg" if d is not None else f"  t={t}ms: none")
    if cat_degrees:
        cat_range = max(cat_degrees) - min(cat_degrees)
        print(f"  cat swing range: {cat_range:.1f}deg (target >= 50)")

    print()
    print(f"dog back-foot-left samples ({len(dog_degrees)} valid):")
    for t, d in dog_samples:
        print(f"  t={t}ms: {d}deg" if d is not None else f"  t={t}ms: none")
    if dog_degrees:
        dog_range = max(dog_degrees) - min(dog_degrees)
        print(f"  dog swing range: {dog_range:.1f}deg (target >= 50)")

    failures = []
    if cat_degrees:
        cat_range = max(cat_degrees) - min(cat_degrees)
        if cat_range < 50:
            failures.append(f"cat swing range {cat_range:.1f}deg < 50deg")
    else:
        failures.append("no valid cat samples")
    if dog_degrees:
        dog_range = max(dog_degrees) - min(dog_degrees)
        if dog_range < 50:
            failures.append(f"dog swing range {dog_range:.1f}deg < 50deg")
    else:
        failures.append("no valid dog samples")

    if failures:
        print()
        print("FAIL:")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    else:
        print()
        print(f"PASS — walk v2 swing range cat={cat_range:.1f}deg dog={dog_range:.1f}deg")


if __name__ == "__main__":
    main()
