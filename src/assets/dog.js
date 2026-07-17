const dogIdleSVG = `
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
    <linearGradient id="dog-collar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e74c3c" />
      <stop offset="100%" stop-color="#c0392b" />
    </linearGradient>
  </defs>

  <!-- Tail (Procedural Waving) -->
  <path id="dog-tail" d="M 130,130 C 145,118 151,100 157,84" fill="none" stroke="url(#dog-skin)" stroke-width="16" stroke-linecap="round" />

  <!-- Feet (Back) -->
  <ellipse cx="75" cy="178" rx="14" ry="10" fill="#f1f3f5" class="back-foot-left" />
  <ellipse cx="125" cy="178" rx="14" ry="10" fill="#f1f3f5" class="back-foot-right" />

  <!-- Body (Breathing) -->
  <g class="anim-breath" style="transform-origin: 100px 180px;">
    <ellipse cx="100" cy="138" rx="43" ry="46" fill="url(#dog-skin)" />
    
    <!-- Dalmatian Spots on Body -->
    <circle cx="76" cy="135" r="9" fill="url(#dog-patch)" opacity="0.9" />
    <circle cx="124" cy="148" r="7" fill="url(#dog-patch)" opacity="0.9" />
    <circle cx="78" cy="155" r="6" fill="url(#dog-patch)" opacity="0.9" />
    
    <!-- Chest Patch (White belly) -->
    <path d="M 82,120 Q 100,146 118,120 Q 100,128 82,120 Z" fill="#ffffff" />
    
    <!-- Shadow under chin -->
    <ellipse cx="100" cy="108" rx="26" ry="4" fill="#000000" opacity="0.12" />

    <!-- Collar -->
    <rect x="74" y="106" width="52" height="6" rx="3" fill="url(#dog-collar)" />
    
    <!-- Hanging Bone Tag -->
    <path d="M 95,115 L 105,115 L 105,124 L 95,124 Z" fill="none" /> <!-- placeholder spacing -->
    <path d="M 94,115 Q 94,112 96,112 Q 98,112 98,115 L 102,115 Q 102,112 104,112 Q 106,112 106,115 L 106,119 Q 106,122 104,122 Q 102,122 102,119 L 98,119 Q 98,122 96,122 Q 94,122 94,119 Z" 
          fill="#ffffff" 
          stroke="#cbd5e1" 
          stroke-width="0.8" />
  </g>

  <!-- Head Group -->
  <g class="anim-breath" style="transform-origin: 100px 180px;">
    <!-- Head Base -->
    <circle cx="100" cy="78" r="42" fill="url(#dog-skin)" />
    
    <!-- Eye Patch (Left) -->
    <path d="M 70,78 A 16,16 0 1,1 92,62 A 42,42 0 0,1 70,78 Z" fill="url(#dog-patch)" opacity="0.85" />
    
    <!-- Spot on head top right -->
    <circle cx="120" cy="56" r="8" fill="url(#dog-patch)" opacity="0.85" />

    <!-- Left Floppy Ear -->
    <path d="M 62,60 C 50,60 40,85 46,105 C 50,115 62,110 60,80 Z" fill="url(#dog-patch)" />
    <!-- Ear inner shadow details -->
    <path d="M 59,64 C 52,65 46,84 49,98 C 52,104 59,102 58,80 Z" fill="#7e2d00" opacity="0.15" />

    <!-- Right Floppy Ear -->
    <path d="M 138,60 C 150,60 160,85 154,105 C 150,115 138,110 140,80 Z" fill="url(#dog-patch)" />
    <path d="M 141,64 C 148,65 154,84 151,98 C 148,104 141,102 142,80 Z" fill="#7e2d00" opacity="0.15" />

    <!-- Glossy Highlight on Head Top -->
    <path d="M 78,48 Q 100,38 122,48" stroke="#ffffff" stroke-width="2.5" fill="none" opacity="0.35" stroke-linecap="round" />

    <!-- Eyes (Blinking Group) -->
    <g class="anim-blink">
      <circle cx="80" cy="74" r="7.2" fill="#1e1e24" />
      <circle cx="77.5" cy="71.5" r="2.5" fill="#ffffff" />
      <circle cx="120" cy="74" r="7.2" fill="#1e1e24" />
      <circle cx="117.5" cy="71.5" r="2.5" fill="#ffffff" />
    </g>

    <!-- Muzzle / Nose area -->
    <ellipse cx="100" cy="90" rx="14" ry="10" fill="#ffffff" />
    <ellipse cx="100" cy="84" rx="6.5" ry="4.5" fill="#1e1e24" />
    <!-- Snout highlight -->
    <circle cx="98.5" cy="82.5" r="1.5" fill="#ffffff" />

    <!-- Cute Tongue Hanging Out -->
    <path d="M 97,91 Q 100,94 103,91" stroke="#212529" stroke-width="1.6" fill="none" stroke-linecap="round" />
    <path d="M 98,92 Q 100,92 102,92 L 102,99 C 102,102 98,102 98,99 Z" fill="#ff6b6b" />
    <line x1="100" y1="92" x2="100" y2="97" stroke="#c92a2a" stroke-width="0.8" />

    <!-- Cute Cheeks -->
    <ellipse cx="70" cy="85" rx="6" ry="3" fill="#ffa8a8" opacity="0.5" />
    <ellipse cx="130" cy="85" rx="6" ry="3" fill="#ffa8a8" opacity="0.5" />
  </g>

  <!-- Front Paws -->
  <ellipse cx="90" cy="180" rx="10" ry="7" fill="#ffffff" class="left-paw" />
  <ellipse cx="110" cy="180" rx="10" ry="7" fill="#ffffff" class="right-paw" />
</svg>
`;

