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
      <!-- Pupil highlights -->
      <circle cx="80" cy="70" r="2.5" fill="#ffffff" />
      <circle cx="83" cy="74" r="0.9" fill="#ffffff" />
      <circle cx="116" cy="70" r="2.5" fill="#ffffff" />
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
    <circle cx="40.5" cy="76" r="1.6" fill="#ffffff" />

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

const catSVG = catIdleSVG; // Compatibility alias

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { catIdleSVG, catWalkSVG, catSleepSVG, catSVG };
} else {
  window.catIdleSVG = catIdleSVG;
  window.catWalkSVG = catWalkSVG;
  window.catSleepSVG = catSleepSVG;
  window.catSVG = catSVG;
}
