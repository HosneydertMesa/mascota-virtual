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
          d="M 136,155 C 143,157 149,153 150,147 C 151,140 149,132 145,126 C 148,133 149,140 147,146 C 145,151 141,153 136,152 Z"
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
    <path class="cel-outline"
          d="M 92,143 C 78,144 64,139 60,129 C 56,138 55,150 59,159 C 63,166 74,169 81,167 C 88,165 92,155 92,143 Z"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 68,164 C 73,168 78,169 81,167 C 88,165 92,155 92,143 C 90,154 86,161 79,163 C 74,164 70,164 68,162 Z"
          fill="#E4C4A0" />
    <path d="M 67,159 C 67,162 67,165 68,167" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 75,160 C 75,163 75,166 75,168" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 110px 138px;">
    <path class="cel-outline"
          d="M 128,134 C 116,139 104,142 92,143 C 90,152 91,159 96,163 C 102,167 112,166 117,162 C 123,156 126,146 128,134 Z"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 100,162 C 106,166 112,166 117,162 C 123,156 126,146 128,134 C 126,145 122,154 115,158 C 110,161 105,162 100,160 Z"
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
            d="M 138,45 C 130,46 122,44 116,39 C 118,44 126,48 134,47 C 136,47 137,46 138,45 Z"
            fill="#C4783A" />
    </g>

    <path class="cel-outline"
          d="M 92,32 C 66,32 46,44 40,60 C 34,74 38,88 52,95 C 64,101 80,102 92,102 C 104,102 120,101 132,95 C 146,88 150,74 144,60 C 138,44 118,32 92,32 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 92,102 C 104,102 120,101 132,95 C 140,91 145,85 147,78 C 141,83 133,88 123,91 C 113,94 102,95 92,95 Z"
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
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="1.8" stroke-linejoin="round" />
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
      <path class="cel-shadow" d="M 54,82 C 55,87 60,91 66,91 C 72,91 78,86 78.5,78 Z" fill="#8A4A1E" />
      <circle class="pet-pupil" data-anchor-x="66" data-anchor-y="76" cx="66" cy="76" r="5" fill="#1E0F08" />
      <circle cx="61" cy="70" r="4.5" fill="#FFFFFF" />
      <circle cx="71" cy="82" r="2" fill="#FFFFFF" />
      <ellipse class="cel-outline" cx="118" cy="76" rx="13" ry="15" fill="#8C5A2B" stroke="#3A1E12" stroke-width="3.2" />
      <path class="cel-shadow" d="M 106,82 C 107,87 112,91 118,91 C 124,91 130,86 130.5,78 Z" fill="#8A4A1E" />
      <circle class="pet-pupil" data-anchor-x="118" data-anchor-y="76" cx="118" cy="76" r="5" fill="#1E0F08" />
      <circle cx="113" cy="70" r="4.5" fill="#FFFFFF" />
      <circle cx="123" cy="82" r="2" fill="#FFFFFF" />
    </g>
  </g>