const dogWalkSVG = `
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

  <!-- Tail (Procedural Waving) -->
  <path id="dog-tail" d="M 138,110 C 155,100 160,85 165,70" fill="none" stroke="url(#dog-skin)" stroke-width="16" stroke-linecap="round" />

  <!-- Back Left Leg (Inside) -->
  <g class="back-foot-left">
    <rect x="115" y="115" width="12" height="60" rx="6" fill="#a04000" />
    <ellipse cx="121" cy="175" rx="8" ry="5" fill="#f1f3f5" />
    <!-- Pink pad -->
    <circle cx="121" cy="176" r="3.2" fill="#ffa8a8" />
  </g>

  <!-- Front Left Leg (Inside) -->
  <g class="left-paw">
    <rect x="70" y="115" width="12" height="60" rx="6" fill="#a04000" />
    <ellipse cx="76" cy="175" rx="8" ry="5" fill="#f1f3f5" />
    <circle cx="76" cy="176" r="3.2" fill="#ffa8a8" />
  </g>

  <!-- Body -->
  <ellipse cx="100" cy="115" rx="46" ry="34" fill="url(#dog-skin)" />
  
  <!-- Dalmatian Spots on side -->
  <circle cx="98" cy="110" r="8" fill="url(#dog-patch)" opacity="0.85" />
  <circle cx="120" cy="120" r="6" fill="url(#dog-patch)" opacity="0.85" />

  <!-- Chest fluff side -->
  <path d="M 58,96 Q 48,115 63,128 Z" fill="#ffffff" />

  <!-- Head Group (Profile) -->
  <g style="transform-origin: 55px 80px;">
    <circle cx="55" cy="80" r="30" fill="url(#dog-skin)" />

    <!-- Snout profile (Left facing) -->
    <path d="M 40,85 L 20,85 L 20,74 Q 30,68 40,72 Z" fill="url(#dog-skin)" />
    <ellipse cx="20" cy="76" rx="3.5" ry="3" fill="#1e1e24" />

    <!-- Eye Patch (Left side) -->
    <ellipse cx="44" cy="74" rx="10" ry="8" fill="url(#dog-patch)" opacity="0.85" />
    
    <!-- Floppy Ear (Hanging down) -->
    <path d="M 68,68 Q 80,72 76,105 Q 65,115 58,95 Z" fill="url(#dog-patch)" />

    <!-- Eye (Looking side/profile) -->
    <ellipse cx="42" cy="76" rx="4" ry="5.5" fill="#1e1e24" />
    <circle cx="40.5" cy="74" r="1.5" fill="#ffffff" />

    <!-- Blush profile -->
    <ellipse cx="46" cy="84" rx="5" ry="2.5" fill="#ff8787" opacity="0.55" />
  </g>

  <!-- Back Right Leg (Foreground) -->
  <g class="back-foot-right">
    <rect x="125" y="115" width="12" height="60" rx="6" fill="url(#dog-skin)" />
    <ellipse cx="131" cy="175" rx="8" ry="5" fill="#ffffff" />
    <circle cx="131" cy="176" r="3.2" fill="#ffa8a8" />
  </g>

  <!-- Front Right Leg (Foreground) -->
  <g class="right-paw">
    <rect x="80" y="115" width="12" height="60" rx="6" fill="url(#dog-skin)" />
    <ellipse cx="86" cy="175" rx="8" ry="5" fill="#ffffff" />
    <circle cx="86" cy="176" r="3.2" fill="#ffa8a8" />
  </g>
</svg>
`;

