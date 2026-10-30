/* Mascot Cat Assets - Chibi 2D Anime Illustration */
const catIdleSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="104" cy="171" rx="56" ry="6.5" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 126px 128px; transform: rotate(0deg);">
    <path class="cel-outline"
          d="M 126,128 C 152,130 168,116 174,96 C 179,76 174,58 162,52 C 154,48 146,54 148,62 C 150,70 158,74 158,86 C 158,102 146,120 126,128 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 142,126 C 158,122 166,112 170,98 C 174,80 170,64 162,56 C 166,66 169,80 166,96 C 163,108 154,117 142,122 Z"
          fill="#C4783A" />
    <path d="M 163,110 C 167,100 168,90 166,80" fill="none" stroke="#3A1E12" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 154,74 C 152,66 155,59 161,55" fill="none" stroke="#3A1E12" stroke-width="1.8" stroke-linecap="round" />
  </g>

  <g class="back-foot-left" style="transform-origin: 121px 127px;">
    <path class="cel-outline"
          d="M 114,124 C 108,132 106,144 110,152 C 113,158 123,160 129,156 C 133,151 132,139 128,130 C 124,126 118,124 114,124 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 114,152 C 118,156 124,158 129,156 C 133,151 132,139 128,130 C 130,140 128,149 123,152 C 119,154 116,154 114,152 Z"
          fill="#C4783A" />
    <path d="M 117,148 C 117,152 118,155 118,157" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="back-foot-right" style="transform-origin: 136px 120px;">
    <path class="cel-outline"
          d="M 136,118 C 146,125 152,137 151,147 C 150,155 142,159 134,156 C 128,153 127,141 130,130 C 133,124 135,120 136,118 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 136,155 C 143,157 149,153 150,147 C 150,140 147,133 144,127 C 148,133 149,140 147,146 C 145,151 141,153 136,152 Z"
          fill="#C4783A" />
    <path d="M 140,148 C 140,152 141,155 141,157" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="anim-breath pet-body" style="transform-origin: 104px 114px; transform: translateY(0px) rotate(0deg);">
    <path class="cel-outline"
          d="M 70,88 C 58,98 54,116 60,129 C 64,139 78,144 92,143 C 104,142 116,139 128,134 C 140,129 151,124 156,114 C 160,102 150,93 136,88 C 118,82 92,81 78,88 C 74,89 72,88 70,88 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 62,126 C 67,137 79,142 92,141 C 104,140 116,137 128,132 C 139,127 148,122 152,114 C 146,118 138,121 127,126 C 115,130 103,133 92,134 C 81,135 71,131 66,124 Z"
          fill="#C4783A" />
    <path d="M 132,96 C 137,104 139,112 138,120 C 133,113 129,104 128,96 Z" fill="#8A4A1E" />
    <path d="M 143,100 C 147,107 148,113 147,119 C 143,113 140,106 139,100 Z" fill="#8A4A1E" />
    <path d="M 60,102 C 62,109 62,116 61,122 C 59,115 58,108 59,102 Z" fill="#8A4A1E" />
  </g>

  <g class="left-paw" style="transform-origin: 76px 136px;">
    <path class="cel-base"
          d="M 92,143 C 78,144 64,139 60,129 C 56,138 55,150 59,159 C 63,166 74,169 81,167 C 88,165 92,155 92,143 Z"
          fill="#FFF4E4" />
    <path class="cel-outline"
          d="M 59,159 C 63,166 74,169 81,167 C 88,165 92,155 92,143"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 63.14,163.48 L 65.87,165.13 L 70.19,165.71 L 72.02,167.19 L 75.72,166.77 L 78.4,166.72 L 80.85,166.26 L 83.04,165.28 L 85.67,164.09 L 86.63,161.59 L 89.12,158.75 L 89.1,156 L 89.89,152.65 L 91.81,147.39 L 91.81,147.39 L 87.9,150.92 L 85.79,153.98 L 83.91,156.44 L 82.22,158.24 L 80.82,159.38 L 79.8,159.96 L 78.94,160.34 L 77.54,160.78 L 75.5,161.24 L 73.09,161.59 L 70.39,161.85 L 67.41,162.08 L 63.14,163.48 Z"
          fill="#E4C4A0" />
    <path d="M 67,159 C 67,162 67,165 68,167" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 75,160 C 75,163 75,166 75,168" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 110px 138px;">
    <path class="cel-base"
          d="M 128,134 C 116,139 104,142 92,143 C 90,152 91,159 96,163 C 102,167 112,166 117,162 C 123,156 126,146 128,134 Z"
          fill="#FFF4E4" />
    <path class="cel-outline"
          d="M 96,163 C 102,167 112,166 117,162 C 123,156 126,146 128,134"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 101.11,165.09 L 105.42,164.37 L 107.99,164.37 L 110.51,164.04 L 112.89,163.41 L 115.05,162.48 L 116.89,161.29 L 119.11,159.57 L 120.39,156.69 L 121.81,153.96 L 123.05,150.95 L 125.22,146.55 L 126.28,142.59 L 125.87,140.52 L 125.87,140.52 L 122.95,141.79 L 120.65,145.19 L 118.65,148.27 L 116.83,150.99 L 115.14,153.34 L 113.56,155.34 L 112.33,156.82 L 111.74,157.37 L 110.39,158.4 L 108.64,159.54 L 106.57,160.74 L 104.2,162.08 L 101.11,165.09 Z"
          fill="#E4C4A0" />
    <path d="M 101,157 C 101,160 101,162 102,164" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 109,157 C 109,160 109,162 109,164" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="pet-head anim-breath" style="transform-origin: 92px 98px; transform: translateY(0px) rotate(0deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 52px 44px;">
      <path class="cel-outline"
            d="M 44,46 C 40,34 38,24 38,16 C 48,20 60,28 70,40 C 62,46 52,48 44,46 Z"
            fill="#F2A85E" stroke="#3A1E12" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 47,42 C 45,32 43,25 43,20 C 51,24 60,30 66,39 C 60,43 53,44 47,42 Z" fill="#F09A96" />
      <path class="cel-shadow"
            d="M 46,45 C 54,46 62,44 68,39 C 66,44 58,48 50,47 C 48,47 47,46 46,45 Z"
            fill="#C4783A" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 132px 44px;">
      <path class="cel-outline"
            d="M 140,46 C 144,34 146,24 146,16 C 136,20 124,28 114,40 C 122,46 132,48 140,46 Z"
            fill="#F2A85E" stroke="#3A1E12" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 137,42 C 139,32 141,25 141,20 C 133,24 124,30 118,39 C 124,43 131,44 137,42 Z" fill="#F09A96" />
      <path class="cel-shadow"
            d="M 138,45 C 130,46 122,44 116,39 C 118,44 126,47 134,46 C 136,47 137,46 138,45 Z"
            fill="#C4783A" />
    </g>

    <path class="cel-outline"
          d="M 92,32 C 66,32 46,44 40,60 C 34,74 38,88 52,95 C 64,101 80,102 92,102 C 104,102 120,101 132,95 C 146,88 150,74 144,60 C 138,44 118,32 92,32 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 47.22,92.06 L 49.49,93.61 L 52,95 L 54.29,96.07 L 56.67,97.02 L 59.12,97.87 L 61.62,98.62 L 64.18,99.28 L 66.77,99.85 L 69.38,100.34 L 72,100.75 L 74.62,101.09 L 77.23,101.37 L 79.82,101.58 L 82.38,101.75 L 84.88,101.87 L 87.33,101.95 L 89.71,101.99 L 92,102 L 94.29,101.99 L 96.67,101.95 L 99.12,101.87 L 101.62,101.75 L 104.18,101.58 L 106.77,101.37 L 109.38,101.09 L 112,100.75 L 114.62,100.34 L 117.23,99.85 L 119.82,99.28 L 122.38,98.62 L 124.88,97.87 L 127.33,97.02 L 129.71,96.07 L 132,95 L 134.51,93.61 L 136.78,92.06 L 138.82,90.37 L 140.62,88.55 L 142.2,86.6 L 143.53,84.54 L 144.63,82.38 L 145.5,80.12 L 146.13,77.79 L 146.53,75.38 L 146.7,72.91 L 146.62,70.39 L 146.32,67.83 L 145.78,65.24 L 145.01,62.62 L 144,60 L 142.71,57.05 L 141.11,54.2 L 139.2,51.47 L 139.2,51.47 L 139.67,55.11 L 140.56,58.12 L 141.28,61.12 L 141.8,63.72 L 142.11,66.16 L 142.24,68.5 L 142.19,70.72 L 141.97,72.82 L 141.57,74.81 L 141.02,76.68 L 140.32,78.43 L 139.47,80.08 L 138.47,81.62 L 137.33,83.07 L 136.03,84.43 L 134.56,85.71 L 132.92,86.91 L 131.08,88.03 L 128.97,89.08 L 127.03,89.88 L 124.94,90.64 L 122.77,91.33 L 120.52,91.95 L 118.21,92.51 L 115.84,93.01 L 113.44,93.44 L 111.01,93.82 L 108.56,94.15 L 106.11,94.44 L 103.66,94.68 L 101.24,94.89 L 98.85,95.06 L 96.51,95.21 L 94.22,95.34 L 92,95.45 L 89.78,95.55 L 87.48,95.64 L 85.12,95.7 L 82.71,95.75 L 80.26,95.76 L 77.77,95.74 L 75.26,95.68 L 72.74,95.57 L 70.22,95.42 L 67.71,95.22 L 65.21,94.96 L 62.73,94.65 L 60.28,94.27 L 57.86,93.85 L 55.47,93.37 L 53.1,92.86 L 50.38,92.16 L 47.22,92.06 Z"
          fill="#C4783A" />
    <path d="M 76,33 C 78,40 78,47 77,53 C 74,48 72,40 73,33 Z" fill="#8A4A1E" />
    <path d="M 88,32 C 90,40 90,48 89,55 C 86,49 85,40 85,32 Z" fill="#8A4A1E" />
    <path d="M 100,33 C 102,40 102,47 101,53 C 98,48 96,40 97,33 Z" fill="#8A4A1E" />
    <path d="M 40,60 C 44,67 46,73 46,79 C 42,73 39,66 38,60 Z" fill="#8A4A1E" />
    <path d="M 38,72 C 42,78 44,83 44,88 C 40,83 37,78 36,72 Z" fill="#8A4A1E" />
    <path d="M 144,60 C 140,67 138,73 138,79 C 142,73 145,66 146,60 Z" fill="#8A4A1E" />
    <path d="M 146,72 C 142,78 140,83 140,88 C 144,83 147,78 148,72 Z" fill="#8A4A1E" />

    <ellipse cx="50" cy="84" rx="7.5" ry="4" fill="#F08C8C" />
    <ellipse cx="134" cy="84" rx="7.5" ry="4" fill="#F08C8C" />

    <path d="M 78,84 C 78,77 84,72 92,72 C 100,72 106,77 106,84 C 106,92 100,99 92,99 C 84,99 78,92 78,84 Z"
          fill="#FFF4E4" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 79,87 C 84,93 100,93 105,87 C 103,94 98,99 92,99 C 86,99 81,94 79,87 Z" fill="#E4C4A0" />
    <path d="M 86,80 C 86,76 89,73 92,73 C 95,73 98,76 98,80 C 98,84 95,87 92,87 C 89,87 86,84 86,80 Z"
          fill="#E2707A" stroke="#3A1E12" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M 89,89 C 89,96 95,96 95,89 Z" fill="#E2707A" stroke="#3A1E12" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M 85,87 C 88,91 91,91 92,88 C 93,91 96,91 99,87" fill="none" stroke="#3A1E12" stroke-width="1.6" stroke-linecap="round" />

    <path d="M 45,91 C 52,96 59,99 66,100" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 139,91 C 132,96 125,99 118,100" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 77,90 C 66,92 54,95 42,98" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 78,95 C 68,98 58,101 48,104" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 107,90 C 118,92 130,95 142,98" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 106,95 C 116,98 126,101 136,104" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />

    <g class="anim-blink">
      <ellipse class="cel-outline" cx="66" cy="76" rx="13" ry="15" fill="#8C5A2B" stroke="#3A1E12" stroke-width="3.2" />
      <path class="cel-shadow" d="M 55,81 C 55,80 59,87 58,86 C 58,86 64,90 63,89 C 62,89 70,89 69,89 C 68,90 74,86 74,86 C 73,87 77,80 77,81 Z" fill="#8A4A1E" />
      <circle class="pet-pupil" data-anchor-x="66" data-anchor-y="76" cx="66" cy="76" r="5" fill="#1E0F08" />
      <circle cx="61" cy="70" r="4.5" fill="#FFFFFF" />
      <circle cx="71" cy="82" r="2" fill="#FFFFFF" />
      <ellipse class="cel-outline" cx="118" cy="76" rx="13" ry="15" fill="#8C5A2B" stroke="#3A1E12" stroke-width="3.2" />
      <path class="cel-shadow" d="M 107,81 C 107,80 111,87 110,86 C 110,86 116,90 115,89 C 114,89 122,89 121,89 C 120,90 126,86 126,86 C 125,87 129,80 129,81 Z" fill="#8A4A1E" />
      <circle class="pet-pupil" data-anchor-x="118" data-anchor-y="76" cx="118" cy="76" r="5" fill="#1E0F08" />
      <circle cx="113" cy="70" r="4.5" fill="#FFFFFF" />
      <circle cx="123" cy="82" r="2" fill="#FFFFFF" />
    </g>
  </g>
</svg>
`;
const catWalkSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="172" rx="54" ry="6" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 130px 112px; transform: rotate(0deg);">
    <path class="cel-base"
          d="M 122,102 C 138,92 152,78 163,63 C 168,57 176,60 175,69 C 174,78 165,87 153,95 C 144,101 138,110 136,120 C 128,118 122,112 122,102 Z"
          fill="#F2A85E" />
    <path class="cel-outline"
          d="M 122,102 C 138,92 152,78 163,63 C 168,57 176,60 175,69 C 174,78 165,87 153,95 C 144,101 138,110 136,120"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 134,114 C 142,104 149,96 156,88 C 163,80 169,72 173,63 C 172,74 164,84 153,92 C 145,99 138,107 135,115 Z"
          fill="#C4783A" />
    <path d="M 145,90 C 152,82 158,74 162,66" fill="none" stroke="#3A1E12" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 127,105 C 138,97 148,88 155,78" fill="none" stroke="#3A1E12" stroke-width="1.8" stroke-linecap="round" />
  </g>

  <g class="back-foot-left" style="transform-origin: 126px 118px;">
    <path class="cel-base"
          d="M 114,114 C 119,126 122,138 122,147 C 122,155 126,159 132,159 C 138,159 141,154 140,147 C 139,139 136,127 133,112 C 127,108 116,108 114,114 Z"
          fill="#F2A85E" />
    <path class="cel-outline"
          d="M 114,114 C 119,126 122,138 122,147 C 122,155 126,159 132,159 C 138,159 141,154 140,147 C 139,139 136,127 133,112 C 127,108 116,108 114,114 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 121,128 C 122,135 123,141 124,146 C 127,148 132,148 136,145 C 137,139 136,130 134,122 C 129,121 124,124 121,128 Z"
          fill="#C4783A" />
    <path d="M 127,151 C 127,154 127,157 127,158" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="back-foot-right" style="transform-origin: 140px 118px;">
    <path class="cel-base"
          d="M 132,120 C 137,132 140,144 140,153 C 140,161 144,165 150,165 C 156,165 159,160 158,153 C 157,145 153,133 149,117 C 143,113 134,114 132,120 Z"
          fill="#F2A85E" />
    <path class="cel-outline"
          d="M 132,120 C 137,132 140,144 140,153 C 140,161 144,165 150,165 C 156,165 159,160 158,153 C 157,145 153,133 149,117 C 143,113 134,114 132,120 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 136,124 C 139,134 141,143 141,151 C 143,153 145,153 147,151 C 151,145 153,134 150,124 C 145,122 140,122 136,124 Z"
          fill="#C4783A" />
    <path d="M 145,157 C 145,160 145,163 145,164" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="anim-breath pet-body" style="transform-origin: 104px 116px; transform: translateY(0px) rotate(0deg);">
    <path class="cel-outline"
          d="M 58,112 C 55,97 66,88 84,88 C 106,87 130,89 143,94 C 155,98 158,110 151,119 C 143,128 128,135 112,137 C 100,139 92,139 86,138 C 78,137 70,137 64,135 C 60,133 58,124 58,112 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 151,119 C 143,128 128,135 112,137 C 100,139 92,139 86,138 C 78,137 70,137 64,135 C 68,131 77,131 88,132 C 93,132 99,132 110,131 C 123,127 136,122 145,119 Z"
          fill="#C4783A" />
    <path d="M 94,89 C 97,97 97,105 95,112 C 92,105 91,97 92,89 Z" fill="#8A4A1E" />
    <path d="M 112,89 C 115,97 115,105 113,113 C 110,106 109,97 110,89 Z" fill="#8A4A1E" />
    <path d="M 129,91 C 132,99 132,106 130,114 C 127,107 126,99 127,91 Z" fill="#8A4A1E" />
  </g>

  <g class="left-paw" style="transform-origin: 74px 138px;">
    <path class="cel-base"
          d="M 86.3,139.6 L 89.3,153.1 L 92,163 L 92.1,164.8 L 91.7,166.8 L 91.2,167.7 L 90.3,168.8 L 89.4,169.3 L 88,169.9 L 85.8,170.2 L 83.4,169.9 L 80.6,168.7 L 78.3,166.8 L 76.4,164.3 L 75.1,161.8 L 74,159 L 68.3,146.6 L 65.8,140.6 L 64.3,135.9"
          fill="#FFF4E4" />
    <path class="cel-outline"
          d="M 66.2,137.2 L 92,163 L 92.1,164.8 L 91.9,166.3 L 91.2,167.7 L 89.9,169 L 88.5,169.7 L 87,170.1 L 85.2,170.2 L 83.4,169.9 L 81.7,169.3 L 80.1,168.4 L 78.7,167.3 L 77.5,165.9 L 75.4,162.5 L 74,159 L 69.1,148.7 L 66.2,141.6 L 64.3,135.9"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 90.2,165.5 L 89.7,166.7 L 88.8,167.7 L 89,169.5 L 87.5,170 L 85.8,170.2 L 84,170 L 81.7,168.3 L 80.6,168.7 L 86.1,163.2 L 86.5,164.2 L 87.6,165.3 L 90.2,165.5"
          fill="#E4C4A0" />
    <path d="M 79,164 C 79,167 79,169 79,170" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 86,163 C 86,166 86,168 86,170" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 98px 138px;">
    <path class="cel-base"
          d="M 112.1,138.5 L 112.4,144.9 L 112.1,151.9 L 111.3,158 L 110,163 L 108.8,165.2 L 107.1,167 L 105.1,168.1 L 102.3,168.8 L 99.2,168.4 L 97.4,167.7 L 95.7,166.8 L 93.2,164.5 L 91.3,161.6 L 90.4,159.6 L 89.5,156.5 L 86.3,139"
          fill="#FFF4E4" />
    <path class="cel-outline"
          d="M 87.7,139.8 L 110,163 L 108.8,165.2 L 108,166.2 L 106.6,167.3 L 105.1,168.1 L 102.9,168.7 L 101.1,168.7 L 99.2,168.4 L 97.4,167.7 L 95.7,166.8 L 94.1,165.5 L 92.4,163.5 L 91,161 L 89.7,157.3 L 86.3,139"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 107.4,163.9 L 108,166.2 L 105.2,166.2 L 105.1,168.1 L 102.4,167.3 L 100.8,167.5 L 99.9,168.6 L 98,168 L 96.2,167.1 L 102.2,161.7 L 104.9,163.2 L 107.4,163.9"
          fill="#E4C4A0" />
    <path d="M 96,163 C 96,166 96,168 96,169" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 103,162 C 103,165 103,167 103,168" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="pet-head anim-breath" style="transform-origin: 70px 98px; transform: translateY(0px) rotate(0deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 52px 40px;">
      <path class="cel-outline"
            d="M 42,60 C 36,46 36,30 44,20 C 54,26 64,38 68,50 C 58,58 50,61 42,60 Z"
            fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 47,55 C 43,45 43,34 48,27 C 55,32 61,40 63,48 C 57,53 52,56 47,55 Z" fill="#F09A96" />
      <path class="cel-shadow"
            d="M 42,60 C 50,61 58,58 68,50 C 60,52 52,56 45,58 Z"
            fill="#C4783A" />
    </g>
    <path class="cel-base"
          d="M 30,84 C 24,68 32,52 50,46 C 70,39 90,47 98,62 C 104,75 99,93 86,102 C 73,111 50,109 38,99 C 32,94 30,89 30,84 Z"
          fill="#F2A85E" />
    <path class="cel-outline"
          d="M 98,88 C 103,80 104,70 98,62 C 90,47 70,39 50,46 C 32,52 24,68 30,84 C 30,89 32,94 38,99 C 45,105 51,108 59,112"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow" d="M 86,51 C 91,53 95,60 96,69 C 97,78 94,85 90,89 C 92,82 93,74 92,67 C 91,59 89,54 86,51 Z" fill="#C4783A" />
    <path class="cel-base" d="M 48,94 C 60,102 74,105 86,99 C 82,107 68,111 56,107 C 48,104 44,98 48,94 Z" fill="#F2A85E" />
    <path class="cel-shadow" d="M 52,96 C 62,103 74,105 84,100 C 80,107 66,109 56,105 C 52,103 50,99 52,96 Z" fill="#C4783A" />
    <path d="M 58,86 C 64,93 72,97 80,98" fill="none" stroke="#3A1E12" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 70,82 C 76,89 83,93 89,94" fill="none" stroke="#3A1E12" stroke-width="1.8" stroke-linecap="round" />

    <g class="pet-ear pet-ear-right" style="transform-origin: 78px 42px;">
      <path class="cel-outline"
            d="M 68,54 C 68,42 74,32 82,28 C 88,36 92,46 92,56 C 84,60 74,59 68,54 Z"
            fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 73,52 C 73,44 77,37 82,34 C 85,39 88,45 88,51 C 83,54 77,54 73,52 Z" fill="#F09A96" />
      <path class="cel-shadow"
            d="M 68,54 C 74,59 84,60 92,56 C 86,55 78,54 72,54 Z"
            fill="#C4783A" />
    </g>

    <path d="M 46,48 C 49,56 49,63 47,69 C 44,63 43,55 44,48 Z" fill="#8A4A1E" />
    <path d="M 62,44 C 65,52 65,59 63,65 C 60,59 59,51 60,44 Z" fill="#8A4A1E" />

    <ellipse cx="62" cy="88" rx="6.5" ry="3.5" fill="#F08C8C" />

    <path d="M 25,79 C 30,70 41,68 49,74 C 57,80 58,91 50,98 C 42,104 30,103 25,95 C 21,90 22,84 25,79 Z"
          fill="#FFF4E4" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 24,90 C 28,97 40,101 50,96 C 53,94 55,91 55,88 C 52,93 47,98 40,101 C 30,101 24,96 24,90 Z" fill="#E4C4A0" />
    <path d="M 22,78 C 18,77 15,80 16,84 C 17,88 22,89 25,86 C 27,83 26,79 22,78 Z"
          fill="#E2707A" stroke="#3A1E12" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M 24,91 C 26,95 30,96 33,94" fill="none" stroke="#3A1E12" stroke-width="1.6" stroke-linecap="round" />

    <path d="M 27,84 C 18,80 10,76 3,74" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 26,89 C 16,87 8,86 1,86" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 27,94 C 18,95 11,97 6,100" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />

    <g class="anim-blink">
      <ellipse class="cel-outline" cx="52" cy="70" rx="11" ry="13" fill="#8C5A2B" stroke="#3A1E12" stroke-width="3.2" />
      <path class="cel-shadow" d="M 43,74 C 43,74 46,79 46,79 C 45,78 50,82 50,81 C 49,81 55,81 54,81 C 54,82 59,78 58,79 C 58,79 61,74 61,74 Z" fill="#8A4A1E" />
      <circle class="pet-pupil" data-anchor-x="52" data-anchor-y="70" cx="52" cy="70" r="4.5" fill="#1E0F08" />
      <circle cx="48" cy="64" r="3.6" fill="#FFFFFF" />
      <circle cx="57" cy="76" r="1.7" fill="#FFFFFF" />
    </g>
  </g>
</svg>
`;
const catSleepSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="168" rx="58" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 150px 126px; transform: rotate(0deg);">
    <path class="cel-outline"
          d="M 144,116 C 160,120 170,134 166,148 C 162,161 148,168 132,164 C 120,161 112,152 114,144 C 116,137 123,138 126,144 C 129,150 136,155 143,155 C 150,155 154,149 152,142 C 150,134 145,127 138,124 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 138,124 C 145,127 150,134 152,142 C 154,149 150,155 143,155 C 138,155 133,153 128,148 C 133,153 139,157 145,156 C 152,155 156,148 154,140 C 152,132 147,125 138,124 Z"
          fill="#C4783A" />
    <path d="M 160,140 C 161,146 159,152 155,156" fill="none" stroke="#3A1E12" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 128,158 C 124,155 121,151 120,147" fill="none" stroke="#3A1E12" stroke-width="1.8" stroke-linecap="round" />
  </g>

  <g class="back-foot-left" style="transform-origin: 132px 136px;">
    <path class="cel-outline"
          d="M 124,124 C 120,132 122,142 130,146 C 138,149 146,144 146,136 C 146,128 138,122 130,122 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 130,146 C 138,149 146,144 146,136 C 146,133 145,131 144,129 C 146,136 143,143 137,144 C 134,145 132,146 130,146 Z"
          fill="#C4783A" />
  </g>
  <g class="back-foot-right" style="transform-origin: 148px 130px;">
    <path class="cel-outline"
          d="M 142,118 C 140,126 144,134 152,136 C 158,138 162,133 161,127 C 160,121 152,116 146,116 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 152,136 C 158,138 162,133 161,127 C 160.8,125.1 159.6,123.3 158.7,122.2 C 160.2,129 158,134 153,134 C 152,134 152,135 152,136 Z"
          fill="#C4783A" />
  </g>

  <g class="anim-breath pet-body" style="transform-origin: 104px 122px; transform: translateY(0px) rotate(0deg);">
    <path class="cel-outline"
          d="M 100,86 C 74,86 54,102 54,122 C 54,142 74,152 104,152 C 136,152 156,140 156,118 C 156,96 126,86 100,86 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 156,118 C 156,140 136,152 104,152 C 74,152 54,142 54,122 C 58,138 76,146 104,146 C 132,146 152,136 156,118 Z"
          fill="#C4783A" />
    <path d="M 96,88 C 99,98 99,108 97,116 C 94,108 93,98 94,88 Z" fill="#8A4A1E" />
    <path d="M 118,90 C 121,100 121,110 119,118 C 116,110 115,100 116,90 Z" fill="#8A4A1E" />
    <path d="M 138,96 C 141,104 141,112 139,119 C 136,112 135,104 136,96 Z" fill="#8A4A1E" />
  </g>

  <g class="left-paw" style="transform-origin: 44px 150px;">
    <path class="cel-outline"
          d="M 26,140 L 25.1,142.5 L 24.3,146.2 L 24,149.7 L 24.3,153.1 L 25.1,156.1 L 26,157.9 L 27.8,160.3 L 29.3,161.6 L 32,163 L 35.2,163.8 L 38.5,164.2 L 41.9,163.9 L 45.3,163.3 L 48.3,162.1 L 50.8,160.5 L 52.8,158.4 L 53.7,156.9 L 54.4,154.2 L 54.5,151.4 L 54.1,148.7 L 53.2,146 L 51.8,143.5 L 49.9,141.3 L 48.5,140.1 L 45.9,138.6 L 44,138 L 40.5,137.2 L 37.1,137 L 33.9,137.1 L 30.9,137.7 L 28.2,138.7 L 26,140"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 32,163 L 34.1,163.6 L 36.3,164 L 40.8,164.1 L 45.3,163.3 L 47.3,162.5 L 49.2,161.6 L 50.8,160.5 L 52.2,159.2 L 53.3,157.7 L 54,156 L 53.7,153.3 L 52.9,151.1 L 52,150 L 51.6,152.5 L 51,154.1 L 50.2,155.5 L 48.5,157.5 L 45.6,159.6 L 43.2,160.8 L 40.5,161.6 L 35.8,162.1 L 32,163"
          fill="#E4C4A0" />
    <path d="M 34,158 C 34,161 35,162 35,163" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 41,158 C 41,161 42,162 42,163" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 74px 152px;">
    <path class="cel-base"
          d="M 59.1,139.5 L 57.7,140.3 L 56.6,141.3 L 56,142 L 55.5,143.2 L 54.8,145.7 L 54.4,148.1 L 54.2,150.4 L 54.3,152.6 L 55,155.6 L 55.7,157.5 L 56.7,159.2 L 58,160.7 L 59.4,162 L 62,163.6 L 63,164 L 66.1,164.5 L 70.4,164.5 L 74.6,163.7 L 78.3,162.1 L 79.9,161.1 L 81.2,159.8 L 82.5,157.7 L 83,156 L 83.1,154.2 L 82.7,150.7"
          fill="#FFF4E4" />
    <path class="cel-outline"
          d="M 52,152 L 54.1,156.2 L 55.5,158.2 L 57.2,160.2 L 59.4,162.1 L 61.1,163.1 L 63,164 L 65.1,164.4 L 68.3,164.6 L 71.5,164.4 L 74.6,163.7 L 77.5,162.6 L 79.9,161.1 L 81.2,159.8 L 82.5,157.7 L 83,156 L 53.9,152.3"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 60.2,162.6 L 63,164 L 72.6,164.2 L 74.5,163 L 78.3,162.1 L 80.6,160.5 L 80.3,158.6 L 77.6,157.4 L 75.4,157.1 L 73.4,157 L 69,157.9 L 66.7,158.7 L 64.3,159.9 L 60.2,162.6"
          fill="#E4C4A0" />
    <path d="M 65,159 C 65,162 66,163 66,164" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 72,158 C 72,161 73,162 73,163" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="pet-head anim-breath" style="transform-origin: 62px 114px; transform: translateY(0px) rotate(-16deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 46px 70px;">
      <path class="cel-outline"
            d="M 36,88 C 30,74 32,58 40,50 C 50,56 60,68 62,80 C 54,88 44,91 36,88 Z"
            fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 41,84 C 37,74 38,62 43,56 C 50,60 56,68 58,76 C 52,81 46,84 41,84 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 36,88 C 44,91 54,88 62,80 C 56,84 46,87 36,88 Z" fill="#C4783A" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 78px 70px;">
      <path class="cel-outline"
            d="M 62,80 C 64,68 74,56 84,50 C 92,58 94,74 90,88 C 82,91 70,88 62,80 Z"
            fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 68,79 C 70,71 76,62 82,56 C 87,62 89,74 86,83 C 79,85 73,83 68,79 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 62,80 C 70,88 82,91 90,88 C 84,87 73,85 62,80 Z" fill="#C4783A" />
    </g>

    <path class="cel-base" d="M 62,74 C 40,74 22,90 22,112 C 22,134 40,150 62,150 C 84,150 102,134 102,112 C 102,90 84,74 62,74 Z" fill="#F2A85E" />
    <path class="cel-outline"
          d="M 92,86.5 L 88.4,83.1 L 84.3,80.2 L 82.1,79 L 77.5,76.8 L 72.6,75.3 L 67.4,74.3 L 62,74 L 56.6,74.3 L 51.4,75.3 L 46.5,76.8 L 41.9,79 L 39.7,80.2 L 35.6,83.1 L 32,86.5 L 28.9,90.3 L 26.2,94.5 L 24.2,99.1 L 22.8,104.1 L 22.1,109.3 L 22.1,114.7 L 22.8,119.9 L 24.2,124.9 L 26.2,129.5 L 28.9,133.7 L 32,137.5 L 35.6,140.9 L 39.7,143.8 L 41.9,145 L 46.5,147.2 L 51.4,148.7 L 56.6,149.7 L 62,150 L 67.4,149.7 L 72.6,148.7 L 77.5,147.2"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 67.4,143.3 L 62,144.2 L 58.4,144.4 L 54.9,144.3 L 47.9,143.5 L 40.9,141.8 L 36.6,141.7 L 39.7,143.8 L 43,145.6 L 46.5,147.2 L 50.1,148.4 L 54,149.3 L 57.9,149.8 L 62,150 L 66.1,149.8 L 70,149.3 L 73.9,148.4"
          fill="#C4783A" />

    <ellipse cx="36" cy="126" rx="6.5" ry="3.5" fill="#F08C8C" />
    <ellipse cx="88" cy="126" rx="6.5" ry="3.5" fill="#F08C8C" />

    <path d="M 50,128 C 50,120 55,116 62,116 C 69,116 74,120 74,128 C 74,136 69,140 62,140 C 55,140 50,136 50,128 Z"
          fill="#FFF4E4" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 50,131 C 54,137 70,137 74,131 C 72,138 68,141 62,141 C 56,141 51,137 50,131 Z" fill="#E4C4A0" />
    <path d="M 58,120 C 58,116 66,116 66,120 C 66,124 58,124 58,120 Z" fill="#E2707A" stroke="#3A1E12" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M 56,126 C 58,129 66,129 68,126" fill="none" stroke="#3A1E12" stroke-width="1.6" stroke-linecap="round" />

    <path d="M 44,108 C 48,114 58,114 62,108" fill="none" stroke="#3A1E12" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 66,108 C 70,114 80,114 84,108" fill="none" stroke="#3A1E12" stroke-width="1.8" stroke-linecap="round" />

    <path d="M 48,124 C 38,120 30,116 22,114" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 48,129 C 38,128 30,128 22,129" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 49,134 C 40,135 32,138 26,142" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
</svg>
`;
const catSitSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="170" rx="52" ry="6.5" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 140px 142px; transform: rotate(0deg);">
    <path class="cel-outline"
          d="M 134,146 C 154,150 170,140 175,122 C 178,111 174,102 166,101 C 160,100 156,106 160,111 C 164,116 164,122 160,128 C 154,137 146,142 137,142 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 137,142 C 146,142 154,137 160,128 C 163,123 164,117 161,112 C 165,117 165,124 161,131 C 155,139 147,144 139,144 Z"
          fill="#C4783A" />
    <path d="M 160,130 C 166,123 169,115 168,108" fill="none" stroke="#3A1E12" stroke-width="1.8" stroke-linecap="round" />
  </g>

  <g class="back-foot-left" style="transform-origin: 56px 148px;">
    <path class="cel-outline"
          d="M 44,134 C 38,142 40,154 48,158 C 56,162 66,158 68,150 C 70,142 62,132 54,130 C 50,129 46,131 44,134 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 48,158 C 56,162 66,158 68,150 C 68,147 67,144 66,142 C 66,149 60,155 53,156 C 51,157 49,158 48,158 Z"
          fill="#C4783A" />
    <path d="M 50,152 C 50,155 51,157 51,158" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 57,151 C 57,154 58,156 58,157" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="back-foot-right" style="transform-origin: 140px 152px;">
    <path class="cel-outline"
          d="M 126,138 C 120,146 122,158 130,162 C 138,166 148,162 150,154 C 152,146 144,136 136,134 C 132,133 128,135 126,138 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 130,162 C 138,166 148,162 150,154 C 150,151 149,148 148,146 C 148,153 142,159 135,160 C 133,161 131,162 130,162 Z"
          fill="#C4783A" />
    <path d="M 132,156 C 132,159 133,161 133,162" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 139,155 C 139,158 140,160 140,161" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="anim-breath pet-body" style="transform-origin: 100px 132px; transform: translateY(0px) rotate(0deg);">
    <path class="cel-outline"
          d="M 100,92 C 78,92 62,104 58,124 C 55,140 58,154 68,160 C 80,165 120,165 132,160 C 142,154 145,140 142,124 C 138,104 122,92 100,92 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 58,124 C 55,140 58,154 68,160 C 80,165 120,165 132,160 C 142,154 145,140 142,124 C 142,142 128,155 100,155 C 72,155 58,142 58,124 Z"
          fill="#C4783A" />
    <path d="M 70,106 C 68,116 68,126 71,134 C 66,126 65,115 67,106 Z" fill="#8A4A1E" />
    <path d="M 130,106 C 132,116 132,126 129,134 C 134,126 135,115 133,106 Z" fill="#8A4A1E" />
    <path d="M 78,96 C 70,108 70,124 78,134 C 84,141 92,144 100,144 C 108,144 116,141 122,134 C 130,124 130,108 122,96 C 116,102 84,102 78,96 Z"
          fill="#FFF4E4" stroke-linejoin="round" />
  </g>

  <g class="left-paw" style="transform-origin: 86px 146px;">
    <path class="cel-base"
          d="M 100,144 C 92,144 84,141 78,134 C 76,142 76,152 78,160 C 79,165 83,168 88,168 C 94,168 98,165 98,158 C 98,152 99,148 100,144 Z"
          fill="#FFF4E4" />
    <path class="cel-outline"
          d="M 88,168 C 94,168 98,165 98,158 C 98,152 99,148 100,144"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 92.09,167.42 L 93.8,166.68 L 95.25,165.62 L 96.49,163.36 L 97.25,161.84 L 97.72,160.01 L 97.88,157.86 L 98.04,155.84 L 98.17,153.84 L 98.2,152.58 L 98.62,150.25 L 98.7,149.6 L 99,148.21 L 99,148.21 L 96.36,153.21 L 95.82,154.19 L 95.58,155.09 L 95.31,155.74 L 94.9,156.4 L 94.84,157.15 L 94.22,158.02 L 94.29,158.45 L 93.69,159.36 L 93.5,160.37 L 92.04,163.59 L 92.09,167.42 Z"
          fill="#E4C4A0" />
    <path d="M 82,162 C 82,165 83,167 83,168" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 90,161 C 90,164 91,166 91,167" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 110px 146px;">
    <path class="cel-base"
          d="M 122,134 C 116,141 108,144 100,144 C 101,152 102,160 104,164 C 106,168 112,169 117,167 C 123,165 125,159 124,151 C 124,145 123,139 122,134 Z"
          fill="#FFF4E4" />
    <path class="cel-outline"
          d="M 117,167 C 123,165 125,159 124,151 C 124,145 123,139 122,134"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 121.02,163.05 L 122.21,161.63 L 123.12,161.25 L 123.7,158 L 124.17,156.59 L 124.23,153.9 L 123.87,150.92 L 123.83,148.94 L 123.72,146.98 L 123.63,144.3 L 123.32,143.11 L 123.07,139.99 L 122.73,137.92 L 122.37,135.92 L 122.37,135.92 L 121.25,144.84 L 121.03,146.4 L 121.03,147.65 L 120.88,148.4 L 120.8,149.14 L 120.77,149.86 L 120.5,150.76 L 120.37,152.09 L 120.55,153 L 120.11,154.81 L 120.04,156.54 L 119.7,159.96 L 121.02,163.05 Z"
          fill="#E4C4A0" />
    <path d="M 108,162 C 108,165 109,167 109,168" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 116,160 C 116,163 117,165 117,166" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="pet-head anim-breath" style="transform-origin: 100px 96px; transform: translateY(0px) rotate(0deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 66px 50px;">
      <path class="cel-outline"
            d="M 54,58 C 50,42 52,26 60,18 C 72,24 84,38 86,52 C 76,60 62,63 54,58 Z"
            fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 60,53 C 58,41 59,30 63,25 C 71,30 78,40 80,49 C 73,54 66,55 60,53 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 54,58 C 62,63 76,60 86,52 C 77,53 65,56 58,58 Z" fill="#C4783A" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 134px 50px;">
      <path class="cel-outline"
            d="M 146,58 C 150,42 148,26 140,18 C 128,24 116,38 114,52 C 124,60 138,63 146,58 Z"
            fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 140,53 C 142,41 141,30 137,25 C 129,30 122,40 120,49 C 127,54 134,55 140,53 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 146,58 C 138,63 124,60 114,52 C 120,56 132,59 146,58 Z" fill="#C4783A" />
    </g>

    <path class="cel-outline"
          d="M 100,46 C 72,46 50,60 46,80 C 42,98 50,114 68,118 C 82,121 118,121 132,118 C 150,114 158,98 154,80 C 150,60 128,46 100,46 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 56.41,112.91 L 58.94,114.55 L 61.72,115.96 L 64.74,117.11 L 68,118 L 70.87,118.53 L 74.2,118.98 L 77.91,119.37 L 81.94,119.69 L 86.23,119.93 L 90.71,120.11 L 95.32,120.21 L 100,120.25 L 104.68,120.21 L 109.29,120.11 L 113.77,119.93 L 118.06,119.69 L 122.09,119.37 L 125.8,118.98 L 129.13,118.53 L 132,118 L 135.26,117.11 L 138.28,115.96 L 141.06,114.55 L 143.59,112.91 L 145.88,111.04 L 147.93,108.96 L 149.72,106.7 L 151.25,104.25 L 152.53,101.64 L 153.54,98.88 L 154.3,95.98 L 154.78,92.97 L 155,89.85 L 154.94,86.64 L 154.61,83.35 L 154,80 L 153.04,76.32 L 151.68,72.8 L 149.93,69.44 L 147.81,66.25 L 147.81,66.25 L 148.24,70.43 L 149.16,73.94 L 149.82,77.36 L 150.2,80.85 L 150.32,83.96 L 150.23,86.92 L 149.94,89.72 L 149.45,92.36 L 148.77,94.83 L 147.92,97.12 L 146.91,99.24 L 145.75,101.19 L 144.43,102.97 L 142.97,104.59 L 141.36,106.06 L 139.58,107.39 L 137.62,108.56 L 135.47,109.59 L 133.09,110.47 L 130.42,111.18 L 128.03,111.62 L 124.98,112.08 L 121.47,112.5 L 117.6,112.88 L 113.45,113.21 L 109.08,113.51 L 104.58,113.75 L 100,113.95 L 95.42,114.11 L 90.89,114.23 L 86.5,114.3 L 82.3,114.33 L 78.36,114.33 L 74.76,114.3 L 71.55,114.25 L 68.88,114.21 L 65.79,113.9 L 62.84,113.42 L 59.92,112.85 L 56.41,112.91 Z"
          fill="#C4783A" />
    <path d="M 84,47 C 87,56 87,64 85,71 C 81,64 80,55 81,47 Z" fill="#8A4A1E" />
    <path d="M 100,46 C 103,55 103,64 101,72 C 97,64 96,55 97,46 Z" fill="#8A4A1E" />
    <path d="M 116,47 C 119,56 119,64 117,71 C 113,64 112,55 113,47 Z" fill="#8A4A1E" />
    <path d="M 52,66 C 56,73 57,79 56,85 C 52,79 50,72 50,66 Z" fill="#8A4A1E" />
    <path d="M 148,66 C 144,73 143,79 144,85 C 148,79 150,72 150,66 Z" fill="#8A4A1E" />

    <ellipse cx="58" cy="94" rx="7" ry="4" fill="#F08C8C" />
    <ellipse cx="142" cy="94" rx="7" ry="4" fill="#F08C8C" />

    <path d="M 84,96 C 84,88 91,84 100,84 C 109,84 116,88 116,96 C 116,106 109,113 100,113 C 91,113 84,106 84,96 Z"
          fill="#FFF4E4" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 85,100 C 90,108 110,108 115,100 C 113,108 108,113 100,113 C 92,113 87,108 85,100 Z" fill="#E4C4A0" />
    <path d="M 96,88 C 96,84 104,84 104,88 C 104,92 96,92 96,88 Z" fill="#E2707A" stroke="#3A1E12" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M 94,97 C 96,100 104,100 106,97" fill="none" stroke="#3A1E12" stroke-width="1.6" stroke-linecap="round" />

    <path d="M 84,92 C 72,88 62,86 52,86" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 83,97 C 70,97 60,97 50,99" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 84,102 C 72,105 62,109 54,113" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 116,92 C 128,88 138,86 148,86" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 117,97 C 130,97 140,97 150,99" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 116,102 C 128,105 138,109 146,113" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />

    <g class="anim-blink">
      <ellipse class="cel-outline" cx="76" cy="76" rx="13" ry="15" fill="#8C5A2B" stroke="#3A1E12" stroke-width="3.2" />
      <path class="cel-shadow" d="M 65,81 C 65,80 69,87 68,86 C 68,86 74,90 73,89 C 72,89 80,89 79,89 C 78,90 84,86 84,86 C 83,87 87,80 87,81 Z" fill="#8A4A1E" />
      <circle class="pet-pupil" data-anchor-x="76" data-anchor-y="76" cx="76" cy="76" r="5" fill="#1E0F08" />
      <circle cx="71" cy="70" r="4.5" fill="#FFFFFF" />
      <circle cx="81" cy="82" r="2" fill="#FFFFFF" />
      <ellipse class="cel-outline" cx="124" cy="76" rx="13" ry="15" fill="#8C5A2B" stroke="#3A1E12" stroke-width="3.2" />
      <path class="cel-shadow" d="M 113,81 C 113,80 117,87 116,86 C 116,86 122,90 121,89 C 120,89 128,89 127,89 C 126,90 132,86 132,86 C 131,87 135,80 135,81 Z" fill="#8A4A1E" />
      <circle class="pet-pupil" data-anchor-x="124" data-anchor-y="76" cx="124" cy="76" r="5" fill="#1E0F08" />
      <circle cx="119" cy="70" r="4.5" fill="#FFFFFF" />
      <circle cx="129" cy="82" r="2" fill="#FFFFFF" />
    </g>
  </g>
</svg>
`;
const catLaySVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="98" cy="168" rx="62" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 152px 114px; transform: rotate(0deg);">
    <path class="cel-base"
          d="M 138,118 C 157,116 176,102 183,86 C 185,76 180,68 172,69 C 166,70 163,76 167,80 C 171,84 171,90 167,95 C 161,103 150,110 138,112 Z"
          fill="#F2A85E" />
    <path class="cel-outline"
          d="M 138,118 C 157,116 176,102 183,86 C 185,76 180,68 172,69 C 166,70 163,76 167,80 C 171,84 171,90 167,95 C 161,103 150,110 138,112"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 146,110 C 154,109 161,103 167,95 C 171,90 171,85 169,81 C 172,85 172,91 168,97 C 162,105 155,111 147,112 Z"
          fill="#C4783A" />
    <path d="M 168,93 C 174,86 177,78 177,71" fill="none" stroke="#3A1E12" stroke-width="1.8" stroke-linecap="round" />
  </g>

  <g class="back-foot-left" style="transform-origin: 144px 140px;">
    <path class="cel-outline"
          d="M 134,126 C 128,136 130,148 138,151 C 146,154 155,149 156,141 C 157,133 148,125 141,124 C 138,124 135,124 134,126 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 138,151 C 146,154 155,149 156,141 C 156,138 155,135 154,133 C 154,140 149,146 142,147 C 140,148 139,150 138,151 Z"
          fill="#C4783A" />
    <path d="M 142,145 C 142,148 143,150 143,151" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 148,143 C 148,146 149,148 149,149" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="back-foot-right" style="transform-origin: 160px 146px;">
    <path class="cel-outline"
          d="M 148,134 C 143,144 147,154 155,156 C 163,158 171,153 171,145 C 171,137 162,131 155,131 C 152,130 149,131 148,134 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 155,156 C 163,158 171,153 171,145 C 170.9,142.1 169.8,139.1 168,137.8 C 169,144 164,150 157,151 C 156,153 155,155 155,156 Z"
          fill="#C4783A" />
    <path d="M 157,150 C 157,153 158,155 158,156" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 163,148 C 163,151 164,153 164,154" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="anim-breath pet-body" style="transform-origin: 108px 126px; transform: translateY(0px) rotate(0deg);">
    <path class="cel-outline"
          d="M 104,98 C 82,98 66,108 62,124 C 58,140 74,152 104,152 C 134,152 158,144 158,126 C 158,108 128,98 104,98 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 62,124 C 58,140 74,152 104,152 C 134,152 158,144 158,126 C 154,142 132,150 104,150 C 78,150 62,140 62,124 Z"
          fill="#C4783A" />
    <path d="M 88,100 C 91,110 91,120 89,128 C 85,120 84,110 85,100 Z" fill="#8A4A1E" />
    <path d="M 108,99 C 111,109 111,119 109,128 C 105,120 104,109 105,99 Z" fill="#8A4A1E" />
    <path d="M 128,102 C 131,110 131,118 129,126 C 125,119 124,110 125,102 Z" fill="#8A4A1E" />
  </g>

  <g class="left-paw" style="transform-origin: 52px 152px;">
    <path class="cel-base"
          d="M 62.2,137.5 L 51.6,140.6 L 41.5,144.1 L 32,148 L 25.1,151.3 L 20.6,153.8 L 18.6,155.7 L 18,156.7 L 17.5,158.3 L 17.6,159.9 L 18,160.9 L 18.6,161.9 L 19.5,162.7 L 20.6,163.4 L 22,164 L 26,164.9 L 30.4,165.2 L 35,165.1 L 39.8,164.5 L 44.4,163.6 L 50.1,161.8 L 53.8,160.2 L 56,159 L 57.4,157.9 L 59.4,156 L 61.1,153.7 L 62.6,151.1 L 64,148.1 L 65.7,143.7"
          fill="#FFF4E4" />
    <path class="cel-outline"
          d="M 52,140 L 43,143.3 L 35.1,146.5 L 28.4,149.6 L 21.3,153.4 L 19.5,154.7 L 18,156.7 L 17.6,157.8 L 17.5,158.9 L 17.6,159.9 L 18,160.9 L 18.6,161.9 L 19.5,162.7 L 20.6,163.4 L 22,164 L 24.6,164.6 L 27.4,165 L 33.5,165.1 L 38.2,164.7 L 44.4,163.6 L 50.1,161.8 L 55,159.6 L 56,159 L 52.3,141.2"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 21.6,162.2 L 22,164 L 26,164.9 L 30.7,164.1 L 35,165.1 L 38.9,163.5 L 44.4,163.6 L 48.7,162.3 L 52.7,160.8 L 53.2,158.7 L 51,157.1 L 46.9,157 L 38.7,157.6 L 30.6,158.7 L 23.2,160.1 L 21.6,162.2"
          fill="#E4C4A0" />
    <path d="M 26,158 C 26,161 27,163 27,164" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 33,157 C 33,160 34,162 34,163" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 70px 154px;">
    <path class="cel-base"
          d="M 67.1,143.5 L 60.8,145.9 L 54.1,148.8 L 48,151.8 L 42.6,154.8 L 41.1,156.2 L 40.5,157.2 L 40.1,158.3 L 40,159.3 L 40.1,160.4 L 40.5,161.4 L 41.1,162.4 L 42.4,163.7 L 44.3,164.7 L 47.3,165.6 L 49.9,165.9 L 52.5,166 L 56.7,165.7 L 59.5,165.3 L 63.7,164.3 L 70.3,161.9 L 73.9,160.2 L 76.7,158.5 L 78.1,157.3 L 79.8,155.3 L 81.2,153 L 82.2,150.4"
          fill="#FFF4E4" />
    <path class="cel-outline"
          d="M 66.9,143.2 L 59.4,146.3 L 52.3,149.6 L 46.6,152.5 L 42.6,154.8 L 41.1,156.2 L 40.5,157.2 L 40.1,158.3 L 40,159.3 L 40.1,160.4 L 40.5,161.4 L 41.1,162.4 L 43,164.1 L 44.3,164.7 L 46.2,165.3 L 49.9,165.9 L 53.9,166 L 58.1,165.5 L 63.7,164.3 L 67.7,163 L 72.7,160.8 L 76,159 L 71.9,147.3"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 44.3,163.2 L 45,165 L 49.2,164.8 L 52.5,166 L 56.3,164.7 L 60.1,164.1 L 63.7,163.1 L 67.3,161.8 L 70.5,160.4 L 73.4,158.8 L 70.9,157.2 L 67,157.3 L 59.4,158.2 L 52.5,159.5 L 46.2,161.1 L 44.3,163.2"
          fill="#E4C4A0" />
    <path d="M 48,159 C 48,162 49,164 49,165" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 55,158 C 55,161 56,163 56,164" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="pet-head anim-breath" style="transform-origin: 62px 128px; transform: translateY(0px) rotate(-8deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 40px 90px;">
      <path class="cel-outline"
            d="M 30,100 C 26,86 28,70 36,62 C 47,68 58,80 60,94 C 50,102 38,104 30,100 Z"
            fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 36,95 C 34,84 35,73 39,68 C 46,73 53,82 55,90 C 48,95 42,97 36,95 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 30,100 C 38,104 50,102 60,94 C 52,98 40,100 30,100 Z" fill="#C4783A" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 84px 90px;">
      <path class="cel-outline"
            d="M 64,94 C 66,82 77,70 88,62 C 96,70 98,86 94,100 C 84,104 70,102 64,94 Z"
            fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 70,92 C 72,84 78,74 84,69 C 89,75 91,85 89,93 C 83,97 75,96 70,92 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 64,94 C 70,102 84,104 94,100 C 86,101 75,99 64,94 Z" fill="#C4783A" />
    </g>

    <path class="cel-base" d="M 62,88 C 40,88 24,102 24,124 C 24,144 40,156 62,156 C 84,156 100,142 100,122 C 100,102 84,88 62,88 Z" fill="#F2A85E" />
    <path class="cel-outline"
          d="M 91.1,99.3 L 87.5,96.1 L 83.7,93.5 L 79.5,91.4 L 77.2,90.5 L 72.5,89.1 L 67.4,88.3 L 64.7,88.1 L 59.3,88.1 L 54.1,88.6 L 49.1,89.8 L 44.5,91.4 L 42.4,92.4 L 38.3,94.9 L 34.8,97.8 L 31.6,101.1 L 29,104.9 L 26.8,109.1 L 25.3,113.7 L 24.3,118.7 L 24,124 L 24.3,128.8 L 25.3,133.3 L 26.8,137.4 L 29,141.2 L 31.6,144.5 L 34.8,147.5 L 36.5,148.8 L 40.3,151.1 L 42.4,152.1 L 46.8,153.8 L 51.5,155 L 56.6,155.8 L 59.3,155.9 L 64.7,155.9 L 69.9,155.4 L 74.9,154.2 L 79.5,152.6 L 81.6,151.6 L 85.7,149.3"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 76.4,146.5 L 72.1,148.2 L 68.9,149.1 L 65.6,149.8 L 62,150.2 L 54.8,150.5 L 48,150 L 41.4,149.1 L 37.4,149.4 L 40.3,151.2 L 43.4,152.6 L 46.8,153.8 L 50.3,154.8 L 54.1,155.5 L 58,155.9 L 62,156 L 66.1,155.8 L 70,155.4 L 73.7,154.6 L 77.2,153.5 L 80.6,152.1 L 83.7,150.5"
          fill="#C4783A" />
    <path d="M 48,90 C 51,98 51,105 49,112 C 45,105 44,97 45,90 Z" fill="#8A4A1E" />
    <path d="M 66,88 C 69,96 69,104 67,111 C 63,104 62,95 63,88 Z" fill="#8A4A1E" />

    <ellipse cx="34" cy="132" rx="6.5" ry="3.5" fill="#F08C8C" />
    <ellipse cx="90" cy="132" rx="6.5" ry="3.5" fill="#F08C8C" />

    <path d="M 48,130 C 48,122 54,118 62,118 C 70,118 76,122 76,130 C 76,140 70,146 62,146 C 54,146 48,140 48,130 Z"
          fill="#FFF4E4" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 49,134 C 53,142 71,142 75,134 C 73,142 68,146 62,146 C 56,146 50,142 49,134 Z" fill="#E4C4A0" />
    <path d="M 58,124 C 58,120 66,120 66,124 C 66,128 58,128 58,124 Z" fill="#E2707A" stroke="#3A1E12" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M 56,132 C 58,135 66,135 68,132" fill="none" stroke="#3A1E12" stroke-width="1.6" stroke-linecap="round" />

    <path d="M 46,128 C 34,124 24,122 14,122" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 45,133 C 32,133 22,134 12,136" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 46,138 C 34,140 25,143 17,147" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 78,128 C 90,124 100,122 110,122" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 79,133 C 92,133 102,134 112,136" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 78,138 C 90,140 99,143 107,147" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />

    <g class="anim-blink">
      <ellipse class="cel-outline" cx="48" cy="116" rx="12" ry="14" fill="#8C5A2B" stroke="#3A1E12" stroke-width="3.2" />
      <path class="cel-shadow" d="M 38,121 C 38,120 42,126 41,126 C 41,125 46,129 46,128 C 45,128 51,128 51,128 C 50,129 56,125 55,126 C 54,126 58,120 58,121 Z" fill="#8A4A1E" />
      <circle class="pet-pupil" data-anchor-x="48" data-anchor-y="116" cx="48" cy="116" r="4.8" fill="#1E0F08" />
      <circle cx="43" cy="110" r="4.2" fill="#FFFFFF" />
      <circle cx="53" cy="122" r="1.9" fill="#FFFFFF" />
      <ellipse class="cel-outline" cx="76" cy="116" rx="12" ry="14" fill="#8C5A2B" stroke="#3A1E12" stroke-width="3.2" />
      <path class="cel-shadow" d="M 66,121 C 66,120 70,126 69,126 C 69,125 74,129 74,128 C 73,128 79,128 79,128 C 78,129 84,125 83,126 C 82,126 86,120 86,121 Z" fill="#8A4A1E" />
      <circle class="pet-pupil" data-anchor-x="76" data-anchor-y="116" cx="76" cy="116" r="4.8" fill="#1E0F08" />
      <circle cx="71" cy="110" r="4.2" fill="#FFFFFF" />
      <circle cx="81" cy="122" r="1.9" fill="#FFFFFF" />
    </g>
  </g>
</svg>
`;
const catStretchSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="92" cy="170" rx="50" ry="6" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 132px 92px; transform: rotate(0deg);">
    <path class="cel-outline"
          d="M 118,98 C 138,90 152,70 158,50 C 161,39 157,30 149,31 C 143,32 140,38 144,42 C 148,46 148,52 145,58 C 139,71 130,82 122,94 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 122,94 C 130,82 139,71 145,58 C 148,53 148,47 146,43 C 149,47 150,53 146,60 C 140,73 131,86 122,94 Z"
          fill="#C4783A" />
    <path d="M 140,80 C 149,71 155,61 157,50" fill="none" stroke="#3A1E12" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 151,38 C 154,34 158,32 162,33" fill="none" stroke="#3A1E12" stroke-width="1.8" stroke-linecap="round" />
  </g>

  <g class="back-foot-left" style="transform-origin: 122px 92px;">
    <path class="cel-outline"
          d="M 122,93 C 133,93 143,97 147,104 C 150,110 148,115 144,117 C 149,119 153,124 152,128 C 151,133 143,134 138,130 C 133,126 132,119 131,111 C 129,104 125,97 120,94 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 138,130 C 143,134 151,133 152,128 C 150,129 148,130 146,131 C 143,129 141,129 138,130 Z"
          fill="#C4783A" />
    <path d="M 146,125 C 146,128 147,130 147,131" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="back-foot-right" style="transform-origin: 138px 100px;">
    <path class="cel-outline"
          d="M 132,92 C 144,95 156,103 161,114 C 164,120 162,126 158,128 C 164,130 168,135 167,140 C 166,145 157,146 152,142 C 147,138 146,130 145,122 C 143,111 136,100 130,95 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 152,142 C 157,146 166,145 167,140 C 165,141 163,142 161,143 C 158,142 155,141 152,140 Z"
          fill="#C4783A" />
    <path d="M 160,137 C 160,140 161,142 161,143" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="anim-breath pet-body" style="transform-origin: 110px 114px; transform: translateY(0px) rotate(0deg);">
    <path class="cel-outline"
          d="M 68,116 C 82,102 104,92 126,86 C 141,81 151,87 151,98 C 151,109 141,117 129,121 C 113,127 100,135 90,140 C 76,146 64,134 68,116 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 151,98 C 151,109 141,117 129,121 C 113,127 100,135 90,140 C 86,142 82,142 79,140 C 88,138 100,131 114,124 C 132,116 146,108 148,96 C 149,94 150,95 151,98 Z"
          fill="#C4783A" />
    <path d="M 88,106 C 92,114 93,123 91,130 C 86,123 85,114 86,106 Z" fill="#8A4A1E" />
    <path d="M 106,96 C 110,104 111,113 109,121 C 104,113 103,104 104,96 Z" fill="#8A4A1E" />
    <path d="M 123,89 C 127,96 128,104 126,111 C 121,104 120,96 121,89 Z" fill="#8A4A1E" />
  </g>

  <g class="left-paw" style="transform-origin: 32px 158px;">
    <path class="cel-base"
          d="M 44,139 L 35.6,142.9 L 11.1,152.9 L 2,157 L 0.4,158.3 L -0.9,160.2 L -1.2,162.2 L -0.6,164.2 L 0.5,165.4 L 1.4,166.1 L 3.3,166.8 L 5.3,167.2 L 11,167.6 L 17.7,167.2 L 23.4,166.4 L 31.7,164.6 L 40.9,162.2 L 51,159 L 52.6,157.1 L 53.3,155.5 L 53.7,153.7 L 53.8,150.7 L 53.2,147.6 L 51.8,144.6 L 49.6,142 L 46.5,139.9 L 44,139"
          fill="#FFF4E4" />
    <path class="cel-outline"
          d="M 44,139 L 35.6,142.9 L 11.1,152.9 L 2,157 L 0.4,158.3 L -0.9,160.2 L -1.2,162.2 L -0.6,164.2 L 0.5,165.4 L 1.4,166.1 L 3.3,166.8 L 5.3,167.2 L 11,167.6 L 17.7,167.2 L 23.4,166.4 L 31.7,164.6 L 40.9,162.2 L 51,159 L 44.4,140.3"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 4,167 L 6.6,167.4 L 9.3,167.5 L 12.1,167.5 L 16.4,167 L 23.4,165.6 L 29.8,163.4 L 35,161 L 36.9,159.3 L 37.8,158.1 L 38.5,156.3 L 38.9,154.9 L 39,153 L 38.5,154.8 L 37.7,156.5 L 35.7,159.1 L 33,161.4 L 29.5,163.2 L 22.4,165.3 L 15.7,166.7 L 8.9,167.4 L 5.8,167.3 L 4,167"
          fill="#E4C4A0" />
    <path d="M 5,161 C 5,164 6,166 6,167" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 12,159 C 12,162 13,164 13,165" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 50px 160px;">
    <path class="cel-base"
          d="M 58,146 L 35.4,154.4 L 29.4,156.9 L 24.2,159.4 L 21.9,160.8 L 20.4,162.5 L 19.8,164.4 L 20.2,166.1 L 21.1,167.3 L 21.9,167.9 L 24.3,168.9 L 29.3,169.5 L 35.2,169.3 L 39.8,168.7 L 45.9,167.2 L 51.9,165.1 L 57.4,162.5 L 60.7,160.5 L 62.5,158.7 L 63.7,156.7 L 64.1,155.3 L 64.3,153.8 L 64.2,152.4 L 63.7,151 L 62.5,149 L 60.6,147.3 L 58,146"
          fill="#FFF4E4" />
    <path class="cel-outline"
          d="M 58,146 L 35.4,154.4 L 29.4,156.9 L 24.2,159.4 L 21.9,160.8 L 20.4,162.5 L 19.8,164.4 L 20.2,166.1 L 21.1,167.3 L 21.9,167.9 L 24.3,168.9 L 29.3,169.5 L 35.2,169.3 L 39.8,168.7 L 45.9,167.2 L 50.4,165.6 L 56.1,163.1 L 60,161 L 58.1,146.9"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 25,169 C 36,171 48,167 54,163 C 57,161 58,158 58,155 C 57,160 53,164 46,166 C 37,169 28,170 25,169 Z"
          fill="#E4C4A0" />
    <path d="M 26,163 C 26,166 27,168 27,169" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 33,161 C 33,164 34,166 34,167" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="pet-head anim-breath" style="transform-origin: 54px 142px; transform: translateY(0px) rotate(-16deg);">
    <g class="pet-ear pet-ear-left" style="transform-origin: 32px 110px;">
      <path class="cel-outline"
            d="M 28,116 C 24,102 26,86 34,78 C 45,84 56,96 58,110 C 48,118 36,120 28,116 Z"
            fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 34,111 C 32,100 33,89 37,84 C 44,89 51,98 53,106 C 46,111 40,113 34,111 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 28,116 C 36,120 48,118 58,110 C 50,114 38,116 28,116 Z" fill="#C4783A" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 68px 110px;">
      <path class="cel-outline"
            d="M 58,110 C 60,98 71,86 82,78 C 90,86 92,102 88,116 C 78,120 64,118 58,110 Z"
            fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 64,108 C 66,100 72,90 78,85 C 83,91 85,101 83,109 C 77,113 69,112 64,108 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 58,110 C 64,118 78,120 88,116 C 80,117 69,115 58,110 Z" fill="#C4783A" />
    </g>

    <path class="cel-base" d="M 54,104 C 35,104 20,117 20,136 C 20,153 35,165 54,165 C 73,165 88,153 88,136 C 88,117 73,104 54,104 Z" fill="#F2A85E" />
    <path class="cel-outline"
          d="M 74.6,110.1 L 71.3,108.1 L 69.3,107.1 L 65.3,105.6 L 60.9,104.6 L 58.7,104.3 L 54,104 L 49.3,104.3 L 47.1,104.6 L 42.7,105.6 L 38.7,107.1 L 36.7,108.1 L 33.1,110.3 L 29.9,112.9 L 28.4,114.3 L 25.7,117.5 L 23.6,121.1 L 22.6,123 L 21.2,127 L 20.3,131.4 L 20,136 L 20.3,140.1 L 20.7,142.1 L 21.9,145.9 L 23.6,149.4 L 24.6,151.1 L 27,154.1 L 29.9,156.9 L 31.5,158.1 L 34.9,160.3 L 38.7,162.1 L 40.7,162.9 L 44.9,164 L 49.3,164.8 L 51.6,164.9 L 56.4,164.9 L 60.9,164.5 L 63.1,164 L 67.3,162.9 L 71.3,161.3 L 73.1,160.3 L 76.5,158.1 L 79.6,155.5 L 81,154.1 L 83.4,151.1 L 85.4,147.7 L 86.1,145.9 L 87.3,142.1"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 81.4,140.7 L 79.4,144.8 L 78.2,146.7 L 75.3,150 L 73.6,151.5 L 69.7,154.2 L 65.2,156.5 L 59.9,158.2 L 57,158.8 L 50.9,159.4 L 44.9,159.4 L 36,158.3 L 32.3,158.7 L 34.9,160.3 L 37.7,161.7 L 40.7,162.9 L 43.8,163.8 L 47.1,164.5 L 50.5,164.9 L 54,165 L 57.5,164.9 L 60.9,164.5 L 64.2,163.8 L 67.3,162.9 L 70.3,161.7 L 73.1,160.3 L 75.7,158.7 L 78.1,156.9 L 80.3,154.9 L 82.3,152.7 L 83.9,150.3 L 85.4,147.7 L 86.5,145 L 87.3,142.1"
          fill="#C4783A" />
    <path d="M 42,106 C 45,114 45,121 43,127 C 39,121 38,113 39,106 Z" fill="#8A4A1E" />
    <path d="M 60,104 C 63,112 63,120 61,127 C 57,120 56,111 57,104 Z" fill="#8A4A1E" />

    <ellipse cx="28" cy="140" rx="6" ry="3.5" fill="#F08C8C" />
    <ellipse cx="80" cy="140" rx="6" ry="3.5" fill="#F08C8C" />

    <path d="M 40,142 C 40,134 46,130 54,130 C 62,130 68,134 68,142 C 68,152 62,158 54,158 C 46,158 40,152 40,142 Z"
          fill="#FFF4E4" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 41,146 C 45,154 63,154 67,146 C 65,154 60,158 54,158 C 48,158 42,154 41,146 Z" fill="#E4C4A0" />
    <path d="M 50,136 C 50,132 58,132 58,136 C 58,140 50,140 50,136 Z" fill="#E2707A" stroke="#3A1E12" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M 48,144 C 50,147 58,147 60,144" fill="none" stroke="#3A1E12" stroke-width="1.6" stroke-linecap="round" />

    <path d="M 38,140 C 28,138 20,138 14,140" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 37,145 C 27,145 19,147 13,150" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 70,140 C 80,138 88,138 94,140" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 71,145 C 81,145 89,147 95,150" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />

    <g class="anim-blink">
      <ellipse class="cel-outline" cx="40" cy="126" rx="11" ry="13" fill="#8C5A2B" stroke="#3A1E12" stroke-width="3.2" />
      <path class="cel-shadow" d="M 31,130 C 31,130 34,135 34,135 C 33,134 38,138 38,137 C 37,137 43,137 42,137 C 42,138 47,134 46,135 C 46,135 49,130 49,130 Z" fill="#8A4A1E" />
      <circle class="pet-pupil" data-anchor-x="40" data-anchor-y="126" cx="40" cy="126" r="4.5" fill="#1E0F08" />
      <circle cx="36" cy="120" r="3.6" fill="#FFFFFF" />
      <circle cx="45" cy="132" r="1.7" fill="#FFFFFF" />
      <ellipse class="cel-outline" cx="66" cy="126" rx="11" ry="13" fill="#8C5A2B" stroke="#3A1E12" stroke-width="3.2" />
      <path class="cel-shadow" d="M 57,130 C 57,130 60,135 60,135 C 59,134 64,138 64,137 C 63,137 69,137 68,137 C 68,138 73,134 72,135 C 72,135 75,130 75,130 Z" fill="#8A4A1E" />
      <circle class="pet-pupil" data-anchor-x="66" data-anchor-y="126" cx="66" cy="126" r="4.5" fill="#1E0F08" />
      <circle cx="62" cy="120" r="3.6" fill="#FFFFFF" />
      <circle cx="71" cy="132" r="1.7" fill="#FFFFFF" />
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
