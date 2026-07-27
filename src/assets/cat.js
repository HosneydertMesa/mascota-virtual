const catIdleSVG = `
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
    <linearGradient id="cat-collar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#0891b2" />
    </linearGradient>
    <linearGradient id="gold-bell" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#facc15" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>
  </defs>

  <!-- Tail (Procedural Waving) -->
  <path id="cat-tail" d="M 130,130 C 148,120 160,92 165,70" fill="none" stroke="url(#cat-skin)" stroke-width="14" stroke-linecap="round" />

  <!-- Feet (Back) -->
  <ellipse cx="75" cy="178" rx="14" ry="10" fill="#f1f3f5" class="back-foot-left" />
  <ellipse cx="125" cy="178" rx="14" ry="10" fill="#f1f3f5" class="back-foot-right" />

  <!-- Body Group (Breathing) -->
  <g class="anim-breath" style="transform-origin: 100px 180px;">
    <ellipse cx="100" cy="138" rx="42" ry="48" fill="url(#cat-skin)" />
    
    <!-- Tabby Stripes on Body -->
    <path d="M 60,132 Q 72,133 78,136" stroke="#d9480f" stroke-width="4.5" fill="none" stroke-linecap="round" />
    <path d="M 61,146 Q 73,147 79,150" stroke="#d9480f" stroke-width="4.5" fill="none" stroke-linecap="round" />
    <path d="M 140,132 Q 128,133 122,136" stroke="#d9480f" stroke-width="4.5" fill="none" stroke-linecap="round" />
    <path d="M 139,146 Q 127,147 121,150" stroke="#d9480f" stroke-width="4.5" fill="none" stroke-linecap="round" />
    
    <!-- Chest Fluff (White belly patch) -->
    <path d="M 76,122 Q 100,146 124,122 Q 100,130 76,122 Z" fill="#ffffff" />
    
    <!-- Shadow under chin -->
    <ellipse cx="100" cy="104" rx="28" ry="4" fill="#000000" opacity="0.1" />

    <!-- Collar -->
    <rect x="74" y="102" width="52" height="6" rx="3" fill="url(#cat-collar)" />
    <!-- Gold Bell Tag -->
    <circle cx="100" cy="112" r="7" fill="url(#gold-bell)" stroke="#eab308" stroke-width="0.8" />
    <circle cx="98" cy="110" r="1.8" fill="#ffffff" opacity="0.8" />
    <line x1="96" y1="113" x2="104" y2="113" stroke="#854d0e" stroke-width="1" />
  </g>

  <!-- Head Group (Breathing & Head Bob) -->
  <g class="anim-breath" style="transform-origin: 100px 180px;">
    <!-- Left Ear (wrapped for ear-twitch animation) -->
    <g class="pet-ear pet-ear-left" style="transform-origin: 60px 65px;">
      <path d="M 60,68 L 45,25 Q 75,40 75,55 Z" fill="url(#cat-skin)" />
      <path d="M 62,64 L 50,34 Q 71,46 72,54 Z" fill="url(#cat-ear)" />
    </g>

    <!-- Right Ear -->
    <g class="pet-ear pet-ear-right" style="transform-origin: 140px 65px;">
      <path d="M 140,68 L 155,25 Q 125,40 125,55 Z" fill="url(#cat-skin)" />
      <path d="M 138,64 L 150,34 Q 129,46 128,54 Z" fill="url(#cat-ear)" />
    </g>

    <!-- Head Base -->
    <circle cx="100" cy="74" r="44" fill="url(#cat-skin)" />

    <!-- Forehead Tabby Stripes -->
    <path d="M 94,36 Q 98,46 96,52" stroke="#d9480f" stroke-width="3" fill="none" stroke-linecap="round" />
    <path d="M 100,34 Q 100,47 100,54" stroke="#d9480f" stroke-width="3.5" fill="none" stroke-linecap="round" />
    <path d="M 106,36 Q 102,46 104,52" stroke="#d9480f" stroke-width="3" fill="none" stroke-linecap="round" />

    <!-- Cheek Tabby Stripes -->
    <path d="M 60,78 Q 68,80 72,79" stroke="#d9480f" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <path d="M 61,84 Q 69,85 73,83" stroke="#d9480f" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <path d="M 140,78 Q 132,80 128,79" stroke="#d9480f" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <path d="M 139,84 Q 131,85 127,83" stroke="#d9480f" stroke-width="2.5" fill="none" stroke-linecap="round" />

    <!-- Whiskers -->
    <line x1="55" y1="80" x2="25" y2="76" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <line x1="53" y1="85" x2="20" y2="85" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <line x1="55" y1="90" x2="25" y2="94" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <line x1="145" y1="80" x2="175" y2="76" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <line x1="147" y1="85" x2="180" y2="85" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <line x1="145" y1="90" x2="175" y2="94" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />

    <!-- Glossy Highlight on Head -->
    <path d="M 72,46 Q 100,36 128,46" stroke="#ffffff" stroke-width="2.5" fill="none" opacity="0.35" stroke-linecap="round" />

    <!-- Eyes (Blinking Group) -->
    <g class="anim-blink">
      <!-- Outer eye -->
      <circle cx="82" cy="72" r="7" fill="#1e1e24" />
      <circle cx="118" cy="72" r="7" fill="#1e1e24" />
      <!-- Pet pupils (M2 eye tracking) - glint that follows the cursor -->
      <circle class="pet-pupil" data-anchor-x="82" data-anchor-y="72" cx="82" cy="72" r="2.5" fill="#ffffff" />
      <circle cx="83" cy="74" r="0.9" fill="#ffffff" />
      <circle class="pet-pupil" data-anchor-x="118" data-anchor-y="72" cx="118" cy="72" r="2.5" fill="#ffffff" />
      <circle cx="119" cy="74" r="0.9" fill="#ffffff" />
    </g>

    <!-- Cute Cheeks -->
    <ellipse cx="70" cy="80" rx="7" ry="3.5" fill="#ffa8a8" opacity="0.65" />
    <ellipse cx="130" cy="80" rx="7" ry="3.5" fill="#ffa8a8" opacity="0.65" />

    <!-- Nose & Mouth -->
    <polygon points="100,79 96,75 104,75" fill="#ff8787" />
    <path d="M 96,82 Q 100,85 100,82 Q 100,85 104,82" stroke="#212529" stroke-width="1.6" fill="none" stroke-linecap="round" />
  </g>

  <!-- Front Paws -->
  <ellipse cx="90" cy="180" rx="10" ry="7" fill="#ffffff" class="left-paw" />
  <ellipse cx="110" cy="180" rx="10" ry="7" fill="#ffffff" class="right-paw" />
</svg>
`;

