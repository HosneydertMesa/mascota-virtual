#!/usr/bin/env python3
"""Add dog walk cycle + sit/lay/stretch to dog.js."""
from pathlib import Path

DOG_JS = Path(r"C:/Users/HOSNE/OneDrive/Desktop/mascotaVirtual/src/assets/dog.js")

# Anchor: just before the final catSVG = catIdleSVG alias + exports block
START_ANCHOR = "const dogSVG = dogIdleSVG; // Compatibility alias"

# New content: 4 walk frames (skeletal) + sit/lay/stretch (static) + arrays + updated exports
NEW_CONTENT = '''// ============================================================
// Walk cycle multi-frame (M1) — SKELETAL ANIMATION 2D (dog)
// Cada pata = upper-leg + lower-leg + paw con pivots:
//   - Hip pivot: (legX, 115) — swing de la pata entera
//   - Knee pivot: (legX, 147) — bend del lower-leg
// Convención: rotación POSITIVA = clockwise (en screen coords, Y down).
// Frame 1 (Contact): front-left + back-right planted diagonal
// Frame 2 (Down): 4 patas plantadas, body squash
// Frame 3 (Pass): front-right + back-left planted
// Frame 4 (Up): 4 patas cerca, body stretch
// ============================================================

// Frame 1 — Contact
const dogWalk1SVG = `
<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dog-skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd43b" />
      <stop offset="100%" stop-color="#e67e22" />
    </linearGradient>
    <linearGradient id="dog-patch" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d35400" />
      <stop offset="100%" stop-color="#a04000" />
    </linearGradient>
  </defs>

  <path id="dog-tail" d="M 138,108 C 158,96 167,72 172,52" fill="none" stroke="url(#dog-skin)" stroke-width="16" stroke-linecap="round" />

  <g class="back-foot-left" style="transform-origin: 115px 115px; transform: rotate(-15deg)">
    <rect x="109" y="115" width="12" height="32" rx="6" fill="#a04000" />
    <g style="transform-origin: 115px 147px; transform: rotate(-60deg)">
      <rect x="109" y="147" width="12" height="32" rx="6" fill="#a04000" />
      <ellipse cx="115" cy="179" rx="8" ry="5" fill="#f1f3f5" />
      <circle cx="115" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>

  <g class="left-paw" style="transform-origin: 70px 115px; transform: rotate(10deg)">
    <rect x="64" y="115" width="12" height="32" rx="6" fill="#a04000" />
    <g style="transform-origin: 70px 147px; transform: rotate(0deg)">
      <rect x="64" y="147" width="12" height="32" rx="6" fill="#a04000" />
      <ellipse cx="70" cy="179" rx="8" ry="5" fill="#f1f3f5" />
      <circle cx="70" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>

  <ellipse cx="100" cy="115" rx="46" ry="34" fill="url(#dog-skin)" />
  <circle cx="98" cy="110" r="8" fill="url(#dog-patch)" opacity="0.85" />
  <circle cx="120" cy="120" r="6" fill="url(#dog-patch)" opacity="0.85" />
  <path d="M 58,96 Q 48,115 63,128 Z" fill="#ffffff" />

  <g style="transform-origin: 55px 80px;">
    <circle cx="55" cy="80" r="30" fill="url(#dog-skin)" />
    <path d="M 40,85 L 20,85 L 20,74 Q 30,68 40,72 Z" fill="url(#dog-skin)" />
    <ellipse cx="20" cy="76" rx="3.5" ry="3" fill="#1e1e24" />
    <ellipse cx="44" cy="74" rx="10" ry="8" fill="url(#dog-patch)" opacity="0.85" />
    <path d="M 68,68 Q 80,72 76,105 Q 65,115 58,95 Z" fill="url(#dog-patch)" />
    <ellipse cx="42" cy="76" rx="4" ry="5.5" fill="#1e1e24" />
    <circle class="pet-pupil" data-anchor-x="42" data-anchor-y="76" cx="42" cy="76" r="1.5" fill="#ffffff" />
    <ellipse cx="46" cy="84" rx="5" ry="2.5" fill="#ff8787" opacity="0.55" />
  </g>

  <g class="back-foot-right" style="transform-origin: 125px 115px; transform: rotate(-10deg)">
    <rect x="119" y="115" width="12" height="32" rx="6" fill="url(#dog-skin)" />
    <g style="transform-origin: 125px 147px; transform: rotate(5deg)">
      <rect x="119" y="147" width="12" height="32" rx="6" fill="url(#dog-skin)" />
      <ellipse cx="125" cy="179" rx="8" ry="5" fill="#ffffff" />
      <circle cx="125" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>

  <g class="right-paw" style="transform-origin: 80px 115px; transform: rotate(-5deg)">
    <rect x="74" y="115" width="12" height="32" rx="6" fill="url(#dog-skin)" />
    <g style="transform-origin: 80px 147px; transform: rotate(-30deg)">
      <rect x="74" y="147" width="12" height="32" rx="6" fill="url(#dog-skin)" />
      <ellipse cx="80" cy="179" rx="8" ry="5" fill="#ffffff" />
      <circle cx="80" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>
</svg>
`;

// Frame 2 — Down
const dogWalk2SVG = `
<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dog-skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd43b" />
      <stop offset="100%" stop-color="#e67e22" />
    </linearGradient>
    <linearGradient id="dog-patch" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d35400" />
      <stop offset="100%" stop-color="#a04000" />
    </linearGradient>
  </defs>

  <path id="dog-tail" d="M 138,112 C 155,100 162,80 165,62" fill="none" stroke="url(#dog-skin)" stroke-width="16" stroke-linecap="round" />

  <g class="back-foot-left" style="transform-origin: 115px 115px; transform: rotate(0deg)">
    <rect x="109" y="115" width="12" height="32" rx="6" fill="#a04000" />
    <g style="transform-origin: 115px 147px; transform: rotate(5deg)">
      <rect x="109" y="147" width="12" height="32" rx="6" fill="#a04000" />
      <ellipse cx="115" cy="179" rx="8" ry="5" fill="#f1f3f5" />
      <circle cx="115" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>
  <g class="left-paw" style="transform-origin: 70px 115px; transform: rotate(0deg)">
    <rect x="64" y="115" width="12" height="32" rx="6" fill="#a04000" />
    <g style="transform-origin: 70px 147px; transform: rotate(5deg)">
      <rect x="64" y="147" width="12" height="32" rx="6" fill="#a04000" />
      <ellipse cx="70" cy="179" rx="8" ry="5" fill="#f1f3f5" />
      <circle cx="70" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>

  <ellipse cx="100" cy="118" rx="47" ry="32" fill="url(#dog-skin)" />
  <circle cx="98" cy="112" r="7" fill="url(#dog-patch)" opacity="0.85" />
  <circle cx="120" cy="122" r="5" fill="url(#dog-patch)" opacity="0.85" />
  <path d="M 58,99 Q 48,118 63,131 Z" fill="#ffffff" />

  <g style="transform-origin: 55px 83px;">
    <circle cx="55" cy="83" r="30" fill="url(#dog-skin)" />
    <path d="M 40,88 L 20,88 L 20,77 Q 30,71 40,75 Z" fill="url(#dog-skin)" />
    <ellipse cx="20" cy="79" rx="3.5" ry="3" fill="#1e1e24" />
    <ellipse cx="44" cy="77" rx="10" ry="8" fill="url(#dog-patch)" opacity="0.85" />
    <path d="M 68,71 Q 80,75 76,108 Q 65,118 58,98 Z" fill="url(#dog-patch)" />
    <ellipse cx="42" cy="79" rx="4" ry="5.5" fill="#1e1e24" />
    <circle class="pet-pupil" data-anchor-x="42" data-anchor-y="79" cx="42" cy="79" r="1.5" fill="#ffffff" />
    <ellipse cx="46" cy="87" rx="5" ry="2.5" fill="#ff8787" opacity="0.55" />
  </g>

  <g class="back-foot-right" style="transform-origin: 125px 115px; transform: rotate(0deg)">
    <rect x="119" y="115" width="12" height="32" rx="6" fill="url(#dog-skin)" />
    <g style="transform-origin: 125px 147px; transform: rotate(5deg)">
      <rect x="119" y="147" width="12" height="32" rx="6" fill="url(#dog-skin)" />
      <ellipse cx="125" cy="179" rx="8" ry="5" fill="#ffffff" />
      <circle cx="125" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>
  <g class="right-paw" style="transform-origin: 80px 115px; transform: rotate(0deg)">
    <rect x="74" y="115" width="12" height="32" rx="6" fill="url(#dog-skin)" />
    <g style="transform-origin: 80px 147px; transform: rotate(5deg)">
      <rect x="74" y="147" width="12" height="32" rx="6" fill="url(#dog-skin)" />
      <ellipse cx="80" cy="179" rx="8" ry="5" fill="#ffffff" />
      <circle cx="80" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>
</svg>
`;

// Frame 3 — Pass
const dogWalk3SVG = `
<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dog-skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd43b" />
      <stop offset="100%" stop-color="#e67e22" />
    </linearGradient>
    <linearGradient id="dog-patch" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d35400" />
      <stop offset="100%" stop-color="#a04000" />
    </linearGradient>
  </defs>

  <path id="dog-tail" d="M 140,116 C 158,106 165,84 168,68" fill="none" stroke="url(#dog-skin)" stroke-width="16" stroke-linecap="round" />

  <g class="back-foot-left" style="transform-origin: 115px 115px; transform: rotate(-10deg)">
    <rect x="109" y="115" width="12" height="32" rx="6" fill="#a04000" />
    <g style="transform-origin: 115px 147px; transform: rotate(5deg)">
      <rect x="109" y="147" width="12" height="32" rx="6" fill="#a04000" />
      <ellipse cx="115" cy="179" rx="8" ry="5" fill="#f1f3f5" />
      <circle cx="115" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>

  <g class="left-paw" style="transform-origin: 70px 115px; transform: rotate(-5deg)">
    <rect x="64" y="115" width="12" height="32" rx="6" fill="#a04000" />
    <g style="transform-origin: 70px 147px; transform: rotate(-30deg)">
      <rect x="64" y="147" width="12" height="32" rx="6" fill="#a04000" />
      <ellipse cx="70" cy="179" rx="8" ry="5" fill="#f1f3f5" />
      <circle cx="70" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>

  <ellipse cx="100" cy="115" rx="46" ry="34" fill="url(#dog-skin)" />
  <circle cx="98" cy="110" r="8" fill="url(#dog-patch)" opacity="0.85" />
  <circle cx="120" cy="120" r="6" fill="url(#dog-patch)" opacity="0.85" />
  <path d="M 58,96 Q 48,115 63,128 Z" fill="#ffffff" />

  <g style="transform-origin: 55px 80px;">
    <circle cx="55" cy="80" r="30" fill="url(#dog-skin)" />
    <path d="M 40,85 L 20,85 L 20,74 Q 30,68 40,72 Z" fill="url(#dog-skin)" />
    <ellipse cx="20" cy="76" rx="3.5" ry="3" fill="#1e1e24" />
    <ellipse cx="44" cy="74" rx="10" ry="8" fill="url(#dog-patch)" opacity="0.85" />
    <path d="M 68,68 Q 80,72 76,105 Q 65,115 58,95 Z" fill="url(#dog-patch)" />
    <ellipse cx="42" cy="76" rx="4" ry="5.5" fill="#1e1e24" />
    <circle class="pet-pupil" data-anchor-x="42" data-anchor-y="76" cx="42" cy="76" r="1.5" fill="#ffffff" />
    <ellipse cx="46" cy="84" rx="5" ry="2.5" fill="#ff8787" opacity="0.55" />
  </g>

  <g class="back-foot-right" style="transform-origin: 125px 115px; transform: rotate(-15deg)">
    <rect x="119" y="115" width="12" height="32" rx="6" fill="url(#dog-skin)" />
    <g style="transform-origin: 125px 147px; transform: rotate(-60deg)">
      <rect x="119" y="147" width="12" height="32" rx="6" fill="url(#dog-skin)" />
      <ellipse cx="125" cy="179" rx="8" ry="5" fill="#ffffff" />
      <circle cx="125" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>

  <g class="right-paw" style="transform-origin: 80px 115px; transform: rotate(10deg)">
    <rect x="74" y="115" width="12" height="32" rx="6" fill="url(#dog-skin)" />
    <g style="transform-origin: 80px 147px; transform: rotate(0deg)">
      <rect x="74" y="147" width="12" height="32" rx="6" fill="url(#dog-skin)" />
      <ellipse cx="80" cy="179" rx="8" ry="5" fill="#ffffff" />
      <circle cx="80" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>
</svg>
`;

// Frame 4 — Up
const dogWalk4SVG = `
<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dog-skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd43b" />
      <stop offset="100%" stop-color="#e67e22" />
    </linearGradient>
    <linearGradient id="dog-patch" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d35400" />
      <stop offset="100%" stop-color="#a04000" />
    </linearGradient>
  </defs>

  <path id="dog-tail" d="M 138,108 C 158,98 167,74 172,54" fill="none" stroke="url(#dog-skin)" stroke-width="16" stroke-linecap="round" />

  <g class="back-foot-left" style="transform-origin: 115px 115px; transform: rotate(-3deg)">
    <rect x="109" y="115" width="12" height="32" rx="6" fill="#a04000" />
    <g style="transform-origin: 115px 147px; transform: rotate(-15deg)">
      <rect x="109" y="147" width="12" height="32" rx="6" fill="#a04000" />
      <ellipse cx="115" cy="179" rx="8" ry="5" fill="#f1f3f5" />
      <circle cx="115" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>
  <g class="left-paw" style="transform-origin: 70px 115px; transform: rotate(-3deg)">
    <rect x="64" y="115" width="12" height="32" rx="6" fill="#a04000" />
    <g style="transform-origin: 70px 147px; transform: rotate(-15deg)">
      <rect x="64" y="147" width="12" height="32" rx="6" fill="#a04000" />
      <ellipse cx="70" cy="179" rx="8" ry="5" fill="#f1f3f5" />
      <circle cx="70" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>

  <ellipse cx="100" cy="112" rx="45" ry="36" fill="url(#dog-skin)" />
  <circle cx="98" cy="108" r="8" fill="url(#dog-patch)" opacity="0.85" />
  <circle cx="120" cy="118" r="6" fill="url(#dog-patch)" opacity="0.85" />
  <path d="M 58,93 Q 48,112 63,125 Z" fill="#ffffff" />

  <g style="transform-origin: 55px 77px;">
    <circle cx="55" cy="77" r="30" fill="url(#dog-skin)" />
    <path d="M 40,82 L 20,82 L 20,71 Q 30,65 40,69 Z" fill="url(#dog-skin)" />
    <ellipse cx="20" cy="73" rx="3.5" ry="3" fill="#1e1e24" />
    <ellipse cx="44" cy="71" rx="10" ry="8" fill="url(#dog-patch)" opacity="0.85" />
    <path d="M 68,65 Q 80,69 76,102 Q 65,112 58,92 Z" fill="url(#dog-patch)" />
    <ellipse cx="42" cy="73" rx="4" ry="5.5" fill="#1e1e24" />
    <circle class="pet-pupil" data-anchor-x="42" data-anchor-y="73" cx="42" cy="73" r="1.5" fill="#ffffff" />
    <ellipse cx="46" cy="81" rx="5" ry="2.5" fill="#ff8787" opacity="0.55" />
  </g>

  <g class="back-foot-right" style="transform-origin: 125px 115px; transform: rotate(-3deg)">
    <rect x="119" y="115" width="12" height="32" rx="6" fill="url(#dog-skin)" />
    <g style="transform-origin: 125px 147px; transform: rotate(-15deg)">
      <rect x="119" y="147" width="12" height="32" rx="6" fill="url(#dog-skin)" />
      <ellipse cx="125" cy="179" rx="8" ry="5" fill="#ffffff" />
      <circle cx="125" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>
  <g class="right-paw" style="transform-origin: 80px 115px; transform: rotate(-3deg)">
    <rect x="74" y="115" width="12" height="32" rx="6" fill="url(#dog-skin)" />
    <g style="transform-origin: 80px 147px; transform: rotate(-15deg)">
      <rect x="74" y="147" width="12" height="32" rx="6" fill="url(#dog-skin)" />
      <ellipse cx="80" cy="179" rx="8" ry="5" fill="#ffffff" />
      <circle cx="80" cy="180" r="3.2" fill="#ffa8a8" />
    </g>
  </g>
</svg>
`;

// Array walk frames
const dogWalkFrames = [dogWalk1SVG, dogWalk2SVG, dogWalk3SVG, dogWalk4SVG];

// ============================================================
// M1-C — Sit, Lay, Stretch (dog, profile mirando izquierda)
// ============================================================

// === SIT ===
const dogSitSVG = `
<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dog-skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd43b" />
      <stop offset="100%" stop-color="#e67e22" />
    </linearGradient>
    <linearGradient id="dog-patch" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d35400" />
      <stop offset="100%" stop-color="#a04000" />
    </linearGradient>
  </defs>

  <path id="dog-tail" d="M 130,140 C 152,130 165,110 170,88" fill="none" stroke="url(#dog-skin)" stroke-width="16" stroke-linecap="round" />

  <g class="back-foot-left">
    <rect x="105" y="115" width="12" height="35" rx="6" fill="#a04000" transform="rotate(15 111 132)" />
    <ellipse cx="95" cy="160" rx="8" ry="5" fill="#f1f3f5" />
  </g>
  <g class="left-paw">
    <rect x="68" y="155" width="12" height="25" rx="6" fill="#a04000" />
    <ellipse cx="74" cy="180" rx="8" ry="5" fill="#f1f3f5" />
  </g>

  <ellipse cx="100" cy="125" rx="44" ry="42" fill="url(#dog-skin)" />
  <circle cx="78" cy="120" r="9" fill="url(#dog-patch)" opacity="0.85" />
  <circle cx="125" cy="135" r="7" fill="url(#dog-patch)" opacity="0.85" />
  <ellipse cx="100" cy="100" rx="22" ry="3" fill="#000000" opacity="0.1" />
  <rect x="80" y="98" width="40" height="5" rx="2.5" fill="#e74c3c" />
  <path d="M 94,107 Q 94,104 96,104 Q 98,104 98,107 L 102,107 Q 102,104 104,104 Q 106,104 106,107 L 106,111 Q 106,114 104,114 Q 102,114 102,111 L 98,111 Q 98,114 96,114 Q 94,114 94,111 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8" />

  <g style="transform-origin: 60px 70px;">
    <circle cx="60" cy="70" r="32" fill="url(#dog-skin)" />
    <path d="M 45,75 L 20,75 L 20,64 Q 30,58 45,62 Z" fill="url(#dog-skin)" />
    <ellipse cx="20" cy="66" rx="3.5" ry="3" fill="#1e1e24" />
    <ellipse cx="48" cy="65" rx="11" ry="9" fill="url(#dog-patch)" opacity="0.85" />
    <path d="M 75,58 Q 87,62 83,98 Q 72,108 65,88 Z" fill="url(#dog-patch)" />
    <ellipse cx="46" cy="67" rx="4" ry="5.5" fill="#1e1e24" />
    <circle class="pet-pupil" data-anchor-x="46" data-anchor-y="67" cx="46" cy="67" r="1.6" fill="#ffffff" />
    <ellipse cx="50" cy="75" rx="5" ry="2.5" fill="#ff8787" opacity="0.55" />
  </g>

  <g class="right-paw">
    <rect x="78" y="155" width="12" height="25" rx="6" fill="url(#dog-skin)" />
    <ellipse cx="84" cy="180" rx="8" ry="5" fill="#ffffff" />
  </g>
  <g class="back-foot-right">
    <rect x="115" y="115" width="12" height="35" rx="6" fill="url(#dog-skin)" transform="rotate(15 121 132)" />
    <ellipse cx="105" cy="160" rx="8" ry="5" fill="#ffffff" />
  </g>
</svg>
`;

// === SIT BLINK ===
const dogSitBlinkSVG = `
<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dog-skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd43b" />
      <stop offset="100%" stop-color="#e67e22" />
    </linearGradient>
    <linearGradient id="dog-patch" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d35400" />
      <stop offset="100%" stop-color="#a04000" />
    </linearGradient>
  </defs>

  <path id="dog-tail" d="M 130,140 C 152,130 165,110 170,88" fill="none" stroke="url(#dog-skin)" stroke-width="16" stroke-linecap="round" />

  <g class="back-foot-left">
    <rect x="105" y="115" width="12" height="35" rx="6" fill="#a04000" transform="rotate(15 111 132)" />
    <ellipse cx="95" cy="160" rx="8" ry="5" fill="#f1f3f5" />
  </g>
  <g class="left-paw">
    <rect x="68" y="155" width="12" height="25" rx="6" fill="#a04000" />
    <ellipse cx="74" cy="180" rx="8" ry="5" fill="#f1f3f5" />
  </g>

  <ellipse cx="100" cy="125" rx="44" ry="42" fill="url(#dog-skin)" />
  <circle cx="78" cy="120" r="9" fill="url(#dog-patch)" opacity="0.85" />
  <circle cx="125" cy="135" r="7" fill="url(#dog-patch)" opacity="0.85" />
  <ellipse cx="100" cy="100" rx="22" ry="3" fill="#000000" opacity="0.1" />
  <rect x="80" y="98" width="40" height="5" rx="2.5" fill="#e74c3c" />
  <path d="M 94,107 Q 94,104 96,104 Q 98,104 98,107 L 102,107 Q 102,104 104,104 Q 106,104 106,107 L 106,111 Q 106,114 104,114 Q 102,114 102,111 L 98,111 Q 98,114 96,114 Q 94,114 94,111 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8" />

  <g style="transform-origin: 60px 70px;">
    <circle cx="60" cy="70" r="32" fill="url(#dog-skin)" />
    <path d="M 45,75 L 20,75 L 20,64 Q 30,58 45,62 Z" fill="url(#dog-skin)" />
    <ellipse cx="20" cy="66" rx="3.5" ry="3" fill="#1e1e24" />
    <ellipse cx="48" cy="65" rx="11" ry="9" fill="url(#dog-patch)" opacity="0.85" />
    <path d="M 75,58 Q 87,62 83,98 Q 72,108 65,88 Z" fill="url(#dog-patch)" />
    <line x1="41" y1="67" x2="51" y2="67" stroke="#1e1e24" stroke-width="2" stroke-linecap="round" />
    <ellipse cx="50" cy="75" rx="5" ry="2.5" fill="#ff8787" opacity="0.55" />
  </g>

  <g class="right-paw">
    <rect x="78" y="155" width="12" height="25" rx="6" fill="url(#dog-skin)" />
    <ellipse cx="84" cy="180" rx="8" ry="5" fill="#ffffff" />
  </g>
  <g class="back-foot-right">
    <rect x="115" y="115" width="12" height="35" rx="6" fill="url(#dog-skin)" transform="rotate(15 121 132)" />
    <ellipse cx="105" cy="160" rx="8" ry="5" fill="#ffffff" />
  </g>
</svg>
`;

// === LAY ===
const dogLaySVG = `
<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dog-skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd43b" />
      <stop offset="100%" stop-color="#e67e22" />
    </linearGradient>
    <linearGradient id="dog-patch" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d35400" />
      <stop offset="100%" stop-color="#a04000" />
    </linearGradient>
  </defs>

  <path id="dog-tail" d="M 150,170 C 172,165 180,153 184,138" fill="none" stroke="url(#dog-skin)" stroke-width="16" stroke-linecap="round" />

  <g class="back-foot-left">
    <ellipse cx="125" cy="178" rx="20" ry="8" fill="#a04000" transform="rotate(-15 125 178)" />
    <ellipse cx="143" cy="173" rx="7" ry="4" fill="#f1f3f5" />
  </g>
  <g class="left-paw">
    <ellipse cx="60" cy="175" rx="18" ry="7" fill="#a04000" transform="rotate(10 60 175)" />
    <ellipse cx="44" cy="178" rx="7" ry="4" fill="#f1f3f5" />
  </g>

  <ellipse cx="100" cy="170" rx="68" ry="22" fill="url(#dog-skin)" />
  <circle cx="80" cy="170" r="9" fill="url(#dog-patch)" opacity="0.85" />
  <circle cx="125" cy="175" r="7" fill="url(#dog-patch)" opacity="0.85" />

  <g style="transform-origin: 35px 155px;">
    <circle cx="35" cy="155" r="30" fill="url(#dog-skin)" />
    <path d="M 20,160 L -5,160 L -5,149 Q 5,143 20,147 Z" fill="url(#dog-skin)" />
    <ellipse cx="-5" cy="151" rx="3.5" ry="3" fill="#1e1e24" />
    <ellipse cx="24" cy="150" rx="11" ry="9" fill="url(#dog-patch)" opacity="0.85" />
    <path d="M 50,143 Q 62,147 58,183 Q 47,193 40,173 Z" fill="url(#dog-patch)" />
    <ellipse cx="22" cy="152" rx="4" ry="5.5" fill="#1e1e24" />
    <circle class="pet-pupil" data-anchor-x="22" data-anchor-y="152" cx="22" cy="152" r="1.5" fill="#ffffff" />
    <ellipse cx="26" cy="160" rx="5" ry="2.5" fill="#ff8787" opacity="0.55" />
  </g>

  <g class="back-foot-right">
    <ellipse cx="135" cy="180" rx="20" ry="8" fill="url(#dog-skin)" transform="rotate(-15 135 180)" />
    <ellipse cx="153" cy="175" rx="7" ry="4" fill="#ffffff" />
  </g>
  <g class="right-paw">
    <ellipse cx="70" cy="178" rx="18" ry="7" fill="url(#dog-skin)" transform="rotate(10 70 178)" />
    <ellipse cx="54" cy="181" rx="7" ry="4" fill="#ffffff" />
  </g>
</svg>
`;

// === LAY BREATHE ===
const dogLayBreatheSVG = `
<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dog-skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd43b" />
      <stop offset="100%" stop-color="#e67e22" />
    </linearGradient>
    <linearGradient id="dog-patch" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d35400" />
      <stop offset="100%" stop-color="#a04000" />
    </linearGradient>
  </defs>

  <path id="dog-tail" d="M 150,170 C 172,165 180,153 184,138" fill="none" stroke="url(#dog-skin)" stroke-width="16" stroke-linecap="round" />

  <g class="back-foot-left">
    <ellipse cx="125" cy="178" rx="20" ry="8" fill="#a04000" transform="rotate(-15 125 178)" />
    <ellipse cx="143" cy="173" rx="7" ry="4" fill="#f1f3f5" />
  </g>
  <g class="left-paw">
    <ellipse cx="60" cy="175" rx="18" ry="7" fill="#a04000" transform="rotate(10 60 175)" />
    <ellipse cx="44" cy="178" rx="7" ry="4" fill="#f1f3f5" />
  </g>

  <ellipse cx="100" cy="170" rx="69" ry="24" fill="url(#dog-skin)" />
  <circle cx="80" cy="170" r="9" fill="url(#dog-patch)" opacity="0.85" />
  <circle cx="125" cy="175" r="7" fill="url(#dog-patch)" opacity="0.85" />

  <g style="transform-origin: 35px 155px;">
    <circle cx="35" cy="155" r="30" fill="url(#dog-skin)" />
    <path d="M 20,160 L -5,160 L -5,149 Q 5,143 20,147 Z" fill="url(#dog-skin)" />
    <ellipse cx="-5" cy="151" rx="3.5" ry="3" fill="#1e1e24" />
    <ellipse cx="24" cy="150" rx="11" ry="9" fill="url(#dog-patch)" opacity="0.85" />
    <path d="M 50,143 Q 62,147 58,183 Q 47,193 40,173 Z" fill="url(#dog-patch)" />
    <ellipse cx="22" cy="152" rx="4" ry="5.5" fill="#1e1e24" />
    <circle class="pet-pupil" data-anchor-x="22" data-anchor-y="152" cx="22" cy="152" r="1.5" fill="#ffffff" />
    <ellipse cx="26" cy="160" rx="5" ry="2.5" fill="#ff8787" opacity="0.55" />
  </g>

  <g class="back-foot-right">
    <ellipse cx="135" cy="180" rx="20" ry="8" fill="url(#dog-skin)" transform="rotate(-15 135 180)" />
    <ellipse cx="153" cy="175" rx="7" ry="4" fill="#ffffff" />
  </g>
  <g class="right-paw">
    <ellipse cx="70" cy="178" rx="18" ry="7" fill="url(#dog-skin)" transform="rotate(10 70 178)" />
    <ellipse cx="54" cy="181" rx="7" ry="4" fill="#ffffff" />
  </g>
</svg>
`;

// === STRETCH ===
const dogStretchSVG = `
<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dog-skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd43b" />
      <stop offset="100%" stop-color="#e67e22" />
    </linearGradient>
    <linearGradient id="dog-patch" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d35400" />
      <stop offset="100%" stop-color="#a04000" />
    </linearGradient>
  </defs>

  <path id="dog-tail" d="M 150,168 C 172,160 180,146 184,130" fill="none" stroke="url(#dog-skin)" stroke-width="16" stroke-linecap="round" />

  <g class="back-foot-left">
    <rect x="118" y="160" width="12" height="22" rx="6" fill="#a04000" transform="rotate(-30 124 171)" />
    <ellipse cx="142" cy="178" rx="7" ry="4" fill="#f1f3f5" />
  </g>
  <g class="left-paw">
    <rect x="58" y="160" width="12" height="22" rx="6" fill="#a04000" transform="rotate(30 64 171)" />
    <ellipse cx="40" cy="178" rx="7" ry="4" fill="#f1f3f5" />
  </g>

  <ellipse cx="100" cy="160" rx="72" ry="20" fill="url(#dog-skin)" />
  <circle cx="80" cy="160" r="9" fill="url(#dog-patch)" opacity="0.85" />
  <circle cx="125" cy="165" r="7" fill="url(#dog-patch)" opacity="0.85" />

  <g style="transform-origin: 32px 158px;">
    <circle cx="32" cy="158" r="30" fill="url(#dog-skin)" />
    <path d="M 17,163 L -8,163 L -8,152 Q 2,146 17,150 Z" fill="url(#dog-skin)" />
    <ellipse cx="-8" cy="154" rx="3.5" ry="3" fill="#1e1e24" />
    <ellipse cx="21" cy="153" rx="11" ry="9" fill="url(#dog-patch)" opacity="0.85" />
    <path d="M 47,146 Q 59,150 55,186 Q 44,196 37,176 Z" fill="url(#dog-patch)" />
    <ellipse cx="19" cy="155" rx="4" ry="5.5" fill="#1e1e24" />
    <circle class="pet-pupil" data-anchor-x="19" data-anchor-y="155" cx="19" cy="155" r="1.5" fill="#ffffff" />
    <ellipse cx="23" cy="163" rx="5" ry="2.5" fill="#ff8787" opacity="0.55" />
  </g>

  <g class="back-foot-right">
    <rect x="125" y="160" width="12" height="22" rx="6" fill="url(#dog-skin)" transform="rotate(-30 131 171)" />
    <ellipse cx="149" cy="180" rx="7" ry="4" fill="#ffffff" />
  </g>
  <g class="right-paw">
    <rect x="65" y="160" width="12" height="22" rx="6" fill="url(#dog-skin)" transform="rotate(30 71 171)" />
    <ellipse cx="47" cy="180" rx="7" ry="4" fill="#ffffff" />
  </g>
</svg>
`;

// Arrays
const dogSitFrames = [dogSitSVG, dogSitBlinkSVG];
const dogLayFrames = [dogLaySVG, dogLayBreatheSVG];

const dogSVG = dogIdleSVG; // Compatibility alias

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    dogIdleSVG,
    dogWalkSVG,
    dogWalk1SVG,
    dogWalk2SVG,
    dogWalk3SVG,
    dogWalk4SVG,
    dogWalkFrames,
    dogSleepSVG,
    dogSitSVG,
    dogSitBlinkSVG,
    dogSitFrames,
    dogLaySVG,
    dogLayBreatheSVG,
    dogLayFrames,
    dogStretchSVG,
    dogSVG
  };
} else {
  window.dogIdleSVG = dogIdleSVG;
  window.dogWalkSVG = dogWalkSVG;
  window.dogWalk1SVG = dogWalk1SVG;
  window.dogWalk2SVG = dogWalk2SVG;
  window.dogWalk3SVG = dogWalk3SVG;
  window.dogWalk4SVG = dogWalk4SVG;
  window.dogWalkFrames = dogWalkFrames;
  window.dogSleepSVG = dogSleepSVG;
  window.dogSitSVG = dogSitSVG;
  window.dogSitBlinkSVG = dogSitBlinkSVG;
  window.dogSitFrames = dogSitFrames;
  window.dogLaySVG = dogLaySVG;
  window.dogLayBreatheSVG = dogLayBreatheSVG;
  window.dogLayFrames = dogLayFrames;
  window.dogStretchSVG = dogStretchSVG;
  window.dogSVG = dogSVG;
}
'''

def main():
    text = DOG_JS.read_text(encoding='utf-8')
    if START_ANCHOR not in text:
        raise SystemExit(f"Anchor not found: {START_ANCHOR}")
    new_text = text.replace(START_ANCHOR, NEW_CONTENT)
    DOG_JS.write_text(new_text, encoding='utf-8')
    print(f"OK: dog.js now has {len(new_text)} chars (was {len(text)})")
    print(f"Added {len(NEW_CONTENT)} chars of new content")

if __name__ == "__main__":
    main()
