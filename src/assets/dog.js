/* Mascot Dog Assets - Shiba Chibi 2D Anime Illustration */
const dogIdleSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="102" cy="171" rx="54" ry="6.5" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 126px 126px; transform: rotate(0deg);">
    <path class="cel-outline"
          d="M 126,126 C 152,130 170,116 176,94 C 181,72 174,54 162,50 C 152,47 144,55 148,64 C 151,72 158,76 158,88 C 158,104 146,118 126,126 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 142,124 C 158,120 166,110 170,96 C 175,76 170,60 162,54 C 167,64 170,78 167,94 C 164,106 154,116 142,120 Z"
          fill="#C97E22" />
    <path d="M 176,94 C 181,72 174,54 162,50 C 170,58 175,72 174,88 Z" fill="#8A4A12" />
    <path d="M 163,108 C 167,98 168,88 166,78" fill="none" stroke="#3B2416" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 154,72 C 152,64 155,57 161,53" fill="none" stroke="#3B2416" stroke-width="1.8" stroke-linecap="round" />
  </g>

  <g class="back-foot-left" style="transform-origin: 121px 127px;">
    <path class="cel-outline"
          d="M 114,124 C 108,132 106,144 110,152 C 113,158 123,160 129,156 C 133,151 132,139 128,130 C 124,126 118,124 114,124 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 114,152 C 118,156 124,158 129,156 C 133,151 132,139 128,130 C 130,140 128,149 123,152 C 119,154 116,154 114,152 Z"
          fill="#C97E22" />
    <path d="M 117,148 C 117,152 118,155 118,157" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="back-foot-right" style="transform-origin: 136px 120px;">
    <path class="cel-outline"
          d="M 136,118 C 146,125 152,137 151,147 C 150,155 142,159 134,156 C 128,153 127,141 130,130 C 133,124 135,120 136,118 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 136,155 C 143,157 149,153 150,147 C 150,140 147,133 144,127 C 148,133 149,140 147,146 C 145,151 141,153 136,152 Z"
          fill="#C97E22" />
    <path d="M 140,148 C 140,152 141,155 141,157" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="pet-body anim-breath" style="transform-origin: 104px 116px; transform: translateY(0px) rotate(0deg);">
    <path class="cel-outline"
          d="M 72,84 C 60,94 54,114 60,128 C 65,140 78,145 92,144 C 104,143 116,140 128,135 C 140,130 149,126 152,116 C 155,103 146,93 132,87 C 114,80 90,79 78,85 C 75,86 73,85 72,84 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 62,125 C 67,136 79,142 92,141 C 104,140 116,137 128,132 C 139,127 146,123 149,115 C 144,120 137,123 127,127 C 115,131 103,134 92,135 C 81,136 71,132 66,123 Z"
          fill="#C97E22" />
    <path d="M 72,90 C 63,102 61,122 71,134 C 79,143 97,144 107,134 C 115,125 115,106 107,94 C 96,87 84,87 72,90 Z"
          fill="#FFF8EC" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 76,126 C 82,134 98,136 108,128 C 106,136 100,141 92,141 C 84,141 77,135 76,126 Z" fill="#E9CFA8" />
  </g>

  <g class="left-paw" style="transform-origin: 76px 138px;">
    <path class="cel-base"
          d="M 92,144 C 78,145 65,140 60,128 C 56,137 55,149 59,158 C 63,165 74,168 81,166 C 88,164 92,154 92,144 Z"
          fill="#FFF8EC" />
    <path class="cel-outline"
          d="M 59,158 C 63,165 74,168 81,166 C 88,164 92,154 92,144"
          fill="#FFF8EC" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 63.14,162.48 L 65.87,164.13 L 70.19,164.75 L 72.02,166.19 L 75.72,165.81 L 78.4,165.76 L 80.85,165.3 L 83.48,164.89 L 85.67,163.12 L 86.63,160.72 L 89.12,158 L 89.1,155.47 L 89.89,152.43 L 91.81,147.73 L 91.81,147.73 L 87.91,150.69 L 85.82,153.36 L 83.97,155.57 L 82.29,157.25 L 80.87,158.35 L 79.83,158.95 L 78.94,159.34 L 77.54,159.78 L 75.5,160.24 L 73.09,160.59 L 70.39,160.85 L 67.41,161.08 L 63.14,162.48 Z"
          fill="#E9CFA8" />
    <path d="M 67,158 C 67,161 67,164 68,166" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 75,159 C 75,162 75,165 75,167" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 110px 140px;">
    <path class="cel-base"
          d="M 128,135 C 116,140 104,143 92,144 C 90,153 91,160 96,164 C 102,168 112,167 117,163 C 123,157 126,147 128,135 Z"
          fill="#FFF8EC" />
    <path class="cel-outline"
          d="M 96,164 C 102,168 112,167 117,163 C 123,157 126,147 128,135"
          fill="#FFF8EC" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 101.11,166.09 L 105.42,165.37 L 107.99,165.37 L 110.51,165.04 L 112.89,164.41 L 115.05,163.48 L 116.89,162.29 L 119.11,160.57 L 120.39,157.69 L 121.81,154.96 L 123.05,151.95 L 125.22,147.55 L 126.28,143.59 L 125.87,141.52 L 125.87,141.52 L 122.95,142.79 L 120.65,146.19 L 118.65,149.27 L 116.83,151.99 L 115.14,154.34 L 113.56,156.34 L 112.33,157.82 L 111.74,158.37 L 110.39,159.4 L 108.64,160.54 L 106.57,161.74 L 104.2,163.08 L 101.11,166.09 Z"
          fill="#E9CFA8" />
    <path d="M 101,158 C 101,161 101,163 102,165" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 109,158 C 109,161 109,163 109,165" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="pet-head" style="transform-origin: 92px 100px;">
    <g class="pet-ear pet-ear-left" style="transform-origin: 36px 40px;">
      <path class="cel-outline"
            d="M 42,34 C 28,42 22,60 24,76 C 25,88 36,92 42,82 C 48,72 54,54 58,42 C 53,36 47,32 42,34 Z"
            fill="#F7B851" stroke="#3B2416" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 42,44 C 32,50 27,62 28,72 C 29,80 35,82 39,74 C 43,66 48,52 52,44 C 49,41 45,41 42,44 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 56,44 C 52,58 46,74 40,82 C 44,72 49,58 53,46 Z" fill="#C97E22" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 148px 40px;">
      <path class="cel-outline"
            d="M 142,34 C 156,42 162,60 160,76 C 159,88 148,92 142,82 C 136,72 130,54 126,42 C 131,36 137,32 142,34 Z"
            fill="#F7B851" stroke="#3B2416" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 142,44 C 152,50 157,62 156,72 C 155,80 149,82 145,74 C 141,66 136,52 132,44 C 135,41 139,41 142,44 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 128,44 C 132,58 138,74 144,82 C 140,72 135,58 131,46 Z" fill="#C97E22" />
    </g>

    <path class="cel-outline"
          d="M 92,34 C 66,34 46,46 40,62 C 34,76 38,90 52,97 C 64,103 80,104 92,104 C 104,104 120,103 132,97 C 146,90 150,76 144,62 C 138,46 118,34 92,34 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 47.22,94.06 L 49.49,95.61 L 52,97 L 54.29,98.07 L 56.67,99.02 L 59.12,99.87 L 61.62,100.62 L 64.18,101.28 L 66.77,101.85 L 69.38,102.34 L 72,102.75 L 74.62,103.09 L 77.23,103.37 L 79.82,103.58 L 82.38,103.75 L 84.88,103.87 L 87.33,103.95 L 89.71,103.99 L 92,104 L 94.29,103.99 L 96.67,103.95 L 99.12,103.87 L 101.62,103.75 L 104.18,103.58 L 106.77,103.37 L 109.38,103.09 L 112,102.75 L 114.62,102.34 L 117.23,101.85 L 119.82,101.28 L 122.38,100.62 L 124.88,99.87 L 127.33,99.02 L 129.71,98.07 L 132,97 L 134.51,95.61 L 136.78,94.06 L 138.82,92.37 L 140.62,90.55 L 142.2,88.6 L 143.53,86.54 L 144.63,84.38 L 145.5,82.12 L 146.13,79.79 L 146.53,77.38 L 146.7,74.91 L 146.62,72.39 L 146.32,69.83 L 145.78,67.24 L 145.01,64.62 L 144,62 L 142.71,59.05 L 141.11,56.2 L 139.2,53.47 L 139.2,53.47 L 139.67,57.11 L 140.56,60.12 L 141.28,63.12 L 141.8,65.72 L 142.11,68.16 L 142.24,70.5 L 142.19,72.72 L 141.97,74.82 L 141.57,76.81 L 141.02,78.68 L 140.32,80.43 L 139.47,82.08 L 138.47,83.62 L 137.33,85.07 L 136.03,86.43 L 134.56,87.71 L 132.92,88.91 L 131.08,90.03 L 128.97,91.08 L 127.03,91.88 L 124.94,92.64 L 122.77,93.33 L 120.52,93.95 L 118.21,94.51 L 115.84,95.01 L 113.44,95.44 L 111.01,95.82 L 108.56,96.15 L 106.11,96.44 L 103.66,96.68 L 101.24,96.89 L 98.85,97.06 L 96.51,97.21 L 94.22,97.34 L 92,97.45 L 89.78,97.55 L 87.48,97.64 L 85.12,97.7 L 82.71,97.75 L 80.26,97.76 L 77.77,97.74 L 75.26,97.68 L 72.74,97.57 L 70.22,97.42 L 67.71,97.22 L 65.21,96.96 L 62.73,96.65 L 60.28,96.27 L 57.86,95.85 L 55.47,95.37 L 53.1,94.86 L 50.38,94.16 L 47.22,94.06 Z"
          fill="#C97E22" />

    <ellipse cx="62" cy="55" rx="7" ry="4" fill="#FFF8EC" />
    <ellipse cx="122" cy="55" rx="7" ry="4" fill="#FFF8EC" />

    <ellipse cx="48" cy="84" rx="7.5" ry="4" fill="#F0927F" />
    <ellipse cx="136" cy="84" rx="7.5" ry="4" fill="#F0927F" />

    <path d="M 74,80 C 74,72 81,66 92,66 C 103,66 110,72 110,80 C 110,91 102,99 92,99 C 82,99 74,91 74,80 Z"
          fill="#FFF8EC" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 75,85 C 81,93 103,93 109,85 C 107,93 100,99 92,99 C 84,99 77,93 75,85 Z" fill="#E9CFA8" />
    <path d="M 86,76 C 86,71 89,68 92,68 C 95,68 98,71 98,76 C 98,81 95,84 92,84 C 89,84 86,81 86,76 Z"
          fill="#3A2A22" stroke="#3B2416" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M 92,84 L 92,87" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 82,86 C 87,92 97,92 102,86" fill="none" stroke="#3B2416" stroke-width="1.6" stroke-linecap="round" />

    <path d="M 45,93 C 52,98 59,101 66,102" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 139,93 C 132,98 125,101 118,102" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />

    <g class="anim-blink">
      <ellipse class="cel-outline" cx="64" cy="76" rx="12" ry="14" fill="#8A4A12" stroke="#3B2416" stroke-width="3.2" />
      <path class="cel-shadow" d="M 54,81 C 54,80 58,86 57,86 C 57,85 62,89 62,88 C 61,88 67,88 67,88 C 66,89 72,85 71,86 C 70,86 74,80 74,81 Z" fill="#6B3A12" />
      <circle class="pet-pupil" data-anchor-x="64" data-anchor-y="76" cx="64" cy="76" r="5" fill="#160C06" />
      <circle cx="59" cy="70" r="4.2" fill="#FFFFFF" />
      <circle cx="69" cy="82" r="2" fill="#FFFFFF" />
      <ellipse class="cel-outline" cx="120" cy="76" rx="12" ry="14" fill="#8A4A12" stroke="#3B2416" stroke-width="3.2" />
      <path class="cel-shadow" d="M 110,81 C 110,80 114,86 113,86 C 113,85 118,89 118,88 C 117,88 123,88 123,88 C 122,89 128,85 127,86 C 126,86 130,80 130,81 Z" fill="#6B3A12" />
      <circle class="pet-pupil" data-anchor-x="120" data-anchor-y="76" cx="120" cy="76" r="5" fill="#160C06" />
      <circle cx="115" cy="70" r="4.2" fill="#FFFFFF" />
      <circle cx="125" cy="82" r="2" fill="#FFFFFF" />
    </g>
  </g>