const catWalkSVG = `
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

  <!-- Tail (Procedural Waving) -->
  <path id="cat-tail" d="M 140,110 C 160,100 170,75 175,55" fill="none" stroke="url(#cat-skin)" stroke-width="14" stroke-linecap="round" />

  <!-- Back Left Leg (Inside) -->
  <g class="back-foot-left">
    <rect x="115" y="115" width="12" height="60" rx="6" fill="#d9480f" />
    <ellipse cx="121" cy="175" rx="8" ry="5" fill="#f1f3f5" />
    <!-- Paw pads -->
    <circle cx="121" cy="176" r="3.2" fill="#ffa8a8" />
  </g>

  <!-- Front Left Leg (Inside) -->
  <g class="left-paw">
    <rect x="70" y="115" width="12" height="60" rx="6" fill="#d9480f" />
    <ellipse cx="76" cy="175" rx="8" ry="5" fill="#f1f3f5" />
    <circle cx="76" cy="176" r="3.2" fill="#ffa8a8" />
  </g>

  <!-- Body -->
  <ellipse cx="100" cy="115" rx="45" ry="32" fill="url(#cat-skin)" />
  
  <!-- Tabby Stripes on Side Body -->
  <path d="M 94,92 L 91,105" stroke="#d9480f" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 106,92 L 102,107" stroke="#d9480f" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 118,94 L 114,109" stroke="#d9480f" stroke-width="4.5" stroke-linecap="round" />

  <!-- Chest fluff side -->
  <path d="M 60,95 Q 50,115 65,130 Z" fill="#ffffff" />

  <!-- Head Group (Profile) -->
  <g style="transform-origin: 55px 80px;">
    <!-- Left Ear (Facing profile left) -->
    <path d="M 40,55 L 30,25 Q 50,38 52,50 Z" fill="url(#cat-skin)" />
    <path d="M 42,52 L 34,31 Q 48,41 49,49 Z" fill="url(#cat-ear)" />
    <!-- Right Ear (Slightly behind) -->
    <path d="M 52,55 L 48,22 Q 62,35 60,48 Z" fill="url(#cat-skin)" />

    <circle cx="55" cy="80" r="30" fill="url(#cat-skin)" />

    <!-- Forehead stripes in profile -->
    <path d="M 58,54 Q 53,60 48,64" stroke="#d9480f" stroke-width="3" fill="none" stroke-linecap="round" />
    <path d="M 64,54 Q 61,62 55,67" stroke="#d9480f" stroke-width="3.5" fill="none" stroke-linecap="round" />
    
    <!-- Cheek stripe profile -->
    <path d="M 70,82 Q 64,84 60,83" stroke="#d9480f" stroke-width="2.5" fill="none" stroke-linecap="round" />

    <!-- Eye (Looking side/profile) -->
    <ellipse cx="42" cy="78" rx="4" ry="5.5" fill="#1e1e24" />
    <circle class="pet-pupil" data-anchor-x="42" data-anchor-y="78" cx="42" cy="78" r="1.6" fill="#ffffff" />

    <!-- Whiskers -->
    <line x1="28" y1="84" x2="10" y2="82" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <line x1="28" y1="89" x2="6" y2="89" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <line x1="28" y1="94" x2="10" y2="96" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />

    <!-- Blush profile -->
    <ellipse cx="46" cy="86" rx="5" ry="2.5" fill="#ff8787" opacity="0.65" />

    <!-- Nose / Mouth profile -->
    <polygon points="26,80 22,83 26,84" fill="#ff8787" />
    <path d="M 26,86 Q 22,89 25,92" stroke="#212529" stroke-width="1.2" fill="none" stroke-linecap="round" />
  </g>

  <!-- Back Right Leg (Foreground) -->
  <g class="back-foot-right">
    <rect x="125" y="115" width="12" height="60" rx="6" fill="url(#cat-skin)" />
    <ellipse cx="131" cy="175" rx="8" ry="5" fill="#ffffff" />
    <!-- Paw pads -->
    <circle cx="131" cy="176" r="3.2" fill="#ffa8a8" />
  </g>

  <!-- Front Right Leg (Foreground) -->
  <g class="right-paw">
    <rect x="80" y="115" width="12" height="60" rx="6" fill="url(#cat-skin)" />
    <ellipse cx="86" cy="175" rx="8" ry="5" fill="#ffffff" />
    <circle cx="86" cy="176" r="3.2" fill="#ffa8a8" />
  </g>
</svg>
`;

