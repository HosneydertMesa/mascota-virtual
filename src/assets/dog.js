/* Mascot Dog Assets - Shiba Chibi 2D Anime Illustration */
const dogIdleSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="max-idle-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="50%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="max-idle-white" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FFFBEB" />
    </linearGradient>
    <linearGradient id="max-idle-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FECDD3" />
      <stop offset="100%" stop-color="#FDA4AF" />
    </linearGradient>
    <linearGradient id="max-idle-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D150B" />
      <stop offset="40%" stop-color="#1A0C06" />
      <stop offset="85%" stop-color="#78350F" />
      <stop offset="100%" stop-color="#92400E" />
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="170" rx="52" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 68px 126px;">
    <path d="M 70,126 C 52,128 32,114 28,90 C 26,70 40,56 52,62 C 58,64 56,76 48,82 C 42,88 46,106 62,118 Z"
          fill="url(#max-idle-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 40,70 C 34,77 32,85 34,93" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none" />
  </g>

  <g class="back-foot-left" style="transform-origin: 60px 124px;">
    <path d="M 56,122 C 48,134 46,152 54,164 C 58,170 70,170 74,162 C 76,150 72,132 66,122 Z"
          fill="url(#max-idle-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <ellipse cx="56" cy="167" rx="8.5" ry="5" fill="url(#max-idle-white)" stroke="#3B1E12" stroke-width="1.8" />
  </g>
  <g class="back-foot-right" style="transform-origin: 140px 124px;">
    <path d="M 144,122 C 152,134 154,152 146,164 C 142,170 130,170 126,162 C 124,150 128,132 134,122 Z"
          fill="url(#max-idle-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <ellipse cx="144" cy="167" rx="8.5" ry="5" fill="url(#max-idle-white)" stroke="#3B1E12" stroke-width="1.8" />
  </g>

  <g class="left-paw" style="transform-origin: 76px 120px;">
    <path d="M 68,118 L 66,154 C 66,162 70,168 78,168 C 86,168 90,162 90,154 L 88,118 Z"
          fill="url(#max-idle-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="78" cy="166" rx="10" ry="6" fill="url(#max-idle-white)" stroke="#3B1E12" stroke-width="2" />
    <path d="M 74,164 L 74,170" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
    <path d="M 82,164 L 82,170" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 124px 120px;">
    <path d="M 112,118 L 110,154 C 110,162 114,168 122,168 C 130,168 134,162 134,154 L 132,118 Z"
          fill="url(#max-idle-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="122" cy="166" rx="10" ry="6" fill="url(#max-idle-white)" stroke="#3B1E12" stroke-width="2" />
    <path d="M 118,164 L 118,170" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
    <path d="M 126,164 L 126,170" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
  </g>

  <g class="pet-body anim-breath" style="transform-origin: 100px 136px;">
    <path d="M 70,98 C 64,110 66,126 80,134 C 90,138 110,138 120,134 C 134,126 136,110 130,98 Z"
          fill="url(#max-idle-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 82,92 C 76,104 74,116 82,124 C 88,130 94,134 100,136 C 106,134 112,130 118,124 C 126,116 124,104 118,92 C 111,102 89,102 82,92 Z"
          fill="url(#max-idle-white)" stroke="#3B1E12" stroke-width="1.8" stroke-linejoin="round" />
      <!-- seam-hip -->
    <path d="M 58,128 C 64,136 72,140 78,136 C 74,128 66,124 58,128 Z" fill="url(#max-idle-fur)"/>
    <path d="M 142,128 C 136,136 128,140 122,136 C 126,128 134,124 142,128 Z" fill="url(#max-idle-fur)"/>
</g>

  <g class="pet-head" style="transform-origin: 100px 100px;">
    <g class="pet-ear pet-ear-left" style="transform-origin: 58px 48px;">
      <path d="M 60,50 C 42,50 32,66 34,88 C 36,100 46,104 52,94 C 58,84 64,70 62,50 Z" fill="url(#max-idle-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 48,60 C 42,68 40,80 44,88" stroke="url(#max-idle-ear-inner)" stroke-width="4" stroke-linecap="round" fill="none" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 142px 48px;">
      <path d="M 140,50 C 158,50 168,66 166,88 C 164,100 154,104 148,94 C 142,84 136,70 138,50 Z" fill="url(#max-idle-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 152,60 C 158,68 160,80 156,88" stroke="url(#max-idle-ear-inner)" stroke-width="4" stroke-linecap="round" fill="none" />
    </g>

    <!-- seam-ruff -->
    <path d="M 62,96 C 74,112 86,118 100,118 C 114,118 126,112 138,96 C 124,108 76,108 62,96 Z" fill="url(#max-idle-fur)"/>
    <path d="M 54,58 C 48,46 68,32 100,32 C 132,32 152,46 146,58 C 158,66 162,80 154,91 C 148,101 136,108 100,108 C 64,108 52,101 46,91 C 38,80 42,66 54,58 Z"
          fill="url(#max-idle-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 94,34 C 96,51 92,64 84,74 C 84,74 100,78 100,78 C 100,78 116,74 116,74 C 108,64 104,51 106,34 Z" fill="url(#max-idle-white)" />
    <ellipse cx="100" cy="84" rx="18" ry="13" fill="url(#max-idle-white)" stroke="#3B1E12" stroke-width="1.8" />
    <ellipse cx="100" cy="76" rx="6" ry="4.2" fill="#1C1917" />
    <circle cx="98" cy="74.5" r="1.5" fill="#FFFFFF" />
    <path d="M 94,81 Q 100,84 100,81 Q 100,84 106,81" stroke="#3B1E12" stroke-width="1.8" fill="none" stroke-linecap="round" />
    <path d="M 96,82 C 96,91 104,91 104,82 Z" fill="#FB7185" stroke="#3B1E12" stroke-width="1.2" />
    <ellipse cx="64" cy="86" rx="8" ry="4.5" fill="#FB7185" opacity="0.45" />
    <ellipse cx="136" cy="86" rx="8" ry="4.5" fill="#FB7185" opacity="0.45" />
    <g class="anim-blink">
      <ellipse cx="80" cy="70" rx="12.5" ry="14.5" fill="url(#max-idle-eye-iris)" stroke="#3B1E12" stroke-width="2.2" />
      <ellipse cx="80" cy="70" rx="8.5" ry="10.5" fill="#0A0503" />
      <circle class="pet-pupil" data-anchor-x="80" data-anchor-y="70" cx="80" cy="70" r="5" fill="#000000" />
      <circle cx="76" cy="64" r="4.2" fill="#FFFFFF" />
      <circle cx="85" cy="75" r="1.8" fill="#FFFFFF" />
      <ellipse cx="120" cy="70" rx="12.5" ry="14.5" fill="url(#max-idle-eye-iris)" stroke="#3B1E12" stroke-width="2.2" />
      <ellipse cx="120" cy="70" rx="8.5" ry="10.5" fill="#0A0503" />
      <circle class="pet-pupil" data-anchor-x="120" data-anchor-y="70" cx="120" cy="70" r="5" fill="#000000" />
      <circle cx="116" cy="64" r="4.2" fill="#FFFFFF" />
      <circle cx="125" cy="75" r="1.8" fill="#FFFFFF" />
    </g>
  </g>
</svg>
`;
const dogWalkSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="max-walk-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="50%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="max-walk-white" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FFFBEB" />
    </linearGradient>
    <linearGradient id="max-walk-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FECDD3" />
      <stop offset="100%" stop-color="#FDA4AF" />
    </linearGradient>
    <linearGradient id="max-walk-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D150B" />
      <stop offset="40%" stop-color="#1A0C06" />
      <stop offset="85%" stop-color="#78350F" />
      <stop offset="100%" stop-color="#92400E" />
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="169" rx="78" ry="7.5" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag anim-wag-fast" style="transform-origin: 158px 112px;">
    <path d="M 156,114 C 176,106 192,84 184,58 C 178,40 156,40 150,56 C 148,66 164,74 168,88 C 172,102 166,112 156,114 Z"
          fill="url(#max-walk-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 172,64 C 178,74 178,88 170,100" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none" />
  </g>

  <g class="back-foot-left" style="transform-origin: 154px 124px;">
    <path d="M 152,122 C 168,132 178,150 170,166 C 166,172 152,172 146,164 C 140,150 140,132 152,122 Z"
          fill="url(#max-walk-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <ellipse cx="164" cy="168" rx="9.5" ry="5.2" fill="url(#max-walk-white)" stroke="#3B1E12" stroke-width="1.8" />
  </g>
  <g class="back-foot-right" style="transform-origin: 116px 122px;">
    <path d="M 114,120 C 102,132 94,148 102,158 C 108,164 124,162 128,152 C 130,138 126,124 114,120 Z"
          fill="url(#max-walk-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <ellipse cx="104" cy="154" rx="8.5" ry="5" fill="url(#max-walk-white)" stroke="#3B1E12" stroke-width="1.8" />
  </g>

  <g class="left-paw" style="transform-origin: 78px 116px;">
    <path d="M 76,116 L 88,146 C 90,152 86,158 78,158 C 70,158 66,152 68,146 L 74,116 Z"
          fill="url(#max-walk-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="78" cy="154" rx="9" ry="5.2" fill="url(#max-walk-white)" stroke="#3B1E12" stroke-width="2" />
    <path d="M 74,152 L 74,158" stroke="#3B1E12" stroke-width="1.4" stroke-linecap="round" />
    <path d="M 82,152 L 82,158" stroke="#3B1E12" stroke-width="1.4" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 58px 114px;">
    <path d="M 58,114 L 30,148 C 24,156 24,164 34,168 C 44,172 56,166 60,156 L 70,116 Z"
          fill="url(#max-walk-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="32" cy="168" rx="10.5" ry="6" fill="url(#max-walk-white)" stroke="#3B1E12" stroke-width="2" />
    <path d="M 28,166 L 28,172" stroke="#3B1E12" stroke-width="1.4" stroke-linecap="round" />
    <path d="M 36,166 L 36,172" stroke="#3B1E12" stroke-width="1.4" stroke-linecap="round" />
  </g>

  <g class="pet-body anim-breath" style="transform-origin: 112px 138px;">
    <path d="M 48,112 C 38,124 44,144 72,152 C 100,160 140,156 166,142 C 178,134 176,116 160,106 C 136,96 78,98 48,112 Z"
          fill="url(#max-walk-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 54,114 C 44,126 48,142 68,148 C 84,150 96,140 98,126 C 96,114 76,106 54,114 Z"
          fill="url(#max-walk-white)" stroke="#3B1E12" stroke-width="1.8" stroke-linejoin="round" />
      <!-- seam-hip -->
    <path d="M 58,128 C 64,136 72,140 78,136 C 74,128 66,124 58,128 Z" fill="url(#max-walk-fur)"/>
    <path d="M 142,128 C 136,136 128,140 122,136 C 126,128 134,124 142,128 Z" fill="url(#max-walk-fur)"/>
</g>

  <g class="pet-head" style="transform-origin: 46px 96px;">
    <g class="pet-ear pet-ear-left" style="transform-origin: 22px 54px;">
      <path d="M 24,52 C 10,50 2,64 6,82 C 8,92 20,94 26,84 C 30,74 32,58 24,52 Z" fill="url(#max-walk-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 14,62 C 8,70 8,80 12,86" stroke="url(#max-walk-ear-inner)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 64px 46px;">
      <path d="M 62,46 C 80,42 92,58 88,82 C 86,96 74,100 68,88 C 64,76 60,56 62,46 Z" fill="url(#max-walk-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 74,58 C 80,66 82,78 78,86" stroke="url(#max-walk-ear-inner)" stroke-width="4" stroke-linecap="round" fill="none" />
    </g>

    <!-- seam-ruff -->
    <path d="M 70,100 C 78,114 92,124 106,120 C 96,110 84,104 70,100 Z" fill="url(#max-walk-fur)"/>
    <path d="M 36,46 C 50,36 74,40 80,62 C 84,74 80,90 66,100 C 50,110 26,108 12,96 C 0,86 0,70 10,62 C 4,54 14,44 30,44 C 32,44 34,45 36,46 Z"
          fill="url(#max-walk-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 44,42 C 46,56 40,70 28,80 C 28,80 40,84 40,84 C 40,84 54,76 54,76 C 50,64 48,52 50,42 Z" fill="url(#max-walk-white)" />
    <ellipse cx="18" cy="86" rx="14" ry="11" fill="url(#max-walk-white)" stroke="#3B1E12" stroke-width="1.8" />
    <ellipse cx="10" cy="82" rx="5" ry="3.6" fill="#1C1917" />
    <circle cx="8.5" cy="80.5" r="1.3" fill="#FFFFFF" />
    <path d="M 14,88 Q 18,92 18,88 Q 18,92 24,88" stroke="#3B1E12" stroke-width="1.7" fill="none" stroke-linecap="round" />
    <path d="M 16,89 C 16,97 22,97 22,89 Z" fill="#FB7185" stroke="#3B1E12" stroke-width="1.1" />
    <ellipse cx="52" cy="86" rx="7" ry="4" fill="#FB7185" opacity="0.4" />
    <g class="anim-blink">
      <ellipse cx="42" cy="70" rx="12.5" ry="14.5" fill="url(#max-walk-eye-iris)" stroke="#3B1E12" stroke-width="2.2" />
      <ellipse cx="42" cy="70" rx="8.5" ry="10.5" fill="#0A0503" />
      <circle class="pet-pupil" data-anchor-x="42" data-anchor-y="70" cx="42" cy="70" r="5" fill="#000000" />
      <circle cx="38" cy="64" r="4.2" fill="#FFFFFF" />
      <circle cx="47" cy="75" r="1.8" fill="#FFFFFF" />
    </g>
  </g>
</svg>
`;
const dogSleepSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="max-sleep-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="50%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="max-sleep-white" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FFFBEB" />
    </linearGradient>
    <linearGradient id="max-sleep-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FECDD3" />
      <stop offset="100%" stop-color="#FDA4AF" />
    </linearGradient>
    <linearGradient id="max-sleep-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D150B" />
      <stop offset="40%" stop-color="#1A0C06" />
      <stop offset="85%" stop-color="#78350F" />
      <stop offset="100%" stop-color="#92400E" />
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="170" rx="62" ry="8" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 134px 146px;">
    <path d="M 130,144 C 152,136 170,148 166,166 C 162,178 140,182 120,174 C 108,170 104,162 110,158 C 118,164 140,166 148,156 C 154,148 146,142 130,144 Z"
          fill="url(#max-sleep-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 150,150 C 156,156 156,164 150,170" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" fill="none" />
  </g>

  <g class="back-foot-left" style="transform-origin: 120px 158px;">
    <path d="M 114,152 C 110,158 112,166 120,170 C 126,172 132,168 132,162 C 130,156 124,152 114,152 Z"
          fill="url(#max-sleep-fur)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="122" cy="170" rx="8" ry="4.2" fill="url(#max-sleep-white)" stroke="#3B1E12" stroke-width="1.6" />
  </g>
  <g class="back-foot-right" style="transform-origin: 140px 156px;">
    <path d="M 134,148 C 132,156 136,164 144,166 C 150,166 154,160 152,154 C 148,148 142,146 134,148 Z"
          fill="url(#max-sleep-fur)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="144" cy="166" rx="7.5" ry="4" fill="url(#max-sleep-white)" stroke="#3B1E12" stroke-width="1.6" />
  </g>

  <g class="left-paw" style="transform-origin: 86px 160px;">
    <ellipse cx="86" cy="168" rx="9" ry="5" fill="url(#max-sleep-white)" stroke="#3B1E12" stroke-width="1.8" />
    <path d="M 82,166 L 82,171" stroke="#3B1E12" stroke-width="1.3" stroke-linecap="round" />
    <path d="M 90,166 L 90,171" stroke="#3B1E12" stroke-width="1.3" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 102px 160px;">
    <ellipse cx="102" cy="169" rx="8.5" ry="4.6" fill="url(#max-sleep-white)" stroke="#3B1E12" stroke-width="1.8" />
    <path d="M 98,167 L 98,172" stroke="#3B1E12" stroke-width="1.3" stroke-linecap="round" />
    <path d="M 106,167 L 106,172" stroke="#3B1E12" stroke-width="1.3" stroke-linecap="round" />
  </g>

  <g class="pet-body anim-breath" style="transform-origin: 108px 148px;">
    <path d="M 68,126 C 56,144 64,166 94,172 C 122,178 148,166 152,146 C 154,130 140,116 116,112 C 92,108 78,112 68,126 Z"
          fill="url(#max-sleep-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 86,142 C 82,152 88,162 100,164 C 110,162 114,152 110,142 C 104,138 92,138 86,142 Z"
          fill="url(#max-sleep-white)" stroke="#3B1E12" stroke-width="1.6" stroke-linejoin="round" />
      <!-- seam-hip -->
    <path d="M 58,128 C 64,136 72,140 78,136 C 74,128 66,124 58,128 Z" fill="url(#max-sleep-fur)"/>
    <path d="M 142,128 C 136,136 128,140 122,136 C 126,128 134,124 142,128 Z" fill="url(#max-sleep-fur)"/>
</g>

  <g class="pet-head" style="transform-origin: 74px 130px;">
    <g class="pet-ear pet-ear-left" style="transform-origin: 56px 106px;">
      <path d="M 58,108 C 42,102 34,114 36,130 C 38,138 48,140 54,130 C 58,122 62,112 58,108 Z" fill="url(#max-sleep-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 46,114 C 40,120 40,128 44,132" stroke="url(#max-sleep-ear-inner)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 92px 104px;">
      <path d="M 90,106 C 104,98 114,110 110,126 C 108,134 98,136 94,126 C 90,118 88,110 90,106 Z" fill="url(#max-sleep-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 100,110 C 106,116 106,124 102,128" stroke="url(#max-sleep-ear-inner)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    </g>

    <!-- seam-ruff -->
    <path d="M 56,128 C 66,140 82,146 96,140 C 84,132 68,128 56,128 Z" fill="url(#max-sleep-fur)"/>
    <circle cx="74" cy="130" r="26" fill="url(#max-sleep-fur)" stroke="#3B1E12" stroke-width="2.2" />
    <path d="M 70,108 C 72,120 68,130 60,138 C 60,138 74,142 74,142 C 74,142 88,136 88,136 C 82,126 80,116 82,108 Z" fill="url(#max-sleep-white)" />
    <ellipse cx="74" cy="138" rx="11" ry="8" fill="url(#max-sleep-white)" stroke="#3B1E12" stroke-width="1.5" />
    <ellipse cx="74" cy="134" rx="4" ry="2.8" fill="#1C1917" />
    <path d="M 70,140 Q 74,142 78,140" stroke="#3B1E12" stroke-width="1.5" fill="none" stroke-linecap="round" />
    <ellipse cx="62" cy="136" rx="5" ry="3" fill="#FB7185" opacity="0.45" />
    <ellipse cx="88" cy="136" rx="5" ry="3" fill="#FB7185" opacity="0.45" />
    <g class="anim-blink">
      <path d="M 51,127 Q 64,134 77,127" stroke="#3B1E12" stroke-width="2.6" fill="none" stroke-linecap="round" />
      <path d="M 53,125 Q 64,130 75,125" stroke="#3B1E12" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.55" />
      <path d="M 71,127 Q 84,134 97,127" stroke="#3B1E12" stroke-width="2.6" fill="none" stroke-linecap="round" />
      <path d="M 73,125 Q 84,130 95,125" stroke="#3B1E12" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.55" />
    </g>
  </g>
</svg>
`;
const dogSitSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="max-sit-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="50%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="max-sit-white" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FFFBEB" />
    </linearGradient>
    <linearGradient id="max-sit-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FECDD3" />
      <stop offset="100%" stop-color="#FDA4AF" />
    </linearGradient>
    <linearGradient id="max-sit-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D150B" />
      <stop offset="40%" stop-color="#1A0C06" />
      <stop offset="85%" stop-color="#78350F" />
      <stop offset="100%" stop-color="#92400E" />
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="172" rx="55" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 70px 142px;">
    <path d="M 72,142 C 54,144 34,130 30,105 C 28,85 42,70 54,76 C 60,78 58,90 50,96 C 44,102 48,120 64,132 Z"
          fill="url(#max-sit-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 42,85 C 36,92 34,100 36,108" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none" />
  </g>

  <g class="back-foot-left" style="transform-origin: 64px 134px;">
    <path d="M 56,134 C 47,143 47,158 54,166 C 59,171 68,171 74,168 C 77,164 76,148 71,138 Z"
          fill="url(#max-sit-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <ellipse cx="54" cy="168" rx="8" ry="4.5" fill="url(#max-sit-white)" stroke="#3B1E12" stroke-width="1.8" />
  </g>
  <g class="back-foot-right" style="transform-origin: 136px 134px;">
    <path d="M 144,134 C 153,143 153,158 146,166 C 141,171 132,171 126,168 C 123,164 124,148 129,138 Z"
          fill="url(#max-sit-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <ellipse cx="146" cy="168" rx="8" ry="4.5" fill="url(#max-sit-white)" stroke="#3B1E12" stroke-width="1.8" />
  </g>

  <g class="left-paw" style="transform-origin: 83px 132px;">
    <path d="M 76,134 L 75,158 C 75,164 78,168 83,168 C 88,168 91,164 91,158 L 90,134 Z"
          fill="url(#max-sit-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="83" cy="166" rx="10" ry="6" fill="url(#max-sit-white)" stroke="#3B1E12" stroke-width="2" />
    <path d="M 79,164 L 79,170" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
    <path d="M 86,164 L 86,170" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 117px 132px;">
    <path d="M 110,134 L 109,158 C 109,164 112,168 117,168 C 122,168 125,164 125,158 L 124,134 Z"
          fill="url(#max-sit-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="117" cy="166" rx="10" ry="6" fill="url(#max-sit-white)" stroke="#3B1E12" stroke-width="2" />
    <path d="M 113,164 L 113,170" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
    <path d="M 120,164 L 120,170" stroke="#3B1E12" stroke-width="1.6" stroke-linecap="round" />
  </g>

  <g class="pet-body anim-breath" style="transform-origin: 100px 152px;">
    <path d="M 68,106 C 63,124 65,144 78,152 C 88,150 112,150 122,152 C 135,144 137,124 132,106 Z"
          fill="url(#max-sit-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 82,96 C 75,111 72,124 80,135 C 86,142 93,148 100,150 C 107,148 114,142 120,135 C 128,124 125,111 118,96 C 111,106 89,106 82,96 Z"
          fill="url(#max-sit-white)" stroke="#3B1E12" stroke-width="1.8" stroke-linejoin="round" />
      <!-- seam-hip -->
    <path d="M 58,128 C 64,136 72,140 78,136 C 74,128 66,124 58,128 Z" fill="url(#max-sit-fur)"/>
    <path d="M 142,128 C 136,136 128,140 122,136 C 126,128 134,124 142,128 Z" fill="url(#max-sit-fur)"/>
</g>

  <g class="pet-head" style="transform-origin: 100px 105px;">
    <g class="pet-ear pet-ear-left" style="transform-origin: 58px 52px;">
      <path d="M 60,54 C 42,54 32,70 34,92 C 36,104 46,108 52,98 C 58,88 64,74 62,54 Z" fill="url(#max-sit-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 48,64 C 42,72 40,84 44,92" stroke="url(#max-sit-ear-inner)" stroke-width="4" stroke-linecap="round" fill="none" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 142px 52px;">
      <path d="M 140,54 C 158,54 168,70 166,92 C 164,104 154,108 148,98 C 142,88 136,74 138,54 Z" fill="url(#max-sit-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 152,64 C 158,72 160,84 156,92" stroke="url(#max-sit-ear-inner)" stroke-width="4" stroke-linecap="round" fill="none" />
    </g>

    <!-- seam-ruff -->
    <path d="M 62,100 C 74,114 86,120 100,120 C 114,120 126,114 138,100 C 124,110 76,110 62,100 Z" fill="url(#max-sit-fur)"/>
    <path d="M 54,62 C 48,50 68,36 100,36 C 132,36 152,50 146,62 C 158,70 162,84 154,95 C 148,105 136,112 100,112 C 64,112 52,105 46,95 C 38,84 42,70 54,62 Z"
          fill="url(#max-sit-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 94,38 C 96,55 92,68 84,78 C 84,78 100,82 100,82 C 100,82 116,78 116,78 C 108,68 104,55 106,38 Z" fill="url(#max-sit-white)" />
    <ellipse cx="100" cy="88" rx="18" ry="13" fill="url(#max-sit-white)" stroke="#3B1E12" stroke-width="1.8" />
    <ellipse cx="100" cy="80" rx="6" ry="4.2" fill="#1C1917" />
    <circle cx="98" cy="78.5" r="1.5" fill="#FFFFFF" />
    <path d="M 94,85 Q 100,88 100,85 Q 100,88 106,85" stroke="#3B1E12" stroke-width="1.8" fill="none" stroke-linecap="round" />
    <path d="M 96,86 C 96,95 104,95 104,86 Z" fill="#FB7185" stroke="#3B1E12" stroke-width="1.2" />
    <ellipse cx="64" cy="90" rx="8" ry="4.5" fill="#FB7185" opacity="0.45" />
    <ellipse cx="136" cy="90" rx="8" ry="4.5" fill="#FB7185" opacity="0.45" />
    <g class="anim-blink">
      <ellipse cx="80" cy="74" rx="12.5" ry="14.5" fill="url(#max-sit-eye-iris)" stroke="#3B1E12" stroke-width="2.2" />
      <ellipse cx="80" cy="74" rx="8.5" ry="10.5" fill="#0A0503" />
      <circle class="pet-pupil" data-anchor-x="80" data-anchor-y="74" cx="80" cy="74" r="5" fill="#000000" />
      <circle cx="76" cy="68" r="4.2" fill="#FFFFFF" />
      <circle cx="85" cy="79" r="1.8" fill="#FFFFFF" />
      <ellipse cx="120" cy="74" rx="12.5" ry="14.5" fill="url(#max-sit-eye-iris)" stroke="#3B1E12" stroke-width="2.2" />
      <ellipse cx="120" cy="74" rx="8.5" ry="10.5" fill="#0A0503" />
      <circle class="pet-pupil" data-anchor-x="120" data-anchor-y="74" cx="120" cy="74" r="5" fill="#000000" />
      <circle cx="116" cy="68" r="4.2" fill="#FFFFFF" />
      <circle cx="125" cy="79" r="1.8" fill="#FFFFFF" />
    </g>
  </g>
</svg>
`;
const dogLaySVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="max-lay-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="50%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="max-lay-white" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FFFBEB" />
    </linearGradient>
    <linearGradient id="max-lay-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FECDD3" />
      <stop offset="100%" stop-color="#FDA4AF" />
    </linearGradient>
    <linearGradient id="max-lay-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D150B" />
      <stop offset="40%" stop-color="#1A0C06" />
      <stop offset="85%" stop-color="#78350F" />
      <stop offset="100%" stop-color="#92400E" />
    </linearGradient>
  </defs>
  <ellipse cx="104" cy="170" rx="74" ry="8" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 168px 140px;">
    <path d="M 166,142 C 184,132 194,112 184,90 C 176,74 156,76 152,92 C 150,102 164,110 168,122 C 170,132 170,138 166,142 Z"
          fill="url(#max-lay-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 176,98 C 180,108 180,118 174,128" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" fill="none" />
  </g>

  <g class="back-foot-left" style="transform-origin: 150px 154px;">
    <path d="M 142,148 C 150,152 160,158 164,166 C 166,170 160,172 152,170 C 144,166 138,156 142,148 Z"
          fill="url(#max-lay-fur)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="158" cy="170" rx="9" ry="4.5" fill="url(#max-lay-white)" stroke="#3B1E12" stroke-width="1.6" />
  </g>
  <g class="back-foot-right" style="transform-origin: 132px 154px;">
    <path d="M 124,148 C 132,154 140,162 142,168 C 144,172 136,172 128,168 C 120,162 118,152 124,148 Z"
          fill="url(#max-lay-fur)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="136" cy="170" rx="8.5" ry="4.5" fill="url(#max-lay-white)" stroke="#3B1E12" stroke-width="1.6" />
  </g>

  <g class="left-paw" style="transform-origin: 44px 156px;">
    <path d="M 50,152 L 26,162 C 20,164 18,170 24,172 C 30,174 42,168 50,162 Z"
          fill="url(#max-lay-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="24" cy="170" rx="9.5" ry="5" fill="url(#max-lay-white)" stroke="#3B1E12" stroke-width="1.8" />
    <path d="M 20,168 L 20,173" stroke="#3B1E12" stroke-width="1.3" stroke-linecap="round" />
    <path d="M 28,168 L 28,173" stroke="#3B1E12" stroke-width="1.3" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 62px 156px;">
    <path d="M 64,152 L 42,164 C 36,166 36,172 42,174 C 50,174 60,168 66,162 Z"
          fill="url(#max-lay-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="42" cy="172" rx="8.5" ry="4.6" fill="url(#max-lay-white)" stroke="#3B1E12" stroke-width="1.8" />
    <path d="M 38,170 L 38,175" stroke="#3B1E12" stroke-width="1.3" stroke-linecap="round" />
    <path d="M 46,170 L 46,175" stroke="#3B1E12" stroke-width="1.3" stroke-linecap="round" />
  </g>

  <g class="pet-body anim-breath" style="transform-origin: 110px 150px;">
    <path d="M 44,134 C 40,150 54,166 88,170 C 120,174 156,170 174,158 C 184,150 182,136 168,128 C 144,120 72,120 44,134 Z"
          fill="url(#max-lay-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 70,134 C 62,144 64,156 80,160 C 96,162 110,156 114,144 C 110,134 88,130 70,134 Z"
          fill="url(#max-lay-white)" stroke="#3B1E12" stroke-width="1.6" stroke-linejoin="round" />
      <!-- seam-hip -->
    <path d="M 58,128 C 64,136 72,140 78,136 C 74,128 66,124 58,128 Z" fill="url(#max-lay-fur)"/>
    <path d="M 142,128 C 136,136 128,140 122,136 C 126,128 134,124 142,128 Z" fill="url(#max-lay-fur)"/>
</g>

  <g class="pet-head" style="transform-origin: 76px 114px;">
    <g class="pet-ear pet-ear-left" style="transform-origin: 50px 74px;">
      <path d="M 52,76 C 36,72 26,86 28,106 C 30,116 42,118 48,106 C 54,94 58,84 52,76 Z" fill="url(#max-lay-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 40,84 C 34,92 34,102 38,108" stroke="url(#max-lay-ear-inner)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 106px 72px;">
      <path d="M 104,74 C 120,68 132,82 128,102 C 126,112 114,114 110,102 C 106,90 102,80 104,74 Z" fill="url(#max-lay-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 116,80 C 122,88 122,98 118,104" stroke="url(#max-lay-ear-inner)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    </g>

    <!-- seam-ruff -->
    <path d="M 58,118 C 70,132 88,138 104,132 C 90,122 72,118 58,118 Z" fill="url(#max-lay-fur)"/>
    <path d="M 48,82 C 44,70 60,58 78,58 C 100,58 116,70 112,82 C 122,88 124,100 116,108 C 110,116 98,122 78,122 C 56,122 46,116 42,108 C 36,100 40,88 48,82 Z"
          fill="url(#max-lay-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 74,60 C 76,74 72,86 64,94 C 64,94 78,98 78,98 C 78,98 92,94 92,94 C 86,84 82,74 84,60 Z" fill="url(#max-lay-white)" />
    <ellipse cx="78" cy="102" rx="14" ry="10" fill="url(#max-lay-white)" stroke="#3B1E12" stroke-width="1.6" />
    <ellipse cx="78" cy="96" rx="5" ry="3.4" fill="#1C1917" />
    <circle cx="76.5" cy="94.5" r="1.2" fill="#FFFFFF" />
    <path d="M 74,100 Q 78,103 78,100 Q 78,103 82,100" stroke="#3B1E12" stroke-width="1.6" fill="none" stroke-linecap="round" />
    <path d="M 75,101 C 75,108 81,108 81,101 Z" fill="#FB7185" stroke="#3B1E12" stroke-width="1.1" />
    <ellipse cx="54" cy="102" rx="6" ry="3.5" fill="#FB7185" opacity="0.45" />
    <ellipse cx="102" cy="102" rx="6" ry="3.5" fill="#FB7185" opacity="0.45" />
    <g class="anim-blink">
      <ellipse cx="64" cy="88" rx="12.5" ry="14.5" fill="url(#max-lay-eye-iris)" stroke="#3B1E12" stroke-width="2.2" />
      <ellipse cx="64" cy="88" rx="8.5" ry="10.5" fill="#0A0503" />
      <circle class="pet-pupil" data-anchor-x="64" data-anchor-y="88" cx="64" cy="88" r="5" fill="#000000" />
      <circle cx="60" cy="82" r="4.2" fill="#FFFFFF" />
      <circle cx="69" cy="93" r="1.8" fill="#FFFFFF" />
      <ellipse cx="92" cy="88" rx="12.5" ry="14.5" fill="url(#max-lay-eye-iris)" stroke="#3B1E12" stroke-width="2.2" />
      <ellipse cx="92" cy="88" rx="8.5" ry="10.5" fill="#0A0503" />
      <circle class="pet-pupil" data-anchor-x="92" data-anchor-y="88" cx="92" cy="88" r="5" fill="#000000" />
      <circle cx="88" cy="82" r="4.2" fill="#FFFFFF" />
      <circle cx="97" cy="93" r="1.8" fill="#FFFFFF" />
    </g>
  </g>
</svg>
`;
const dogStretchSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="max-stretch-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="50%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="max-stretch-white" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FFFBEB" />
    </linearGradient>
    <linearGradient id="max-stretch-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FECDD3" />
      <stop offset="100%" stop-color="#FDA4AF" />
    </linearGradient>
    <linearGradient id="max-stretch-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D150B" />
      <stop offset="40%" stop-color="#1A0C06" />
      <stop offset="85%" stop-color="#78350F" />
      <stop offset="100%" stop-color="#92400E" />
    </linearGradient>
  </defs>
  <ellipse cx="108" cy="170" rx="78" ry="7.5" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 156px 82px;">
    <path d="M 156,84 C 166,58 154,34 134,28 C 118,24 110,40 120,50 C 128,58 146,62 154,76 C 156,80 156,82 156,84 Z"
          fill="url(#max-stretch-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 140,42 C 148,48 152,60 150,70" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" fill="none" />
  </g>

  <g class="back-foot-left" style="transform-origin: 148px 104px;">
    <path d="M 144,100 C 160,114 168,142 158,162 C 154,170 138,172 132,162 C 128,146 130,112 144,100 Z"
          fill="url(#max-stretch-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <ellipse cx="150" cy="168" rx="10" ry="5.5" fill="url(#max-stretch-white)" stroke="#3B1E12" stroke-width="1.8" />
  </g>
  <g class="back-foot-right" style="transform-origin: 128px 106px;">
    <path d="M 124,104 C 112,122 108,148 120,164 C 126,170 142,170 146,158 C 148,142 142,116 130,104 Z"
          fill="url(#max-stretch-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <ellipse cx="128" cy="168" rx="9.5" ry="5" fill="url(#max-stretch-white)" stroke="#3B1E12" stroke-width="1.8" />
  </g>

  <g class="left-paw" style="transform-origin: 46px 148px;">
    <path d="M 50,146 L 22,160 C 14,164 14,170 24,172 C 34,174 48,166 54,156 Z"
          fill="url(#max-stretch-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="22" cy="170" rx="10.5" ry="5.5" fill="url(#max-stretch-white)" stroke="#3B1E12" stroke-width="2" />
    <path d="M 18,168 L 18,174" stroke="#3B1E12" stroke-width="1.4" stroke-linecap="round" />
    <path d="M 26,168 L 26,174" stroke="#3B1E12" stroke-width="1.4" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 64px 148px;">
    <path d="M 66,146 L 44,162 C 36,166 38,172 48,174 C 58,174 70,166 74,156 Z"
          fill="url(#max-stretch-white)" stroke="#3B1E12" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="44" cy="172" rx="9.5" ry="5" fill="url(#max-stretch-white)" stroke="#3B1E12" stroke-width="2" />
    <path d="M 40,170 L 40,176" stroke="#3B1E12" stroke-width="1.4" stroke-linecap="round" />
    <path d="M 48,170 L 48,176" stroke="#3B1E12" stroke-width="1.4" stroke-linecap="round" />
  </g>

  <g class="pet-body anim-breath" style="transform-origin: 112px 120px;">
    <path d="M 52,144 C 70,96 118,80 158,94 C 170,100 170,118 156,126 C 128,140 86,154 58,156 C 46,156 44,148 52,144 Z"
          fill="url(#max-stretch-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 66,140 C 80,130 112,124 134,130 C 142,134 138,144 122,148 C 98,154 78,154 66,148 C 60,146 62,142 66,140 Z"
          fill="url(#max-stretch-white)" stroke="#3B1E12" stroke-width="1.6" stroke-linejoin="round" />
      <!-- seam-hip -->
    <path d="M 58,128 C 64,136 72,140 78,136 C 74,128 66,124 58,128 Z" fill="url(#max-stretch-fur)"/>
    <path d="M 142,128 C 136,136 128,140 122,136 C 126,128 134,124 142,128 Z" fill="url(#max-stretch-fur)"/>
</g>

  <g class="pet-head" style="transform-origin: 52px 118px;">
    <g class="pet-ear pet-ear-left" style="transform-origin: 28px 84px;">
      <path d="M 30,86 C 14,84 6,98 10,116 C 12,126 24,126 30,116 C 34,106 36,90 30,86 Z" fill="url(#max-stretch-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 20,96 C 14,104 14,114 18,118" stroke="url(#max-stretch-ear-inner)" stroke-width="3.4" stroke-linecap="round" fill="none" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 74px 78px;">
      <path d="M 72,80 C 88,74 100,88 96,108 C 94,118 82,120 76,108 C 72,96 68,86 72,80 Z" fill="url(#max-stretch-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 84,88 C 90,96 90,106 86,112" stroke="url(#max-stretch-ear-inner)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    </g>

    <!-- seam-ruff -->
    <path d="M 44,116 C 54,126 68,130 82,124 C 70,116 54,114 44,116 Z" fill="url(#max-stretch-fur)"/>
    <path d="M 32,88 C 28,76 44,64 62,64 C 84,64 98,76 94,88 C 104,94 106,106 98,114 C 92,122 80,128 60,128 C 40,128 30,122 26,114 C 20,106 24,94 32,88 Z"
          fill="url(#max-stretch-fur)" stroke="#3B1E12" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 58,66 C 60,80 56,92 48,100 C 48,100 62,104 62,104 C 62,104 76,100 76,100 C 70,90 66,80 68,66 Z" fill="url(#max-stretch-white)" />
    <ellipse cx="54" cy="108" rx="14" ry="10" fill="url(#max-stretch-white)" stroke="#3B1E12" stroke-width="1.6" />
    <ellipse cx="50" cy="102" rx="5" ry="3.4" fill="#1C1917" />
    <circle cx="48.5" cy="100.5" r="1.2" fill="#FFFFFF" />
    <path d="M 46,106 Q 52,110 52,106 Q 52,110 60,106" stroke="#3B1E12" stroke-width="1.6" fill="none" stroke-linecap="round" />
    <path d="M 50,107 C 50,115 58,115 58,107 Z" fill="#FB7185" stroke="#3B1E12" stroke-width="1.1" />
    <ellipse cx="38" cy="108" rx="6" ry="3.4" fill="#FB7185" opacity="0.45" />
    <ellipse cx="82" cy="106" rx="6" ry="3.4" fill="#FB7185" opacity="0.45" />
    <g class="anim-blink">
      <ellipse cx="46" cy="92" rx="12.5" ry="14.5" fill="url(#max-stretch-eye-iris)" stroke="#3B1E12" stroke-width="2.2" />
      <ellipse cx="46" cy="92" rx="8.5" ry="10.5" fill="#0A0503" />
      <circle class="pet-pupil" data-anchor-x="46" data-anchor-y="92" cx="46" cy="92" r="5" fill="#000000" />
      <circle cx="42" cy="86" r="4.2" fill="#FFFFFF" />
      <circle cx="51" cy="97" r="1.8" fill="#FFFFFF" />
      <ellipse cx="72" cy="90" rx="12.5" ry="14.5" fill="url(#max-stretch-eye-iris)" stroke="#3B1E12" stroke-width="2.2" />
      <ellipse cx="72" cy="90" rx="8.5" ry="10.5" fill="#0A0503" />
      <circle class="pet-pupil" data-anchor-x="72" data-anchor-y="90" cx="72" cy="90" r="5" fill="#000000" />
      <circle cx="68" cy="84" r="4.2" fill="#FFFFFF" />
      <circle cx="77" cy="95" r="1.8" fill="#FFFFFF" />
    </g>
  </g>
</svg>
`;

const dogWalk1SVG = dogWalkSVG;
const dogWalk2SVG = dogWalkSVG;
const dogWalk3SVG = dogWalkSVG;
const dogWalk4SVG = dogWalkSVG;
const dogWalkFrames = [dogWalkSVG];
const dogSitBlinkSVG = dogSitSVG;
const dogLayBreatheSVG = dogLaySVG;
const dogSVG = dogIdleSVG;

function getDogPartsForState(state) {
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
    Idle: dogIdleSVG,
    Walk: dogWalkSVG,
    Walk1: dogWalkSVG,
    Walk2: dogWalkSVG,
    Walk3: dogWalkSVG,
    Walk4: dogWalkSVG,
    Sleep: dogSleepSVG,
    Sit: dogSitSVG,
    SitBlink: dogSitSVG,
    Lay: dogLaySVG,
    LayBreathe: dogLaySVG,
    Stretch: dogStretchSVG,
  };
  return frames.map(name => ({
    head: null,
    body: scope["dog" + name + "SVG"] || fallback[name] || dogIdleSVG,
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