</svg>
`;
const dogWalkSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="170" rx="76" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag anim-wag-fast" style="transform-origin: 146px 104px; transform: rotate(0deg);">
    <path class="cel-outline"
          d="M 146,104 C 142,80 130,62 110,57 C 92,53 79,66 91,80 C 96,86 104,86 110,81 C 120,90 134,101 146,110 C 150,112 149,106 146,104 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 110,81 C 120,90 134,101 146,110 C 148,111 148,109 146,108 C 138,99 126,89 112,78 Z"
          fill="#C97E22" />
    <path d="M 91,79 C 86,73 88,64 96,59 C 93,64 92,70 95,75 C 96,77 94,80 91,79 Z" fill="#8A4A12" />
    <path d="M 134,88 C 128,78 120,70 110,66" fill="none" stroke="#3B2416" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 104,62 C 97,66 93,72 94,78" fill="none" stroke="#3B2416" stroke-width="1.8" stroke-linecap="round" />
  </g>

  <g class="back-foot-left" style="transform-origin: 124px 104px;">
    <path class="cel-outline"
          d="M 122,102 C 133,112 140,127 141,141 C 142,151 139,159 132,160 C 125,161 121,154 121,143 C 121,129 116,113 113,105 C 116,102 119,101 122,102 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 141,141 C 142,151 139,159 132,160 C 135,157 136,151 135,144 C 134,137 132,131 130,126 C 136,130 140,135 141,141 Z"
          fill="#C97E22" />
    <path d="M 130,152 C 130,155 131,157 131,158" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="back-foot-right" style="transform-origin: 138px 100px;">
    <path class="cel-outline"
          d="M 136,98 C 147,109 153,124 154,138 C 155,148 152,156 146,156 C 139,156 136,149 136,138 C 136,124 131,108 128,100 C 131,97 134,96 136,98 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 154,138 C 155,148 152,156 146,156 C 149,153 150,147 149,140 C 148,133 146,127 144,122 C 150,126 153,131 154,138 Z"
          fill="#C97E22" />
    <path d="M 144,148 C 144,151 145,153 145,154" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="anim-breath pet-body" style="transform-origin: 106px 112px; transform: translateY(0px) rotate(0deg);">
    <path class="cel-outline"
          d="M 56,110 C 53,95 66,85 86,85 C 108,85 133,87 147,94 C 159,100 161,114 153,124 C 144,135 128,140 110,142 C 98,143 90,143 84,142 C 76,140 66,139 60,133 C 56,127 56,118 56,110 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 152,119 C 143,129 128,134 110,136 C 98,137 90,137 84,136 C 76,134 67,133 61,127 C 65,133 75,137 84,139 C 90,140 98,140 110,139 C 128,137 143,132 152,123 Z"
          fill="#C97E22" />
    <path d="M 63,116 C 61,126 64,134 70,138 C 76,141 83,142 90,142 C 85,145 74,144 66,139 C 61,135 59,124 63,116 Z"
          fill="#FFF8EC" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 64,132 C 67,139 79,142 90,142 C 85,144 75,143 68,139 C 65,137 63,135 64,132 Z" fill="#E9CFA8" />
    <path d="M 96,86 C 99,95 99,104 97,112 C 93,104 92,95 94,86 Z" fill="#8A4A12" />
    <path d="M 120,87 C 123,96 123,105 121,113 C 117,105 116,96 118,87 Z" fill="#8A4A12" />
  </g>

  <g class="left-paw" style="transform-origin: 74px 140px;">
    <path class="cel-base"
          d="M 84,142 C 76,140 66,139 60,133 C 56,140 55,150 59,159 C 63,166 72,168 79,166 C 86,164 88,154 84,142 Z"
          fill="#FFF8EC" />
    <path class="cel-outline"
          d="M 59,159 C 63,166 72,168 79,166 C 86,164 88,154 84,142"
          fill="#FFF8EC" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 64.53,162.94 L 66.65,164.25 L 68.98,165.18 L 71.41,165.74 L 73.48,166.73 L 76.29,166.56 L 78.76,165.29 L 80.87,164.31 L 82.55,162.73 L 84.71,160.69 L 85.62,157.75 L 86.02,154.34 L 85.89,150.53 L 84.24,148.03 L 84.24,148.03 L 82.48,150.87 L 81.25,154.16 L 80.04,156.6 L 78.89,158.16 L 77.99,158.89 L 77.48,159.11 L 76.82,159.37 L 75.4,159.85 L 73.54,160.38 L 71.51,160.88 L 69.3,161.32 L 66.78,161.76 L 64.53,162.94 Z"
          fill="#E9CFA8" />
    <path d="M 65,160 C 65,163 66,165 66,166" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 73,159 C 73,162 74,164 74,165" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 100px 140px;">
    <path class="cel-base"
          d="M 84,142 C 90,143 98,143 110,142 C 112,150 112,158 109,164 C 106,169 99,170 94,167 C 89,164 87,156 86,148 C 85,145 84,143 84,142 Z"
          fill="#FFF8EC" />
    <path class="cel-outline"
          d="M 109,164 C 106,169 99,170 94,167 C 89,164 87,156 86,148 C 85,145 84,143 84,142"
          fill="#FFF8EC" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 106.09,167 L 102.71,166.56 L 100.95,167.05 L 99.1,167.22 L 97.23,167.05 L 95.41,166.56 L 94,167 L 94,167 L 97.68,163.3 L 99.18,162.09 L 100.15,161.69 L 101.08,162.09 L 102.45,163.33 L 106.09,167 Z"
          fill="#E9CFA8" />
    <path d="M 91,163 C 91,166 92,168 92,169" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 99,162 C 99,165 100,167 100,168" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="pet-head" style="transform-origin: 60px 94px; transform: translateY(0px) rotate(0deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 44px 60px;">
      <path class="cel-outline"
            d="M 44,42 C 33,42 25,50 24,62 C 23,73 28,81 34,81 C 40,81 45,75 46,66 C 47,57 47,44 44,42 Z"
            fill="#F7B851" stroke="#3B2416" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 39,50 C 32,52 28,59 28,67 C 28,74 32,77 36,75 C 40,73 42,66 42,59 C 42,54 41,51 39,50 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 44,44 C 46.3,54 46,66 44,73.5 C 46.8,66 47.8,52 44.9,43 Z" fill="#C97E22" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 72px 52px;">
      <path class="cel-outline"
            d="M 66,40 C 77,38 85,46 86,58 C 87,70 82,78 75,78 C 68,78 63,72 62,62 C 61,52 62,41 66,40 Z"
            fill="#F7B851" stroke="#3B2416" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 71,46 C 78,48 81,55 81,63 C 81,70 77,73 73,72 C 69,71 67,65 67,57 C 67,51 69,47 71,46 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 66,41 C 63,50 63,60 64,67 C 62,58 63,46 67,41 Z" fill="#C97E22" />
    </g>

    <path class="cel-base"
          d="M 60,44 C 42,42 27,52 24,68 C 23,73 21,78 18,81 C 13,85 14,93 20,95 C 26,97 31,94 34,91 C 40,97 50,102 60,101 C 72,101 82,100 88,95 C 91,92 92,88 92,85 C 92,70 80,50 60,44 Z"
          fill="#F7B851" />
    <path class="cel-outline"
          d="M 92,85 C 92,70 80,50 60,44 C 42,42 27,52 24,68 C 23,73 21,78 18,81 C 13,85 14,93 20,95 C 26,97 31,94 34,91"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 17.99,93.99 L 18.93,94.56 L 20,95 L 21.11,95.32 L 22.2,95.53 L 23.26,95.63 L 24.3,95.64 L 25.3,95.56 L 26.28,95.4 L 27.22,95.17 L 28.12,94.88 L 29,94.52 L 29.83,94.11 L 30.63,93.66 L 31.39,93.17 L 32.11,92.65 L 32.78,92.12 L 33.41,91.56 L 34,91 L 34,91 L 31.44,89.41 L 30.16,88.98 L 29.12,88.71 L 28.23,88.53 L 27.47,88.41 L 26.8,88.34 L 26.23,88.32 L 25.73,88.35 L 25.29,88.44 L 24.89,88.6 L 24.5,88.82 L 24.08,89.13 L 23.6,89.51 L 23.01,89.97 L 22.26,90.5 L 21.35,91.13 L 20.24,91.95 L 17.99,93.99 Z"
          fill="#C97E22" />
    <path class="cel-shadow"
          d="M 58,47 C 78,53 88,68 90,84 C 88,79 87,73 84,67 C 79,59 69,53 58,52 Z"
          fill="#C97E22" />
    <path d="M 76,54 C 81,61 84,69 85,77" fill="none" stroke="#3B2416" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 84,63 C 87,69 89,76 89,83" fill="none" stroke="#3B2416" stroke-width="1.8" stroke-linecap="round" />

    <path d="M 25,78 C 19,80 16,86 18,91 C 21,95 28,95 32,91 C 36,87 37,81 34,78 C 32,76 28,76 25,78 Z"
          fill="#FFF8EC" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 18,91 C 21,95 28,95 32,91 C 35,89 36,85 36,82 C 37,87 34,92 31,93 C 26,96 20,94 18,91 Z" fill="#E9CFA8" />
    <path d="M 20,83 C 16,84 15,88 17,90 C 19,92 23,91 23,88 C 24,85 23,83 20,83 Z"
          fill="#3A2A22" stroke="#3B2416" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M 20,91 C 22,94 27,94 29,91" fill="none" stroke="#3B2416" stroke-width="1.6" stroke-linecap="round" />

    <path d="M 40,48 C 46,44 55,45 60,49 C 54,47 46,47 42,50 Z" fill="#FFF8EC" />
    <ellipse cx="44" cy="88" rx="6.5" ry="3.5" fill="#F0927F" />

    <g class="anim-blink">
      <ellipse class="cel-outline" cx="48" cy="66" rx="11" ry="13" fill="#6B3A12" stroke="#3B2416" stroke-width="3.2" />
      <path class="cel-shadow" d="M 39,70 C 39,70 42,75 42,75 C 41,74 46,78 46,77 C 45,77 51,77 50,77 C 50,78 55,74 54,75 C 54,75 57,70 57,70 Z" fill="#8A4A12" />
      <circle class="pet-pupil" data-anchor-x="48" data-anchor-y="66" cx="48" cy="66" r="4.8" fill="#160C06" />
      <circle cx="44" cy="60" r="3.8" fill="#FFFFFF" />
      <circle cx="52" cy="72" r="1.8" fill="#FFFFFF" />
    </g>
  </g>
</svg>
`;
const dogSleepSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="168" rx="62" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 146px 120px; transform: rotate(0deg);">
    <path class="cel-outline"
          d="M 148,118 C 165,122 174,138 169,153 C 164,167 148,174 131,169 C 119,166 111,155 114,146 C 116,138 124,139 127,146 C 130,153 138,158 145,157 C 153,156 157,149 154,141 C 152,132 147,125 140,122 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 127,146 C 130,153 138,158 145,157 C 153,156 157,149 154,141 C 157,150 152,158 142,159 C 133,160 126,154 124,147 Z"
          fill="#C97E22" />
    <path d="M 140,122 C 147,125 152,132 154,141 C 150,132 145,126 137,124 Z" fill="#8A4A12" />
    <path d="M 160,132 C 163,138 164,146 162,153" fill="none" stroke="#3B2416" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 124,152 C 122,156 122,160 124,163" fill="none" stroke="#3B2416" stroke-width="1.8" stroke-linecap="round" />
  </g>

  <g class="back-foot-left" style="transform-origin: 134px 146px;">
    <path class="cel-outline"
          d="M 128,140 C 124,148 126,158 134,161 C 142,164 151,159 152,151 C 153,143 144,136 136,136 C 132,136 129,138 128,140 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 134,161 C 142,164 151,159 152,151 C 152.5,147.3 150.8,143.7 148.2,141.4 C 152,147 149,154 143,156 C 139,157 136,159 134,161 Z"
          fill="#C97E22" />
  </g>
  <g class="back-foot-right" style="transform-origin: 152px 140px;">
    <path class="cel-outline"
          d="M 146,132 C 142,140 145,150 153,152 C 161,154 168,148 167,141 C 166,134 157,129 150,129 C 148,129 147,130 146,132 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 153,152 C 161,154 168,148 167,141 C 166.7,138.2 164.7,135.2 162.2,133.8 C 165,140 162,146 156,147 C 155,149 154,151 153,152 Z"
          fill="#C97E22" />
  </g>

  <g class="anim-breath pet-body" style="transform-origin: 108px 134px; transform: translateY(0px) rotate(0deg);">
    <path class="cel-outline"
          d="M 66,116 C 84,107 116,107 136,116 C 152,122 157,140 148,152 C 139,163 118,167 96,165 C 76,163 62,154 60,140 C 58,130 60,121 66,116 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 148,152 C 139,163 118,167 96,165 C 76,163 62,154 60,140 C 64,152 78,159 96,161 C 118,163 138,158 147,148 Z"
          fill="#C97E22" />
    <path d="M 74,124 C 70,134 72,144 80,148 C 90,153 104,152 112,146 C 108,152 96,155 86,152 C 74,148 70,136 74,124 Z"
          fill="#FFF8EC" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 72,140 C 74,147 80,151 88,152 C 82,153 76,149 73,144 Z" fill="#E9CFA8" />
    <path d="M 96,110 C 99,120 99,130 97,138 C 93,130 92,120 94,110 Z" fill="#8A4A12" />
    <path d="M 118,112 C 121,122 121,131 119,139 C 115,131 114,122 116,112 Z" fill="#8A4A12" />
  </g>

  <g class="left-paw" style="transform-origin: 44px 152px;">
    <path class="cel-base"
          d="M 64,142 C 52,146 36,150 24,154 C 16,157 16,163 24,165 C 36,168 54,164 62,158 C 67,154 67,148 64,142 Z"
          fill="#FFF8EC" />
    <path class="cel-outline"
          d="M 52,146 C 52,146 36,150 24,154 C 16,157 16,163 24,165 C 36,168 54,164 62,158"
          fill="#FFF8EC" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 23.04,163.32 L 24,165 L 29.52,164.84 L 34.04,165.03 L 38.71,164.74 L 43.38,164.02 L 49.62,163.64 L 52.08,161.53 L 55.76,159.86 L 58.78,157.97 L 58.78,157.97 L 56.64,156.53 L 52.33,156.82 L 47.83,157.38 L 43.17,158.06 L 38.45,158.78 L 33.8,159.5 L 29.32,160.22 L 24.94,161.01 L 23.04,163.32 Z"
          fill="#E9CFA8" />
    <path d="M 28,157 C 28,160 29,162 29,163" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 36,155 C 36,158 37,160 37,161" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 72px 152px;">
    <path class="cel-outline"
          d="M 80,146 C 68,150 54,154 44,158 C 38,161 40,166 48,167 C 60,168 74,164 82,158 C 86,154 85,149 80,146 Z"
          fill="#FFF8EC" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 48,167 C 60,168 74,164 82,158 C 84.7,155.8 84.9,151.9 83.3,149.4 C 83.4,153.9 81.2,158.3 76,160 C 66,164 54,166 48,167 Z"
          fill="#E9CFA8" />
    <path d="M 46,160 C 46,163 47,165 47,166" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 54,158 C 54,161 55,163 55,164" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="pet-head" style="transform-origin: 70px 126px; transform: translateY(0px) rotate(-16deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 52px 100px;">
      <path class="cel-outline"
            d="M 58,88 C 44,92 36,106 38,120 C 39,131 49,136 55,129 C 61,122 64,106 62,94 C 61,89 60,87 58,88 Z"
            fill="#F7B851" stroke="#3B2416" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 52,97 C 44,100 40,110 41,118 C 42,125 47,127 50,122 C 54,116 55,105 54,98 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 59,91 C 62,102 61,116 56,124 C 60,114 60,100 58,90 Z" fill="#C97E22" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 88px 94px;">
      <path class="cel-outline"
            d="M 88,86 C 100,90 104,102 100,114 C 97,124 87,127 83,119 C 79,111 80,97 84,90 C 85,87 86,86 88,86 Z"
            fill="#F7B851" stroke="#3B2416" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 90,95 C 97,98 99,106 97,113 C 95,119 90,120 88,114 C 86,107 87,99 88,95 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 83,119 C 87,127 97,124 100,114 C 97,120 91,123 83,119 Z" fill="#C97E22" />
    </g>

    <path class="cel-base"
          d="M 76,86 C 56,84 40,96 38,114 C 36,124 32,130 26,134 C 20,138 22,146 30,146 C 36,146 40,143 43,140 C 50,148 62,152 74,150 C 90,148 100,136 100,120 C 100,100 90,88 76,86 Z"
          fill="#F7B851" />
    <path class="cel-outline"
          d="M 99.8,117 C 100,107 96,98 88,91 C 84,89 80,87 76,86 C 56,84 40,96 38,114 C 36,124 32,130 26,134 C 20,138 22,146 30,146 C 36,146 40,143 43,140"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 74,89 C 87,91 96,102 97,114 C 95,104 90,97 80,93 Z"
          fill="#C97E22" />
    <path d="M 82,95 C 88,100 92,106 94,112" fill="none" stroke="#3B2416" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 89,93 C 94,99 97,105 98,111" fill="none" stroke="#3B2416" stroke-width="1.8" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 25.16,144.69 L 26.15,145.24 L 27.29,145.65 L 28.57,145.91 L 30,146 L 31.1,145.97 L 32.16,145.87 L 33.17,145.7 L 34.14,145.48 L 35.07,145.21 L 35.96,144.89 L 36.81,144.53 L 37.62,144.12 L 38.4,143.69 L 39.15,143.22 L 39.86,142.72 L 40.55,142.2 L 41.2,141.67 L 41.83,141.12 L 42.43,140.56 L 43,140 L 43,140 L 40.52,138.56 L 39.22,138.23 L 38.15,138.07 L 37.23,137.99 L 36.41,137.96 L 35.68,137.97 L 35.02,138.01 L 34.44,138.09 L 33.9,138.21 L 33.4,138.38 L 32.92,138.6 L 32.43,138.87 L 31.92,139.21 L 31.37,139.62 L 30.73,140.09 L 30.12,140.63 L 29.18,141.23 L 28.33,141.9 L 27.29,142.71 L 25.16,144.69 Z"
          fill="#C97E22" />

    <path d="M 37,127 C 31,129 27,136 30,142 C 34,147 43,146 47,141 C 51,136 48,129 42,127 C 40,126 38,126 37,127 Z"
          fill="#FFF8EC" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 30,142 C 34,147 43,146 47,141 C 50,137 48,131 46,130 C 45,135 41,140 34,142 C 32,142 31,142 30,142 Z" fill="#E9CFA8" />
    <path d="M 29,134 C 25,135 24,140 28,142 C 32,144 35,142 35,139 C 35,136 32,133 29,134 Z"
          fill="#3A2A22" stroke="#3B2416" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M 33,144 C 35,147 40,147 42,143" fill="none" stroke="#3B2416" stroke-width="1.6" stroke-linecap="round" />

    <path d="M 62,106 C 66,113 76,113 80,106" fill="none" stroke="#3B2416" stroke-width="2" stroke-linecap="round" />
    <path d="M 64,111 C 68,115 74,115 78,111" fill="none" stroke="#3B2416" stroke-width="1.6" stroke-linecap="round" />

    <ellipse cx="52" cy="130" rx="6" ry="3.5" fill="#F0927F" />
    <ellipse cx="88" cy="124" rx="5.5" ry="3.2" fill="#F0927F" />
  </g>
</svg>
`;
const dogSitSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="172" rx="54" ry="6.5" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 138px 144px; transform: rotate(0deg);">
    <path class="cel-outline"
          d="M 124,158 C 146,153 168,138 175,120 C 178,109 174,100 166,99 C 160,98 156,104 160,109 C 164,114 164,120 160,126 C 154,135 146,140 139,140 C 135,146 130,152 124,158 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 139,140 C 146,140 154,135 160,126 C 163,121 164,116 162,111 C 164,117 164,123 161,129 C 155,138 147,143 140,142 Z"
          fill="#C97E22" />
    <path d="M 166,99 C 172,99 176,105 175,112 C 176,106 173,101 168,101 Z" fill="#8A4A12" />
    <path d="M 158,132 C 165,126 169,118 170,110" fill="none" stroke="#3B2416" stroke-width="1.8" stroke-linecap="round" />
  </g>

  <g class="back-foot-left" style="transform-origin: 70px 148px;">
    <path class="cel-outline"
          d="M 64,132 C 56,139 54,153 60,161 C 65,167 76,168 82,162 C 86,157 86,141 80,133 C 75,128 68,129 64,132 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 60,161 C 65,167 76,168 82,162 C 84.4,158.9 85.2,152.9 84.6,147 C 85,155 81,161 74,162 C 68,163 63,162 60,161 Z"
          fill="#C97E22" />
    <path d="M 66,155 C 66,158 67,160 67,161" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="back-foot-right" style="transform-origin: 130px 148px;">
    <path class="cel-outline"
          d="M 136,132 C 144,139 146,153 140,161 C 135,167 124,168 118,162 C 114,157 114,141 120,133 C 125,128 132,129 136,132 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 140,161 C 135,167 124,168 118,162 C 118,158 117,153 116,147 C 116,155 119,161 126,162 C 132,163 137,162 140,161 Z"
          fill="#C97E22" />
    <path d="M 134,155 C 134,158 133,160 133,161" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="anim-breath pet-body" style="transform-origin: 100px 134px; transform: translateY(0px) rotate(0deg);">
    <path class="cel-outline"
          d="M 100,94 C 78,94 63,110 61,132 C 59,150 66,163 80,167 C 92,170 108,170 120,167 C 134,163 141,150 139,132 C 137,110 122,94 100,94 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 139,132 C 141,150 134,163 120,167 C 108,170 92,170 80,167 C 66,163 59,150 61,132 C 63,148 71,158 82,161 C 93,164 107,164 118,161 C 129,158 137,148 139,132 Z"
          fill="#C97E22" />
    <path d="M 86,100 C 83,116 83,136 87,152 C 89,159 94,163 100,163 C 106,163 111,159 113,152 C 117,136 117,116 114,100 C 109,96 91,96 86,100 Z"
          fill="#FFF8EC" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 87,148 C 89,157 94,162 100,162 C 106,162 111,157 113,148 C 112,157 107,163 100,163 C 93,163 88,157 87,148 Z" fill="#E9CFA8" />
  </g>

  <g class="left-paw" style="transform-origin: 90px 148px;">
    <path class="cel-base"
          d="M 100,144 C 94,144 88,142 84,137 C 82,145 82,155 84,162 C 85,167 89,170 93,170 C 98,170 101,167 101,160 C 101,154 100,148 100,144 Z"
          fill="#FFF8EC" />
    <path class="cel-outline"
          d="M 84,137 C 82,145 82,155 84,162 C 85,167 89,170 93,170 C 98,170 101,167 101,160 C 101,154 100,148 100,144"
          fill="#FFF8EC" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 84,162 C 85,167 89,170 93,170 C 97,170 100,168 100,164 C 99,167 96,168 93,168 C 89,168 86,166 84,162 Z"
          fill="#E9CFA8" />
    <path d="M 87,164 C 87,167 88,169 88,169" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 110px 148px;">
    <path class="cel-base"
          d="M 114,137 C 110,142 104,144 100,144 C 99,152 100,160 102,165 C 104,169 110,169 114,166 C 118,162 119,152 118,142 C 117,139 115,137 114,137 Z"
          fill="#FFF8EC" />
    <path class="cel-outline"
          d="M 100,144 C 99,152 100,160 102,165 C 104,169 110,169 114,166 C 118,162 119,152 118,142 C 117,139 115,137 114,137"
          fill="#FFF8EC" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 102,165 C 104,169 110,169 114,166 C 116,164 117,160 118,156 C 117,162 115,166 111,166 C 107,167 104,166 102,165 Z"
          fill="#E9CFA8" />
    <path d="M 106,163 C 106,166 107,168 107,168" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="pet-head" style="transform-origin: 100px 96px; transform: translateY(0px) rotate(0deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 56px 62px;">
      <path class="cel-outline"
            d="M 56,48 C 42,52 33,66 35,82 C 36,93 45,99 51,92 C 57,85 61,68 61,56 C 61,50 59,47 56,48 Z"
            fill="#F7B851" stroke="#3B2416" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 50,58 C 42,62 39,72 40,81 C 41,88 46,91 49,86 C 53,80 55,69 55,60 C 55,58 52,57 50,58 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 57,50 C 60,60 59.9,78 53.7,87.4 C 59,78 59,58 56,49 Z" fill="#C97E22" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 144px 62px;">
      <path class="cel-outline"
            d="M 144,48 C 158,52 167,66 165,82 C 164,93 155,99 149,92 C 143,85 139,68 139,56 C 139,50 141,47 144,48 Z"
            fill="#F7B851" stroke="#3B2416" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 150,58 C 158,62 161,72 160,81 C 159,88 154,91 151,86 C 147,80 145,69 145,60 C 145,58 148,57 150,58 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 149,92 C 155,99 164,93 165,82 C 163,90 156,95 149,92 Z" fill="#C97E22" />
    </g>

    <path class="cel-outline"
          d="M 100,40 C 70,40 48,56 46,82 C 45,96 52,110 66,116 C 78,121 122,121 134,116 C 148,110 155,96 154,82 C 152,56 130,40 100,40 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 58.87,111.83 L 61.08,113.39 L 63.46,114.78 L 66,116 L 68.61,116.88 L 71.88,117.64 L 75.7,118.29 L 80,118.81 L 84.67,119.22 L 89.62,119.52 L 94.77,119.69 L 100,119.75 L 105.23,119.69 L 110.38,119.52 L 115.33,119.22 L 120,118.81 L 124.3,118.29 L 128.12,117.64 L 131.39,116.88 L 134,116 L 136.54,114.78 L 138.92,113.39 L 141.13,111.83 L 143.17,110.12 L 145.04,108.28 L 146.74,106.3 L 148.27,104.2 L 149.62,102 L 150.8,99.71 L 151.8,97.33 L 152.62,94.88 L 153.27,92.38 L 153.73,89.82 L 154,87.23 L 154.09,84.62 L 154,82 L 153.39,77.24 L 152.34,72.73 L 150.84,68.47 L 148.94,64.47 L 146.63,60.74 L 146.63,60.74 L 147.22,65.41 L 148.28,69.52 L 149.09,73.67 L 149.56,77.93 L 149.69,82.41 L 149.38,84.62 L 148.95,86.88 L 148.41,89.06 L 147.75,91.18 L 146.98,93.21 L 146.09,95.17 L 145.1,97.04 L 143.99,98.83 L 142.78,100.52 L 141.47,102.12 L 140.05,103.62 L 138.53,105.02 L 136.89,106.32 L 135.14,107.51 L 133.26,108.6 L 131.37,109.53 L 129.52,110.18 L 126.78,110.87 L 123.32,111.53 L 119.3,112.12 L 114.85,112.63 L 110.08,113.06 L 105.09,113.4 L 100,113.65 L 94.9,113.81 L 89.89,113.88 L 85.06,113.87 L 80.53,113.78 L 76.38,113.62 L 72.72,113.39 L 69.66,113.13 L 67.27,112.87 L 64.75,112.34 L 62.14,111.74 L 58.87,111.83 Z"
          fill="#C97E22" />

    <path d="M 64,56 C 70,52 82,52 88,56 C 82,54 70,54 66,58 Z" fill="#FFF8EC" />
    <path d="M 112,56 C 118,52 130,52 136,56 C 130,54 118,54 114,58 Z" fill="#FFF8EC" />

    <ellipse cx="62" cy="92" rx="7" ry="4" fill="#F0927F" />
    <ellipse cx="138" cy="92" rx="7" ry="4" fill="#F0927F" />

    <path d="M 78,90 C 78,82 87,78 100,78 C 113,78 122,82 122,90 C 122,102 113,110 100,110 C 87,110 78,102 78,90 Z"
          fill="#FFF8EC" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 79,95 C 85,103 115,103 121,95 C 119,103 111,110 100,110 C 89,110 81,103 79,95 Z" fill="#E9CFA8" />
    <path d="M 95,80 C 90,83 90,88 95,90 C 100,92 105,90 105,86 C 105,82 100,79 95,80 Z"
          fill="#3A2A22" stroke="#3B2416" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M 93,92 C 96,96 104,96 107,92" fill="none" stroke="#3B2416" stroke-width="1.6" stroke-linecap="round" />

    <g class="anim-blink">
      <ellipse class="cel-outline" cx="76" cy="74" rx="13" ry="15" fill="#6B3A12" stroke="#3B2416" stroke-width="3.2" />
      <path class="cel-shadow" d="M 65,79 C 65,78 69,85 68,84 C 68,84 74,88 73,87 C 72,87 80,87 79,87 C 78,88 84,84 84,84 C 83,85 87,78 87,79 Z" fill="#8A4A12" />
      <circle class="pet-pupil" data-anchor-x="76" data-anchor-y="74" cx="76" cy="74" r="4.8" fill="#160C06" />
      <circle cx="71" cy="68" r="4" fill="#FFFFFF" />
      <circle cx="81" cy="80" r="1.9" fill="#FFFFFF" />
      <ellipse class="cel-outline" cx="124" cy="74" rx="13" ry="15" fill="#6B3A12" stroke="#3B2416" stroke-width="3.2" />
      <path class="cel-shadow" d="M 113,79 C 113,78 117,85 116,84 C 116,84 122,88 121,87 C 120,87 128,87 127,87 C 126,88 132,84 132,84 C 131,85 135,78 135,79 Z" fill="#8A4A12" />
      <circle class="pet-pupil" data-anchor-x="124" data-anchor-y="74" cx="124" cy="74" r="4.8" fill="#160C06" />
      <circle cx="119" cy="68" r="4" fill="#FFFFFF" />
      <circle cx="129" cy="80" r="1.9" fill="#FFFFFF" />
    </g>
  </g>
</svg>
`;
const dogLaySVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="104" cy="170" rx="72" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 162px 126px; transform: rotate(0deg);">
    <path class="cel-outline"
          d="M 136,146 C 152,138 166,129 175,120 C 186,109 190,92 182,76 C 173,58 150,60 145,78 C 142,90 157,99 162,112 C 165,122 165,127 162,130 C 162,138 150,146 136,146 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 175,120 C 186,109 190,92 182,76 C 181,86 181,93 180,99 C 179,106 177,114 175,120 Z"
          fill="#C97E22" />
    <path d="M 182,76 C 186,88 183,102 175,112 C 181,101 183,88 179,79 Z" fill="#8A4A12" />
    <path d="M 170,86 C 173,96 172,106 168,114" fill="none" stroke="#3B2416" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 152,80 C 150,86 152,92 156,96" fill="none" stroke="#3B2416" stroke-width="1.8" stroke-linecap="round" />
  </g>

  <g class="back-foot-left" style="transform-origin: 144px 144px;">
    <path class="cel-outline"
          d="M 138,140 C 144,146 152,154 156,162 C 158,167 151,170 143,168 C 135,165 130,155 133,147 C 134,143 136,140 138,140 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 156,162 C 158,167 151,170 143,168 C 140,165 137,162 135,159 C 137,164 141,165 145,165 C 150,165 154,164 156,162 Z"
          fill="#C97E22" />
  </g>
  <g class="back-foot-right" style="transform-origin: 160px 148px;">
    <path class="cel-outline"
          d="M 154,144 C 160,150 166,157 168,163 C 170,168 163,170 156,168 C 148,165 144,155 148,148 C 150,145 152,143 154,144 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 168,163 C 170,168 163,170 156,168 C 153,165 151,163 149,160 C 151,164 154,166 158,166 C 163,166 166,165 168,163 Z"
          fill="#C97E22" />
  </g>

  <g class="anim-breath pet-body" style="transform-origin: 110px 132px; transform: translateY(0px) rotate(0deg);">
    <path class="cel-outline"
          d="M 56,132 C 52,144 62,156 86,160 C 112,164 146,160 164,150 C 174,144 172,130 158,124 C 134,114 72,116 56,132 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 164,150 C 146,160 112,164 86,160 C 62,156 52,144 56,132 C 58,142 68,150 88,154 C 112,158 144,154 161,145 Z"
          fill="#C97E22" />
    <path d="M 72,134 C 66,142 68,152 80,156 C 92,159 106,156 112,148 C 108,155 96,158 86,156 C 76,154 71,144 72,134 Z"
          fill="#FFF8EC" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 70,148 C 73,153 79,156 86,156 C 80,157 73,155 70,151 Z" fill="#E9CFA8" />
    <path d="M 96,120 C 99,130 99,140 97,148 C 93,140 92,130 94,120 Z" fill="#8A4A12" />
    <path d="M 120,124 C 123,133 123,142 121,149 C 117,142 116,133 118,124 Z" fill="#8A4A12" />
  </g>

  <g class="left-paw" style="transform-origin: 52px 156px;">
    <path class="cel-base"
          d="M 76,138 C 62,142 44,150 30,158 C 22,162 24,168 32,169 C 46,171 66,166 76,160 C 82,156 82,144 76,138 Z"
          fill="#FFF8EC" />
    <path class="cel-outline"
          d="M 62,142 C 62,142 44,150 30,158 C 22,162 24,168 32,169 C 46,171 66,166 76,160"
          fill="#FFF8EC" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 27.19,167.42 L 29.29,168.4 L 32,169 L 37.5,169.43 L 43.38,169.28 L 49.44,168.61 L 54.13,166.59 L 61.38,166.01 L 64.15,163.71 L 71.81,162.19 L 72.17,159.99 L 72.17,159.99 L 70.18,158.66 L 65.03,159.18 L 59.63,159.96 L 54.05,160.83 L 48.42,161.69 L 42.91,162.47 L 37.66,163.14 L 32.67,163.67 L 30.5,164.71 L 27.19,167.42 Z"
          fill="#E9CFA8" />
    <path d="M 34,161 C 34,164 35,166 35,167" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 42,158 C 42,161 43,163 43,164" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 78px 156px;">
    <path class="cel-outline"
          d="M 92,142 C 78,146 60,153 48,160 C 42,164 44,169 51,170 C 64,171 82,166 92,160 C 97,156 97,148 92,142 Z"
          fill="#FFF8EC" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 51,170 C 64,171 82,166 92,160 C 95,158 96,154 95,151 C 95,157 92,161 86,163 C 76,167 60,170 51,170 Z"
          fill="#E9CFA8" />
    <path d="M 48,162 C 48,165 49,167 49,168" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 56,159 C 56,162 57,164 57,165" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="pet-head" style="transform-origin: 78px 126px; transform: translateY(0px) rotate(-8deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 38px 104px;">
      <path class="cel-outline"
            d="M 40,92 C 28,94 21,106 23,120 C 24,131 34,136 40,130 C 46,123 49,111 48,100 C 47,94 44,91 40,92 Z"
            fill="#F7B851" stroke="#3B2416" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 36,100 C 28,102 25,110 26,119 C 27,126 32,128 35,123 C 39,118 40,108 39,101 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 23,120 C 24,131 34,136 40,130 C 36,132 28,128 23,120 Z" fill="#C97E22" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 78px 94px;">
      <path class="cel-outline"
            d="M 80,88 C 92,90 99,102 97,116 C 95,127 85,132 79,125 C 73,118 71,105 73,95 C 74,90 77,87 80,88 Z"
            fill="#F7B851" stroke="#3B2416" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 83,96 C 91,98 93,106 91,114 C 90,121 85,123 82,118 C 78,113 77,103 79,97 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 79,125 C 85,132 95,127 97,116 C 94,122 87,127 79,125 Z" fill="#C97E22" />
    </g>

    <path class="cel-outline"
          d="M 64,86 C 42,86 26,100 26,120 C 26,140 42,156 64,156 C 86,156 102,140 102,120 C 102,100 86,86 64,86 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 42.31,149.88 L 45.44,151.68 L 48.78,153.19 L 52.32,154.39 L 56.05,155.27 L 59.95,155.82 L 64,156 L 68.05,155.82 L 71.95,155.27 L 75.68,154.39 L 79.22,153.19 L 82.56,151.68 L 85.69,149.88 L 88.59,147.82 L 91.25,145.5 L 93.65,142.95 L 95.78,140.18 L 97.62,137.21 L 99.16,134.06 L 100.38,130.75 L 101.27,127.29 L 101.81,123.7 L 102,120 L 101.81,116.32 L 101.27,112.8 L 100.38,109.44 L 99.16,106.25 L 97.62,103.25 L 95.78,100.45 L 95.78,100.45 L 95.59,104.43 L 96.14,107.6 L 96.55,110.67 L 96.76,113.74 L 96.74,116.84 L 96.47,120 L 95.96,123.11 L 95.2,126.05 L 94.23,128.83 L 93.05,131.45 L 91.66,133.92 L 90.09,136.25 L 88.34,138.43 L 86.4,140.46 L 84.27,142.34 L 81.96,144.06 L 79.47,145.62 L 76.78,147.01 L 73.9,148.2 L 70.81,149.19 L 67.52,149.95 L 64,150.47 L 60.41,150.73 L 56.9,150.74 L 53.43,150.52 L 49.99,150.12 L 46.5,149.59 L 42.31,149.88 Z"
          fill="#C97E22" />

    <path d="M 50,130 C 50,122 56,118 64,118 C 72,118 78,122 78,130 C 78,140 72,146 64,146 C 56,146 50,140 50,130 Z"
          fill="#FFF8EC" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 50,133 C 53,141 58,144 64,144 C 70,144 75,141 78,133 C 77,141 72,147 64,147 C 56,147 51,141 50,133 Z" fill="#E9CFA8" />
    <path d="M 60,120 C 56,122 56,127 60,129 C 64,131 68,129 68,125 C 68,121 64,119 60,120 Z"
          fill="#3A2A22" stroke="#3B2416" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M 58,131 C 60,135 68,135 70,131" fill="none" stroke="#3B2416" stroke-width="1.6" stroke-linecap="round" />

    <ellipse cx="36" cy="128" rx="6" ry="3.5" fill="#F0927F" />
    <ellipse cx="92" cy="128" rx="6" ry="3.5" fill="#F0927F" />

    <g class="anim-blink">
      <ellipse class="cel-outline" cx="50" cy="116" rx="12" ry="14" fill="#6B3A12" stroke="#3B2416" stroke-width="3.2" />
      <path class="cel-shadow" d="M 40,121 C 40,120 44,126 43,126 C 43,125 48,129 48,128 C 47,128 53,128 53,128 C 52,129 58,125 57,126 C 56,126 60,120 60,121 Z" fill="#8A4A12" />
      <circle class="pet-pupil" data-anchor-x="50" data-anchor-y="116" cx="50" cy="116" r="4.6" fill="#160C06" />
      <circle cx="46" cy="110" r="3.7" fill="#FFFFFF" />
      <circle cx="54" cy="122" r="1.8" fill="#FFFFFF" />
      <ellipse class="cel-outline" cx="78" cy="116" rx="12" ry="14" fill="#6B3A12" stroke="#3B2416" stroke-width="3.2" />
      <path class="cel-shadow" d="M 68,121 C 68,120 72,126 71,126 C 71,125 76,129 76,128 C 75,128 81,128 81,128 C 80,129 86,125 85,126 C 84,126 88,120 88,121 Z" fill="#8A4A12" />
      <circle class="pet-pupil" data-anchor-x="78" data-anchor-y="116" cx="78" cy="116" r="4.6" fill="#160C06" />
      <circle cx="74" cy="110" r="3.7" fill="#FFFFFF" />
      <circle cx="82" cy="122" r="1.8" fill="#FFFFFF" />
    </g>
  </g>
</svg>
`;
const dogStretchSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="170" rx="66" ry="6.5" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 138px 98px; transform: rotate(0deg);">
    <path class="cel-outline"
          d="M 138,100 C 142,78 138,54 122,44 C 110,37 100,48 108,60 C 114,69 122,78 128,92 C 130,95 134,98 138,100 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 138,100 C 142,78 138,54 122,44 C 125,50 131,60 133,68 C 135,79 136,90 138,100 Z"
          fill="#C97E22" />
    <path d="M 108,60 C 103,50 110,40 122,44 C 114,46 110,53 113,58 C 114,61 111,62 108,60 Z" fill="#8A4A12" />
    <path d="M 132,80 C 136,70 136,58 131,49" fill="none" stroke="#3B2416" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 118,45 C 124,42 131,43 136,46" fill="none" stroke="#3B2416" stroke-width="1.8" stroke-linecap="round" />
  </g>

  <g class="back-foot-left" style="transform-origin: 124px 94px;">
    <path class="cel-outline"
          d="M 121,91 C 132,92 142,97 147,106 C 150,112 148,118 143,120 C 148,122 152,127 151,132 C 150,137 141,138 136,133 C 131,128 131,120 130,112 C 128,104 123,96 118,92 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 136,133 C 141,138 150,137 151,132 C 148,133 147,133 145,134 C 142,133 139,132 136,133 Z"
          fill="#C97E22" />
    <path d="M 145,129 C 145,132 146,134 146,135" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="back-foot-right" style="transform-origin: 142px 100px;">
    <path class="cel-outline"
          d="M 134,92 C 146,96 156,104 161,114 C 164,120 162,126 158,128 C 164,130 168,135 167,140 C 166,145 156,146 151,141 C 146,136 146,129 145,121 C 143,110 137,99 131,95 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 151,141 C 156,146 166,145 167,140 C 165,141 163,142 161,142 C 158,141 154,141 151,141 Z"
          fill="#C97E22" />
    <path d="M 160,137 C 160,140 161,142 161,143" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="anim-breath pet-body" style="transform-origin: 110px 116px; transform: translateY(0px) rotate(0deg);">
    <path class="cel-outline"
          d="M 58,146 C 72,112 104,90 138,92 C 152,93 158,104 150,116 C 140,130 112,140 88,150 C 70,157 54,158 58,146 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 150,116 C 140,130 112,140 88,150 C 84,151 81,152 78,152 C 86,148 100,140 116,133 C 132,126 143,118 146,110 C 148,112 149,114 150,116 Z"
          fill="#C97E22" />
    <path d="M 62,146 C 76,141 96,133 114,126 C 126,121 136,116 142,111 C 145,115 143,119 137,123 C 121,132 99,141 82,146 C 72,149 64,150 62,146 Z"
          fill="#FFF8EC" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 62,146 C 64,150 72,149 82,146 C 99,141 121,132 137,123 C 140,121 142,119 143,117 C 139,122 124,131 106,139 C 88,146 70,151 62,146 Z" fill="#E9CFA8" />
    <path d="M 88,108 C 93,117 95,127 93,136 C 88,128 85,117 86,108 Z" fill="#8A4A12" />
    <path d="M 108,95 C 113,104 115,114 113,123 C 108,115 105,104 106,95 Z" fill="#8A4A12" />
  </g>

  <g class="left-paw" style="transform-origin: 34px 158px;">
    <path class="cel-outline"
          d="M 42,142 C 32,146 14,152 4,157 C -2,160 -1,166 5,167 C 15,169 30,165 37,161 C 42,157 44,148 42,142 Z"
          fill="#FFF8EC" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 5,167 C 15,169 30,165 37,161 C 40,159 41,156 41,153 C 40,158 36,162 29,164 C 20,167 10,168 5,167 Z"
          fill="#E9CFA8" />
    <path d="M 7,161 C 7,164 8,166 8,167" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 14,159 C 14,162 15,164 15,165" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 58px 158px;">
    <path class="cel-base"
          d="M 60,146 C 50,150 34,155 25,160 C 20,163 21,168 27,169 C 38,171 50,167 56,163 C 61,159 62,151 60,146 Z"
          fill="#FFF8EC" />
    <path class="cel-outline"
          d="M 50,150 C 50,150 34,155 25,160 C 20,163 21,168 27,169 C 38,171 50,167 56,163"
          fill="#FFF8EC" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 23.45,167.59 L 24.99,168.45 L 27,169 L 31.16,169.48 L 35.33,168.62 L 38.94,168.24 L 42.42,167.54 L 47.09,167.18 L 48.67,165.48 L 51.31,164.23 L 53.52,162.92 L 53.52,162.92 L 51.67,161.05 L 48.4,160.96 L 45.12,161.2 L 41.77,161.61 L 38.38,162.11 L 34.96,162.65 L 31.51,163.19 L 27.88,163.71 L 26.42,164.83 L 23.45,167.59 Z"
          fill="#E9CFA8" />
    <path d="M 28,163 C 28,166 29,168 29,169" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 35,161 C 35,164 36,166 36,167" fill="none" stroke="#3B2416" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="pet-head" style="transform-origin: 56px 140px; transform: translateY(0px) rotate(-16deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 34px 118px;">
      <path class="cel-outline"
            d="M 36,106 C 24,108 17,120 19,134 C 20,145 30,150 36,144 C 42,137 45,125 44,114 C 43,108 40,105 36,106 Z"
            fill="#F7B851" stroke="#3B2416" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 32,114 C 24,116 21,124 22,133 C 23,140 28,142 31,137 C 35,132 36,122 35,115 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 19,134 C 20,145 30,150 36,144 C 32,146 25,141 19,134 Z" fill="#C97E22" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 74px 108px;">
      <path class="cel-outline"
            d="M 76,102 C 88,104 95,116 93,130 C 91,141 81,146 75,139 C 69,132 67,119 69,109 C 70,104 73,101 76,102 Z"
            fill="#F7B851" stroke="#3B2416" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 79,110 C 87,112 89,120 87,128 C 86,135 81,137 78,132 C 74,127 73,117 75,111 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 75,139 C 81,146 91,141 93,130 C 90,136 83,139 75,139 Z" fill="#C97E22" />
    </g>

    <path class="cel-outline"
          d="M 56,100 C 34,100 20,112 20,128 C 20,144 34,154 56,154 C 78,154 92,144 92,128 C 92,112 78,100 56,100 Z"
          fill="#F7B851" stroke="#3B2416" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 29.75,147 L 32.22,148.59 L 34.94,149.99 L 37.9,151.19 L 41.09,152.19 L 44.51,152.97 L 48.14,153.54 L 51.97,153.88 L 56,154 L 60.03,153.88 L 63.86,153.54 L 67.49,152.97 L 70.91,152.19 L 74.1,151.19 L 77.06,149.99 L 79.78,148.59 L 82.25,147 L 84.46,145.22 L 86.41,143.26 L 88.08,141.12 L 89.47,138.81 L 90.56,136.34 L 91.36,133.71 L 91.84,130.93 L 92,128 L 91.84,125.05 L 91.36,122.2 L 90.56,119.47 L 89.47,116.88 L 88.08,114.42 L 88.08,114.42 L 87.4,117.89 L 87.5,120.56 L 87.5,123.08 L 87.33,125.55 L 86.97,128 L 86.43,130.32 L 85.71,132.38 L 84.83,134.22 L 83.82,135.88 L 82.66,137.39 L 81.35,138.79 L 79.87,140.11 L 78.19,141.36 L 76.29,142.53 L 74.15,143.63 L 71.76,144.64 L 69.12,145.55 L 66.22,146.35 L 63.06,147.01 L 59.66,147.53 L 56,147.89 L 52.31,148.09 L 48.8,148.13 L 45.46,148.04 L 42.27,147.81 L 39.23,147.47 L 36.29,147.04 L 33.37,146.6 L 29.75,147 Z"
          fill="#C97E22" />

    <path d="M 44,138 C 44,130 50,126 56,126 C 62,126 68,130 68,138 C 68,146 62,152 56,152 C 50,152 44,146 44,138 Z"
          fill="#FFF8EC" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 44,141 C 47,148 51,150 56,150 C 61,150 65,148 68,141 C 67,148 62,153 56,153 C 50,153 45,148 44,141 Z" fill="#E9CFA8" />
    <path d="M 52,128 C 48,130 48,135 52,137 C 56,139 60,137 60,133 C 60,129 56,127 52,128 Z"
          fill="#3A2A22" stroke="#3B2416" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M 50,139 C 52,143 60,143 62,139" fill="none" stroke="#3B2416" stroke-width="1.6" stroke-linecap="round" />

    <ellipse cx="30" cy="136" rx="6" ry="3.5" fill="#F0927F" />
    <ellipse cx="82" cy="136" rx="6" ry="3.5" fill="#F0927F" />

    <g class="anim-blink">
      <ellipse class="cel-outline" cx="42" cy="124" rx="12" ry="14" fill="#6B3A12" stroke="#3B2416" stroke-width="3.2" />
      <path class="cel-shadow" d="M 32,129 C 32,128 36,134 35,134 C 35,133 40,137 40,136 C 39,136 45,136 45,136 C 44,137 50,133 49,134 C 48,134 52,128 52,129 Z" fill="#8A4A12" />
      <circle class="pet-pupil" data-anchor-x="42" data-anchor-y="124" cx="42" cy="124" r="4.6" fill="#160C06" />
      <circle cx="38" cy="118" r="3.7" fill="#FFFFFF" />
      <circle cx="46" cy="130" r="1.8" fill="#FFFFFF" />
      <ellipse class="cel-outline" cx="68" cy="124" rx="12" ry="14" fill="#6B3A12" stroke="#3B2416" stroke-width="3.2" />
      <path class="cel-shadow" d="M 58,129 C 58,128 62,134 61,134 C 61,133 66,137 66,136 C 65,136 71,136 71,136 C 70,137 76,133 75,134 C 74,134 78,128 78,129 Z" fill="#8A4A12" />
      <circle class="pet-pupil" data-anchor-x="68" data-anchor-y="124" cx="68" cy="124" r="4.6" fill="#160C06" />
      <circle cx="64" cy="118" r="3.7" fill="#FFFFFF" />
      <circle cx="72" cy="130" r="1.8" fill="#FFFFFF" />
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