const catSleepSVG = `
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

  <!-- Soft Sleeping Mat with Lace Border -->
  <ellipse cx="100" cy="160" rx="66" ry="16" fill="#ffffff" opacity="0.75" stroke="#d8b4fe" stroke-width="1.5" stroke-dasharray="4,4" />
  <ellipse cx="100" cy="160" rx="60" ry="13" fill="#e9d5ff" opacity="0.6" />

  <!-- Shadow under cat on mat -->
  <ellipse cx="98" cy="150" rx="46" ry="8" fill="#a855f7" opacity="0.25" />

  <g class="anim-breath" style="transform-origin: 100px 160px;">
    <!-- Curled Tail wrapped around body -->
    <path d="M 140,132 C 150,145 125,156 95,156 C 65,156 55,145 55,140" 
          stroke="url(#cat-skin)" 
          stroke-width="12" 
          fill="none" 
          stroke-linecap="round" />
    <!-- Tail ring stripes -->
    <path d="M 126,149 C 122,152 112,153 108,153" stroke="#d9480f" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <path d="M 142,139 C 138,144 130,148 126,149" stroke="#d9480f" stroke-width="2.5" fill="none" stroke-linecap="round" />

    <!-- Curled Body -->
    <ellipse cx="102" cy="126" rx="48" ry="38" fill="url(#cat-skin)" />
    
    <!-- Tabby stripes on sleeping body -->
    <path d="M 98,102 Q 106,94 114,102" stroke="#d9480f" stroke-width="4.5" fill="none" stroke-linecap="round" />
    <path d="M 112,106 Q 118,99 125,107" stroke="#d9480f" stroke-width="4.5" fill="none" stroke-linecap="round" />
    <path d="M 123,115 Q 128,110 134,118" stroke="#d9480f" stroke-width="4.5" fill="none" stroke-linecap="round" />

    <!-- Sleeping Head resting on paws -->
    <g style="transform-origin: 72px 122px;">
      <!-- Ears folded slightly back -->
      <path d="M 52,108 L 38,94 L 58,102 Z" fill="url(#cat-skin)" />
      <path d="M 78,104 L 72,90 L 84,102 Z" fill="url(#cat-skin)" />

      <circle cx="72" cy="122" r="26" fill="url(#cat-skin)" />

      <!-- Head stripes in sleep -->
      <path d="M 68,104 Q 72,98 70,102" stroke="#d9480f" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <path d="M 74,104 Q 76,98 75,102" stroke="#d9480f" stroke-width="2.5" fill="none" stroke-linecap="round" />

      <!-- Closed Eyes (sleeping ^^ curves) -->
      <path d="M 58,122 Q 62,126 66,122" stroke="#1e1e24" stroke-width="2" fill="none" stroke-linecap="round" />
      <path d="M 78,122 Q 82,126 86,122" stroke="#1e1e24" stroke-width="2" fill="none" stroke-linecap="round" />

      <!-- Nose/Mouth -->
      <polygon points="72,126 70,128 74,128" fill="#ff8787" />
      <path d="M 70,131 Q 72,133 72,131 Q 72,133 74,131" stroke="#212529" stroke-width="1.2" fill="none" />
      
      <!-- Blush -->
      <ellipse cx="60" cy="127" rx="4.5" ry="2.2" fill="#ff8787" opacity="0.45" />
      <ellipse cx="84" cy="127" rx="4.5" ry="2.2" fill="#ff8787" opacity="0.45" />
    </g>
  </g>
</svg>
`;

