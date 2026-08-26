/* Mascot Dog Assets - Shiba Chibi 2D Anime Illustration */
const dogIdleSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dog-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="50%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="dog-white" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FFFBEB" />
    </linearGradient>
    <linearGradient id="dog-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FECDD3" />
      <stop offset="100%" stop-color="#FDA4AF" />
    </linearGradient>
    <linearGradient id="dog-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D150B" />
      <stop offset="40%" stop-color="#1A0C06" />
      <stop offset="85%" stop-color="#78350F" />
      <stop offset="100%" stop-color="#92400E" />
    </linearGradient>
    <linearGradient id="cushion-grad-green" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="172" rx="55" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g id="dog-tail" class="anim-wag" style="transform-origin: 70px 142px; transform: rotate(0deg);">
    <path d="M 72,142 C 54,144 34,130 30,105 C 28,85 42,70 54,76 C 60,78 58,90 50,96 C 44,102 48,120 64,132 Z" 
          fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 42,85 C 36,92 34,100 36,108" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none" />
  </g>

  <g class="pet-hind-legs">
    <g class="back-foot-left">
      <path d="M 56,134 C 47,143 47,158 54,166 C 59,171 68,171 74,168 C 77,164 76,148 71,138 Z"
            fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <ellipse cx="54" cy="168" rx="8" ry="4.5" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" />
    </g>
    <g class="back-foot-right">
      <path d="M 144,134 C 153,143 153,158 146,166 C 141,171 132,171 126,168 C 123,164 124,148 129,138 Z"
            fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <ellipse cx="146" cy="168" rx="8" ry="4.5" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" />
    </g>
  </g>

  <g class="anim-breath pet-body" style="transform-origin: 100px 170px; transform: translateY(0px) rotate(0deg);">
    <path d="M 68,106 C 63,124 65,150 74,166 C 83,170 117,170 126,166 C 135,150 137,124 132,106 Z" 
          fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    
    <path d="M 82,96 C 75,111 72,124 80,135 C 86,142 93,148 100,150 C 107,148 114,142 120,135 C 128,124 125,111 118,96 C 111,106 89,106 82,96 Z" 
          fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" stroke-linejoin="round" />

    <g class="pet-front-paws">
      <path d="M 76,134 L 75,158 C 75,164 78,168 83,168 C 88,168 91,164 91,158 L 90,134 Z" 
            fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
      <ellipse cx="83" cy="166" rx="10" ry="6" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" />
      <path d="M 79,164 L 79,170" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
      <path d="M 86,164 L 86,170" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />

      <path d="M 110,134 L 109,158 C 109,164 112,168 117,168 C 122,168 125,164 125,158 L 124,134 Z" 
            fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
      <ellipse cx="117" cy="166" rx="10" ry="6" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" />
      <path d="M 113,164 L 113,170" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
      <path d="M 120,164 L 120,170" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
    </g>
  </g>

  <g class="pet-head anim-breath" style="transform-origin: 100px 105px; transform: translateY(0px) rotate(0deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 58px 52px;">
      <path d="M 60,54 C 42,54 32,70 34,92 C 36,104 46,108 52,98 C 58,88 64,74 62,54 Z" fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" />
      <path d="M 48,64 C 42,72 40,84 44,92" stroke="url(#dog-ear-inner)" stroke-width="4" stroke-linecap="round" fill="none" />
    </g>

    <g class="pet-ear pet-ear-right" style="transform-origin: 142px 52px;">
      <path d="M 140,54 C 158,54 168,70 166,92 C 164,104 154,108 148,98 C 142,88 136,74 138,54 Z" fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" />
      <path d="M 152,64 C 158,72 160,84 156,92" stroke="url(#dog-ear-inner)" stroke-width="4" stroke-linecap="round" fill="none" />
    </g>

    <path d="M 54,62 C 48,50 68,36 100,36 C 132,36 152,50 146,62 C 158,70 162,84 154,95 C 148,105 136,112 100,112 C 64,112 52,105 46,95 C 38,84 42,70 54,62 Z" 
          fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />

    <path d="M 94,38 C 96,55 92,68 84,78 C 84,78 100,82 100,82 C 100,82 116,78 116,78 C 108,68 104,55 106,38 Z" fill="url(#dog-white)" />

    <ellipse cx="100" cy="88" rx="18" ry="13" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" />
    <ellipse cx="100" cy="80" rx="6" ry="4.2" fill="#1C1917" />
    <circle cx="98" cy="78.5" r="1.5" fill="#FFFFFF" />

    <path d="M 94,85 Q 100,88 100,85 Q 100,88 106,85" stroke="#3B1E12" stroke-width="1.8" fill="none" stroke-linecap="round" />
    <path d="M 96,86 C 96,95 104,95 104,86 Z" fill="#FB7185" stroke="#3B1E12" stroke-width="1.2" />

    <ellipse cx="64" cy="90" rx="8" ry="4.5" fill="#FB7185" opacity="0.45" />
    <ellipse cx="136" cy="90" rx="8" ry="4.5" fill="#FB7185" opacity="0.45" />

    <g class="anim-blink">
      <ellipse cx="80" cy="74" rx="12.5" ry="14.5" fill="url(#dog-eye-iris)" stroke="#3B1E12" stroke-width="2.2" />
      <ellipse cx="80" cy="74" rx="8.5" ry="10.5" fill="#0A0503" />
      <circle class="pet-pupil" data-anchor-x="80" data-anchor-y="74" cx="80" cy="74" r="5" fill="#000000" />
      <circle cx="76" cy="68" r="4.2" fill="#FFFFFF" />
      <circle cx="85" cy="79" r="1.8" fill="#FFFFFF" />

      <ellipse cx="120" cy="74" rx="12.5" ry="14.5" fill="url(#dog-eye-iris)" stroke="#3B1E12" stroke-width="2.2" />
      <ellipse cx="120" cy="74" rx="8.5" ry="10.5" fill="#0A0503" />
      <circle class="pet-pupil" data-anchor-x="120" data-anchor-y="74" cx="120" cy="74" r="5" fill="#000000" />
      <circle cx="116" cy="68" r="4.2" fill="#FFFFFF" />
      <circle cx="125" cy="79" r="1.8" fill="#FFFFFF" />
    </g>
  </g>
