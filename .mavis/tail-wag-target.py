#!/usr/bin/env python3
"""Convert direct tailWagSpeed/Amplitude assignments to target assignments.

The lerp function (lerpTailTargets) reads from _target and writes to
the non-target variables. All other code should set the targets,
not the actual values, so the rAF loop lerps smoothly.
"""
import re
from pathlib import Path

RENDERER = Path(r"C:/Users/HOSNE/OneDrive/Desktop/mascotaVirtual/src/renderer.js")

# Pattern: tailWagSpeed = X (where X is NOT tailWagSpeedTarget)
# This matches the assignments in handlePetAction, onPetMoveState, etc.
# but NOT the lerp internal assignment (which has tailWagSpeedTarget on RHS).

def main():
    text = RENDERER.read_text(encoding='utf-8')
    original = text

    # tailWagSpeed = <not tailWagSpeedTarget>
    text = re.sub(
        r'tailWagSpeed = (?!tailWagSpeedTarget)',
        'tailWagSpeedTarget = ',
        text
    )
    # tailWagAmplitude = <not tailWagAmplitudeTarget>
    text = re.sub(
        r'tailWagAmplitude = (?!tailWagAmplitudeTarget)',
        'tailWagAmplitudeTarget = ',
        text
    )

    if text == original:
        print("No changes needed")
        return

    RENDERER.write_text(text, encoding='utf-8')

    # Count changes
    n_speed = original.count('tailWagSpeed = ') - original.count('tailWagSpeedTarget = ')
    n_amp = original.count('tailWagAmplitude = ') - original.count('tailWagAmplitudeTarget = ')
    print(f"Converted {n_speed} tailWagSpeed assignments to target")
    print(f"Converted {n_amp} tailWagAmplitude assignments to target")

if __name__ == "__main__":
    main()