// ============================================================
// Walk cycle multi-frame (M1) — 4 frames en profile (mirando izquierda)
// Las patas varían en Y/X para crear la sensación de paso. La cola
// se mueve en posición según el frame (más alta = excited, neutral = calm).
// Squash/stretch aplicado en el body ellipse.
// ============================================================

// ============================================================
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
const catWalkFrames = [catWalk1SVG, catWalk2SVG, catWalk3SVG, catWalk4SVG];

// ============================================================
// M1-B — Sit, Lay, Stretch SVGs (profile mirando izquierda)
// Sit: sentada en patas traseras, cuerpo vertical, patas traseras dobladas en V
// Lay: acostada panza abajo, cuerpo horizontal, patas estiradas
// Stretch: cuerpo extendido, lomo arqueado, patas adelante/atrás
// ============================================================

// === SIT ===
const catSitSVG = `
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

  <!-- Tail enroscada al lado (curling) -->
  <path id="cat-tail" d="M 130,140 C 150,130 162,110 168,90" fill="none" stroke="url(#cat-skin)" stroke-width="14" stroke-linecap="round" />

  <!-- Back leg background (doblada en V) -->
  <g class="back-foot-left">
    <rect x="105" y="115" width="12" height="35" rx="6" fill="#d9480f" transform="rotate(15 111 132)" />
    <ellipse cx="95" cy="160" rx="8" ry="5" fill="#f1f3f5" />
    <circle cx="95" cy="161" r="3.2" fill="#ffa8a8" />
  </g>

  <!-- Front leg background (vertical, sentada) -->
  <g class="left-paw">
    <rect x="68" y="155" width="12" height="25" rx="6" fill="#d9480f" />
    <ellipse cx="74" cy="180" rx="8" ry="5" fill="#f1f3f5" />
    <circle cx="74" cy="181" r="3.2" fill="#ffa8a8" />
  </g>

  <!-- Body vertical (sentada, compacto) -->
  <ellipse cx="100" cy="125" rx="42" ry="40" fill="url(#cat-skin)" />
  <path d="M 70,115 Q 72,128 78,135" stroke="#d9480f" stroke-width="3.5" fill="none" stroke-linecap="round" />
  <path d="M 130,115 Q 128,128 122,135" stroke="#d9480f" stroke-width="3.5" fill="none" stroke-linecap="round" />
  <path d="M 78,140 Q 100,158 122,140 Q 100,148 78,140 Z" fill="#ffffff" />

  <!-- Shadow bajo el chin -->
  <ellipse cx="100" cy="98" rx="22" ry="3" fill="#000000" opacity="0.1" />

  <!-- Collar -->
  <rect x="80" y="96" width="40" height="5" rx="2.5" fill="#06b6d4" />
  <circle cx="100" cy="105" r="6" fill="#facc15" stroke="#eab308" stroke-width="0.7" />
  <circle cx="98" cy="103" r="1.5" fill="#ffffff" opacity="0.8" />

  <!-- Head profile (mirando izquierda) -->
  <g style="transform-origin: 60px 70px;">
    <path d="M 45,45 L 35,15 Q 55,28 57,40 Z" fill="url(#cat-skin)" />
    <path d="M 47,42 L 39,21 Q 53,31 54,39 Z" fill="url(#cat-ear)" />
    <path d="M 57,45 L 53,12 Q 67,25 65,38 Z" fill="url(#cat-skin)" />
    <circle cx="60" cy="70" r="30" fill="url(#cat-skin)" />
    <path d="M 63,44 Q 58,50 53,54" stroke="#d9480f" stroke-width="3" fill="none" stroke-linecap="round" />
    <path d="M 69,44 Q 66,52 60,57" stroke="#d9480f" stroke-width="3.5" fill="none" stroke-linecap="round" />
    <path d="M 75,72 Q 69,74 65,73" stroke="#d9480f" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <line x1="33" y1="74" x2="15" y2="72" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <line x1="33" y1="79" x2="11" y2="79" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <line x1="33" y1="84" x2="15" y2="86" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <ellipse cx="47" cy="68" rx="4" ry="5.5" fill="#1e1e24" />
    <circle class="pet-pupil" data-anchor-x="47" data-anchor-y="68" cx="47" cy="68" r="1.6" fill="#ffffff" />
    <ellipse cx="51" cy="76" rx="5" ry="2.5" fill="#ff8787" opacity="0.65" />
    <polygon points="31,70 27,73 31,74" fill="#ff8787" />
    <path d="M 31,76 Q 27,79 30,82" stroke="#212529" stroke-width="1.2" fill="none" stroke-linecap="round" />
  </g>

  <!-- Front leg foreground (vertical, sentada) -->
  <g class="right-paw">
    <rect x="78" y="155" width="12" height="25" rx="6" fill="url(#cat-skin)" />
    <ellipse cx="84" cy="180" rx="8" ry="5" fill="#ffffff" />
    <circle cx="84" cy="181" r="3.2" fill="#ffa8a8" />
  </g>

  <!-- Back leg foreground (doblada en V) -->
  <g class="back-foot-right">
    <rect x="115" y="115" width="12" height="35" rx="6" fill="url(#cat-skin)" transform="rotate(15 121 132)" />
    <ellipse cx="105" cy="160" rx="8" ry="5" fill="#ffffff" />
    <circle cx="105" cy="161" r="3.2" fill="#ffa8a8" />
  </g>
</svg>
`;