</svg>`;
const dogWalk1SVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dog-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="50%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="dog-white" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FFFBEB" />
    </linearGradient>
    <linearGradient id="dog-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FECDD3" />
      <stop offset="100%" stop-color="#FDA4AF" />
    </linearGradient>
    <linearGradient id="dog-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D150B" />
      <stop offset="40%" stop-color="#1A0C06" />
      <stop offset="85%" stop-color="#78350F" />
      <stop offset="100%" stop-color="#92400E" />
    </linearGradient>
    <linearGradient id="cushion-grad-green" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="172" rx="55" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g id="dog-tail" class="" style="transform-origin: 70px 142px; transform: rotate(10deg);">
    <path d="M 72,142 C 54,144 34,130 30,105 C 28,85 42,70 54,76 C 60,78 58,90 50,96 C 44,102 48,120 64,132 Z" 
          fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 42,85 C 36,92 34,100 36,108" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none" />
  </g>

  <g class="pet-hind-legs">
    <g class="back-foot-left">
      <path d="M 56,134 C 47,143 47,158 54,166 C 59,171 68,171 74,168 C 77,164 76,148 71,138 Z"
            fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <ellipse cx="54" cy="170" rx="8" ry="4.5" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" />
    </g>
    <g class="back-foot-right">
      <path d="M 144,134 C 153,143 153,158 146,166 C 141,171 132,171 126,168 C 123,164 124,148 129,138 Z"
            fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <ellipse cx="146" cy="164" rx="8" ry="4.5" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" />
    </g>
  </g>

  <g class=" pet-body" style="transform-origin: 100px 170px; transform: translateY(-1px) rotate(-2deg);">
    <path d="M 68,106 C 63,124 65,150 74,166 C 83,170 117,170 126,166 C 135,150 137,124 132,106 Z" 
          fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    
    <path d="M 82,96 C 75,111 72,124 80,135 C 86,142 93,148 100,150 C 107,148 114,142 120,135 C 128,124 125,111 118,96 C 111,106 89,106 82,96 Z" 
          fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" stroke-linejoin="round" />

    <g class="pet-front-paws">
      <g class="left-paw">
        <path d="M 76,134 L 75,158 C 75,164 78,168 83,168 C 88,168 91,164 91,158 L 90,134 Z"
              fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
        <ellipse cx="83" cy="160" rx="10" ry="6" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" />
        <path d="M 79,158 L 79,164" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
        <path d="M 86,158 L 86,164" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
      </g>
      <g class="right-paw">
        <path d="M 110,134 L 109,158 C 109,164 112,168 117,168 C 122,168 125,164 125,158 L 124,134 Z"
              fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
        <ellipse cx="117" cy="168" rx="10" ry="6" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" />
        <path d="M 113,166 L 113,172" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
        <path d="M 120,166 L 120,172" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
      </g>
    </g>
  </g>

  <g class="pet-head " style="transform-origin: 100px 105px; transform: translateY(-1px) rotate(-1.4deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 58px 52px;">
      <path d="M 60,54 C 42,54 32,70 34,92 C 36,104 46,108 52,98 C 58,88 64,74 62,54 Z" fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" />
      <path d="M 48,64 C 42,72 40,84 44,92" stroke="url(#dog-ear-inner)" stroke-width="4" stroke-linecap="round" fill="none" />
    </g>

    <g class="pet-ear pet-ear-right" style="transform-origin: 142px 52px;">
      <path d="M 140,54 C 158,54 168,70 166,92 C 164,104 154,108 148,98 C 142,88 136,74 138,54 Z" fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" />
      <path d="M 152,64 C 158,72 160,84 156,92" stroke="url(#dog-ear-inner)" stroke-width="4" stroke-linecap="round" fill="none" />
    </g>

    <path d="M 54,62 C 48,50 68,36 100,36 C 132,36 152,50 146,62 C 158,70 162,84 154,95 C 148,105 136,112 100,112 C 64,112 52,105 46,95 C 38,84 42,70 54,62 Z" 
          fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />

    <path d="M 94,38 C 96,55 92,68 84,78 C 84,78 100,82 100,82 C 100,82 116,78 116,78 C 108,68 104,55 106,38 Z" fill="url(#dog-white)" />

    <ellipse cx="100" cy="88" rx="18" ry="13" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" />
    <ellipse cx="100" cy="80" rx="6" ry="4.2" fill="#1C1917" />
    <circle cx="98" cy="78.5" r="1.5" fill="#FFFFFF" />

    <path d="M 94,85 Q 100,88 100,85 Q 100,88 106,85" stroke="#3B1E12" stroke-width="1.8" fill="none" stroke-linecap="round" />
    <path d="M 96,86 C 96,95 104,95 104,86 Z" fill="#FB7185" stroke="#3B1E12" stroke-width="1.2" />

    <ellipse cx="64" cy="90" rx="8" ry="4.5" fill="#FB7185" opacity="0.45" />
    <ellipse cx="136" cy="90" rx="8" ry="4.5" fill="#FB7185" opacity="0.45" />

    <g class="">
      <ellipse cx="80" cy="74" rx="12.5" ry="14.5" fill="url(#dog-eye-iris)" stroke="#3B1E12" stroke-width="2.2" />
      <ellipse cx="80" cy="74" rx="8.5" ry="10.5" fill="#0A0503" />
      <circle class="pet-pupil" data-anchor-x="80" data-anchor-y="74" cx="80" cy="74" r="5" fill="#000000" />
      <circle cx="76" cy="68" r="4.2" fill="#FFFFFF" />
      <circle cx="85" cy="79" r="1.8" fill="#FFFFFF" />

      <ellipse cx="120" cy="74" rx="12.5" ry="14.5" fill="url(#dog-eye-iris)" stroke="#3B1E12" stroke-width="2.2" />
      <ellipse cx="120" cy="74" rx="8.5" ry="10.5" fill="#0A0503" />
      <circle class="pet-pupil" data-anchor-x="120" data-anchor-y="74" cx="120" cy="74" r="5" fill="#000000" />
      <circle cx="116" cy="68" r="4.2" fill="#FFFFFF" />
      <circle cx="125" cy="79" r="1.8" fill="#FFFFFF" />
    </g>
  </g>
</svg>`;
const dogWalk2SVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dog-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="50%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="dog-white" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FFFBEB" />
    </linearGradient>
    <linearGradient id="dog-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FECDD3" />
      <stop offset="100%" stop-color="#FDA4AF" />
    </linearGradient>
    <linearGradient id="dog-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D150B" />
      <stop offset="40%" stop-color="#1A0C06" />
      <stop offset="85%" stop-color="#78350F" />
      <stop offset="100%" stop-color="#92400E" />
    </linearGradient>
    <linearGradient id="cushion-grad-green" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="172" rx="55" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g id="dog-tail" class="" style="transform-origin: 70px 142px; transform: rotate(0deg);">
    <path d="M 72,142 C 54,144 34,130 30,105 C 28,85 42,70 54,76 C 60,78 58,90 50,96 C 44,102 48,120 64,132 Z" 
          fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 42,85 C 36,92 34,100 36,108" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none" />
  </g>

  <g class="pet-hind-legs">
    <g class="back-foot-left">
      <path d="M 56,134 C 47,143 47,158 54,166 C 59,171 68,171 74,168 C 77,164 76,148 71,138 Z"
            fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <ellipse cx="54" cy="168" rx="8" ry="4.5" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" />
    </g>
    <g class="back-foot-right">
      <path d="M 144,134 C 153,143 153,158 146,166 C 141,171 132,171 126,168 C 123,164 124,148 129,138 Z"
            fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <ellipse cx="146" cy="168" rx="8" ry="4.5" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" />
    </g>
  </g>

  <g class=" pet-body" style="transform-origin: 100px 170px; transform: translateY(-3px) rotate(0deg);">
    <path d="M 68,106 C 63,124 65,150 74,166 C 83,170 117,170 126,166 C 135,150 137,124 132,106 Z" 
          fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    
    <path d="M 82,96 C 75,111 72,124 80,135 C 86,142 93,148 100,150 C 107,148 114,142 120,135 C 128,124 125,111 118,96 C 111,106 89,106 82,96 Z" 
          fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" stroke-linejoin="round" />

    <g class="pet-front-paws">
      <g class="left-paw">
        <path d="M 76,134 L 75,158 C 75,164 78,168 83,168 C 88,168 91,164 91,158 L 90,134 Z"
              fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
        <ellipse cx="83" cy="163" rx="10" ry="6" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" />
        <path d="M 79,161 L 79,167" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
        <path d="M 86,161 L 86,167" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
      </g>
      <g class="right-paw">
        <path d="M 110,134 L 109,158 C 109,164 112,168 117,168 C 122,168 125,164 125,158 L 124,134 Z"
              fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
        <ellipse cx="117" cy="165" rx="10" ry="6" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" />
        <path d="M 113,163 L 113,169" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
        <path d="M 120,163 L 120,169" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
      </g>
    </g>
  </g>

  <g class="pet-head " style="transform-origin: 100px 105px; transform: translateY(-3px) rotate(0deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 58px 52px;">
      <path d="M 60,54 C 42,54 32,70 34,92 C 36,104 46,108 52,98 C 58,88 64,74 62,54 Z" fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" />
      <path d="M 48,64 C 42,72 40,84 44,92" stroke="url(#dog-ear-inner)" stroke-width="4" stroke-linecap="round" fill="none" />
    </g>

    <g class="pet-ear pet-ear-right" style="transform-origin: 142px 52px;">
      <path d="M 140,54 C 158,54 168,70 166,92 C 164,104 154,108 148,98 C 142,88 136,74 138,54 Z" fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" />
      <path d="M 152,64 C 158,72 160,84 156,92" stroke="url(#dog-ear-inner)" stroke-width="4" stroke-linecap="round" fill="none" />
    </g>

    <path d="M 54,62 C 48,50 68,36 100,36 C 132,36 152,50 146,62 C 158,70 162,84 154,95 C 148,105 136,112 100,112 C 64,112 52,105 46,95 C 38,84 42,70 54,62 Z" 
          fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />

    <path d="M 94,38 C 96,55 92,68 84,78 C 84,78 100,82 100,82 C 100,82 116,78 116,78 C 108,68 104,55 106,38 Z" fill="url(#dog-white)" />

    <ellipse cx="100" cy="88" rx="18" ry="13" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" />
    <ellipse cx="100" cy="80" rx="6" ry="4.2" fill="#1C1917" />
    <circle cx="98" cy="78.5" r="1.5" fill="#FFFFFF" />

    <path d="M 94,85 Q 100,88 100,85 Q 100,88 106,85" stroke="#3B1E12" stroke-width="1.8" fill="none" stroke-linecap="round" />
    <path d="M 96,86 C 96,95 104,95 104,86 Z" fill="#FB7185" stroke="#3B1E12" stroke-width="1.2" />

    <ellipse cx="64" cy="90" rx="8" ry="4.5" fill="#FB7185" opacity="0.45" />
    <ellipse cx="136" cy="90" rx="8" ry="4.5" fill="#FB7185" opacity="0.45" />

    <g class="">
      <ellipse cx="80" cy="74" rx="12.5" ry="14.5" fill="url(#dog-eye-iris)" stroke="#3B1E12" stroke-width="2.2" />
      <ellipse cx="80" cy="74" rx="8.5" ry="10.5" fill="#0A0503" />
      <circle class="pet-pupil" data-anchor-x="80" data-anchor-y="74" cx="80" cy="74" r="5" fill="#000000" />
      <circle cx="76" cy="68" r="4.2" fill="#FFFFFF" />
      <circle cx="85" cy="79" r="1.8" fill="#FFFFFF" />

      <ellipse cx="120" cy="74" rx="12.5" ry="14.5" fill="url(#dog-eye-iris)" stroke="#3B1E12" stroke-width="2.2" />
      <ellipse cx="120" cy="74" rx="8.5" ry="10.5" fill="#0A0503" />
      <circle class="pet-pupil" data-anchor-x="120" data-anchor-y="74" cx="120" cy="74" r="5" fill="#000000" />
      <circle cx="116" cy="68" r="4.2" fill="#FFFFFF" />
      <circle cx="125" cy="79" r="1.8" fill="#FFFFFF" />
    </g>
  </g>