const dogSleepSVG = `
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

  <!-- Soft Sleeping Mat with Lace Border -->
  <ellipse cx="100" cy="160" rx="66" ry="16" fill="#ffffff" opacity="0.75" stroke="#fed7aa" stroke-width="1.5" stroke-dasharray="4,4" />
  <ellipse cx="100" cy="160" rx="60" ry="13" fill="#ffedd5" opacity="0.6" />

  <!-- Shadow under dog on mat -->
  <ellipse cx="98" cy="150" rx="46" ry="8" fill="#ea580c" opacity="0.18" />

  <g class="anim-breath" style="transform-origin: 100px 160px;">
    <!-- Curled Tail wrapped around -->
    <path d="M 140,130 C 148,142 122,154 95,154 C 68,154 58,143 58,138" 
          stroke="url(#dog-skin)" 
          stroke-width="12" 
          fill="none" 
          stroke-linecap="round" />
    <path d="M 124,147 C 120,150 110,151 106,151" stroke="url(#dog-patch)" stroke-width="2.5" fill="none" stroke-linecap="round" />

    <!-- Curled Body -->
    <ellipse cx="102" cy="126" rx="50" ry="36" fill="url(#dog-skin)" />
    
    <!-- Dalmatian spots on sleeping body -->
    <circle cx="108" cy="108" r="8" fill="url(#dog-patch)" opacity="0.85" />
    <circle cx="126" cy="115" r="6" fill="url(#dog-patch)" opacity="0.85" />

    <!-- Sleeping Head resting on paws -->
    <g style="transform-origin: 72px 122px;">
      <circle cx="72" cy="122" r="26" fill="url(#dog-skin)" />

      <!-- Floppy ear folded cozily -->
      <path d="M 68,108 Q 50,112 55,138 Q 65,145 72,130 Z" fill="url(#dog-patch)" />
      
      <!-- Spot on sleeping head -->
      <circle cx="82" cy="112" r="5" fill="url(#dog-patch)" opacity="0.85" />

      <!-- Closed Eyes (sleeping ^^ curves) -->
      <path d="M 58,122 Q 62,126 66,122" stroke="#1e1e24" stroke-width="2.2" fill="none" stroke-linecap="round" />
      
      <!-- Cozy Muzzle / Nose resting -->
      <ellipse cx="80" cy="128" rx="8" ry="6" fill="#ffffff" />
      <ellipse cx="82" cy="125" rx="3" ry="2" fill="#1e1e24" />

      <!-- Blush -->
      <ellipse cx="60" cy="128" rx="4.5" ry="2.2" fill="#ff8787" opacity="0.4" />
    </g>
  </g>
</svg>
`;

const dogSVG = dogIdleSVG; // Compatibility alias

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { dogIdleSVG, dogWalkSVG, dogSleepSVG, dogSVG };
} else {
  window.dogIdleSVG = dogIdleSVG;
  window.dogWalkSVG = dogWalkSVG;
  window.dogSleepSVG = dogSleepSVG;
  window.dogSVG = dogSVG;
}