// === SIT BLINK (mismo que sit pero con ojo cerrado) ===
const catSitBlinkSVG = `
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

  <path id="cat-tail" d="M 130,140 C 150,130 162,110 168,90" fill="none" stroke="url(#cat-skin)" stroke-width="14" stroke-linecap="round" />

  <g class="back-foot-left">
    <rect x="105" y="115" width="12" height="35" rx="6" fill="#d9480f" transform="rotate(15 111 132)" />
    <ellipse cx="95" cy="160" rx="8" ry="5" fill="#f1f3f5" />
    <circle cx="95" cy="161" r="3.2" fill="#ffa8a8" />
  </g>
  <g class="left-paw">
    <rect x="68" y="155" width="12" height="25" rx="6" fill="#d9480f" />
    <ellipse cx="74" cy="180" rx="8" ry="5" fill="#f1f3f5" />
    <circle cx="74" cy="181" r="3.2" fill="#ffa8a8" />
  </g>

  <ellipse cx="100" cy="125" rx="42" ry="40" fill="url(#cat-skin)" />
  <path d="M 70,115 Q 72,128 78,135" stroke="#d9480f" stroke-width="3.5" fill="none" stroke-linecap="round" />
  <path d="M 130,115 Q 128,128 122,135" stroke="#d9480f" stroke-width="3.5" fill="none" stroke-linecap="round" />
  <path d="M 78,140 Q 100,158 122,140 Q 100,148 78,140 Z" fill="#ffffff" />
  <ellipse cx="100" cy="98" rx="22" ry="3" fill="#000000" opacity="0.1" />
  <rect x="80" y="96" width="40" height="5" rx="2.5" fill="#06b6d4" />
  <circle cx="100" cy="105" r="6" fill="#facc15" stroke="#eab308" stroke-width="0.7" />
  <circle cx="98" cy="103" r="1.5" fill="#ffffff" opacity="0.8" />

  <g style="transform-origin: 60px 70px;">
    <path d="M 45,45 L 35,15 Q 55,28 57,40 Z" fill="url(#cat-skin)" />
    <path d="M 47,42 L 39,21 Q 53,31 54,39 Z" fill="url(#cat-ear)" />
    <path d="M 57,45 L 53,12 Q 67,25 65,38 Z" fill="url(#cat-skin)" />
    <circle cx="60" cy="70" r="30" fill="url(#cat-skin)" />
    <path d="M 63,44 Q 58,50 53,54" stroke="#d9480f" stroke-width="3" fill="none" stroke-linecap="round" />
    <path d="M 69,44 Q 66,52 60,57" stroke="#d9480f" stroke-width="3.5" fill="none" stroke-linecap="round" />
    <path d="M 75,72 Q 69,74 65,73" stroke="#d9480f" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <line x1="33" y1="74" x2="15" y2="72" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <line x1="33" y1="79" x2="11" y2="79" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <line x1="33" y1="84" x2="15" y2="86" stroke="#f1f3f5" stroke-width="1.8" stroke-linecap="round" />
    <!-- Ojo cerrado (línea horizontal) -->
    <line x1="42" y1="68" x2="52" y2="68" stroke="#1e1e24" stroke-width="2" stroke-linecap="round" />
    <ellipse cx="51" cy="76" rx="5" ry="2.5" fill="#ff8787" opacity="0.65" />
    <polygon points="31,70 27,73 31,74" fill="#ff8787" />
    <path d="M 31,76 Q 27,79 30,82" stroke="#212529" stroke-width="1.2" fill="none" stroke-linecap="round" />
  </g>

  <g class="right-paw">
    <rect x="78" y="155" width="12" height="25" rx="6" fill="url(#cat-skin)" />
    <ellipse cx="84" cy="180" rx="8" ry="5" fill="#ffffff" />
    <circle cx="84" cy="181" r="3.2" fill="#ffa8a8" />
  </g>
  <g class="back-foot-right">
    <rect x="115" y="115" width="12" height="35" rx="6" fill="url(#cat-skin)" transform="rotate(15 121 132)" />
    <ellipse cx="105" cy="160" rx="8" ry="5" fill="#ffffff" />
    <circle cx="105" cy="161" r="3.2" fill="#ffa8a8" />
  </g>
</svg>
`;

