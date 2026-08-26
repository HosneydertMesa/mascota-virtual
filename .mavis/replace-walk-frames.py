#!/usr/bin/env python3
"""Replace cat walk frames with bone-rotation versions."""
from pathlib import Path

CAT_JS = Path(r"C:/Users/HOSNE/OneDrive/Desktop/mascotaVirtual/src/assets/cat.js")

# Anchors: the start and end of the block to replace
START_ANCHOR = "// Frame 1 — Contact: pata front-left extendida adelante, back-right empujando"
END_ANCHOR = "// Array de frames en orden de cycle"

NEW_FRAMES = '''// ============================================================
// Walk cycle multi-frame (M1) — SKELETAL ANIMATION 2D
// Cada pata es upper-leg + lower-leg + paw con pivots:
//   - Hip pivot: (legX, 115) — swing de la pata entera
//   - Knee pivot: (legX, 147) — bend del lower-leg
// Convención: rotación POSITIVA = clockwise (en screen coords, Y down).
//   Positiva mueve el foot hacia la derecha (backward para cat mirando izquierda)
//   Negativa mueve el foot hacia la izquierda (forward)
// Frame 1 (Contact): front-left + back-right planted diagonal, otros en aire
// Frame 2 (Down): 4 patas plantadas, body squash (absorción)
// Frame 3 (Pass): front-right + back-left planted, otros en aire
// Frame 4 (Up): todas las 4 cerca, body stretch (push-off)
// ============================================================

// Frame 1 — Contact
const catWalk1SVG = `
<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cat-skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd8a8" />
      <stop offset="100%" stop-color="#ff922b" />
    </linearGradient>
    <linearGradient id="cat-ear" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffdeeb" />
      <stop offset="100%" stop-color="#faa2c1" />
    </linearGradient>
  </defs>

  <path id="cat-tail" d="M 140,108 C 162,96 172,68 178,48" fill="none" stroke="url(#cat-skin)" stroke-width="14" stroke-linecap="round" />

  <g class="back-foot-left" style="transform-origin: 115px 115px; transform: rotate(-15deg)">
    <rect x="109" y="115" width="12" height="32" rx="6" fill="#d9480f" />
    <g style="transform-origin: 115px 147px; transform: rotate(-60deg)">
      <rect x="109" y="147" width="12" height="32" rx="6" fill="#d9480f" />
      <ellipse cx="115" cy="179" rx="8" ry="5" fill="#f1f3f5" />
      <circle cx="115" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>

  <g class="left-paw" style="transform-origin: 70px 115px; transform: rotate(10deg)">
    <rect x="64" y="115" width="12" height="32" rx="6" fill="#d9480f" />
    <g style="transform-origin: 70px 147px; transform: rotate(0deg)">
      <rect x="64" y="147" width="12" height="32" rx="6" fill="#d9480f" />
      <ellipse cx="70" cy="179" rx="8" ry="5" fill="#f1f3f5" />
      <circle cx="70" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>

  <ellipse cx="100" cy="115" rx="45" ry="32" fill="url(#cat-skin)" />
  <path d="M 94,92 L 91,105" stroke="#d9480f" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 106,92 L 102,107" stroke="#d9480f" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 118,94 L 114,109" stroke="#d9480f" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 60,95 Q 50,115 65,130 Z" fill="#ffffff" />

  <g style="transform-origin: 55px 80px;">
    <path d="M 40,55 L 30,25 Q 50,38 52,50 Z" fill="url(#cat-skin)" />
    <path d="M 42,52 L 34,31 Q 48,41 49,49 Z" fill="url(#cat-ear)" />
    <path d="M 52,55 L 48,22 Q 62,35 60,48 Z" fill="url(#cat-skin)" />
    <circle cx="55" cy="80" r="30" fill="url(#cat-skin)" />
    <path d="M 58,54 Q 53,60 48,64" stroke="#d9480f" stroke-width="3" fill="none" stroke-linecap="round" />
    <path d="M 64,54 Q 61,62 55,67" stroke="#d9480f" stroke-width="3.5" fill="none" stroke-linecap="round" />
    <path d="M 70,82 Q 64,84 60,83" stroke="#d9480f" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <line x1="28" y1="84" x2="10" y2="82" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <line x1="28" y1="89" x2="6" y2="89" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <line x1="28" y1="94" x2="10" y2="96" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <ellipse cx="42" cy="78" rx="4" ry="5.5" fill="#1e1e24" />
    <circle class="pet-pupil" data-anchor-x="42" data-anchor-y="78" cx="42" cy="78" r="1.6" fill="#ffffff" />
    <ellipse cx="46" cy="86" rx="5" ry="2.5" fill="#ff8787" opacity="0.65" />
    <polygon points="26,80 22,83 26,84" fill="#ff8787" />
    <path d="M 26,86 Q 22,89 25,92" stroke="#212529" stroke-width="1.2" fill="none" stroke-linecap="round" />
  </g>

  <g class="back-foot-right" style="transform-origin: 125px 115px; transform: rotate(-10deg)">
    <rect x="119" y="115" width="12" height="32" rx="6" fill="url(#cat-skin)" />
    <g style="transform-origin: 125px 147px; transform: rotate(5deg)">
      <rect x="119" y="147" width="12" height="32" rx="6" fill="url(#cat-skin)" />
      <ellipse cx="125" cy="179" rx="8" ry="5" fill="#ffffff" />
      <circle cx="125" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>

  <g class="right-paw" style="transform-origin: 80px 115px; transform: rotate(-5deg)">
    <rect x="74" y="115" width="12" height="32" rx="6" fill="url(#cat-skin)" />
    <g style="transform-origin: 80px 147px; transform: rotate(-30deg)">
      <rect x="74" y="147" width="12" height="32" rx="6" fill="url(#cat-skin)" />
      <ellipse cx="80" cy="179" rx="8" ry="5" fill="#ffffff" />
      <circle cx="80" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>
</svg>
`;

// Frame 2 — Down
const catWalk2SVG = `
<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cat-skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd8a8" />
      <stop offset="100%" stop-color="#ff922b" />
    </linearGradient>
    <linearGradient id="cat-ear" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffdeeb" />
      <stop offset="100%" stop-color="#faa2c1" />
    </linearGradient>
  </defs>

  <path id="cat-tail" d="M 140,112 C 160,102 168,80 172,62" fill="none" stroke="url(#cat-skin)" stroke-width="14" stroke-linecap="round" />

  <g class="back-foot-left" style="transform-origin: 115px 115px; transform: rotate(0deg)">
    <rect x="109" y="115" width="12" height="32" rx="6" fill="#d9480f" />
    <g style="transform-origin: 115px 147px; transform: rotate(5deg)">
      <rect x="109" y="147" width="12" height="32" rx="6" fill="#d9480f" />
      <ellipse cx="115" cy="179" rx="8" ry="5" fill="#f1f3f5" />
      <circle cx="115" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>
  <g class="left-paw" style="transform-origin: 70px 115px; transform: rotate(0deg)">
    <rect x="64" y="115" width="12" height="32" rx="6" fill="#d9480f" />
    <g style="transform-origin: 70px 147px; transform: rotate(5deg)">
      <rect x="64" y="147" width="12" height="32" rx="6" fill="#d9480f" />
      <ellipse cx="70" cy="179" rx="8" ry="5" fill="#f1f3f5" />
      <circle cx="70" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>

  <ellipse cx="100" cy="118" rx="46" ry="30" fill="url(#cat-skin)" />
  <path d="M 94,95 L 91,108" stroke="#d9480f" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 106,95 L 102,111" stroke="#d9480f" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 118,97 L 114,112" stroke="#d9480f" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 60,98 Q 50,118 65,133 Z" fill="#ffffff" />

  <g style="transform-origin: 55px 83px;">
    <path d="M 40,58 L 30,28 Q 50,41 52,53 Z" fill="url(#cat-skin)" />
    <path d="M 42,55 L 34,34 Q 48,44 49,52 Z" fill="url(#cat-ear)" />
    <path d="M 52,58 L 48,25 Q 62,38 60,51 Z" fill="url(#cat-skin)" />
    <circle cx="55" cy="83" r="30" fill="url(#cat-skin)" />
    <path d="M 58,57 Q 53,63 48,67" stroke="#d9480f" stroke-width="3" fill="none" stroke-linecap="round" />
    <path d="M 64,57 Q 61,65 55,70" stroke="#d9480f" stroke-width="3.5" fill="none" stroke-linecap="round" />
    <path d="M 70,85 Q 64,87 60,86" stroke="#d9480f" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <line x1="28" y1="87" x2="10" y2="85" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <line x1="28" y1="92" x2="6" y2="92" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <line x1="28" y1="97" x2="10" y2="99" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <ellipse cx="42" cy="81" rx="4" ry="5.5" fill="#1e1e24" />
    <circle class="pet-pupil" data-anchor-x="42" data-anchor-y="81" cx="42" cy="81" r="1.6" fill="#ffffff" />
    <ellipse cx="46" cy="89" rx="5" ry="2.5" fill="#ff8787" opacity="0.65" />
    <polygon points="26,83 22,86 26,87" fill="#ff8787" />
    <path d="M 26,89 Q 22,92 25,95" stroke="#212529" stroke-width="1.2" fill="none" stroke-linecap="round" />
  </g>

  <g class="back-foot-right" style="transform-origin: 125px 115px; transform: rotate(0deg)">
    <rect x="119" y="115" width="12" height="32" rx="6" fill="url(#cat-skin)" />
    <g style="transform-origin: 125px 147px; transform: rotate(5deg)">
      <rect x="119" y="147" width="12" height="32" rx="6" fill="url(#cat-skin)" />
      <ellipse cx="125" cy="179" rx="8" ry="5" fill="#ffffff" />
      <circle cx="125" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>
  <g class="right-paw" style="transform-origin: 80px 115px; transform: rotate(0deg)">
    <rect x="74" y="115" width="12" height="32" rx="6" fill="url(#cat-skin)" />
    <g style="transform-origin: 80px 147px; transform: rotate(5deg)">
      <rect x="74" y="147" width="12" height="32" rx="6" fill="url(#cat-skin)" />
      <ellipse cx="80" cy="179" rx="8" ry="5" fill="#ffffff" />
      <circle cx="80" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>
</svg>
`;

// Frame 3 — Pass
const catWalk3SVG = `
<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cat-skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd8a8" />
      <stop offset="100%" stop-color="#ff922b" />
    </linearGradient>
    <linearGradient id="cat-ear" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffdeeb" />
      <stop offset="100%" stop-color="#faa2c1" />
    </linearGradient>
  </defs>

  <path id="cat-tail" d="M 142,116 C 162,108 170,86 174,70" fill="none" stroke="url(#cat-skin)" stroke-width="14" stroke-linecap="round" />

  <g class="back-foot-left" style="transform-origin: 115px 115px; transform: rotate(-10deg)">
    <rect x="109" y="115" width="12" height="32" rx="6" fill="#d9480f" />
    <g style="transform-origin: 115px 147px; transform: rotate(5deg)">
      <rect x="109" y="147" width="12" height="32" rx="6" fill="#d9480f" />
      <ellipse cx="115" cy="179" rx="8" ry="5" fill="#f1f3f5" />
      <circle cx="115" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>

  <g class="left-paw" style="transform-origin: 70px 115px; transform: rotate(-5deg)">
    <rect x="64" y="115" width="12" height="32" rx="6" fill="#d9480f" />
    <g style="transform-origin: 70px 147px; transform: rotate(-30deg)">
      <rect x="64" y="147" width="12" height="32" rx="6" fill="#d9480f" />
      <ellipse cx="70" cy="179" rx="8" ry="5" fill="#f1f3f5" />
      <circle cx="70" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>

  <ellipse cx="100" cy="115" rx="45" ry="32" fill="url(#cat-skin)" />
  <path d="M 94,92 L 91,105" stroke="#d9480f" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 106,92 L 102,107" stroke="#d9480f" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 118,94 L 114,109" stroke="#d9480f" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 60,95 Q 50,115 65,130 Z" fill="#ffffff" />

  <g style="transform-origin: 55px 80px;">
    <path d="M 40,55 L 30,25 Q 50,38 52,50 Z" fill="url(#cat-skin)" />
    <path d="M 42,52 L 34,31 Q 48,41 49,49 Z" fill="url(#cat-ear)" />
    <path d="M 52,55 L 48,22 Q 62,35 60,48 Z" fill="url(#cat-skin)" />
    <circle cx="55" cy="80" r="30" fill="url(#cat-skin)" />
    <path d="M 58,54 Q 53,60 48,64" stroke="#d9480f" stroke-width="3" fill="none" stroke-linecap="round" />
    <path d="M 64,54 Q 61,62 55,67" stroke="#d9480f" stroke-width="3.5" fill="none" stroke-linecap="round" />
    <path d="M 70,82 Q 64,84 60,83" stroke="#d9480f" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <line x1="28" y1="84" x2="10" y2="82" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <line x1="28" y1="89" x2="6" y2="89" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <line x1="28" y1="94" x2="10" y2="96" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <ellipse cx="42" cy="78" rx="4" ry="5.5" fill="#1e1e24" />
    <circle class="pet-pupil" data-anchor-x="42" data-anchor-y="78" cx="42" cy="78" r="1.6" fill="#ffffff" />
    <ellipse cx="46" cy="86" rx="5" ry="2.5" fill="#ff8787" opacity="0.65" />
    <polygon points="26,80 22,83 26,84" fill="#ff8787" />
    <path d="M 26,86 Q 22,89 25,92" stroke="#212529" stroke-width="1.2" fill="none" stroke-linecap="round" />
  </g>

  <g class="back-foot-right" style="transform-origin: 125px 115px; transform: rotate(-15deg)">
    <rect x="119" y="115" width="12" height="32" rx="6" fill="url(#cat-skin)" />
    <g style="transform-origin: 125px 147px; transform: rotate(-60deg)">
      <rect x="119" y="147" width="12" height="32" rx="6" fill="url(#cat-skin)" />
      <ellipse cx="125" cy="179" rx="8" ry="5" fill="#ffffff" />
      <circle cx="125" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>

  <g class="right-paw" style="transform-origin: 80px 115px; transform: rotate(10deg)">
    <rect x="74" y="115" width="12" height="32" rx="6" fill="url(#cat-skin)" />
    <g style="transform-origin: 80px 147px; transform: rotate(0deg)">
      <rect x="74" y="147" width="12" height="32" rx="6" fill="url(#cat-skin)" />
      <ellipse cx="80" cy="179" rx="8" ry="5" fill="#ffffff" />
      <circle cx="80" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>
</svg>
`;

// Frame 4 — Up
const catWalk4SVG = `
<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cat-skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd8a8" />
      <stop offset="100%" stop-color="#ff922b" />
    </linearGradient>
    <linearGradient id="cat-ear" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffdeeb" />
      <stop offset="100%" stop-color="#faa2c1" />
    </linearGradient>
  </defs>

  <path id="cat-tail" d="M 140,108 C 162,98 172,70 178,50" fill="none" stroke="url(#cat-skin)" stroke-width="14" stroke-linecap="round" />

  <g class="back-foot-left" style="transform-origin: 115px 115px; transform: rotate(-3deg)">
    <rect x="109" y="115" width="12" height="32" rx="6" fill="#d9480f" />
    <g style="transform-origin: 115px 147px; transform: rotate(-15deg)">
      <rect x="109" y="147" width="12" height="32" rx="6" fill="#d9480f" />
      <ellipse cx="115" cy="179" rx="8" ry="5" fill="#f1f3f5" />
      <circle cx="115" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>
  <g class="left-paw" style="transform-origin: 70px 115px; transform: rotate(-3deg)">
    <rect x="64" y="115" width="12" height="32" rx="6" fill="#d9480f" />
    <g style="transform-origin: 70px 147px; transform: rotate(-15deg)">
      <rect x="64" y="147" width="12" height="32" rx="6" fill="#d9480f" />
      <ellipse cx="70" cy="179" rx="8" ry="5" fill="#f1f3f5" />
      <circle cx="70" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>

  <ellipse cx="100" cy="112" rx="44" ry="34" fill="url(#cat-skin)" />
  <path d="M 94,89 L 91,102" stroke="#d9480f" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 106,89 L 102,105" stroke="#d9480f" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 118,91 L 114,106" stroke="#d9480f" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 60,92 Q 50,112 65,127 Z" fill="#ffffff" />

  <g style="transform-origin: 55px 77px;">
    <path d="M 40,52 L 30,22 Q 50,35 52,47 Z" fill="url(#cat-skin)" />
    <path d="M 42,49 L 34,28 Q 48,38 49,46 Z" fill="url(#cat-ear)" />
    <path d="M 52,52 L 48,19 Q 62,32 60,45 Z" fill="url(#cat-skin)" />
    <circle cx="55" cy="77" r="30" fill="url(#cat-skin)" />
    <path d="M 58,51 Q 53,57 48,61" stroke="#d9480f" stroke-width="3" fill="none" stroke-linecap="round" />
    <path d="M 64,51 Q 61,59 55,64" stroke="#d9480f" stroke-width="3.5" fill="none" stroke-linecap="round" />
    <path d="M 70,79 Q 64,81 60,80" stroke="#d9480f" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <line x1="28" y1="81" x2="10" y2="79" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <line x1="28" y1="86" x2="6" y2="86" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <line x1="28" y1="91" x2="10" y2="93" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <ellipse cx="42" cy="75" rx="4" ry="5.5" fill="#1e1e24" />
    <circle class="pet-pupil" data-anchor-x="42" data-anchor-y="75" cx="42" cy="75" r="1.6" fill="#ffffff" />
    <ellipse cx="46" cy="83" rx="5" ry="2.5" fill="#ff8787" opacity="0.65" />
    <polygon points="26,77 22,80 26,81" fill="#ff8787" />
    <path d="M 26,83 Q 22,86 25,89" stroke="#212529" stroke-width="1.2" fill="none" stroke-linecap="round" />
  </g>

  <g class="back-foot-right" style="transform-origin: 125px 115px; transform: rotate(-3deg)">
    <rect x="119" y="115" width="12" height="32" rx="6" fill="url(#cat-skin)" />
    <g style="transform-origin: 125px 147px; transform: rotate(-15deg)">
      <rect x="119" y="147" width="12" height="32" rx="6" fill="url(#cat-skin)" />
      <ellipse cx="125" cy="179" rx="8" ry="5" fill="#ffffff" />
      <circle cx="125" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>
  <g class="right-paw" style="transform-origin: 80px 115px; transform: rotate(-3deg)">
    <rect x="74" y="115" width="12" height="32" rx="6" fill="url(#cat-skin)" />
    <g style="transform-origin: 80px 147px; transform: rotate(-15deg)">
      <rect x="74" y="147" width="12" height="32" rx="6" fill="url(#cat-skin)" />
      <ellipse cx="80" cy="179" rx="8" ry="5" fill="#ffffff" />
      <circle cx="80" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>
</svg>
`;

// Array de frames en orden de cycle
'''  # nota: el array y los exports se mantienen después

def main():
    text = CAT_JS.read_text(encoding='utf-8')
    start = text.index(START_ANCHOR)
    end = text.index(END_ANCHOR)
    new_text = text[:start] + NEW_FRAMES + text[end:]
    CAT_JS.write_text(new_text, encoding='utf-8')
    print(f"OK: replaced {end - start} chars with {len(NEW_FRAMES)} chars")
    print(f"File now has {len(new_text)} chars (was {len(text)})")

if __name__ == "__main__":
    main()