</svg>`;
const dogWalk3SVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dog-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="50%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="dog-white" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FFFBEB" />
    </linearGradient>
    <linearGradient id="dog-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FECDD3" />
      <stop offset="100%" stop-color="#FDA4AF" />
    </linearGradient>
    <linearGradient id="dog-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D150B" />
      <stop offset="40%" stop-color="#1A0C06" />
      <stop offset="85%" stop-color="#78350F" />
      <stop offset="100%" stop-color="#92400E" />
    </linearGradient>
    <linearGradient id="cushion-grad-green" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="172" rx="55" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g id="dog-tail" class="" style="transform-origin: 70px 142px; transform: rotate(-10deg);">
    <path d="M 72,142 C 54,144 34,130 30,105 C 28,85 42,70 54,76 C 60,78 58,90 50,96 C 44,102 48,120 64,132 Z" 
          fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 42,85 C 36,92 34,100 36,108" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none" />
  </g>

  <g class="pet-hind-legs">
    <g class="back-foot-left">
      <path d="M 56,134 C 47,143 47,158 54,166 C 59,171 68,171 74,168 C 77,164 76,148 71,138 Z"
            fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <ellipse cx="54" cy="164" rx="8" ry="4.5" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" />
    </g>
    <g class="back-foot-right">
      <path d="M 144,134 C 153,143 153,158 146,166 C 141,171 132,171 126,168 C 123,164 124,148 129,138 Z"
            fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <ellipse cx="146" cy="170" rx="8" ry="4.5" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" />
    </g>
  </g>

  <g class=" pet-body" style="transform-origin: 100px 170px; transform: translateY(-1px) rotate(2deg);">
    <path d="M 68,106 C 63,124 65,150 74,166 C 83,170 117,170 126,166 C 135,150 137,124 132,106 Z" 
          fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    
    <path d="M 82,96 C 75,111 72,124 80,135 C 86,142 93,148 100,150 C 107,148 114,142 120,135 C 128,124 125,111 118,96 C 111,106 89,106 82,96 Z" 
          fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" stroke-linejoin="round" />

    <g class="pet-front-paws">
      <g class="left-paw">
        <path d="M 76,134 L 75,158 C 75,164 78,168 83,168 C 88,168 91,164 91,158 L 90,134 Z"
              fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
        <ellipse cx="83" cy="168" rx="10" ry="6" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" />
        <path d="M 79,166 L 79,172" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
        <path d="M 86,166 L 86,172" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
      </g>
      <g class="right-paw">
        <path d="M 110,134 L 109,158 C 109,164 112,168 117,168 C 122,168 125,164 125,158 L 124,134 Z"
              fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
        <ellipse cx="117" cy="160" rx="10" ry="6" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" />
        <path d="M 113,158 L 113,164" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
        <path d="M 120,158 L 120,164" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
      </g>
    </g>
  </g>

  <g class="pet-head " style="transform-origin: 100px 105px; transform: translateY(-1px) rotate(1.4deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 58px 52px;">
      <path d="M 60,54 C 42,54 32,70 34,92 C 36,104 46,108 52,98 C 58,88 64,74 62,54 Z" fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" />
      <path d="M 48,64 C 42,72 40,84 44,92" stroke="url(#dog-ear-inner)" stroke-width="4" stroke-linecap="round" fill="none" />
    </g>

    <g class="pet-ear pet-ear-right" style="transform-origin: 142px 52px;">
      <path d="M 140,54 C 158,54 168,70 166,92 C 164,104 154,108 148,98 C 142,88 136,74 138,54 Z" fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" />
      <path d="M 152,64 C 158,72 160,84 156,92" stroke="url(#dog-ear-inner)" stroke-width="4" stroke-linecap="round" fill="none" />
    </g>

    <path d="M 54,62 C 48,50 68,36 100,36 C 132,36 152,50 146,62 C 158,70 162,84 154,95 C 148,105 136,112 100,112 C 64,112 52,105 46,95 C 38,84 42,70 54,62 Z" 
          fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />

    <path d="M 94,38 C 96,55 92,68 84,78 C 84,78 100,82 100,82 C 100,82 116,78 116,78 C 108,68 104,55 106,38 Z" fill="url(#dog-white)" />

    <ellipse cx="100" cy="88" rx="18" ry="13" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" />
    <ellipse cx="100" cy="80" rx="6" ry="4.2" fill="#1C1917" />
    <circle cx="98" cy="78.5" r="1.5" fill="#FFFFFF" />

    <path d="M 94,85 Q 100,88 100,85 Q 100,88 106,85" stroke="#3B1E12" stroke-width="1.8" fill="none" stroke-linecap="round" />
    <path d="M 96,86 C 96,95 104,95 104,86 Z" fill="#FB7185" stroke="#3B1E12" stroke-width="1.2" />

    <ellipse cx="64" cy="90" rx="8" ry="4.5" fill="#FB7185" opacity="0.45" />
    <ellipse cx="136" cy="90" rx="8" ry="4.5" fill="#FB7185" opacity="0.45" />

    <g class="">
      <ellipse cx="80" cy="74" rx="12.5" ry="14.5" fill="url(#dog-eye-iris)" stroke="#3B1E12" stroke-width="2.2" />
      <ellipse cx="80" cy="74" rx="8.5" ry="10.5" fill="#0A0503" />
      <circle class="pet-pupil" data-anchor-x="80" data-anchor-y="74" cx="80" cy="74" r="5" fill="#000000" />
      <circle cx="76" cy="68" r="4.2" fill="#FFFFFF" />
      <circle cx="85" cy="79" r="1.8" fill="#FFFFFF" />

      <ellipse cx="120" cy="74" rx="12.5" ry="14.5" fill="url(#dog-eye-iris)" stroke="#3B1E12" stroke-width="2.2" />
      <ellipse cx="120" cy="74" rx="8.5" ry="10.5" fill="#0A0503" />
      <circle class="pet-pupil" data-anchor-x="120" data-anchor-y="74" cx="120" cy="74" r="5" fill="#000000" />
      <circle cx="116" cy="68" r="4.2" fill="#FFFFFF" />
      <circle cx="125" cy="79" r="1.8" fill="#FFFFFF" />
    </g>
  </g>
</svg>`;
const dogWalk4SVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dog-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="50%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="dog-white" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FFFBEB" />
    </linearGradient>
    <linearGradient id="dog-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FECDD3" />
      <stop offset="100%" stop-color="#FDA4AF" />
    </linearGradient>
    <linearGradient id="dog-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D150B" />
      <stop offset="40%" stop-color="#1A0C06" />
      <stop offset="85%" stop-color="#78350F" />
      <stop offset="100%" stop-color="#92400E" />
    </linearGradient>
    <linearGradient id="cushion-grad-green" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="172" rx="55" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g id="dog-tail" class="" style="transform-origin: 70px 142px; transform: rotate(0deg);">
    <path d="M 72,142 C 54,144 34,130 30,105 C 28,85 42,70 54,76 C 60,78 58,90 50,96 C 44,102 48,120 64,132 Z" 
          fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 42,85 C 36,92 34,100 36,108" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none" />
  </g>

  <g class="pet-hind-legs">
    <g class="back-foot-left">
      <path d="M 56,134 C 47,143 47,158 54,166 C 59,171 68,171 74,168 C 77,164 76,148 71,138 Z"
            fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <ellipse cx="54" cy="168" rx="8" ry="4.5" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" />
    </g>
    <g class="back-foot-right">
      <path d="M 144,134 C 153,143 153,158 146,166 C 141,171 132,171 126,168 C 123,164 124,148 129,138 Z"
            fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <ellipse cx="146" cy="168" rx="8" ry="4.5" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" />
    </g>
  </g>

  <g class=" pet-body" style="transform-origin: 100px 170px; transform: translateY(-3px) rotate(0deg);">
    <path d="M 68,106 C 63,124 65,150 74,166 C 83,170 117,170 126,166 C 135,150 137,124 132,106 Z" 
          fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    
    <path d="M 82,96 C 75,111 72,124 80,135 C 86,142 93,148 100,150 C 107,148 114,142 120,135 C 128,124 125,111 118,96 C 111,106 89,106 82,96 Z" 
          fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" stroke-linejoin="round" />

    <g class="pet-front-paws">
      <g class="left-paw">
        <path d="M 76,134 L 75,158 C 75,164 78,168 83,168 C 88,168 91,164 91,158 L 90,134 Z"
              fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
        <ellipse cx="83" cy="165" rx="10" ry="6" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" />
        <path d="M 79,163 L 79,169" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
        <path d="M 86,163 L 86,169" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
      </g>
      <g class="right-paw">
        <path d="M 110,134 L 109,158 C 109,164 112,168 117,168 C 122,168 125,164 125,158 L 124,134 Z"
              fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
        <ellipse cx="117" cy="163" rx="10" ry="6" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="2" />
        <path d="M 113,161 L 113,167" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
        <path d="M 120,161 L 120,167" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
      </g>
    </g>
  </g>

  <g class="pet-head " style="transform-origin: 100px 105px; transform: translateY(-3px) rotate(0deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 58px 52px;">
      <path d="M 60,54 C 42,54 32,70 34,92 C 36,104 46,108 52,98 C 58,88 64,74 62,54 Z" fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" />
      <path d="M 48,64 C 42,72 40,84 44,92" stroke="url(#dog-ear-inner)" stroke-width="4" stroke-linecap="round" fill="none" />
    </g>

    <g class="pet-ear pet-ear-right" style="transform-origin: 142px 52px;">
      <path d="M 140,54 C 158,54 168,70 166,92 C 164,104 154,108 148,98 C 142,88 136,74 138,54 Z" fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" />
      <path d="M 152,64 C 158,72 160,84 156,92" stroke="url(#dog-ear-inner)" stroke-width="4" stroke-linecap="round" fill="none" />
    </g>

    <path d="M 54,62 C 48,50 68,36 100,36 C 132,36 152,50 146,62 C 158,70 162,84 154,95 C 148,105 136,112 100,112 C 64,112 52,105 46,95 C 38,84 42,70 54,62 Z" 
          fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />

    <path d="M 94,38 C 96,55 92,68 84,78 C 84,78 100,82 100,82 C 100,82 116,78 116,78 C 108,68 104,55 106,38 Z" fill="url(#dog-white)" />

    <ellipse cx="100" cy="88" rx="18" ry="13" fill="url(#dog-white)" stroke="#3B1E12" stroke-width="1.8" />
    <ellipse cx="100" cy="80" rx="6" ry="4.2" fill="#1C1917" />
    <circle cx="98" cy="78.5" r="1.5" fill="#FFFFFF" />

    <path d="M 94,85 Q 100,88 100,85 Q 100,88 106,85" stroke="#3B1E12" stroke-width="1.8" fill="none" stroke-linecap="round" />
    <path d="M 96,86 C 96,95 104,95 104,86 Z" fill="#FB7185" stroke="#3B1E12" stroke-width="1.2" />

    <ellipse cx="64" cy="90" rx="8" ry="4.5" fill="#FB7185" opacity="0.45" />
    <ellipse cx="136" cy="90" rx="8" ry="4.5" fill="#FB7185" opacity="0.45" />

    <g class="">
      <ellipse cx="80" cy="74" rx="12.5" ry="14.5" fill="url(#dog-eye-iris)" stroke="#3B1E12" stroke-width="2.2" />
      <ellipse cx="80" cy="74" rx="8.5" ry="10.5" fill="#0A0503" />
      <circle class="pet-pupil" data-anchor-x="80" data-anchor-y="74" cx="80" cy="74" r="5" fill="#000000" />
      <circle cx="76" cy="68" r="4.2" fill="#FFFFFF" />
      <circle cx="85" cy="79" r="1.8" fill="#FFFFFF" />

      <ellipse cx="120" cy="74" rx="12.5" ry="14.5" fill="url(#dog-eye-iris)" stroke="#3B1E12" stroke-width="2.2" />
      <ellipse cx="120" cy="74" rx="8.5" ry="10.5" fill="#0A0503" />
      <circle class="pet-pupil" data-anchor-x="120" data-anchor-y="74" cx="120" cy="74" r="5" fill="#000000" />
      <circle cx="116" cy="68" r="4.2" fill="#FFFFFF" />
      <circle cx="125" cy="79" r="1.8" fill="#FFFFFF" />
    </g>
  </g>