// === LAY (acostada panza abajo, cuerpo horizontal) ===
const catLaySVG = `
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

  <!-- Tail estirada atrás -->
  <path id="cat-tail" d="M 150,170 C 170,165 178,155 182,140" fill="none" stroke="url(#cat-skin)" stroke-width="14" stroke-linecap="round" />

  <!-- Back leg background (estirada atrás) -->
  <g class="back-foot-left">
    <ellipse cx="125" cy="178" rx="20" ry="8" fill="#d9480f" transform="rotate(-15 125 178)" />
    <ellipse cx="143" cy="173" rx="7" ry="4" fill="#f1f3f5" />
  </g>

  <!-- Front leg background (estirada adelante) -->
  <g class="left-paw">
    <ellipse cx="60" cy="175" rx="18" ry="7" fill="#d9480f" transform="rotate(10 60 175)" />
    <ellipse cx="44" cy="178" rx="7" ry="4" fill="#f1f3f5" />
  </g>

  <!-- Body horizontal (acostada) -->
  <ellipse cx="100" cy="170" rx="65" ry="20" fill="url(#cat-skin)" />
  <path d="M 50,165 Q 52,170 56,172" stroke="#d9480f" stroke-width="3" fill="none" stroke-linecap="round" />
  <path d="M 150,165 Q 148,170 144,172" stroke="#d9480f" stroke-width="3" fill="none" stroke-linecap="round" />

  <!-- Head profile (apoyada al frente) -->
  <g style="transform-origin: 35px 155px;">
    <path d="M 20,135 L 10,105 Q 30,118 32,130 Z" fill="url(#cat-skin)" />
    <path d="M 22,132 L 14,111 Q 28,121 29,129 Z" fill="url(#cat-ear)" />
    <path d="M 32,135 L 28,102 Q 42,115 40,128 Z" fill="url(#cat-skin)" />
    <circle cx="35" cy="155" r="28" fill="url(#cat-skin)" />
    <path d="M 38,132 Q 33,138 28,142" stroke="#d9480f" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <path d="M 44,132 Q 41,140 35,145" stroke="#d9480f" stroke-width="3" fill="none" stroke-linecap="round" />
    <line x1="10" y1="159" x2="-8" y2="157" stroke="#f1f3f5" stroke-width="1.5" stroke-linecap="round" />
    <line x1="10" y1="164" x2="-12" y2="164" stroke="#f1f3f5" stroke-width="1.5" stroke-linecap="round" />
    <line x1="10" y1="169" x2="-8" y2="171" stroke="#f1f3f5" stroke-width="1.5" stroke-linecap="round" />
    <ellipse cx="23" cy="153" rx="4" ry="5" fill="#1e1e24" />
    <circle class="pet-pupil" data-anchor-x="23" data-anchor-y="153" cx="23" cy="153" r="1.5" fill="#ffffff" />
    <ellipse cx="27" cy="161" rx="5" ry="2.5" fill="#ff8787" opacity="0.55" />
    <polygon points="7,155 3,158 7,159" fill="#ff8787" />
    <path d="M 7,161 Q 3,164 6,167" stroke="#212529" stroke-width="1" fill="none" stroke-linecap="round" />
  </g>

  <!-- Back leg foreground (estirada atrás) -->
  <g class="back-foot-right">
    <ellipse cx="135" cy="180" rx="20" ry="8" fill="url(#cat-skin)" transform="rotate(-15 135 180)" />
    <ellipse cx="153" cy="175" rx="7" ry="4" fill="#ffffff" />
  </g>

  <!-- Front leg foreground (estirada adelante) -->
  <g class="right-paw">
    <ellipse cx="70" cy="178" rx="18" ry="7" fill="url(#cat-skin)" transform="rotate(10 70 178)" />
    <ellipse cx="54" cy="181" rx="7" ry="4" fill="#ffffff" />
  </g>
</svg>
`;