</svg>
`;
const catWalkSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="172" rx="54" ry="6" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <g class="anim-wag" style="transform-origin: 138px 122px; transform: rotate(0deg);">
    <path class="cel-outline"
          d="M 128,130 C 154,133 173,115 178,93 C 181,76 175,64 167,63 C 161,62 157,68 160,74 C 163,80 164,86 161,94 C 156,108 143,117 130,119 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 130,119 C 143,117 156,108 161,94 C 163,87 163,80 160,74 C 166,81 167,90 162,99 C 156,111 145,119 132,123 Z"
          fill="#C4783A" />
    <path d="M 149,116 C 158,109 164,99 166,88" fill="none" stroke="#3A1E12" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 162,73 C 165,68 169,66 173,67" fill="none" stroke="#3A1E12" stroke-width="1.8" stroke-linecap="round" />
  </g>

  <g class="back-foot-left" style="transform-origin: 126px 118px;">
    <path class="cel-outline"
          d="M 122,106 C 133,116 139,131 140,145 C 141,155 138,163 131,164 C 124,165 120,158 120,147 C 120,133 115,117 112,109 C 115,106 119,105 122,106 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 120,147 C 120,156 123,163 129,164 C 132,165 135,164 137,162 C 136,166 131,167 126,165 C 121,163 119,156 120,147 Z"
          fill="#C4783A" />
    <path d="M 128,157 C 128,160 128,162 128,163" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 134,156 C 134,159 134,161 134,162" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="back-foot-right" style="transform-origin: 140px 114px;">
    <path class="cel-outline"
          d="M 136,102 C 146,112 152,127 153,141 C 154,151 151,159 145,159 C 138,159 135,152 135,141 C 135,127 130,112 127,104 C 130,101 133,100 136,102 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 135,141 C 135,152 138,159 145,159 C 148,159 150,158 151,157 C 150,161 146,162 141,160 C 137,158 135,151 135,141 Z"
          fill="#C4783A" />
    <path d="M 142,152 C 142,155 142,157 142,158" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>

  <g class="anim-breath pet-body" style="transform-origin: 104px 116px; transform: translateY(0px) rotate(0deg);">
    <path class="cel-outline"
          d="M 58,112 C 55,97 66,88 84,88 C 106,87 130,89 143,94 C 155,98 158,110 151,119 C 143,128 128,135 112,137 C 100,139 92,139 86,138 C 78,137 70,137 64,135 C 60,133 58,124 58,112 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 151,119 C 143,128 128,135 112,137 C 100,139 92,139 86,138 C 78,137 70,137 64,135 C 66,141 76,143 86,144 C 92,145 100,145 112,143 C 128,141 143,134 151,125 Z"
          fill="#C4783A" />
    <path d="M 94,89 C 97,97 97,105 95,112 C 92,105 91,97 92,89 Z" fill="#8A4A1E" />
    <path d="M 112,89 C 115,97 115,105 113,113 C 110,106 109,97 110,89 Z" fill="#8A4A1E" />
    <path d="M 129,91 C 132,99 132,106 130,114 C 127,107 126,99 127,91 Z" fill="#8A4A1E" />
  </g>

  <g class="left-paw" style="transform-origin: 74px 138px;">
    <path class="cel-outline"
          d="M 64,135 C 70,137 78,137 86,138 C 88,148 90,157 92,163 C 93,168 89,171 84,170 C 79,169 76,165 74,159 C 70,151 66,142 64,135 Z"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 74,159 C 76,165 79,169 84,170 C 87,171 90,170 92,168 C 91,171 87,172 83,171 C 78,170 75,165 74,159 Z"
          fill="#E4C4A0" />
    <path d="M 79,164 C 79,167 79,169 79,170" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 86,163 C 86,166 86,168 86,170" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 98px 138px;">
    <path class="cel-outline"
          d="M 86,138 C 92,139 100,139 112,137 C 113,148 112,157 110,163 C 108,168 103,170 98,168 C 93,166 90,161 89,154 C 88,148 87,142 86,138 Z"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 89,154 C 90,161 93,166 98,168 C 101,169 105,169 107,167 C 106,170 102,171 97,169 C 92,167 89,161 89,154 Z"
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
            d="M 42,60 C 50,61 58,58 68,50 C 64,57 54,62 45,62 Z"
            fill="#C4783A" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 78px 42px;">
      <path class="cel-outline"
            d="M 68,54 C 68,42 74,32 82,28 C 88,36 92,46 92,56 C 84,60 74,59 68,54 Z"
            fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 73,52 C 73,44 77,37 82,34 C 85,39 88,45 88,51 C 83,54 77,54 73,52 Z" fill="#F09A96" />
      <path class="cel-shadow"
            d="M 68,54 C 74,59 84,60 92,56 C 88,61 76,62 70,58 Z"
            fill="#C4783A" />
    </g>

    <path class="cel-outline"
          d="M 30,84 C 24,68 32,52 50,46 C 70,39 90,47 98,62 C 104,75 99,93 86,102 C 73,111 50,109 38,99 C 32,94 30,89 30,84 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 38,99 C 50,109 73,111 86,102 C 92,97 96,88 97,78 C 99,90 94,99 86,105 C 73,114 50,112 38,102 Z"
          fill="#C4783A" />
    <path d="M 46,48 C 49,56 49,63 47,69 C 44,63 43,55 44,48 Z" fill="#8A4A1E" />
    <path d="M 62,44 C 65,52 65,59 63,65 C 60,59 59,51 60,44 Z" fill="#8A4A1E" />

    <ellipse cx="62" cy="88" rx="6.5" ry="3.5" fill="#F08C8C" />

    <path d="M 25,79 C 30,70 41,68 49,74 C 57,80 58,91 50,98 C 42,104 30,103 25,95 C 21,90 22,84 25,79 Z"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="1.8" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 24,90 C 28,97 40,101 50,96 C 53,94 55,91 56,88 C 55,95 48,101 40,101 C 30,101 24,96 24,90 Z" fill="#E4C4A0" />
    <path d="M 22,78 C 18,77 15,80 16,84 C 17,88 22,89 25,86 C 27,83 26,79 22,78 Z"
          fill="#E2707A" stroke="#3A1E12" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M 24,91 C 26,95 30,96 33,94" fill="none" stroke="#3A1E12" stroke-width="1.6" stroke-linecap="round" />

    <path d="M 27,84 C 18,80 10,76 3,74" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 26,89 C 16,87 8,86 1,86" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 27,94 C 18,95 11,97 6,100" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />

    <g class="anim-blink">
      <ellipse class="cel-outline" cx="52" cy="70" rx="11" ry="13" fill="#8C5A2B" stroke="#3A1E12" stroke-width="3.2" />
      <path class="cel-shadow" d="M 41,75 C 42,81 46,83 52,83 C 58,83 62,79 63,73 C 62,80 57,84 52,84 C 46,84 41,80 41,75 Z" fill="#8A4A1E" />
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
          d="M 138,124 C 145,127 150,134 152,142 C 154,149 150,155 143,155 C 138,155 133,152 129,147 C 133,153 139,157 145,156 C 152,155 156,148 154,140 C 152,132 147,125 140,122 Z"
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
          d="M 152,136 C 158,138 162,133 161,127 C 161,125 160,123 159,122 C 161,129 158,134 153,134 C 152,134 152,135 152,136 Z"
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
          d="M 26,140 C 22,150 24,160 32,163 C 40,166 52,163 54,156 C 56,149 52,140 44,138 C 37,136 30,137 26,140 Z"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 32,163 C 40,166 52,163 54,156 C 54,153 53,151 52,150 C 52,157 44,162 37,162 C 35,162 33,163 32,163 Z"
          fill="#E4C4A0" />
    <path d="M 34,158 C 34,161 35,162 35,163" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 41,158 C 41,161 42,162 42,163" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 74px 152px;">
    <path class="cel-outline"
          d="M 56,142 C 52,152 55,161 63,164 C 71,166 82,163 83,156 C 84,149 79,141 71,139 C 64,137 58,139 56,142 Z"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 63,164 C 71,166 82,163 83,156 C 83,153 82,151 81,150 C 81,157 73,162 66,162 C 65,163 64,164 63,164 Z"
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
      <path class="cel-shadow" d="M 36,88 C 44,91 54,88 62,80 C 58,87 46,93 38,91 Z" fill="#C4783A" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 78px 70px;">
      <path class="cel-outline"
            d="M 62,80 C 64,68 74,56 84,50 C 92,58 94,74 90,88 C 82,91 70,88 62,80 Z"
            fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 68,79 C 70,71 76,62 82,56 C 87,62 89,74 86,83 C 79,85 73,83 68,79 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 62,80 C 70,88 82,91 90,88 C 84,93 70,93 63,86 Z" fill="#C4783A" />
    </g>

    <path class="cel-outline"
          d="M 62,74 C 40,74 22,90 22,112 C 22,134 40,150 62,150 C 84,150 102,134 102,112 C 102,90 84,74 62,74 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 22,112 C 22,134 40,150 62,150 C 84,150 102,134 102,112 C 98,130 84,142 62,142 C 40,142 26,130 22,112 Z"
          fill="#C4783A" />

    <ellipse cx="36" cy="126" rx="6.5" ry="3.5" fill="#F08C8C" />
    <ellipse cx="88" cy="126" rx="6.5" ry="3.5" fill="#F08C8C" />

    <path d="M 50,128 C 50,120 55,116 62,116 C 69,116 74,120 74,128 C 74,136 69,140 62,140 C 55,140 50,136 50,128 Z"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="1.8" stroke-linejoin="round" />
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
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="1.8" stroke-linejoin="round" />
  </g>

  <g class="left-paw" style="transform-origin: 86px 146px;">
    <path class="cel-outline"
          d="M 100,144 C 92,144 84,141 78,134 C 76,142 76,152 78,160 C 79,165 83,168 88,168 C 94,168 98,165 98,158 C 98,152 99,148 100,144 Z"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 78,160 C 79,165 83,168 88,168 C 92,168 95,167 97,164 C 96,167 93,169 88,169 C 83,169 79,166 78,160 Z"
          fill="#E4C4A0" />
    <path d="M 82,162 C 82,165 83,167 83,168" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 90,161 C 90,164 91,166 91,167" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 110px 146px;">
    <path class="cel-outline"
          d="M 122,134 C 116,141 108,144 100,144 C 101,152 102,160 104,164 C 106,168 112,169 117,167 C 123,165 125,159 124,151 C 124,145 123,139 122,134 Z"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 104,164 C 106,168 112,169 117,167 C 121,166 123,163 124,159 C 124,164 121,167 116,168 C 111,170 106,168 104,164 Z"
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
      <path class="cel-shadow" d="M 54,58 C 62,63 76,60 86,52 C 81,60 66,65 57,61 Z" fill="#C4783A" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 134px 50px;">
      <path class="cel-outline"
            d="M 146,58 C 150,42 148,26 140,18 C 128,24 116,38 114,52 C 124,60 138,63 146,58 Z"
            fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 140,53 C 142,41 141,30 137,25 C 129,30 122,40 120,49 C 127,54 134,55 140,53 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 146,58 C 138,63 124,60 114,52 C 119,60 134,65 143,61 Z" fill="#C4783A" />
    </g>

    <path class="cel-outline"
          d="M 100,46 C 72,46 50,60 46,80 C 42,98 50,114 68,118 C 82,121 118,121 132,118 C 150,114 158,98 154,80 C 150,60 128,46 100,46 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 154,80 C 158,98 150,114 132,118 C 118,121 82,121 68,118 C 50,114 42,98 46,80 C 50,100 68,112 100,112 C 132,112 150,100 154,80 Z"
          fill="#C4783A" />
    <path d="M 84,47 C 87,56 87,64 85,71 C 81,64 80,55 81,47 Z" fill="#8A4A1E" />
    <path d="M 100,46 C 103,55 103,64 101,72 C 97,64 96,55 97,46 Z" fill="#8A4A1E" />
    <path d="M 116,47 C 119,56 119,64 117,71 C 113,64 112,55 113,47 Z" fill="#8A4A1E" />
    <path d="M 52,66 C 56,73 57,79 56,85 C 52,79 50,72 50,66 Z" fill="#8A4A1E" />
    <path d="M 148,66 C 144,73 143,79 144,85 C 148,79 150,72 150,66 Z" fill="#8A4A1E" />

    <ellipse cx="58" cy="94" rx="7" ry="4" fill="#F08C8C" />
    <ellipse cx="142" cy="94" rx="7" ry="4" fill="#F08C8C" />

    <path d="M 84,96 C 84,88 91,84 100,84 C 109,84 116,88 116,96 C 116,106 109,113 100,113 C 91,113 84,106 84,96 Z"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="1.8" stroke-linejoin="round" />
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
      <path class="cel-shadow" d="M 64,82 C 65,88 70,91 76,91 C 82,91 88,86 89,78 Z" fill="#8A4A1E" />
      <circle class="pet-pupil" data-anchor-x="76" data-anchor-y="76" cx="76" cy="76" r="5" fill="#1E0F08" />
      <circle cx="71" cy="70" r="4.5" fill="#FFFFFF" />
      <circle cx="81" cy="82" r="2" fill="#FFFFFF" />
      <ellipse class="cel-outline" cx="124" cy="76" rx="13" ry="15" fill="#8C5A2B" stroke="#3A1E12" stroke-width="3.2" />
      <path class="cel-shadow" d="M 112,82 C 113,88 118,91 124,91 C 130,91 136,86 137,78 Z" fill="#8A4A1E" />
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
    <path class="cel-outline"
          d="M 146,116 C 164,114 179,102 183,86 C 185,76 180,68 172,69 C 166,70 163,76 167,80 C 171,84 171,90 167,95 C 161,103 154,109 146,110 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 146,110 C 154,109 161,103 167,95 C 170,90 170,85 168,81 C 172,85 172,91 168,97 C 162,105 155,111 147,112 Z"
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
          d="M 155,156 C 163,158 171,153 171,145 C 171,142 170,139 169,137 C 169,144 164,150 157,151 C 156,153 155,155 155,156 Z"
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
    <path class="cel-outline"
          d="M 68,136 C 52,140 34,146 22,153 C 16,156 16,162 22,164 C 32,167 48,164 56,159 C 62,155 65,147 68,136 Z"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 22,164 C 32,167 48,164 56,159 C 60,157 63,153 65,149 C 63,155 58,160 50,162 C 40,165 28,166 22,164 Z"
          fill="#E4C4A0" />
    <path d="M 26,158 C 26,161 27,163 27,164" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 33,157 C 33,160 34,162 34,163" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 70px 154px;">
    <path class="cel-outline"
          d="M 84,138 C 70,142 54,148 44,154 C 38,157 39,163 45,165 C 54,168 68,164 76,159 C 82,155 84,147 84,138 Z"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 45,165 C 54,168 68,164 76,159 C 80,157 82,153 83,149 C 81,155 76,160 68,162 C 58,165 48,166 45,165 Z"
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
      <path class="cel-shadow" d="M 30,100 C 38,104 50,102 60,94 C 55,101 40,106 32,103 Z" fill="#C4783A" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 84px 90px;">
      <path class="cel-outline"
            d="M 64,94 C 66,82 77,70 88,62 C 96,70 98,86 94,100 C 84,104 70,102 64,94 Z"
            fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 70,92 C 72,84 78,74 84,69 C 89,75 91,85 89,93 C 83,97 75,96 70,92 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 64,94 C 70,102 84,104 94,100 C 88,106 72,106 65,98 Z" fill="#C4783A" />
    </g>

    <path class="cel-outline"
          d="M 62,88 C 40,88 24,102 24,124 C 24,144 40,156 62,156 C 84,156 100,142 100,122 C 100,102 84,88 62,88 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 24,124 C 24,144 40,156 62,156 C 84,156 100,142 100,122 C 96,138 82,148 62,148 C 42,148 28,138 24,124 Z"
          fill="#C4783A" />
    <path d="M 48,90 C 51,98 51,105 49,112 C 45,105 44,97 45,90 Z" fill="#8A4A1E" />
    <path d="M 66,88 C 69,96 69,104 67,111 C 63,104 62,95 63,88 Z" fill="#8A4A1E" />

    <ellipse cx="34" cy="132" rx="6.5" ry="3.5" fill="#F08C8C" />
    <ellipse cx="90" cy="132" rx="6.5" ry="3.5" fill="#F08C8C" />

    <path d="M 48,130 C 48,122 54,118 62,118 C 70,118 76,122 76,130 C 76,140 70,146 62,146 C 54,146 48,140 48,130 Z"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="1.8" stroke-linejoin="round" />
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
      <path class="cel-shadow" d="M 37,122 C 38,128 42,130 48,130 C 54,130 59,126 60,118 Z" fill="#8A4A1E" />
      <circle class="pet-pupil" data-anchor-x="48" data-anchor-y="116" cx="48" cy="116" r="4.8" fill="#1E0F08" />
      <circle cx="43" cy="110" r="4.2" fill="#FFFFFF" />
      <circle cx="53" cy="122" r="1.9" fill="#FFFFFF" />
      <ellipse class="cel-outline" cx="76" cy="116" rx="12" ry="14" fill="#8C5A2B" stroke="#3A1E12" stroke-width="3.2" />
      <path class="cel-shadow" d="M 65,122 C 66,128 70,130 76,130 C 82,130 87,126 88,118 Z" fill="#8A4A1E" />
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
          d="M 122,94 C 130,82 139,71 145,58 C 147,53 148,47 145,43 C 149,47 150,53 146,60 C 140,73 131,86 123,96 Z"
          fill="#C4783A" />
    <path d="M 140,80 C 149,71 155,61 157,50" fill="none" stroke="#3A1E12" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 151,38 C 154,34 158,32 162,33" fill="none" stroke="#3A1E12" stroke-width="1.8" stroke-linecap="round" />
  </g>

  <g class="back-foot-left" style="transform-origin: 122px 92px;">
    <path class="cel-outline"
          d="M 120,82 C 131,85 142,93 147,104 C 150,110 148,115 144,117 C 149,119 153,124 152,128 C 151,133 143,134 138,130 C 133,126 132,119 131,111 C 129,101 123,91 118,86 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 138,130 C 143,134 151,133 152,128 C 152,131 150,133 147,134 C 142,135 138,133 136,129 Z"
          fill="#C4783A" />
    <path d="M 146,125 C 146,128 147,130 147,131" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="back-foot-right" style="transform-origin: 138px 100px;">
    <path class="cel-outline"
          d="M 132,92 C 144,95 156,103 161,114 C 164,120 162,126 158,128 C 164,130 168,135 167,140 C 166,145 157,146 152,142 C 147,138 146,130 145,122 C 143,111 136,100 130,95 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 152,142 C 157,146 166,145 167,140 C 167,143 165,145 162,146 C 157,147 152,145 150,142 Z"
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
    <path class="cel-outline"
          d="M 40,142 C 30,146 12,152 2,157 C -3,160 -2,166 4,167 C 14,169 28,165 35,161 C 40,157 42,148 40,142 Z"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 4,167 C 14,169 28,165 35,161 C 38,159 39,156 39,153 C 38,158 34,162 27,164 C 18,167 8,168 4,167 Z"
          fill="#E4C4A0" />
    <path d="M 5,161 C 5,164 6,166 6,167" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 12,159 C 12,162 13,164 13,165" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g class="right-paw" style="transform-origin: 50px 160px;">
    <path class="cel-outline"
          d="M 58,146 C 48,150 32,155 23,160 C 18,163 19,168 25,169 C 36,171 48,167 54,163 C 59,159 60,151 58,146 Z"
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
      <path class="cel-shadow" d="M 28,116 C 36,120 48,118 58,110 C 53,117 38,122 30,119 Z" fill="#C4783A" />
    </g>
    <g class="pet-ear pet-ear-right" style="transform-origin: 68px 110px;">
      <path class="cel-outline"
            d="M 58,110 C 60,98 71,86 82,78 C 90,86 92,102 88,116 C 78,120 64,118 58,110 Z"
            fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M 64,108 C 66,100 72,90 78,85 C 83,91 85,101 83,109 C 77,113 69,112 64,108 Z" fill="#F09A96" />
      <path class="cel-shadow" d="M 58,110 C 64,118 78,120 88,116 C 82,122 66,122 59,114 Z" fill="#C4783A" />
    </g>

    <path class="cel-outline"
          d="M 54,104 C 35,104 20,117 20,136 C 20,153 35,165 54,165 C 73,165 88,153 88,136 C 88,117 73,104 54,104 Z"
          fill="#F2A85E" stroke="#3A1E12" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" />
    <path class="cel-shadow"
          d="M 20,136 C 20,153 35,165 54,165 C 73,165 88,153 88,136 C 84,150 72,158 54,158 C 36,158 24,150 20,136 Z"
          fill="#C4783A" />
    <path d="M 42,106 C 45,114 45,121 43,127 C 39,121 38,113 39,106 Z" fill="#8A4A1E" />
    <path d="M 60,104 C 63,112 63,120 61,127 C 57,120 56,111 57,104 Z" fill="#8A4A1E" />

    <ellipse cx="28" cy="140" rx="6" ry="3.5" fill="#F08C8C" />
    <ellipse cx="80" cy="140" rx="6" ry="3.5" fill="#F08C8C" />

    <path d="M 40,142 C 40,134 46,130 54,130 C 62,130 68,134 68,142 C 68,152 62,158 54,158 C 46,158 40,152 40,142 Z"
          fill="#FFF4E4" stroke="#3A1E12" stroke-width="1.8" stroke-linejoin="round" />
    <path class="cel-shadow" d="M 41,146 C 45,154 63,154 67,146 C 65,154 60,158 54,158 C 48,158 42,154 41,146 Z" fill="#E4C4A0" />
    <path d="M 50,136 C 50,132 58,132 58,136 C 58,140 50,140 50,136 Z" fill="#E2707A" stroke="#3A1E12" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M 48,144 C 50,147 58,147 60,144" fill="none" stroke="#3A1E12" stroke-width="1.6" stroke-linecap="round" />

    <path d="M 38,140 C 28,138 20,138 14,140" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 37,145 C 27,145 19,147 13,150" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 70,140 C 80,138 88,138 94,140" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />
    <path d="M 71,145 C 81,145 89,147 95,150" fill="none" stroke="#3A1E12" stroke-width="1.5" stroke-linecap="round" />

    <g class="anim-blink">
      <ellipse class="cel-outline" cx="40" cy="126" rx="11" ry="13" fill="#8C5A2B" stroke="#3A1E12" stroke-width="3.2" />
      <path class="cel-shadow" d="M 30,131 C 31,137 35,140 40,140 C 46,140 50,136 51,128 Z" fill="#8A4A1E" />
      <circle class="pet-pupil" data-anchor-x="40" data-anchor-y="126" cx="40" cy="126" r="4.5" fill="#1E0F08" />
      <circle cx="36" cy="120" r="3.6" fill="#FFFFFF" />
      <circle cx="45" cy="132" r="1.7" fill="#FFFFFF" />
      <ellipse class="cel-outline" cx="66" cy="126" rx="11" ry="13" fill="#8C5A2B" stroke="#3A1E12" stroke-width="3.2" />
      <path class="cel-shadow" d="M 56,131 C 57,137 61,140 66,140 C 72,140 76,136 77,128 Z" fill="#8A4A1E" />
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