</svg>`;
const dogWalkSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dog-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="50%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="dog-white" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FFFBEB" />
    </linearGradient>
    <linearGradient id="dog-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FECDD3" />
      <stop offset="100%" stop-color="#FDA4AF" />
    </linearGradient>
    <linearGradient id="dog-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D150B" />
      <stop offset="40%" stop-color="#1A0C06" />
      <stop offset="85%" stop-color="#78350F" />
      <stop offset="100%" stop-color="#92400E" />
    </linearGradient>
    <linearGradient id="cushion-grad-green" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="172" rx="56" ry="6.5" fill="#28140B" opacity="0.22" class="pet-shadow" />
  <circle class="pet-pupil" data-anchor-x="42" data-anchor-y="76" cx="42" cy="76" r="4" fill="#000000" />
</svg>`;
const dogWalkFrames = [dogWalk1SVG, dogWalk2SVG, dogWalk3SVG, dogWalk4SVG];
const dogSleepSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dog-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="50%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="dog-white" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FFFBEB" />
    </linearGradient>
    <linearGradient id="dog-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FECDD3" />
      <stop offset="100%" stop-color="#FDA4AF" />
    </linearGradient>
    <linearGradient id="dog-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D150B" />
      <stop offset="40%" stop-color="#1A0C06" />
      <stop offset="85%" stop-color="#78350F" />
      <stop offset="100%" stop-color="#92400E" />
    </linearGradient>
    <linearGradient id="cushion-grad-green" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="178" rx="68" ry="10" fill="#1E293B" opacity="0.25" />
  <path d="M 36,154 Q 100,138 164,154 Q 148,176 100,178 Q 52,176 36,154 Z" fill="url(#cushion-grad-green)" stroke="#065F46" stroke-width="2.2" />

  <g class="anim-breath" style="transform-origin: 100px 150px;">
    <path d="M 140,132 C 152,145 128,163 96,163 C 72,163 56,150 60,138" stroke="url(#dog-fur)" stroke-width="15" fill="none" stroke-linecap="round" />
    <ellipse cx="102" cy="128" rx="44" ry="32" fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" />

    <g class="pet-head" style="transform-origin: 74px 124px;">
      <circle cx="74" cy="124" r="25" fill="url(#dog-fur)" stroke="#3B1E12" stroke-width="2.2" />
      <path d="M 63,122 Q 68,117 73,122" stroke="#3B1E12" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <path d="M 78,122 Q 83,117 88,122" stroke="#3B1E12" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <ellipse cx="76" cy="128" rx="3" ry="2" fill="#1C1917" />
      <ellipse cx="64" cy="130" rx="5" ry="2.8" fill="#FB7185" opacity="0.5" />
    </g>
  </g>