// === LAY BREATHE (mismo que lay, body un poco más inflado) ===
const catLayBreatheSVG = `
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

  <path id="cat-tail" d="M 150,170 C 170,165 178,155 182,140" fill="none" stroke="url(#cat-skin)" stroke-width="14" stroke-linecap="round" />

  <g class="back-foot-left">
    <ellipse cx="125" cy="178" rx="20" ry="8" fill="#d9480f" transform="rotate(-15 125 178)" />
    <ellipse cx="143" cy="173" rx="7" ry="4" fill="#f1f3f5" />
  </g>
  <g class="left-paw">
    <ellipse cx="60" cy="175" rx="18" ry="7" fill="#d9480f" transform="rotate(10 60 175)" />
    <ellipse cx="44" cy="178" rx="7" ry="4" fill="#f1f3f5" />
  </g>

  <!-- Body un poco más inflado (ry 22 vs 20) -->
  <ellipse cx="100" cy="170" rx="66" ry="22" fill="url(#cat-skin)" />
  <path d="M 50,165 Q 52,170 56,172" stroke="#d9480f" stroke-width="3" fill="none" stroke-linecap="round" />
  <path d="M 150,165 Q 148,170 144,172" stroke="#d9480f" stroke-width="3" fill="none" stroke-linecap="round" />

  <g style="transform-origin: 35px 155px;">
    <path d="M 20,135 L 10,105 Q 30,118 32,130 Z" fill="url(#cat-skin)" />
    <path d="M 22,132 L 14,111 Q 28,121 29,129 Z" fill="url(#cat-ear)" />
    <path d="M 32,135 L 28,102 Q 42,115 40,128 Z" fill="url(#cat-skin)" />
    <circle cx="35" cy="155" r="28" fill="url(#cat-skin)" />
    <path d="M 38,132 Q 33,138 28,142" stroke="#d9480f" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <path d="M 44,132 Q 41,140 35,145" stroke="#d9480f" stroke-width="3" fill="none" stroke-linecap="round" />
    <line x1="10" y1="159" x2="-8" y2="157" stroke="#f1f3f5" stroke-width="1.5" stroke-linecap="round" />
    <line x1="10" y1="164" x2="-12" y2="164" stroke="#f1f3f5" stroke-width="1.5" stroke-linecap="round" />
    <line x1="10" y1="169" x2="-8" y2="171" stroke="#f1f3f5" stroke-width="1.5" stroke-linecap="round" />
    <ellipse cx="23" cy="153" rx="4" ry="5" fill="#1e1e24" />
    <circle class="pet-pupil" data-anchor-x="23" data-anchor-y="153" cx="23" cy="153" r="1.5" fill="#ffffff" />
    <ellipse cx="27" cy="161" rx="5" ry="2.5" fill="#ff8787" opacity="0.55" />
    <polygon points="7,155 3,158 7,159" fill="#ff8787" />
    <path d="M 7,161 Q 3,164 6,167" stroke="#212529" stroke-width="1" fill="none" stroke-linecap="round" />
  </g>

  <g class="back-foot-right">
    <ellipse cx="135" cy="180" rx="20" ry="8" fill="url(#cat-skin)" transform="rotate(-15 135 180)" />
    <ellipse cx="153" cy="175" rx="7" ry="4" fill="#ffffff" />
  </g>
  <g class="right-paw">
    <ellipse cx="70" cy="178" rx="18" ry="7" fill="url(#cat-skin)" transform="rotate(10 70 178)" />
    <ellipse cx="54" cy="181" rx="7" ry="4" fill="#ffffff" />
  </g>
</svg>
`;

