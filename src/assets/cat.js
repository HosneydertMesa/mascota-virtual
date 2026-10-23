/* Mascot Cat Assets - Chibi 2D Anime Illustration */
const catIdleSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="luna-idle-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EAA663" />
      <stop offset="50%" stop-color="#D08842" />
      <stop offset="100%" stop-color="#A85F28" />
    </linearGradient>
    <linearGradient id="luna-idle-fur-dark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8C461A" />
      <stop offset="100%" stop-color="#602E0E" />
    </linearGradient>
    <linearGradient id="luna-idle-stripes" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4E240F" />
      <stop offset="100%" stop-color="#341507" />
    </linearGradient>
    <linearGradient id="luna-idle-cream" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF9" />
      <stop offset="50%" stop-color="#FFF5E6" />
      <stop offset="100%" stop-color="#FDE8CE" />
    </linearGradient>
    <linearGradient id="luna-idle-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFBEB8" />
      <stop offset="100%" stop-color="#FFAAA3" />
    </linearGradient>
    <linearGradient id="luna-idle-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1F0D05" />
      <stop offset="45%" stop-color="#3D1A0A" />
      <stop offset="85%" stop-color="#7A3912" />
      <stop offset="100%" stop-color="#A4551E" />
    </linearGradient>
  </defs>
  <ellipse cx="108" cy="170" rx="58" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 148px 118px; transform: rotate(0deg);">
    <path d="M 148,120 C 164,112 176,92 168,70 C 162,54 146,52 142,64 C 140,70 148,78 150,88 C 152,100 150,112 148,120 Z"
          fill="url(#luna-idle-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 158,68 C 162,76 162,84 158,90" stroke="url(#luna-idle-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    <path d="M 156,88 C 158,96 156,104 150,110" stroke="url(#luna-idle-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    <path d="M 150,108 C 152,114 150,118 148,120" stroke="url(#luna-idle-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
  </g>

  <g class="back-foot-left" style="transform-origin: 118px 124px;">
    <path d="M 116,122 C 108,130 106,148 110,164 C 112,168 122,169 128,164 C 132,158 132,136 124,124 Z"
          fill="url(#luna-idle-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 112,140 Q 118,146 122,154" stroke="url(#luna-idle-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <ellipse cx="118" cy="167" rx="8" ry="4.5" fill="url(#luna-idle-cream)" stroke="#34180C" stroke-width="1.8" />
  </g>
  <g class="back-foot-right" style="transform-origin: 146px 122px;">
    <path d="M 144,120 C 140,130 142,148 148,164 C 150,168 160,169 164,164 C 166,158 162,136 154,122 Z"
          fill="url(#luna-idle-fur-dark)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <ellipse cx="154" cy="167" rx="7.5" ry="4.2" fill="url(#luna-idle-cream)" stroke="#34180C" stroke-width="1.8" />
  </g>

  <g class="anim-breath pet-body" style="transform-origin: 112px 132px; transform: translateY(0px) rotate(0deg);">
    <path d="M 72,112 C 66,120 70,134 86,140 C 104,146 132,144 150,136 C 160,130 160,118 150,112 C 136,104 90,104 72,112 Z"
          fill="url(#luna-idle-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 92,110 Q 96,122 92,132" stroke="url(#luna-idle-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 108,108 Q 112,120 108,132" stroke="url(#luna-idle-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 124,110 Q 128,122 124,134" stroke="url(#luna-idle-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 76,114 C 72,124 78,134 92,138 C 102,140 110,136 112,128 C 108,118 94,112 82,112 Z"
          fill="url(#luna-idle-cream)" stroke="#34180C" stroke-width="1.6" stroke-linejoin="round" />
  </g>

  <g class="left-paw" style="transform-origin: 70px 126px;">
    <path d="M 64,124 L 62,154 C 62,160 66,167 74,167 C 82,167 86,160 86,154 L 84,124 Z"
          fill="url(#luna-idle-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="74" cy="167" rx="9" ry="5" fill="url(#luna-idle-cream)" stroke="#34180C" stroke-width="2" />
    <path d="M 70,164 L 70,169" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 78,164 L 78,169" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 96px 124px;">
    <path d="M 90,122 L 90,150 C 90,156 94,162 100,162 C 106,162 110,156 110,150 L 108,122 Z"
          fill="url(#luna-idle-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="100" cy="167" rx="8" ry="4.6" fill="url(#luna-idle-cream)" stroke="#34180C" stroke-width="2" />
    <path d="M 96,164 L 96,169" stroke="#34180C" stroke-width="1.4" stroke-linecap="round" />
    <path d="M 104,164 L 104,169" stroke="#34180C" stroke-width="1.4" stroke-linecap="round" />
  </g>

  <g class="pet-head anim-breath" style="transform-origin: 92px 107px; transform: translateY(0px) rotate(0deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 56px 57px;">
      <path d="M 52,60 L 38,28 C 52,31 68,44 68,58 Z" fill="url(#luna-idle-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 48,56 L 41,35 C 50,38 60,47 58,56 Z" fill="url(#luna-idle-ear-inner)" />
      <path d="M 44,50 Q 49,46 54,53" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 128px 57px;">
      <path d="M 132,60 L 146,28 C 132,31 116,44 116,58 Z" fill="url(#luna-idle-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 136,56 L 143,35 C 134,38 124,47 126,56 Z" fill="url(#luna-idle-ear-inner)" />
      <path d="M 140,50 Q 135,46 130,53" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" />
    </g>
    <path d="M 48,64 C 42,54 60,40 92,40 C 124,40 142,54 136,64
             C 146,68 151,76 144,82
             C 151,86 153,95 142,99
             C 146,103 140,111 129,111
             C 118,117 66,117 55,111
             C 44,111 38,103 42,99
             C 31,95 33,86 40,82
             C 33,76 38,68 48,64 Z"
          fill="url(#luna-idle-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 92,42 L 92,56" stroke="url(#luna-idle-stripes)" stroke-width="3.8" stroke-linecap="round" />
    <path d="M 83,46 Q 85,54 80,58" stroke="url(#luna-idle-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 101,46 Q 99,54 104,58" stroke="url(#luna-idle-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 74,51 Q 78,58 73,62" stroke="url(#luna-idle-stripes)" stroke-width="2.6" stroke-linecap="round" fill="none" />
    <path d="M 110,51 Q 106,58 111,62" stroke="url(#luna-idle-stripes)" stroke-width="2.6" stroke-linecap="round" fill="none" />
    <path d="M 46,76 Q 55,78 59,76" stroke="url(#luna-idle-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 44,85 Q 53,85 59,84" stroke="url(#luna-idle-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 138,76 Q 129,78 125,76" stroke="url(#luna-idle-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 140,85 Q 131,85 125,84" stroke="url(#luna-idle-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 46,88 Q 30,86 20,83" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 45,90.5 Q 28,90.5 16,91" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.9" />
    <path d="M 44,93 Q 28,95 18,99" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 138,88 Q 154,86 164,83" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 139,90.5 Q 156,90.5 168,91" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.9" />
    <path d="M 140,93 Q 156,95 166,99" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <ellipse cx="92" cy="88" rx="14" ry="10" fill="url(#luna-idle-cream)" stroke="#34180C" stroke-width="1.5" />
    <path d="M 89,82 L 95,82 L 92,85 Z" fill="#FF8585" stroke="#34180C" stroke-width="1" stroke-linejoin="round" />
    <path d="M 87,86 Q 92,89 92,86 Q 92,89 97,86" stroke="#34180C" stroke-width="1.8" fill="none" stroke-linecap="round" />
    <path d="M 89,87 Q 92,93 95,87 Z" fill="#FF7675" stroke="#34180C" stroke-width="1" />
    <ellipse cx="56" cy="88" rx="7" ry="4" fill="#FF7675" opacity="0.45" />
    <ellipse cx="128" cy="88" rx="7" ry="4" fill="#FF7675" opacity="0.45" />
    <g class="anim-blink">
      <ellipse cx="74" cy="74" rx="13" ry="15" fill="url(#luna-idle-eye-iris)" stroke="#34180C" stroke-width="2.2" />
      <ellipse cx="74" cy="74" rx="9" ry="11" fill="#0E0502" />
      <circle class="pet-pupil" data-anchor-x="74" data-anchor-y="74" cx="74" cy="74" r="5" fill="#000000" />
      <circle cx="70" cy="68" r="4.5" fill="#FFFFFF" />
      <circle cx="79" cy="79" r="2" fill="#FFFFFF" />
      <circle cx="69" cy="77" r="1.2" fill="#FFFFFF" opacity="0.75" />
      <ellipse cx="110" cy="74" rx="13" ry="15" fill="url(#luna-idle-eye-iris)" stroke="#34180C" stroke-width="2.2" />
      <ellipse cx="110" cy="74" rx="9" ry="11" fill="#0E0502" />
      <circle class="pet-pupil" data-anchor-x="110" data-anchor-y="74" cx="110" cy="74" r="5" fill="#000000" />
      <circle cx="106" cy="68" r="4.5" fill="#FFFFFF" />
      <circle cx="115" cy="79" r="2" fill="#FFFFFF" />
      <circle cx="105" cy="77" r="1.2" fill="#FFFFFF" opacity="0.75" />
    </g>
  </g>
</svg>
`;
const catWalkSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="luna-walk-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EAA663" />
      <stop offset="50%" stop-color="#D08842" />
      <stop offset="100%" stop-color="#A85F28" />
    </linearGradient>
    <linearGradient id="luna-walk-fur-dark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8C461A" />
      <stop offset="100%" stop-color="#602E0E" />
    </linearGradient>
    <linearGradient id="luna-walk-stripes" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4E240F" />
      <stop offset="100%" stop-color="#341507" />
    </linearGradient>
    <linearGradient id="luna-walk-cream" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF9" />
      <stop offset="50%" stop-color="#FFF5E6" />
      <stop offset="100%" stop-color="#FDE8CE" />
    </linearGradient>
    <linearGradient id="luna-walk-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFBEB8" />
      <stop offset="100%" stop-color="#FFAAA3" />
    </linearGradient>
    <linearGradient id="luna-walk-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1F0D05" />
      <stop offset="45%" stop-color="#3D1A0A" />
      <stop offset="85%" stop-color="#7A3912" />
      <stop offset="100%" stop-color="#A4551E" />
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="170" rx="58" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 148px 124px; transform: rotate(0deg);">
    <path d="M 148,126 C 162,118 176,96 170,74 C 166,58 150,54 144,64 C 140,70 148,78 150,88 C 152,100 150,112 146,122 Z"
          fill="url(#luna-walk-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 160,72 C 164,80 164,88 160,94" stroke="url(#luna-walk-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    <path d="M 158,92 C 160,100 158,108 152,114" stroke="url(#luna-walk-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    <path d="M 152,112 C 154,118 152,124 148,126" stroke="url(#luna-walk-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
  </g>

  <g class="back-foot-left" style="transform-origin: 128px 130px;">
    <path d="M 126,128 C 118,136 116,148 120,160 C 122,164 130,164 136,160 C 140,154 140,138 134,128 Z"
          fill="url(#luna-walk-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 122,142 Q 128,146 132,152" stroke="url(#luna-walk-stripes)" stroke-width="2.8" stroke-linecap="round" fill="none" />
    <ellipse cx="128" cy="160" rx="8" ry="4.2" fill="url(#luna-walk-cream)" stroke="#34180C" stroke-width="1.8" />
  </g>
  <g class="back-foot-right" style="transform-origin: 144px 132px;">
    <path d="M 140,130 C 136,140 138,154 144,166 C 146,169 156,169 160,164 C 162,158 158,142 150,132 Z"
          fill="url(#luna-walk-fur-dark)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <ellipse cx="150" cy="168" rx="7.5" ry="4" fill="url(#luna-walk-cream)" stroke="#34180C" stroke-width="1.8" />
  </g>

  <g class="anim-breath pet-body" style="transform-origin: 112px 140px; transform: translateY(0px) rotate(0deg);">
    <path d="M 70,118 C 64,126 66,140 80,148 C 96,154 128,154 146,146 C 158,140 160,126 152,116 C 142,104 118,100 94,104 C 80,106 72,110 70,118 Z"
          fill="url(#luna-walk-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 96,108 Q 100,120 96,132" stroke="url(#luna-walk-stripes)" stroke-width="3.4" stroke-linecap="round" fill="none" />
    <path d="M 112,106 Q 116,118 112,132" stroke="url(#luna-walk-stripes)" stroke-width="3.4" stroke-linecap="round" fill="none" />
    <path d="M 128,108 Q 132,120 128,134" stroke="url(#luna-walk-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 72,122 C 70,132 76,142 88,146 C 96,148 104,146 108,140 C 104,128 92,118 80,116 Z"
          fill="url(#luna-walk-cream)" stroke="#34180C" stroke-width="1.6" stroke-linejoin="round" />
      <!-- seam-hip -->
    <path d="M 58,128 C 64,136 72,140 78,136 C 74,128 66,124 58,128 Z" fill="url(#luna-walk-fur)"/>
    <path d="M 142,128 C 136,136 128,140 122,136 C 126,128 134,124 142,128 Z" fill="url(#luna-walk-fur)"/>
</g>

  <g class="left-paw" style="transform-origin: 64px 134px;">
    <path d="M 58,132 L 54,156 C 53,162 58,168 66,168 C 73,168 76,162 76,156 L 72,132 Z"
          fill="url(#luna-walk-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="64" cy="168" rx="9" ry="4.8" fill="url(#luna-walk-cream)" stroke="#34180C" stroke-width="2" />
    <path d="M 60,165 L 60,170" stroke="#34180C" stroke-width="1.4" stroke-linecap="round" />
    <path d="M 68,165 L 68,170" stroke="#34180C" stroke-width="1.4" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 84px 132px;">
    <path d="M 80,130 L 84,150 C 86,152 90,156 98,154 C 102,152 102,146 98,140 L 90,130 Z"
          fill="url(#luna-walk-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="94" cy="154" rx="8" ry="4.2" fill="url(#luna-walk-cream)" stroke="#34180C" stroke-width="1.8" />
  </g>

  <g class="pet-head anim-breath" style="transform-origin: 58px 108px; transform: translateY(0px) rotate(0deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 46px 62px;">
      <path d="M 44,68 L 28,38 C 42,40 58,52 58,68 Z" fill="url(#luna-walk-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 42,66 L 32,46 C 42,48 52,58 50,66 Z" fill="url(#luna-walk-ear-inner)" />
      <path d="M 38,56 Q 42,52 48,60" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 70px 64px;">
      <path d="M 66,70 L 78,42 C 70,44 58,56 60,70 Z" fill="url(#luna-walk-fur-dark)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 66,68 L 74,50 C 68,52 60,60 62,68 Z" fill="url(#luna-walk-ear-inner)" />
    </g>

    <!-- seam-ruff -->
    <path d="M 66,108 C 72,122 84,132 96,128 C 90,118 80,112 66,108 Z" fill="url(#luna-walk-fur)"/>
    <path d="M 48,70 C 30,74 22,92 26,110 C 30,126 46,136 66,132 C 84,128 94,114 90,96 C 86,76 68,64 48,70 Z"
          fill="url(#luna-walk-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 58,72 L 54,86" stroke="url(#luna-walk-stripes)" stroke-width="3.2" stroke-linecap="round" />
    <path d="M 68,76 L 64,90" stroke="url(#luna-walk-stripes)" stroke-width="2.8" stroke-linecap="round" />
    <path d="M 44,92 Q 52,94 56,92" stroke="url(#luna-walk-stripes)" stroke-width="2.4" stroke-linecap="round" fill="none" />
    <path d="M 42,100 Q 50,102 56,100" stroke="url(#luna-walk-stripes)" stroke-width="2.4" stroke-linecap="round" fill="none" />
    <path d="M 32,104 Q 16,100 6,94" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 32,108 Q 16,108 4,110" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.9" />
    <path d="M 32,112 Q 16,116 8,122" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.95" />
    <ellipse cx="34" cy="110" rx="11" ry="8.5" fill="url(#luna-walk-cream)" stroke="#34180C" stroke-width="1.5" />
    <path d="M 24,106 L 30,106 L 26,110 Z" fill="#FF8585" stroke="#34180C" stroke-width="1" stroke-linejoin="round" />
    <path d="M 26,112 Q 32,116 36,112" stroke="#34180C" stroke-width="1.6" fill="none" stroke-linecap="round" />
    <ellipse cx="42" cy="112" rx="5" ry="3" fill="#FF7675" opacity="0.45" />
    <g class="anim-blink">
      <ellipse cx="52" cy="96" rx="11" ry="13" fill="url(#luna-walk-eye-iris)" stroke="#34180C" stroke-width="2.2" />
      <ellipse cx="52" cy="96" rx="7.5" ry="10" fill="#0E0502" />
      <circle class="pet-pupil" data-anchor-x="52" data-anchor-y="96" cx="52" cy="96" r="4.5" fill="#000000" />
      <circle cx="48" cy="90" r="3.8" fill="#FFFFFF" />
      <circle cx="56" cy="100" r="1.7" fill="#FFFFFF" />
    </g>
  </g>
</svg>
`;
const catSleepSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="luna-sleep-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EAA663" />
      <stop offset="50%" stop-color="#D08842" />
      <stop offset="100%" stop-color="#A85F28" />
    </linearGradient>
    <linearGradient id="luna-sleep-fur-dark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8C461A" />
      <stop offset="100%" stop-color="#602E0E" />
    </linearGradient>
    <linearGradient id="luna-sleep-stripes" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4E240F" />
      <stop offset="100%" stop-color="#341507" />
    </linearGradient>
    <linearGradient id="luna-sleep-cream" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF9" />
      <stop offset="50%" stop-color="#FFF5E6" />
      <stop offset="100%" stop-color="#FDE8CE" />
    </linearGradient>
    <linearGradient id="luna-sleep-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFBEB8" />
      <stop offset="100%" stop-color="#FFAAA3" />
    </linearGradient>
    <linearGradient id="luna-sleep-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1F0D05" />
      <stop offset="45%" stop-color="#3D1A0A" />
      <stop offset="85%" stop-color="#7A3912" />
      <stop offset="100%" stop-color="#A4551E" />
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="170" rx="50" ry="8" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 138px 128px; transform: rotate(0deg);">
    <path d="M 138,128 C 158,132 168,148 160,162 C 150,176 120,180 92,172 C 78,166 70,156 74,148 C 78,142 90,148 102,154 C 118,162 140,158 146,148 C 150,140 146,132 138,128 Z"
          fill="url(#luna-sleep-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 150,140 C 154,148 152,156 146,162" stroke="url(#luna-sleep-stripes)" stroke-width="3.4" stroke-linecap="round" fill="none" />
    <path d="M 138,156 C 128,164 112,168 98,166" stroke="url(#luna-sleep-stripes)" stroke-width="3.4" stroke-linecap="round" fill="none" />
    <path d="M 110,168 C 98,170 88,166 82,158" stroke="url(#luna-sleep-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
  </g>

  <g class="back-foot-left" style="transform-origin: 118px 148px;">
    <path d="M 116,146 C 112,152 114,160 120,164 C 126,166 132,162 132,156 C 132,150 124,146 118,146 Z"
          fill="url(#luna-sleep-fur)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="122" cy="162" rx="7" ry="4" fill="url(#luna-sleep-cream)" stroke="#34180C" stroke-width="1.6" />
  </g>
  <g class="back-foot-right" style="transform-origin: 140px 142px;">
    <path d="M 138,140 C 136,148 140,156 148,158 C 154,158 156,152 154,146 C 152,140 144,138 140,140 Z"
          fill="url(#luna-sleep-fur-dark)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="148" cy="156" rx="6.5" ry="3.6" fill="url(#luna-sleep-cream)" stroke="#34180C" stroke-width="1.6" />
  </g>

  <g class="anim-breath pet-body" style="transform-origin: 108px 138px; transform: translateY(0px) rotate(0deg);">
    <ellipse cx="108" cy="132" rx="46" ry="34" fill="url(#luna-sleep-fur)" stroke="#34180C" stroke-width="2.2" />
    <path d="M 118,108 Q 122,122 116,134" stroke="url(#luna-sleep-stripes)" stroke-width="3.6" stroke-linecap="round" fill="none" />
    <path d="M 132,114 Q 134,126 128,138" stroke="url(#luna-sleep-stripes)" stroke-width="3.6" stroke-linecap="round" fill="none" />
    <path d="M 100,112 Q 102,124 98,136" stroke="url(#luna-sleep-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 92,118 C 88,130 94,142 108,146 C 118,148 126,144 130,136" fill="url(#luna-sleep-cream)" stroke="#34180C" stroke-width="1.5" stroke-linejoin="round" />
      <!-- seam-hip -->
    <path d="M 58,128 C 64,136 72,140 78,136 C 74,128 66,124 58,128 Z" fill="url(#luna-sleep-fur)"/>
    <path d="M 142,128 C 136,136 128,140 122,136 C 126,128 134,124 142,128 Z" fill="url(#luna-sleep-fur)"/>
</g>

  <g class="left-paw" style="transform-origin: 86px 148px;">
    <path d="M 82,146 C 78,152 80,160 88,164 C 94,166 100,162 100,156 L 96,146 Z"
          fill="url(#luna-sleep-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="90" cy="162" rx="8" ry="4.2" fill="url(#luna-sleep-cream)" stroke="#34180C" stroke-width="1.8" />
    <path d="M 86,160 L 86,165" stroke="#34180C" stroke-width="1.3" stroke-linecap="round" />
    <path d="M 93,160 L 93,165" stroke="#34180C" stroke-width="1.3" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 102px 150px;">
    <path d="M 100,148 C 98,154 102,162 110,164 C 116,164 118,158 116,152 L 110,148 Z"
          fill="url(#luna-sleep-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="108" cy="162" rx="7.5" ry="4" fill="url(#luna-sleep-cream)" stroke="#34180C" stroke-width="1.8" />
  </g>

  <g class="pet-head anim-breath" style="transform-origin: 74px 122px; transform: translateY(0px) rotate(-18deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 62px 96px;">
      <path d="M 64,103 L 52,86 C 63,88 74,97 72,106 Z" fill="url(#luna-sleep-fur)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
      <path d="M 62,100 L 55,90 C 62,92 68,98 66,103 Z" fill="url(#luna-sleep-ear-inner)" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 86px 98px;">
      <path d="M 84,102 L 96,84 C 90,86 78,96 80,106 Z" fill="url(#luna-sleep-fur)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
      <path d="M 84,100 L 92,90 C 88,92 80,98 82,104 Z" fill="url(#luna-sleep-ear-inner)" />
    </g>

    <!-- seam-ruff -->
    <path d="M 56,132 C 64,142 78,148 90,144 C 80,136 66,132 56,132 Z" fill="url(#luna-sleep-fur)"/>
    <circle cx="74" cy="122" r="25" fill="url(#luna-sleep-fur)" stroke="#34180C" stroke-width="2.2" />
    <path d="M 82,104 L 80,113" stroke="url(#luna-sleep-stripes)" stroke-width="2.8" stroke-linecap="round" />
    <path d="M 88,108 L 86,117" stroke="url(#luna-sleep-stripes)" stroke-width="2.8" stroke-linecap="round" />
    <path d="M 58,118 Q 48,116 40,112" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.9" />
    <path d="M 58,122 Q 46,124 38,128" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.9" />
    <ellipse cx="70" cy="128" rx="9" ry="6.5" fill="url(#luna-sleep-cream)" stroke="#34180C" stroke-width="1.3" />
    <polygon points="70,126 76,126 73,128.5" fill="#FF8585" stroke="#34180C" stroke-width="0.8" />
    <path d="M 70,130 Q 73.5,132.5 77,130" stroke="#34180C" stroke-width="1.5" fill="none" stroke-linecap="round" />
    <ellipse cx="64" cy="128" rx="5" ry="2.8" fill="#FF7675" opacity="0.5" />
    <g class="anim-blink">
      <path d="M 63,120 Q 68,115 73,120" stroke="#34180C" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <path d="M 78,120 Q 83,115 88,120" stroke="#34180C" stroke-width="2.5" stroke-linecap="round" fill="none" />
    </g>
  </g>
</svg>
`;
const catSitSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="luna-sit-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EAA663" />
      <stop offset="50%" stop-color="#D08842" />
      <stop offset="100%" stop-color="#A85F28" />
    </linearGradient>
    <linearGradient id="luna-sit-fur-dark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8C461A" />
      <stop offset="100%" stop-color="#602E0E" />
    </linearGradient>
    <linearGradient id="luna-sit-stripes" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4E240F" />
      <stop offset="100%" stop-color="#341507" />
    </linearGradient>
    <linearGradient id="luna-sit-cream" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF9" />
      <stop offset="50%" stop-color="#FFF5E6" />
      <stop offset="100%" stop-color="#FDE8CE" />
    </linearGradient>
    <linearGradient id="luna-sit-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFBEB8" />
      <stop offset="100%" stop-color="#FFAAA3" />
    </linearGradient>
    <linearGradient id="luna-sit-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1F0D05" />
      <stop offset="45%" stop-color="#3D1A0A" />
      <stop offset="85%" stop-color="#7A3912" />
      <stop offset="100%" stop-color="#A4551E" />
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="170" rx="55" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g id="cat-tail" class="anim-wag" style="transform-origin: 70px 140px; transform: rotate(0deg);">
    <path d="M 72,140 C 52,145 34,130 30,108 C 26,88 38,72 52,76 C 56,78 54,90 48,96 C 42,104 46,120 60,126 C 66,129 71,133 75,138 Z"
          fill="url(#luna-sit-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 36,90 C 42,94 46,100 46,106" stroke="url(#luna-sit-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    <path d="M 40,108 C 47,112 51,118 49,124" stroke="url(#luna-sit-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    <path d="M 52,124 C 58,128 62,133 58,137" stroke="url(#luna-sit-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
  </g>

  <g class="back-foot-left" style="transform-origin: 58px 132px;">
    <path d="M 58,132 C 48,142 48,156 55,164 C 60,168 68,168 74,165 C 77,161 76,146 71,136 Z"
          fill="url(#luna-sit-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 50,146 Q 58,148 63,152" stroke="url(#luna-sit-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 52,154 Q 60,156 65,159" stroke="url(#luna-sit-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <ellipse cx="54" cy="165" rx="8" ry="4.5" fill="url(#luna-sit-cream)" stroke="#34180C" stroke-width="1.8" />
  </g>
  <g class="back-foot-right" style="transform-origin: 142px 132px;">
    <path d="M 142,132 C 152,142 152,156 145,164 C 140,168 132,168 126,165 C 123,161 124,146 129,136 Z"
          fill="url(#luna-sit-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 150,146 Q 142,148 137,152" stroke="url(#luna-sit-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 148,154 Q 140,156 135,159" stroke="url(#luna-sit-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <ellipse cx="146" cy="165" rx="8" ry="4.5" fill="url(#luna-sit-cream)" stroke="#34180C" stroke-width="1.8" />
  </g>

  <g class="anim-breath pet-body" style="transform-origin: 100px 165px; transform: translateY(0px) rotate(0deg);">
    <path d="M 68,105 C 63,122 65,140 76,150 C 88,155 112,155 124,150 C 135,140 137,122 132,105 Z"
          fill="url(#luna-sit-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 70,120 Q 78,123 82,127" stroke="url(#luna-sit-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 71,132 Q 79,134 84,138" stroke="url(#luna-sit-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 130,120 Q 122,123 118,127" stroke="url(#luna-sit-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 129,132 Q 121,134 116,138" stroke="url(#luna-sit-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 80,94 C 74,108 72,122 79,132 C 84,138 92,144 100,146 C 108,144 116,138 121,132 C 128,122 126,108 120,94 C 112,104 88,104 80,94 Z"
          fill="url(#luna-sit-cream)" stroke="#34180C" stroke-width="1.8" stroke-linejoin="round" />
    <path d="M 88,128 C 94,136 106,136 112,128" stroke="#34180C" stroke-width="1.4" fill="none" />
      <!-- seam-hip -->
    <path d="M 58,128 C 64,136 72,140 78,136 C 74,128 66,124 58,128 Z" fill="url(#luna-sit-fur)"/>
    <path d="M 142,128 C 136,136 128,140 122,136 C 126,128 134,124 142,128 Z" fill="url(#luna-sit-fur)"/>
</g>

  <g class="left-paw" style="transform-origin: 83px 132px;">
    <path d="M 76,132 L 75,155 C 75,161 78,165 83,165 C 88,165 91,161 91,155 L 90,132 Z"
          fill="url(#luna-sit-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="83" cy="164" rx="9.5" ry="5.5" fill="url(#luna-sit-cream)" stroke="#34180C" stroke-width="2" />
    <path d="M 79,162 L 79,167" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 86,162 L 86,167" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 117px 132px;">
    <path d="M 110,132 L 109,155 C 109,161 112,165 117,165 C 122,165 125,161 125,155 L 124,132 Z"
          fill="url(#luna-sit-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="117" cy="164" rx="9.5" ry="5.5" fill="url(#luna-sit-cream)" stroke="#34180C" stroke-width="2" />
    <path d="M 113,162 L 113,167" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 120,162 L 120,167" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="pet-head anim-breath" style="transform-origin: 100px 105px; transform: translateY(0px) rotate(0deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 64px 55px;">
      <path d="M 60,58 L 46,26 C 60,29 76,42 76,56 Z" fill="url(#luna-sit-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 56,54 L 49,33 C 58,36 68,45 66,54 Z" fill="url(#luna-sit-ear-inner)" />
      <path d="M 52,48 Q 57,44 62,51" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 136px 55px;">
      <path d="M 140,58 L 154,26 C 140,29 124,42 124,56 Z" fill="url(#luna-sit-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 144,54 L 151,33 C 142,36 132,45 134,54 Z" fill="url(#luna-sit-ear-inner)" />
      <path d="M 148,48 Q 143,44 138,51" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" />
    </g>

    <!-- seam-ruff -->
    <path d="M 62,100 C 72,114 84,120 100,121 C 116,120 128,114 138,100 C 124,112 76,112 62,100 Z" fill="url(#luna-sit-fur)"/>
    <path d="M 56,62 C 50,52 68,38 100,38 C 132,38 150,52 144,62
             C 154,66 159,74 152,80
             C 159,84 161,93 150,97
             C 154,101 148,109 137,109
             C 126,115 74,115 63,109
             C 52,109 46,101 50,97
             C 39,93 41,84 48,80
             C 41,74 46,66 56,62 Z"
          fill="url(#luna-sit-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 100,40 L 100,54" stroke="url(#luna-sit-stripes)" stroke-width="3.8" stroke-linecap="round" />
    <path d="M 91,44 Q 93,52 88,56" stroke="url(#luna-sit-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 109,44 Q 107,52 112,56" stroke="url(#luna-sit-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 82,49 Q 86,56 81,60" stroke="url(#luna-sit-stripes)" stroke-width="2.6" stroke-linecap="round" fill="none" />
    <path d="M 118,49 Q 114,56 119,60" stroke="url(#luna-sit-stripes)" stroke-width="2.6" stroke-linecap="round" fill="none" />
    <path d="M 54,74 Q 63,76 67,74" stroke="url(#luna-sit-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 52,83 Q 61,83 67,82" stroke="url(#luna-sit-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 146,74 Q 137,76 133,74" stroke="url(#luna-sit-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 148,83 Q 139,83 133,82" stroke="url(#luna-sit-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 54,86 Q 38,84 28,81" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 53,88.5 Q 36,88.5 24,89" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.9" />
    <path d="M 52,91 Q 36,93 26,97" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 146,86 Q 162,84 172,81" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 147,88.5 Q 164,88.5 176,89" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.9" />
    <path d="M 148,91 Q 164,93 174,97" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <ellipse cx="100" cy="86" rx="14" ry="10" fill="url(#luna-sit-cream)" stroke="#34180C" stroke-width="1.5" />
    <path d="M 97,80 L 103,80 L 100,83 Z" fill="#FF8585" stroke="#34180C" stroke-width="1" stroke-linejoin="round" />
    <path d="M 95,84 Q 100,87 100,84 Q 100,87 105,84" stroke="#34180C" stroke-width="1.8" fill="none" stroke-linecap="round" />
    <path d="M 97,85 Q 100,91 103,85 Z" fill="#FF7675" stroke="#34180C" stroke-width="1" />
    <ellipse cx="64" cy="86" rx="7" ry="4" fill="#FF7675" opacity="0.45" />
    <ellipse cx="136" cy="86" rx="7" ry="4" fill="#FF7675" opacity="0.45" />
    <g class="anim-blink">
      <ellipse cx="82" cy="72" rx="13" ry="15" fill="url(#luna-sit-eye-iris)" stroke="#34180C" stroke-width="2.2" />
      <ellipse cx="82" cy="72" rx="9" ry="11" fill="#0E0502" />
      <circle class="pet-pupil" data-anchor-x="82" data-anchor-y="72" cx="82" cy="72" r="5" fill="#000000" />
      <circle cx="78" cy="66" r="4.5" fill="#FFFFFF" />
      <circle cx="87" cy="77" r="2" fill="#FFFFFF" />
      <circle cx="77" cy="75" r="1.2" fill="#FFFFFF" opacity="0.75" />
      <ellipse cx="118" cy="72" rx="13" ry="15" fill="url(#luna-sit-eye-iris)" stroke="#34180C" stroke-width="2.2" />
      <ellipse cx="118" cy="72" rx="9" ry="11" fill="#0E0502" />
      <circle class="pet-pupil" data-anchor-x="118" data-anchor-y="72" cx="118" cy="72" r="5" fill="#000000" />
      <circle cx="114" cy="66" r="4.5" fill="#FFFFFF" />
      <circle cx="123" cy="77" r="2" fill="#FFFFFF" />
      <circle cx="113" cy="75" r="1.2" fill="#FFFFFF" opacity="0.75" />
    </g>
  </g>
</svg>
`;
const catLaySVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="luna-lay-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EAA663" />
      <stop offset="50%" stop-color="#D08842" />
      <stop offset="100%" stop-color="#A85F28" />
    </linearGradient>
    <linearGradient id="luna-lay-fur-dark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8C461A" />
      <stop offset="100%" stop-color="#602E0E" />
    </linearGradient>
    <linearGradient id="luna-lay-stripes" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4E240F" />
      <stop offset="100%" stop-color="#341507" />
    </linearGradient>
    <linearGradient id="luna-lay-cream" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF9" />
      <stop offset="50%" stop-color="#FFF5E6" />
      <stop offset="100%" stop-color="#FDE8CE" />
    </linearGradient>
    <linearGradient id="luna-lay-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFBEB8" />
      <stop offset="100%" stop-color="#FFAAA3" />
    </linearGradient>
    <linearGradient id="luna-lay-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1F0D05" />
      <stop offset="45%" stop-color="#3D1A0A" />
      <stop offset="85%" stop-color="#7A3912" />
      <stop offset="100%" stop-color="#A4551E" />
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="170" rx="68" ry="8" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 46px 150px; transform: rotate(0deg);">
    <path d="M 48,150 C 28,154 16,144 14,128 C 12,112 24,102 36,106 C 40,108 38,118 32,124 C 28,130 32,142 44,148 Z"
          fill="url(#luna-lay-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 22,118 C 28,122 32,128 30,134" stroke="url(#luna-lay-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 28,132 C 34,136 38,142 36,148" stroke="url(#luna-lay-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
  </g>

  <g class="back-foot-left" style="transform-origin: 58px 140px;">
    <path d="M 56,138 C 46,144 44,156 50,164 C 54,168 64,168 70,164 C 74,158 72,144 64,138 Z"
          fill="url(#luna-lay-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 50,150 Q 58,154 62,158" stroke="url(#luna-lay-stripes)" stroke-width="2.8" stroke-linecap="round" fill="none" />
    <ellipse cx="54" cy="166" rx="8" ry="4.2" fill="url(#luna-lay-cream)" stroke="#34180C" stroke-width="1.8" />
  </g>
  <g class="back-foot-right" style="transform-origin: 142px 140px;">
    <path d="M 144,138 C 154,144 156,156 150,164 C 146,168 136,168 130,164 C 126,158 128,144 136,138 Z"
          fill="url(#luna-lay-fur-dark)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 150,150 Q 142,154 138,158" stroke="url(#luna-lay-stripes)" stroke-width="2.8" stroke-linecap="round" fill="none" />
    <ellipse cx="146" cy="166" rx="8" ry="4.2" fill="url(#luna-lay-cream)" stroke="#34180C" stroke-width="1.8" />
  </g>

  <g class="anim-breath pet-body" style="transform-origin: 100px 148px; transform: translateY(0px) rotate(0deg);">
    <path d="M 42,128 C 36,138 42,156 70,160 C 88,164 112,164 130,160 C 158,156 164,138 158,128 C 150,116 50,116 42,128 Z"
          fill="url(#luna-lay-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 56,130 Q 64,136 68,144" stroke="url(#luna-lay-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 144,130 Q 136,136 132,144" stroke="url(#luna-lay-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 60,140 Q 68,144 72,150" stroke="url(#luna-lay-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 140,140 Q 132,144 128,150" stroke="url(#luna-lay-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 78,118 C 72,128 74,142 86,150 C 94,154 106,154 114,150 C 126,142 128,128 122,118 C 114,124 86,124 78,118 Z"
          fill="url(#luna-lay-cream)" stroke="#34180C" stroke-width="1.6" stroke-linejoin="round" />
      <!-- seam-hip -->
    <path d="M 58,128 C 64,136 72,140 78,136 C 74,128 66,124 58,128 Z" fill="url(#luna-lay-fur)"/>
    <path d="M 142,128 C 136,136 128,140 122,136 C 126,128 134,124 142,128 Z" fill="url(#luna-lay-fur)"/>
</g>

  <g class="left-paw" style="transform-origin: 72px 148px;">
    <path d="M 70,146 L 58,158 C 54,164 58,168 68,168 C 78,168 84,164 84,158 L 82,146 Z"
          fill="url(#luna-lay-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="70" cy="167" rx="10" ry="5" fill="url(#luna-lay-cream)" stroke="#34180C" stroke-width="2" />
    <path d="M 64,164 L 64,169" stroke="#34180C" stroke-width="1.4" stroke-linecap="round" />
    <path d="M 74,164 L 74,169" stroke="#34180C" stroke-width="1.4" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 128px 148px;">
    <path d="M 118,146 L 116,158 C 116,164 122,168 132,168 C 142,168 146,164 142,158 L 130,146 Z"
          fill="url(#luna-lay-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="130" cy="167" rx="10" ry="5" fill="url(#luna-lay-cream)" stroke="#34180C" stroke-width="2" />
    <path d="M 124,164 L 124,169" stroke="#34180C" stroke-width="1.4" stroke-linecap="round" />
    <path d="M 134,164 L 134,169" stroke="#34180C" stroke-width="1.4" stroke-linecap="round" />
  </g>

  <g class="pet-head anim-breath" style="transform-origin: 100px 123px; transform: translateY(0px) rotate(0deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 64px 73px;">
      <path d="M 60,76 L 46,44 C 60,47 76,60 76,74 Z" fill="url(#luna-lay-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 56,72 L 49,51 C 58,54 68,63 66,72 Z" fill="url(#luna-lay-ear-inner)" />
      <path d="M 52,66 Q 57,62 62,69" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 136px 73px;">
      <path d="M 140,76 L 154,44 C 140,47 124,60 124,74 Z" fill="url(#luna-lay-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 144,72 L 151,51 C 142,54 132,63 134,72 Z" fill="url(#luna-lay-ear-inner)" />
      <path d="M 148,66 Q 143,62 138,69" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" />
    </g>

    <!-- seam-ruff -->
    <path d="M 62,118 C 74,132 90,138 108,134 C 94,124 76,118 62,118 Z" fill="url(#luna-lay-fur)"/>
    <path d="M 56,80 C 50,70 68,56 100,56 C 132,56 150,70 144,80
             C 154,84 159,92 152,98
             C 159,102 161,111 150,115
             C 154,119 148,127 137,127
             C 126,133 74,133 63,127
             C 52,127 46,119 50,115
             C 39,111 41,102 48,98
             C 41,92 46,84 56,80 Z"
          fill="url(#luna-lay-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 100,58 L 100,72" stroke="url(#luna-lay-stripes)" stroke-width="3.8" stroke-linecap="round" />
    <path d="M 91,62 Q 93,70 88,74" stroke="url(#luna-lay-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 109,62 Q 107,70 112,74" stroke="url(#luna-lay-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 82,67 Q 86,74 81,78" stroke="url(#luna-lay-stripes)" stroke-width="2.6" stroke-linecap="round" fill="none" />
    <path d="M 118,67 Q 114,74 119,78" stroke="url(#luna-lay-stripes)" stroke-width="2.6" stroke-linecap="round" fill="none" />
    <path d="M 54,92 Q 63,94 67,92" stroke="url(#luna-lay-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 52,101 Q 61,101 67,100" stroke="url(#luna-lay-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 146,92 Q 137,94 133,92" stroke="url(#luna-lay-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 148,101 Q 139,101 133,100" stroke="url(#luna-lay-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 54,104 Q 38,102 28,99" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 53,106.5 Q 36,106.5 24,107" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.9" />
    <path d="M 52,109 Q 36,111 26,115" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 146,104 Q 162,102 172,99" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 147,106.5 Q 164,106.5 176,107" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.9" />
    <path d="M 148,109 Q 164,111 174,115" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <ellipse cx="100" cy="104" rx="14" ry="10" fill="url(#luna-lay-cream)" stroke="#34180C" stroke-width="1.5" />
    <path d="M 97,98 L 103,98 L 100,101 Z" fill="#FF8585" stroke="#34180C" stroke-width="1" stroke-linejoin="round" />
    <path d="M 95,102 Q 100,105 100,102 Q 100,105 105,102" stroke="#34180C" stroke-width="1.8" fill="none" stroke-linecap="round" />
    <path d="M 97,103 Q 100,109 103,103 Z" fill="#FF7675" stroke="#34180C" stroke-width="1" />
    <ellipse cx="64" cy="104" rx="7" ry="4" fill="#FF7675" opacity="0.45" />
    <ellipse cx="136" cy="104" rx="7" ry="4" fill="#FF7675" opacity="0.45" />
    <g class="anim-blink">
      <path d="M 69,80 C 74,86 90,86 95,80" fill="url(#luna-lay-fur)" stroke="#34180C" stroke-width="1.6" stroke-linejoin="round" />
      <path d="M 105,80 C 110,86 126,86 131,80" fill="url(#luna-lay-fur)" stroke="#34180C" stroke-width="1.6" stroke-linejoin="round" />
      <ellipse cx="82" cy="90" rx="13" ry="15" fill="url(#luna-lay-eye-iris)" stroke="#34180C" stroke-width="2.2" />
      <ellipse cx="82" cy="90" rx="9" ry="11" fill="#0E0502" />
      <circle class="pet-pupil" data-anchor-x="82" data-anchor-y="90" cx="82" cy="90" r="5" fill="#000000" />
      <circle cx="78" cy="84" r="4.5" fill="#FFFFFF" />
      <circle cx="87" cy="95" r="2" fill="#FFFFFF" />
      <circle cx="77" cy="93" r="1.2" fill="#FFFFFF" opacity="0.75" />
      <ellipse cx="118" cy="90" rx="13" ry="15" fill="url(#luna-lay-eye-iris)" stroke="#34180C" stroke-width="2.2" />
      <ellipse cx="118" cy="90" rx="9" ry="11" fill="#0E0502" />
      <circle class="pet-pupil" data-anchor-x="118" data-anchor-y="90" cx="118" cy="90" r="5" fill="#000000" />
      <circle cx="114" cy="84" r="4.5" fill="#FFFFFF" />
      <circle cx="123" cy="95" r="2" fill="#FFFFFF" />
      <circle cx="113" cy="93" r="1.2" fill="#FFFFFF" opacity="0.75" />
    </g>
  </g>
</svg>
`;
const catStretchSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="luna-stretch-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EAA663" />
      <stop offset="50%" stop-color="#D08842" />
      <stop offset="100%" stop-color="#A85F28" />
    </linearGradient>
    <linearGradient id="luna-stretch-fur-dark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8C461A" />
      <stop offset="100%" stop-color="#602E0E" />
    </linearGradient>
    <linearGradient id="luna-stretch-stripes" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4E240F" />
      <stop offset="100%" stop-color="#341507" />
    </linearGradient>
    <linearGradient id="luna-stretch-cream" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF9" />
      <stop offset="50%" stop-color="#FFF5E6" />
      <stop offset="100%" stop-color="#FDE8CE" />
    </linearGradient>
    <linearGradient id="luna-stretch-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFBEB8" />
      <stop offset="100%" stop-color="#FFAAA3" />
    </linearGradient>
    <linearGradient id="luna-stretch-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1F0D05" />
      <stop offset="45%" stop-color="#3D1A0A" />
      <stop offset="85%" stop-color="#7A3912" />
      <stop offset="100%" stop-color="#A4551E" />
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="170" rx="62" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 152px 88px; transform: rotate(0deg);">
    <path d="M 152,90 C 160,70 168,48 158,32 C 150,20 136,24 136,38 C 136,46 146,54 148,66 C 150,76 150,84 152,90 Z"
          fill="url(#luna-stretch-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 148,40 C 152,48 152,56 148,64" stroke="url(#luna-stretch-stripes)" stroke-width="3.4" stroke-linecap="round" fill="none" />
    <path d="M 148,62 C 152,70 152,78 148,84" stroke="url(#luna-stretch-stripes)" stroke-width="3.4" stroke-linecap="round" fill="none" />
  </g>

  <g class="back-foot-left" style="transform-origin: 128px 118px;">
    <path d="M 126,116 C 118,128 118,150 124,166 C 126,169 136,169 142,164 C 146,156 144,132 136,118 Z"
          fill="url(#luna-stretch-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 124,136 Q 130,142 134,150" stroke="url(#luna-stretch-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <ellipse cx="132" cy="167" rx="8.5" ry="4.5" fill="url(#luna-stretch-cream)" stroke="#34180C" stroke-width="1.8" />
  </g>
  <g class="back-foot-right" style="transform-origin: 150px 114px;">
    <path d="M 148,112 C 144,126 146,150 152,166 C 154,169 164,169 168,164 C 170,156 166,130 158,114 Z"
          fill="url(#luna-stretch-fur-dark)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <ellipse cx="158" cy="167" rx="8" ry="4.2" fill="url(#luna-stretch-cream)" stroke="#34180C" stroke-width="1.8" />
  </g>

  <g class="anim-breath pet-body" style="transform-origin: 120px 120px; transform: translateY(0px) rotate(0deg);">
    <path d="M 70,138 C 62,148 70,156 92,150 C 114,142 138,118 152,100 C 160,90 158,80 146,78 C 128,76 108,96 90,118 C 80,130 74,134 70,138 Z"
          fill="url(#luna-stretch-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 96,128 Q 108,118 118,106" stroke="url(#luna-stretch-stripes)" stroke-width="3.4" stroke-linecap="round" fill="none" />
    <path d="M 108,120 Q 122,108 132,96" stroke="url(#luna-stretch-stripes)" stroke-width="3.4" stroke-linecap="round" fill="none" />
    <path d="M 122,108 Q 134,96 142,88" stroke="url(#luna-stretch-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 74,132 C 70,140 76,148 90,146 C 100,144 108,138 110,130 C 100,126 86,126 74,132 Z"
          fill="url(#luna-stretch-cream)" stroke="#34180C" stroke-width="1.6" stroke-linejoin="round" />
      <!-- seam-hip -->
    <path d="M 58,128 C 64,136 72,140 78,136 C 74,128 66,124 58,128 Z" fill="url(#luna-stretch-fur)"/>
    <path d="M 142,128 C 136,136 128,140 122,136 C 126,128 134,124 142,128 Z" fill="url(#luna-stretch-fur)"/>
</g>

  <g class="left-paw" style="transform-origin: 42px 148px;">
    <path d="M 48,142 L 28,158 C 22,164 26,169 40,169 C 52,169 60,164 60,158 L 62,146 Z"
          fill="url(#luna-stretch-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="40" cy="168" rx="11" ry="5" fill="url(#luna-stretch-cream)" stroke="#34180C" stroke-width="2" />
    <path d="M 34,165 L 34,170" stroke="#34180C" stroke-width="1.4" stroke-linecap="round" />
    <path d="M 46,165 L 46,170" stroke="#34180C" stroke-width="1.4" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 62px 148px;">
    <path d="M 66,140 L 52,158 C 48,164 54,169 66,169 C 78,169 84,164 82,158 L 80,142 Z"
          fill="url(#luna-stretch-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="64" cy="168" rx="10" ry="5" fill="url(#luna-stretch-cream)" stroke="#34180C" stroke-width="2" />
    <path d="M 58,165 L 58,170" stroke="#34180C" stroke-width="1.4" stroke-linecap="round" />
    <path d="M 70,165 L 70,170" stroke="#34180C" stroke-width="1.4" stroke-linecap="round" />
  </g>

  <g class="pet-head anim-breath" style="transform-origin: 80px 139px; transform: translateY(0px) rotate(-14deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 44px 89px;">
      <path d="M 40,92 L 26,60 C 40,63 56,76 56,90 Z" fill="url(#luna-stretch-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 36,88 L 29,67 C 38,70 48,79 46,88 Z" fill="url(#luna-stretch-ear-inner)" />
      <path d="M 32,82 Q 37,78 42,85" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 116px 89px;">
      <path d="M 120,92 L 134,60 C 120,63 104,76 104,90 Z" fill="url(#luna-stretch-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 124,88 L 131,67 C 122,70 112,79 114,88 Z" fill="url(#luna-stretch-ear-inner)" />
      <path d="M 128,82 Q 123,78 118,85" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" />
    </g>

    <!-- seam-ruff -->
    <path d="M 40,118 C 50,128 64,132 78,126 C 66,118 50,116 40,118 Z" fill="url(#luna-stretch-fur)"/>
    <path d="M 36,96 C 30,86 48,72 80,72 C 112,72 130,86 124,96
             C 134,100 139,108 132,114
             C 139,118 141,127 130,131
             C 134,135 128,143 117,143
             C 106,149 54,149 43,143
             C 32,143 26,135 30,131
             C 19,127 21,118 28,114
             C 21,108 26,100 36,96 Z"
          fill="url(#luna-stretch-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 80,74 L 80,88" stroke="url(#luna-stretch-stripes)" stroke-width="3.8" stroke-linecap="round" />
    <path d="M 71,78 Q 73,86 68,90" stroke="url(#luna-stretch-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 89,78 Q 87,86 92,90" stroke="url(#luna-stretch-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 62,83 Q 66,90 61,94" stroke="url(#luna-stretch-stripes)" stroke-width="2.6" stroke-linecap="round" fill="none" />
    <path d="M 98,83 Q 94,90 99,94" stroke="url(#luna-stretch-stripes)" stroke-width="2.6" stroke-linecap="round" fill="none" />
    <path d="M 34,108 Q 43,110 47,108" stroke="url(#luna-stretch-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 32,117 Q 41,117 47,116" stroke="url(#luna-stretch-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 126,108 Q 117,110 113,108" stroke="url(#luna-stretch-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 128,117 Q 119,117 113,116" stroke="url(#luna-stretch-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 34,120 Q 18,118 8,115" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 33,122.5 Q 16,122.5 4,123" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.9" />
    <path d="M 32,125 Q 16,127 6,131" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 126,120 Q 142,118 152,115" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 127,122.5 Q 144,122.5 156,123" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.9" />
    <path d="M 128,125 Q 144,127 154,131" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <ellipse cx="80" cy="120" rx="14" ry="10" fill="url(#luna-stretch-cream)" stroke="#34180C" stroke-width="1.5" />
    <path d="M 77,114 L 83,114 L 80,117 Z" fill="#FF8585" stroke="#34180C" stroke-width="1" stroke-linejoin="round" />
    <path d="M 75,118 Q 80,121 80,118 Q 80,121 85,118" stroke="#34180C" stroke-width="1.8" fill="none" stroke-linecap="round" />
    <path d="M 77,119 Q 80,125 83,119 Z" fill="#FF7675" stroke="#34180C" stroke-width="1" />
    <ellipse cx="44" cy="120" rx="7" ry="4" fill="#FF7675" opacity="0.45" />
    <ellipse cx="116" cy="120" rx="7" ry="4" fill="#FF7675" opacity="0.45" />
    <g class="anim-blink">
      <ellipse cx="62" cy="106" rx="13" ry="15" fill="url(#luna-stretch-eye-iris)" stroke="#34180C" stroke-width="2.2" />
      <ellipse cx="62" cy="106" rx="9" ry="11" fill="#0E0502" />
      <circle class="pet-pupil" data-anchor-x="62" data-anchor-y="106" cx="62" cy="106" r="5" fill="#000000" />
      <circle cx="58" cy="100" r="4.5" fill="#FFFFFF" />
      <circle cx="67" cy="111" r="2" fill="#FFFFFF" />
      <circle cx="57" cy="109" r="1.2" fill="#FFFFFF" opacity="0.75" />
      <ellipse cx="98" cy="106" rx="13" ry="15" fill="url(#luna-stretch-eye-iris)" stroke="#34180C" stroke-width="2.2" />
      <ellipse cx="98" cy="106" rx="9" ry="11" fill="#0E0502" />
      <circle class="pet-pupil" data-anchor-x="98" data-anchor-y="106" cx="98" cy="106" r="5" fill="#000000" />
      <circle cx="94" cy="100" r="4.5" fill="#FFFFFF" />
      <circle cx="103" cy="111" r="2" fill="#FFFFFF" />
      <circle cx="93" cy="109" r="1.2" fill="#FFFFFF" opacity="0.75" />
    </g>
  </g>
</svg>
`;

const catWalk1SVG = catWalkSVG;
const catWalk2SVG = catWalkSVG;
const catWalk3SVG = catWalkSVG;
const catWalk4SVG = catWalkSVG;
const catWalkFrames = [catWalkSVG];
const catSitBlinkSVG = catSitSVG;
const catLayBreatheSVG = catLaySVG;
const catSVG = catIdleSVG;

function getCatPartsForState(state) {
  const scope = typeof window !== "undefined" ? window : {};
  const STATE_TO_FRAMES = {
    idle: ["Idle"],
    walking: ["Walk"],
    sleeping: ["Sleep"],
    sitting: ["Sit"],
    laying: ["Lay"],
    stretching: ["Stretch"],
  };
  const frames = STATE_TO_FRAMES[state] || ["Idle"];
  const fallback = {
    Idle: catIdleSVG,
    Walk: catWalkSVG,
    Walk1: catWalkSVG,
    Walk2: catWalkSVG,
    Walk3: catWalkSVG,
    Walk4: catWalkSVG,
    Sleep: catSleepSVG,
    Sit: catSitSVG,
    SitBlink: catSitSVG,
    Lay: catLaySVG,
    LayBreathe: catLaySVG,
    Stretch: catStretchSVG,
  };
  return frames.map(name => ({
    head: null,
    body: scope["cat" + name + "SVG"] || fallback[name] || catIdleSVG,
    tail: null,
    backLegLeft: null,
    backLegRight: null,
    frontLegLeft: null,
    frontLegRight: null,
  }));
}

if (typeof window !== "undefined") {
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
  window.catLaySVG = catLaySVG;
  window.catLayBreatheSVG = catLayBreatheSVG;
  window.catStretchSVG = catStretchSVG;
  window.catSVG = catSVG;
  window.getCatPartsForState = getCatPartsForState;
}

if (typeof module !== "undefined" && module.exports) {
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
    catLaySVG,
    catLayBreatheSVG,
    catStretchSVG,
    catSVG,
    getCatPartsForState
  };
}