</svg>`;
// Slice 1 MOTION: sit/lay/stretch must be distinct exports (not aliases).
// Designer art comes later; reuse current markup with data-pose so tests
// can assert these are not the same string as idle/sleep/walk.
const dogSitSVG = dogIdleSVG.replace('<svg id="pet-svg"', '<svg id="pet-svg" data-pose="sit"');
const dogSitBlinkSVG = dogIdleSVG.replace('<svg id="pet-svg"', '<svg id="pet-svg" data-pose="sit-blink"');
const dogLaySVG = dogSleepSVG.replace('<svg id="pet-svg"', '<svg id="pet-svg" data-pose="lay"');
const dogLayBreatheSVG = dogSleepSVG.replace('<svg id="pet-svg"', '<svg id="pet-svg" data-pose="lay-breathe"');
const dogStretchSVG = dogWalk1SVG.replace('<svg id="pet-svg"', '<svg id="pet-svg" data-pose="stretch"');
const dogSVG = dogIdleSVG;

function getDogPartsForState(state) {
  const scope = typeof window !== "undefined" ? window : {};
  const STATE_TO_FRAMES = {
    idle: ["Idle"],
    walking: ["Walk1", "Walk2", "Walk3", "Walk4"],
    sleeping: ["Sleep"],
    sitting: ["Sit", "SitBlink"],
    laying: ["Lay", "LayBreathe"],
    stretching: ["Stretch"],
  };
  const frames = STATE_TO_FRAMES[state] || ["Idle"];
  return frames.map(name => ({
    head: null,
    body: scope["dog" + name + "SVG"] || (name === "Idle" || name === "Sit" || name === "SitBlink" ? dogIdleSVG : name === "Sleep" || name === "Lay" || name === "LayBreathe" ? dogSleepSVG : dogWalk1SVG),
    tail: null,
    backLegLeft: null,
    backLegRight: null,
    frontLegLeft: null,
    frontLegRight: null,
  }));
}

if (typeof window !== "undefined") {
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
  window.dogLaySVG = dogLaySVG;
  window.dogLayBreatheSVG = dogLayBreatheSVG;
  window.dogStretchSVG = dogStretchSVG;
  window.dogSVG = dogSVG;
  window.getDogPartsForState = getDogPartsForState;
}

if (typeof module !== "undefined" && module.exports) {
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
    dogLaySVG,
    dogLayBreatheSVG,
    dogStretchSVG,
    dogSVG,
    getDogPartsForState
  };
}