// === STRETCH (cuerpo extendido, lomo arqueado, patas adelante/atrás) ===
const catStretchSVG = `
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

  <!-- Tail estirada atrás (larga) -->
  <path id="cat-tail" d="M 150,168 C 172,160 180,148 184,130" fill="none" stroke="url(#cat-skin)" stroke-width="14" stroke-linecap="round" />

  <!-- Back leg background (estirada atrás) -->
  <g class="back-foot-left">
    <rect x="118" y="160" width="12" height="22" rx="6" fill="#d9480f" transform="rotate(-30 124 171)" />
    <ellipse cx="142" cy="178" rx="7" ry="4" fill="#f1f3f5" />
  </g>

  <!-- Front leg background (estirada adelante) -->
  <g class="left-paw">
    <rect x="58" y="160" width="12" height="22" rx="6" fill="#d9480f" transform="rotate(30 64 171)" />
    <ellipse cx="40" cy="178" rx="7" ry="4" fill="#f1f3f5" />
  </g>

  <!-- Body extendido horizontal (lomo arqueado — elipse wide) -->
  <ellipse cx="100" cy="160" rx="70" ry="18" fill="url(#cat-skin)" />
  <path d="M 50,155 Q 52,160 56,162" stroke="#d9480f" stroke-width="3" fill="none" stroke-linecap="round" />
  <path d="M 150,155 Q 148,160 144,162" stroke="#d9480f" stroke-width="3" fill="none" stroke-linecap="round" />

  <!-- Head profile (al frente, baja, mirada abajo) -->
  <g style="transform-origin: 32px 155px;">
    <path d="M 18,138 L 8,108 Q 28,121 30,133 Z" fill="url(#cat-skin)" />
    <path d="M 20,135 L 12,114 Q 26,124 27,132 Z" fill="url(#cat-ear)" />
    <path d="M 30,138 L 26,105 Q 40,118 38,131 Z" fill="url(#cat-skin)" />
    <circle cx="32" cy="158" r="28" fill="url(#cat-skin)" />
    <path d="M 35,135 Q 30,141 25,145" stroke="#d9480f" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <path d="M 41,135 Q 38,143 32,148" stroke="#d9480f" stroke-width="3" fill="none" stroke-linecap="round" />
    <line x1="7" y1="162" x2="-11" y2="160" stroke="#f1f3f5" stroke-width="1.5" stroke-linecap="round" />
    <line x1="7" y1="167" x2="-15" y2="167" stroke="#f1f3f5" stroke-width="1.5" stroke-linecap="round" />
    <line x1="7" y1="172" x2="-11" y2="174" stroke="#f1f3f5" stroke-width="1.5" stroke-linecap="round" />
    <ellipse cx="20" cy="156" rx="4" ry="5" fill="#1e1e24" />
    <circle class="pet-pupil" data-anchor-x="20" data-anchor-y="156" cx="20" cy="156" r="1.5" fill="#ffffff" />
    <ellipse cx="24" cy="164" rx="5" ry="2.5" fill="#ff8787" opacity="0.55" />
    <polygon points="4,158 0,161 4,162" fill="#ff8787" />
    <path d="M 4,164 Q 0,167 3,170" stroke="#212529" stroke-width="1" fill="none" stroke-linecap="round" />
  </g>

  <!-- Back leg foreground (estirada atrás) -->
  <g class="back-foot-right">
    <rect x="125" y="160" width="12" height="22" rx="6" fill="url(#cat-skin)" transform="rotate(-30 131 171)" />
    <ellipse cx="149" cy="180" rx="7" ry="4" fill="#ffffff" />
  </g>

  <!-- Front leg foreground (estirada adelante) -->
  <g class="right-paw">
    <rect x="65" y="160" width="12" height="22" rx="6" fill="url(#cat-skin)" transform="rotate(30 71 171)" />
    <ellipse cx="47" cy="180" rx="7" ry="4" fill="#ffffff" />
  </g>
</svg>
`;

// Arrays de frames
const catSitFrames = [catSitSVG, catSitBlinkSVG];
const catLayFrames = [catLaySVG, catLayBreatheSVG];

const catSVG = catIdleSVG; // Compatibility alias

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    catIdleSVG,
    catWalkSVG,
    catWalk1SVG,
    catWalk2SVG,
    catWalk3SVG,
    catWalk4SVG,
    catWalkFrames,
    catSleepSVG,
    catSitSVG,
    catSitBlinkSVG,
    catSitFrames,
    catLaySVG,
    catLayBreatheSVG,
    catLayFrames,
    catStretchSVG,
    catSVG
  };
} else {
  window.catIdleSVG = catIdleSVG;
  window.catWalkSVG = catWalkSVG;
  window.catWalk1SVG = catWalk1SVG;
  window.catWalk2SVG = catWalk2SVG;
  window.catWalk3SVG = catWalk3SVG;
  window.catWalk4SVG = catWalk4SVG;
  window.catWalkFrames = catWalkFrames;
  window.catSleepSVG = catSleepSVG;
  window.catSitSVG = catSitSVG;
  window.catSitBlinkSVG = catSitBlinkSVG;
  window.catSitFrames = catSitFrames;
  window.catLaySVG = catLaySVG;
  window.catLayBreatheSVG = catLayBreatheSVG;
  window.catLayFrames = catLayFrames;
  window.catStretchSVG = catStretchSVG;
  window.catSVG = catSVG;
}
