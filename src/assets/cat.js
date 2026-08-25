/* Mascot Cat Assets - Chibi 2D Anime Illustration */
const catIdleSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cat-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EAA663" />
      <stop offset="50%" stop-color="#D08842" />
      <stop offset="100%" stop-color="#A85F28" />
    </linearGradient>
    <linearGradient id="cat-fur-dark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8C461A" />
      <stop offset="100%" stop-color="#602E0E" />
    </linearGradient>
    <linearGradient id="cat-stripes" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4E240F" />
      <stop offset="100%" stop-color="#341507" />
    </linearGradient>
    <linearGradient id="cat-cream" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF9" />
      <stop offset="50%" stop-color="#FFF5E6" />
      <stop offset="100%" stop-color="#FDE8CE" />
    </linearGradient>
    <linearGradient id="cat-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFBEB8" />
      <stop offset="100%" stop-color="#FFAAA3" />
    </linearGradient>
    <linearGradient id="cat-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1F0D05" />
      <stop offset="45%" stop-color="#3D1A0A" />
      <stop offset="85%" stop-color="#7A3912" />
      <stop offset="100%" stop-color="#A4551E" />
    </linearGradient>
    <linearGradient id="cushion-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
  </defs>
  <!-- Sombra en suelo suave -->
  <ellipse cx="100" cy="170" rx="55" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <!-- Cola Esponjosa con Rayas (Atrás Izquierda) -->
  <g id="cat-tail" class="anim-wag" style="transform-origin: 70px 140px; transform: rotate(0deg);">
    <path d="M 72,140 C 52,145 34,130 30,108 C 26,88 38,72 52,76 C 56,78 54,90 48,96 C 42,104 46,120 60,126 C 66,129 71,133 75,138 Z" 
          fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 36,90 C 42,94 46,100 46,106" stroke="url(#cat-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    <path d="M 40,108 C 47,112 51,118 49,124" stroke="url(#cat-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    <path d="M 52,124 C 58,128 62,133 58,137" stroke="url(#cat-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
  </g>

  <!-- Muslos traseros redondeados con patitas apoyadas en suelo -->
  <g class="pet-hind-legs">
    <g class="back-foot-left">
      <!-- Muslo Izquierdo -->
      <path d="M 58,132 C 48,142 48,156 55,164 C 60,168 68,168 74,165 C 77,161 76,146 71,136 Z"
            fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 50,146 Q 58,148 63,152" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M 52,154 Q 60,156 65,159" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <ellipse cx="54" cy="165" rx="8" ry="4.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.8" />
    </g>
    <g class="back-foot-right">
      <!-- Muslo Derecho -->
      <path d="M 142,132 C 152,142 152,156 145,164 C 140,168 132,168 126,165 C 123,161 124,146 129,136 Z"
            fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 150,146 Q 142,148 137,152" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M 148,154 Q 140,156 135,159" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <ellipse cx="146" cy="165" rx="8" ry="4.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.8" />
    </g>
  </g>

  <!-- Torso & Pecho Esponjoso en Capas -->
  <g class="anim-breath pet-body" style="transform-origin: 100px 165px; transform: translateY(0px) rotate(0deg);">
    <!-- Cuerpo Base Atigrado -->
    <path d="M 68,105 C 63,122 65,148 74,163 C 83,167 117,167 126,163 C 135,148 137,122 132,105 Z" 
          fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />

    <path d="M 70,120 Q 78,123 82,127" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 71,132 Q 79,134 84,138" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 130,120 Q 122,123 118,127" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 129,132 Q 121,134 116,138" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />

    <!-- Pechera Esponjosa en Capas Suaves (Cascada de Mechones) -->
    <path d="M 80,94 C 74,108 72,122 79,132 C 84,138 92,144 100,146 C 108,144 116,138 121,132 C 128,122 126,108 120,94 C 112,104 88,104 80,94 Z" 
          fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.8" stroke-linejoin="round" />
    <path d="M 88,128 C 94,136 106,136 112,128" stroke="#34180C" stroke-width="1.4" fill="none" />

    <!-- Patas delanteras redonditas y carnosas con deditos -->
    <g class="pet-front-paws">
      <!-- Pata Delantera Izquierda -->
      <path d="M 76,132 L 75,155 C 75,161 78,165 83,165 C 88,165 91,161 91,155 L 90,132 Z" 
            fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
      <ellipse cx="83" cy="164" rx="9.5" ry="5.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" />
      <path d="M 79,162 L 79,167" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
      <path d="M 86,162 L 86,167" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />

      <!-- Pata Delantera Derecha -->
      <path d="M 110,132 L 109,155 C 109,161 112,165 117,165 C 122,165 125,161 125,155 L 124,132 Z" 
            fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
      <ellipse cx="117" cy="164" rx="9.5" ry="5.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" />
      <path d="M 113,162 L 113,167" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
      <path d="M 120,162 L 120,167" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
    </g>
  </g>

  <!-- Cabeza Expresiva Chibi Anime -->
  <g class="pet-head anim-breath" style="transform-origin: 100px 105px; transform: translateY(0px) rotate(0deg);">
    <!-- Oreja Izquierda -->
    <g class="pet-ear pet-ear-left" style="transform-origin: 64px 55px;">
      <path d="M 60,58 L 46,26 C 60,29 76,42 76,56 Z" fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 56,54 L 49,33 C 58,36 68,45 66,54 Z" fill="url(#cat-ear-inner)" />
      <path d="M 52,48 Q 57,44 62,51" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" />
    </g>

    <!-- Oreja Derecha -->
    <g class="pet-ear pet-ear-right" style="transform-origin: 136px 55px;">
      <path d="M 140,58 L 154,26 C 140,29 124,42 124,56 Z" fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 144,54 L 151,33 C 142,36 132,45 134,54 Z" fill="url(#cat-ear-inner)" />
      <path d="M 148,48 Q 143,44 138,51" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" />
    </g>

    <!-- Silueta de la Cabeza con 3 Mechones en cada Mejilla -->
    <path d="M 56,62 C 50,52 68,38 100,38 C 132,38 150,52 144,62 
             C 154,66 159,74 152,80 
             C 159,84 161,93 150,97 
             C 154,101 148,109 137,109 
             C 126,115 74,115 63,109 
             C 52,109 46,101 50,97 
             C 39,93 41,84 48,80 
             C 41,74 46,66 56,62 Z" 
          fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />

    <!-- Rayas atigradas de la frente -->
    <path d="M 100,40 L 100,54" stroke="url(#cat-stripes)" stroke-width="3.8" stroke-linecap="round" />
    <path d="M 91,44 Q 93,52 88,56" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 109,44 Q 107,52 112,56" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 82,49 Q 86,56 81,60" stroke="url(#cat-stripes)" stroke-width="2.6" stroke-linecap="round" fill="none" />
    <path d="M 118,49 Q 114,56 119,60" stroke="url(#cat-stripes)" stroke-width="2.6" stroke-linecap="round" fill="none" />

    <!-- Rayitas en mejillas -->
    <path d="M 54,74 Q 63,76 67,74" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 52,83 Q 61,83 67,82" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 146,74 Q 137,76 133,74" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 148,83 Q 139,83 133,82" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />

    <!-- Bigotes Blancos Finos -->
    <path d="M 54,86 Q 38,84 28,81" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 52,91 Q 36,93 26,97" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 146,86 Q 162,84 172,81" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 148,91 Q 164,93 174,97" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />

    <!-- Hocico Crema Redondito -->
    <ellipse cx="100" cy="86" rx="14" ry="10" fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.5" />
    <!-- Nariz Rosita -->
    <path d="M 97,80 L 103,80 L 100,83 Z" fill="#FF8585" stroke="#34180C" stroke-width="1" stroke-linejoin="round" />
    <!-- Boquita Abierta Feliz con Lengüita -->
    <path d="M 95,84 Q 100,87 100,84 Q 100,87 105,84" stroke="#34180C" stroke-width="1.8" fill="none" stroke-linecap="round" />
    <path d="M 97,85 Q 100,91 103,85 Z" fill="#FF7675" stroke="#34180C" stroke-width="1" />

    <!-- Rubor en Mejillas -->
    <ellipse cx="64" cy="86" rx="7" ry="4" fill="#FF7675" opacity="0.45" />
    <ellipse cx="136" cy="86" rx="7" ry="4" fill="#FF7675" opacity="0.45" />

    <!-- Ojos Anime Grandes y Brillantes -->
    <g class="anim-blink">
      <ellipse cx="82" cy="72" rx="13" ry="15" fill="url(#cat-eye-iris)" stroke="#34180C" stroke-width="2.2" />
      <ellipse cx="82" cy="72" rx="9" ry="11" fill="#0E0502" />
      <circle class="pet-pupil" data-anchor-x="82" data-anchor-y="72" cx="82" cy="72" r="5" fill="#000000" />
      <circle cx="78" cy="66" r="4.5" fill="#FFFFFF" />
      <circle cx="87" cy="77" r="2" fill="#FFFFFF" />
      <circle cx="77" cy="75" r="1.2" fill="#FFFFFF" opacity="0.75" />

      <ellipse cx="118" cy="72" rx="13" ry="15" fill="url(#cat-eye-iris)" stroke="#34180C" stroke-width="2.2" />
      <ellipse cx="118" cy="72" rx="9" ry="11" fill="#0E0502" />
      <circle class="pet-pupil" data-anchor-x="118" data-anchor-y="72" cx="118" cy="72" r="5" fill="#000000" />
      <circle cx="114" cy="66" r="4.5" fill="#FFFFFF" />
      <circle cx="123" cy="77" r="2" fill="#FFFFFF" />
      <circle cx="113" cy="75" r="1.2" fill="#FFFFFF" opacity="0.75" />
    </g>
  </g>
</svg>`;
const catWalk1SVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cat-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EAA663" />
      <stop offset="50%" stop-color="#D08842" />
      <stop offset="100%" stop-color="#A85F28" />
    </linearGradient>
    <linearGradient id="cat-fur-dark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8C461A" />
      <stop offset="100%" stop-color="#602E0E" />
    </linearGradient>
    <linearGradient id="cat-stripes" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4E240F" />
      <stop offset="100%" stop-color="#341507" />
    </linearGradient>
    <linearGradient id="cat-cream" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF9" />
      <stop offset="50%" stop-color="#FFF5E6" />
      <stop offset="100%" stop-color="#FDE8CE" />
    </linearGradient>
    <linearGradient id="cat-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFBEB8" />
      <stop offset="100%" stop-color="#FFAAA3" />
    </linearGradient>
    <linearGradient id="cat-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1F0D05" />
      <stop offset="45%" stop-color="#3D1A0A" />
      <stop offset="85%" stop-color="#7A3912" />
      <stop offset="100%" stop-color="#A4551E" />
    </linearGradient>
    <linearGradient id="cushion-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
  </defs>
  <!-- Sombra en suelo suave -->
  <ellipse cx="100" cy="170" rx="55" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <!-- Cola Esponjosa con Rayas (Atrás Izquierda) -->
  <g id="cat-tail" class="" style="transform-origin: 70px 140px; transform: rotate(8deg);">
    <path d="M 72,140 C 52,145 34,130 30,108 C 26,88 38,72 52,76 C 56,78 54,90 48,96 C 42,104 46,120 60,126 C 66,129 71,133 75,138 Z" 
          fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 36,90 C 42,94 46,100 46,106" stroke="url(#cat-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    <path d="M 40,108 C 47,112 51,118 49,124" stroke="url(#cat-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    <path d="M 52,124 C 58,128 62,133 58,137" stroke="url(#cat-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
  </g>

  <!-- Muslos traseros redondeados con patitas apoyadas en suelo -->
  <g class="pet-hind-legs">
    <g class="back-foot-left">
      <!-- Muslo Izquierdo -->
      <path d="M 58,132 C 48,142 48,156 55,164 C 60,168 68,168 74,165 C 77,161 76,146 71,136 Z"
            fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 50,146 Q 58,148 63,152" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M 52,154 Q 60,156 65,159" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <ellipse cx="54" cy="167" rx="8" ry="4.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.8" />
    </g>
    <g class="back-foot-right">
      <!-- Muslo Derecho -->
      <path d="M 142,132 C 152,142 152,156 145,164 C 140,168 132,168 126,165 C 123,161 124,146 129,136 Z"
            fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 150,146 Q 142,148 137,152" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M 148,154 Q 140,156 135,159" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <ellipse cx="146" cy="162" rx="8" ry="4.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.8" />
    </g>
  </g>

  <!-- Torso & Pecho Esponjoso en Capas -->
  <g class=" pet-body" style="transform-origin: 100px 165px; transform: translateY(-1px) rotate(-2deg);">
    <!-- Cuerpo Base Atigrado -->
    <path d="M 68,105 C 63,122 65,148 74,163 C 83,167 117,167 126,163 C 135,148 137,122 132,105 Z" 
          fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />

    <path d="M 70,120 Q 78,123 82,127" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 71,132 Q 79,134 84,138" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 130,120 Q 122,123 118,127" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 129,132 Q 121,134 116,138" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />

    <!-- Pechera Esponjosa en Capas Suaves (Cascada de Mechones) -->
    <path d="M 80,94 C 74,108 72,122 79,132 C 84,138 92,144 100,146 C 108,144 116,138 121,132 C 128,122 126,108 120,94 C 112,104 88,104 80,94 Z" 
          fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.8" stroke-linejoin="round" />
    <path d="M 88,128 C 94,136 106,136 112,128" stroke="#34180C" stroke-width="1.4" fill="none" />

    <!-- Patas delanteras redonditas y carnosas con deditos -->
    <g class="pet-front-paws">
      <g class="left-paw">
        <!-- Pata Delantera Izquierda -->
        <path d="M 76,132 L 75,155 C 75,161 78,165 83,165 C 88,165 91,161 91,155 L 90,132 Z"
              fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
        <ellipse cx="83" cy="158" rx="9.5" ry="5.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" />
        <path d="M 79,156 L 79,161" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
        <path d="M 86,156 L 86,161" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
      </g>
      <g class="right-paw">
        <!-- Pata Delantera Derecha -->
        <path d="M 110,132 L 109,155 C 109,161 112,165 117,165 C 122,165 125,161 125,155 L 124,132 Z"
              fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
        <ellipse cx="117" cy="166" rx="9.5" ry="5.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" />
        <path d="M 113,164 L 113,169" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
        <path d="M 120,164 L 120,169" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
      </g>
    </g>
  </g>

  <!-- Cabeza Expresiva Chibi Anime -->
  <g class="pet-head " style="transform-origin: 100px 105px; transform: translateY(-1px) rotate(-1.4deg);">
    <!-- Oreja Izquierda -->
    <g class="pet-ear pet-ear-left" style="transform-origin: 64px 55px;">
      <path d="M 60,58 L 46,26 C 60,29 76,42 76,56 Z" fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 56,54 L 49,33 C 58,36 68,45 66,54 Z" fill="url(#cat-ear-inner)" />
      <path d="M 52,48 Q 57,44 62,51" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" />
    </g>

    <!-- Oreja Derecha -->
    <g class="pet-ear pet-ear-right" style="transform-origin: 136px 55px;">
      <path d="M 140,58 L 154,26 C 140,29 124,42 124,56 Z" fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 144,54 L 151,33 C 142,36 132,45 134,54 Z" fill="url(#cat-ear-inner)" />
      <path d="M 148,48 Q 143,44 138,51" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" />
    </g>

    <!-- Silueta de la Cabeza con 3 Mechones en cada Mejilla -->
    <path d="M 56,62 C 50,52 68,38 100,38 C 132,38 150,52 144,62 
             C 154,66 159,74 152,80 
             C 159,84 161,93 150,97 
             C 154,101 148,109 137,109 
             C 126,115 74,115 63,109 
             C 52,109 46,101 50,97 
             C 39,93 41,84 48,80 
             C 41,74 46,66 56,62 Z" 
          fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />

    <!-- Rayas atigradas de la frente -->
    <path d="M 100,40 L 100,54" stroke="url(#cat-stripes)" stroke-width="3.8" stroke-linecap="round" />
    <path d="M 91,44 Q 93,52 88,56" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 109,44 Q 107,52 112,56" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 82,49 Q 86,56 81,60" stroke="url(#cat-stripes)" stroke-width="2.6" stroke-linecap="round" fill="none" />
    <path d="M 118,49 Q 114,56 119,60" stroke="url(#cat-stripes)" stroke-width="2.6" stroke-linecap="round" fill="none" />

    <!-- Rayitas en mejillas -->
    <path d="M 54,74 Q 63,76 67,74" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 52,83 Q 61,83 67,82" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 146,74 Q 137,76 133,74" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 148,83 Q 139,83 133,82" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />

    <!-- Bigotes Blancos Finos -->
    <path d="M 54,86 Q 38,84 28,81" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 52,91 Q 36,93 26,97" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 146,86 Q 162,84 172,81" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 148,91 Q 164,93 174,97" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />

    <!-- Hocico Crema Redondito -->
    <ellipse cx="100" cy="86" rx="14" ry="10" fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.5" />
    <!-- Nariz Rosita -->
    <path d="M 97,80 L 103,80 L 100,83 Z" fill="#FF8585" stroke="#34180C" stroke-width="1" stroke-linejoin="round" />
    <!-- Boquita Abierta Feliz con Lengüita -->
    <path d="M 95,84 Q 100,87 100,84 Q 100,87 105,84" stroke="#34180C" stroke-width="1.8" fill="none" stroke-linecap="round" />
    <path d="M 97,85 Q 100,91 103,85 Z" fill="#FF7675" stroke="#34180C" stroke-width="1" />

    <!-- Rubor en Mejillas -->
    <ellipse cx="64" cy="86" rx="7" ry="4" fill="#FF7675" opacity="0.45" />
    <ellipse cx="136" cy="86" rx="7" ry="4" fill="#FF7675" opacity="0.45" />

    <!-- Ojos Anime Grandes y Brillantes -->
    <g class="">
      <ellipse cx="82" cy="72" rx="13" ry="15" fill="url(#cat-eye-iris)" stroke="#34180C" stroke-width="2.2" />
      <ellipse cx="82" cy="72" rx="9" ry="11" fill="#0E0502" />
      <circle class="pet-pupil" data-anchor-x="82" data-anchor-y="72" cx="82" cy="72" r="5" fill="#000000" />
      <circle cx="78" cy="66" r="4.5" fill="#FFFFFF" />
      <circle cx="87" cy="77" r="2" fill="#FFFFFF" />
      <circle cx="77" cy="75" r="1.2" fill="#FFFFFF" opacity="0.75" />

      <ellipse cx="118" cy="72" rx="13" ry="15" fill="url(#cat-eye-iris)" stroke="#34180C" stroke-width="2.2" />
      <ellipse cx="118" cy="72" rx="9" ry="11" fill="#0E0502" />
      <circle class="pet-pupil" data-anchor-x="118" data-anchor-y="72" cx="118" cy="72" r="5" fill="#000000" />
      <circle cx="114" cy="66" r="4.5" fill="#FFFFFF" />
      <circle cx="123" cy="77" r="2" fill="#FFFFFF" />
      <circle cx="113" cy="75" r="1.2" fill="#FFFFFF" opacity="0.75" />
    </g>
  </g>
</svg>`;
const catWalk2SVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cat-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EAA663" />
      <stop offset="50%" stop-color="#D08842" />
      <stop offset="100%" stop-color="#A85F28" />
    </linearGradient>
    <linearGradient id="cat-fur-dark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8C461A" />
      <stop offset="100%" stop-color="#602E0E" />
    </linearGradient>
    <linearGradient id="cat-stripes" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4E240F" />
      <stop offset="100%" stop-color="#341507" />
    </linearGradient>
    <linearGradient id="cat-cream" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF9" />
      <stop offset="50%" stop-color="#FFF5E6" />
      <stop offset="100%" stop-color="#FDE8CE" />
    </linearGradient>
    <linearGradient id="cat-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFBEB8" />
      <stop offset="100%" stop-color="#FFAAA3" />
    </linearGradient>
    <linearGradient id="cat-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1F0D05" />
      <stop offset="45%" stop-color="#3D1A0A" />
      <stop offset="85%" stop-color="#7A3912" />
      <stop offset="100%" stop-color="#A4551E" />
    </linearGradient>
    <linearGradient id="cushion-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
  </defs>
  <!-- Sombra en suelo suave -->
  <ellipse cx="100" cy="170" rx="55" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <!-- Cola Esponjosa con Rayas (Atrás Izquierda) -->
  <g id="cat-tail" class="" style="transform-origin: 70px 140px; transform: rotate(0deg);">
    <path d="M 72,140 C 52,145 34,130 30,108 C 26,88 38,72 52,76 C 56,78 54,90 48,96 C 42,104 46,120 60,126 C 66,129 71,133 75,138 Z" 
          fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 36,90 C 42,94 46,100 46,106" stroke="url(#cat-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    <path d="M 40,108 C 47,112 51,118 49,124" stroke="url(#cat-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    <path d="M 52,124 C 58,128 62,133 58,137" stroke="url(#cat-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
  </g>

  <!-- Muslos traseros redondeados con patitas apoyadas en suelo -->
  <g class="pet-hind-legs">
    <g class="back-foot-left">
      <!-- Muslo Izquierdo -->
      <path d="M 58,132 C 48,142 48,156 55,164 C 60,168 68,168 74,165 C 77,161 76,146 71,136 Z"
            fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 50,146 Q 58,148 63,152" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M 52,154 Q 60,156 65,159" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <ellipse cx="54" cy="165" rx="8" ry="4.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.8" />
    </g>
    <g class="back-foot-right">
      <!-- Muslo Derecho -->
      <path d="M 142,132 C 152,142 152,156 145,164 C 140,168 132,168 126,165 C 123,161 124,146 129,136 Z"
            fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 150,146 Q 142,148 137,152" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M 148,154 Q 140,156 135,159" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <ellipse cx="146" cy="165" rx="8" ry="4.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.8" />
    </g>
  </g>

  <!-- Torso & Pecho Esponjoso en Capas -->
  <g class=" pet-body" style="transform-origin: 100px 165px; transform: translateY(-3px) rotate(0deg);">
    <!-- Cuerpo Base Atigrado -->
    <path d="M 68,105 C 63,122 65,148 74,163 C 83,167 117,167 126,163 C 135,148 137,122 132,105 Z" 
          fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />

    <path d="M 70,120 Q 78,123 82,127" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 71,132 Q 79,134 84,138" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 130,120 Q 122,123 118,127" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 129,132 Q 121,134 116,138" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />

    <!-- Pechera Esponjosa en Capas Suaves (Cascada de Mechones) -->
    <path d="M 80,94 C 74,108 72,122 79,132 C 84,138 92,144 100,146 C 108,144 116,138 121,132 C 128,122 126,108 120,94 C 112,104 88,104 80,94 Z" 
          fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.8" stroke-linejoin="round" />
    <path d="M 88,128 C 94,136 106,136 112,128" stroke="#34180C" stroke-width="1.4" fill="none" />

    <!-- Patas delanteras redonditas y carnosas con deditos -->
    <g class="pet-front-paws">
      <g class="left-paw">
        <!-- Pata Delantera Izquierda -->
        <path d="M 76,132 L 75,155 C 75,161 78,165 83,165 C 88,165 91,161 91,155 L 90,132 Z"
              fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
        <ellipse cx="83" cy="161" rx="9.5" ry="5.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" />
        <path d="M 79,159 L 79,164" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
        <path d="M 86,159 L 86,164" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
      </g>
      <g class="right-paw">
        <!-- Pata Delantera Derecha -->
        <path d="M 110,132 L 109,155 C 109,161 112,165 117,165 C 122,165 125,161 125,155 L 124,132 Z"
              fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
        <ellipse cx="117" cy="163" rx="9.5" ry="5.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" />
        <path d="M 113,161 L 113,166" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
        <path d="M 120,161 L 120,166" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
      </g>
    </g>
  </g>

  <!-- Cabeza Expresiva Chibi Anime -->
  <g class="pet-head " style="transform-origin: 100px 105px; transform: translateY(-3px) rotate(0deg);">
    <!-- Oreja Izquierda -->
    <g class="pet-ear pet-ear-left" style="transform-origin: 64px 55px;">
      <path d="M 60,58 L 46,26 C 60,29 76,42 76,56 Z" fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 56,54 L 49,33 C 58,36 68,45 66,54 Z" fill="url(#cat-ear-inner)" />
      <path d="M 52,48 Q 57,44 62,51" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" />
    </g>

    <!-- Oreja Derecha -->
    <g class="pet-ear pet-ear-right" style="transform-origin: 136px 55px;">
      <path d="M 140,58 L 154,26 C 140,29 124,42 124,56 Z" fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 144,54 L 151,33 C 142,36 132,45 134,54 Z" fill="url(#cat-ear-inner)" />
      <path d="M 148,48 Q 143,44 138,51" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" />
    </g>

    <!-- Silueta de la Cabeza con 3 Mechones en cada Mejilla -->
    <path d="M 56,62 C 50,52 68,38 100,38 C 132,38 150,52 144,62 
             C 154,66 159,74 152,80 
             C 159,84 161,93 150,97 
             C 154,101 148,109 137,109 
             C 126,115 74,115 63,109 
             C 52,109 46,101 50,97 
             C 39,93 41,84 48,80 
             C 41,74 46,66 56,62 Z" 
          fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />

    <!-- Rayas atigradas de la frente -->
    <path d="M 100,40 L 100,54" stroke="url(#cat-stripes)" stroke-width="3.8" stroke-linecap="round" />
    <path d="M 91,44 Q 93,52 88,56" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 109,44 Q 107,52 112,56" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 82,49 Q 86,56 81,60" stroke="url(#cat-stripes)" stroke-width="2.6" stroke-linecap="round" fill="none" />
    <path d="M 118,49 Q 114,56 119,60" stroke="url(#cat-stripes)" stroke-width="2.6" stroke-linecap="round" fill="none" />

    <!-- Rayitas en mejillas -->
    <path d="M 54,74 Q 63,76 67,74" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 52,83 Q 61,83 67,82" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 146,74 Q 137,76 133,74" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 148,83 Q 139,83 133,82" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />

    <!-- Bigotes Blancos Finos -->
    <path d="M 54,86 Q 38,84 28,81" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 52,91 Q 36,93 26,97" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 146,86 Q 162,84 172,81" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 148,91 Q 164,93 174,97" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />

    <!-- Hocico Crema Redondito -->
    <ellipse cx="100" cy="86" rx="14" ry="10" fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.5" />
    <!-- Nariz Rosita -->
    <path d="M 97,80 L 103,80 L 100,83 Z" fill="#FF8585" stroke="#34180C" stroke-width="1" stroke-linejoin="round" />
    <!-- Boquita Abierta Feliz con Lengüita -->
    <path d="M 95,84 Q 100,87 100,84 Q 100,87 105,84" stroke="#34180C" stroke-width="1.8" fill="none" stroke-linecap="round" />
    <path d="M 97,85 Q 100,91 103,85 Z" fill="#FF7675" stroke="#34180C" stroke-width="1" />

    <!-- Rubor en Mejillas -->
    <ellipse cx="64" cy="86" rx="7" ry="4" fill="#FF7675" opacity="0.45" />
    <ellipse cx="136" cy="86" rx="7" ry="4" fill="#FF7675" opacity="0.45" />

    <!-- Ojos Anime Grandes y Brillantes -->
    <g class="">
      <ellipse cx="82" cy="72" rx="13" ry="15" fill="url(#cat-eye-iris)" stroke="#34180C" stroke-width="2.2" />
      <ellipse cx="82" cy="72" rx="9" ry="11" fill="#0E0502" />
      <circle class="pet-pupil" data-anchor-x="82" data-anchor-y="72" cx="82" cy="72" r="5" fill="#000000" />
      <circle cx="78" cy="66" r="4.5" fill="#FFFFFF" />
      <circle cx="87" cy="77" r="2" fill="#FFFFFF" />
      <circle cx="77" cy="75" r="1.2" fill="#FFFFFF" opacity="0.75" />

      <ellipse cx="118" cy="72" rx="13" ry="15" fill="url(#cat-eye-iris)" stroke="#34180C" stroke-width="2.2" />
      <ellipse cx="118" cy="72" rx="9" ry="11" fill="#0E0502" />
      <circle class="pet-pupil" data-anchor-x="118" data-anchor-y="72" cx="118" cy="72" r="5" fill="#000000" />
      <circle cx="114" cy="66" r="4.5" fill="#FFFFFF" />
      <circle cx="123" cy="77" r="2" fill="#FFFFFF" />
      <circle cx="113" cy="75" r="1.2" fill="#FFFFFF" opacity="0.75" />
    </g>
  </g>
</svg>`;
const catWalk3SVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cat-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EAA663" />
      <stop offset="50%" stop-color="#D08842" />
      <stop offset="100%" stop-color="#A85F28" />
    </linearGradient>
    <linearGradient id="cat-fur-dark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8C461A" />
      <stop offset="100%" stop-color="#602E0E" />
    </linearGradient>
    <linearGradient id="cat-stripes" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4E240F" />
      <stop offset="100%" stop-color="#341507" />
    </linearGradient>
    <linearGradient id="cat-cream" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF9" />
      <stop offset="50%" stop-color="#FFF5E6" />
      <stop offset="100%" stop-color="#FDE8CE" />
    </linearGradient>
    <linearGradient id="cat-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFBEB8" />
      <stop offset="100%" stop-color="#FFAAA3" />
    </linearGradient>
    <linearGradient id="cat-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1F0D05" />
      <stop offset="45%" stop-color="#3D1A0A" />
      <stop offset="85%" stop-color="#7A3912" />
      <stop offset="100%" stop-color="#A4551E" />
    </linearGradient>
    <linearGradient id="cushion-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
  </defs>
  <!-- Sombra en suelo suave -->
  <ellipse cx="100" cy="170" rx="55" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <!-- Cola Esponjosa con Rayas (Atrás Izquierda) -->
  <g id="cat-tail" class="" style="transform-origin: 70px 140px; transform: rotate(-8deg);">
    <path d="M 72,140 C 52,145 34,130 30,108 C 26,88 38,72 52,76 C 56,78 54,90 48,96 C 42,104 46,120 60,126 C 66,129 71,133 75,138 Z" 
          fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 36,90 C 42,94 46,100 46,106" stroke="url(#cat-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    <path d="M 40,108 C 47,112 51,118 49,124" stroke="url(#cat-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    <path d="M 52,124 C 58,128 62,133 58,137" stroke="url(#cat-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
  </g>

  <!-- Muslos traseros redondeados con patitas apoyadas en suelo -->
  <g class="pet-hind-legs">
    <g class="back-foot-left">
      <!-- Muslo Izquierdo -->
      <path d="M 58,132 C 48,142 48,156 55,164 C 60,168 68,168 74,165 C 77,161 76,146 71,136 Z"
            fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 50,146 Q 58,148 63,152" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M 52,154 Q 60,156 65,159" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <ellipse cx="54" cy="162" rx="8" ry="4.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.8" />
    </g>
    <g class="back-foot-right">
      <!-- Muslo Derecho -->
      <path d="M 142,132 C 152,142 152,156 145,164 C 140,168 132,168 126,165 C 123,161 124,146 129,136 Z"
            fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 150,146 Q 142,148 137,152" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M 148,154 Q 140,156 135,159" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <ellipse cx="146" cy="167" rx="8" ry="4.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.8" />
    </g>
  </g>

  <!-- Torso & Pecho Esponjoso en Capas -->
  <g class=" pet-body" style="transform-origin: 100px 165px; transform: translateY(-1px) rotate(2deg);">
    <!-- Cuerpo Base Atigrado -->
    <path d="M 68,105 C 63,122 65,148 74,163 C 83,167 117,167 126,163 C 135,148 137,122 132,105 Z" 
          fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />

    <path d="M 70,120 Q 78,123 82,127" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 71,132 Q 79,134 84,138" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 130,120 Q 122,123 118,127" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 129,132 Q 121,134 116,138" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />

    <!-- Pechera Esponjosa en Capas Suaves (Cascada de Mechones) -->
    <path d="M 80,94 C 74,108 72,122 79,132 C 84,138 92,144 100,146 C 108,144 116,138 121,132 C 128,122 126,108 120,94 C 112,104 88,104 80,94 Z" 
          fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.8" stroke-linejoin="round" />
    <path d="M 88,128 C 94,136 106,136 112,128" stroke="#34180C" stroke-width="1.4" fill="none" />

    <!-- Patas delanteras redonditas y carnosas con deditos -->
    <g class="pet-front-paws">
      <g class="left-paw">
        <!-- Pata Delantera Izquierda -->
        <path d="M 76,132 L 75,155 C 75,161 78,165 83,165 C 88,165 91,161 91,155 L 90,132 Z"
              fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
        <ellipse cx="83" cy="166" rx="9.5" ry="5.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" />
        <path d="M 79,164 L 79,169" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
        <path d="M 86,164 L 86,169" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
      </g>
      <g class="right-paw">
        <!-- Pata Delantera Derecha -->
        <path d="M 110,132 L 109,155 C 109,161 112,165 117,165 C 122,165 125,161 125,155 L 124,132 Z"
              fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
        <ellipse cx="117" cy="158" rx="9.5" ry="5.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" />
        <path d="M 113,156 L 113,161" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
        <path d="M 120,156 L 120,161" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
      </g>
    </g>
  </g>

  <!-- Cabeza Expresiva Chibi Anime -->
  <g class="pet-head " style="transform-origin: 100px 105px; transform: translateY(-1px) rotate(1.4deg);">
    <!-- Oreja Izquierda -->
    <g class="pet-ear pet-ear-left" style="transform-origin: 64px 55px;">
      <path d="M 60,58 L 46,26 C 60,29 76,42 76,56 Z" fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 56,54 L 49,33 C 58,36 68,45 66,54 Z" fill="url(#cat-ear-inner)" />
      <path d="M 52,48 Q 57,44 62,51" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" />
    </g>

    <!-- Oreja Derecha -->
    <g class="pet-ear pet-ear-right" style="transform-origin: 136px 55px;">
      <path d="M 140,58 L 154,26 C 140,29 124,42 124,56 Z" fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 144,54 L 151,33 C 142,36 132,45 134,54 Z" fill="url(#cat-ear-inner)" />
      <path d="M 148,48 Q 143,44 138,51" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" />
    </g>

    <!-- Silueta de la Cabeza con 3 Mechones en cada Mejilla -->
    <path d="M 56,62 C 50,52 68,38 100,38 C 132,38 150,52 144,62 
             C 154,66 159,74 152,80 
             C 159,84 161,93 150,97 
             C 154,101 148,109 137,109 
             C 126,115 74,115 63,109 
             C 52,109 46,101 50,97 
             C 39,93 41,84 48,80 
             C 41,74 46,66 56,62 Z" 
          fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />

    <!-- Rayas atigradas de la frente -->
    <path d="M 100,40 L 100,54" stroke="url(#cat-stripes)" stroke-width="3.8" stroke-linecap="round" />
    <path d="M 91,44 Q 93,52 88,56" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 109,44 Q 107,52 112,56" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 82,49 Q 86,56 81,60" stroke="url(#cat-stripes)" stroke-width="2.6" stroke-linecap="round" fill="none" />
    <path d="M 118,49 Q 114,56 119,60" stroke="url(#cat-stripes)" stroke-width="2.6" stroke-linecap="round" fill="none" />

    <!-- Rayitas en mejillas -->
    <path d="M 54,74 Q 63,76 67,74" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 52,83 Q 61,83 67,82" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 146,74 Q 137,76 133,74" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 148,83 Q 139,83 133,82" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />

    <!-- Bigotes Blancos Finos -->
    <path d="M 54,86 Q 38,84 28,81" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 52,91 Q 36,93 26,97" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 146,86 Q 162,84 172,81" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 148,91 Q 164,93 174,97" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />

    <!-- Hocico Crema Redondito -->
    <ellipse cx="100" cy="86" rx="14" ry="10" fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.5" />
    <!-- Nariz Rosita -->
    <path d="M 97,80 L 103,80 L 100,83 Z" fill="#FF8585" stroke="#34180C" stroke-width="1" stroke-linejoin="round" />
    <!-- Boquita Abierta Feliz con Lengüita -->
    <path d="M 95,84 Q 100,87 100,84 Q 100,87 105,84" stroke="#34180C" stroke-width="1.8" fill="none" stroke-linecap="round" />
    <path d="M 97,85 Q 100,91 103,85 Z" fill="#FF7675" stroke="#34180C" stroke-width="1" />

    <!-- Rubor en Mejillas -->
    <ellipse cx="64" cy="86" rx="7" ry="4" fill="#FF7675" opacity="0.45" />
    <ellipse cx="136" cy="86" rx="7" ry="4" fill="#FF7675" opacity="0.45" />

    <!-- Ojos Anime Grandes y Brillantes -->
    <g class="">
      <ellipse cx="82" cy="72" rx="13" ry="15" fill="url(#cat-eye-iris)" stroke="#34180C" stroke-width="2.2" />
      <ellipse cx="82" cy="72" rx="9" ry="11" fill="#0E0502" />
      <circle class="pet-pupil" data-anchor-x="82" data-anchor-y="72" cx="82" cy="72" r="5" fill="#000000" />
      <circle cx="78" cy="66" r="4.5" fill="#FFFFFF" />
      <circle cx="87" cy="77" r="2" fill="#FFFFFF" />
      <circle cx="77" cy="75" r="1.2" fill="#FFFFFF" opacity="0.75" />

      <ellipse cx="118" cy="72" rx="13" ry="15" fill="url(#cat-eye-iris)" stroke="#34180C" stroke-width="2.2" />
      <ellipse cx="118" cy="72" rx="9" ry="11" fill="#0E0502" />
      <circle class="pet-pupil" data-anchor-x="118" data-anchor-y="72" cx="118" cy="72" r="5" fill="#000000" />
      <circle cx="114" cy="66" r="4.5" fill="#FFFFFF" />
      <circle cx="123" cy="77" r="2" fill="#FFFFFF" />
      <circle cx="113" cy="75" r="1.2" fill="#FFFFFF" opacity="0.75" />
    </g>
  </g>
</svg>`;
const catWalk4SVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cat-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EAA663" />
      <stop offset="50%" stop-color="#D08842" />
      <stop offset="100%" stop-color="#A85F28" />
    </linearGradient>
    <linearGradient id="cat-fur-dark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8C461A" />
      <stop offset="100%" stop-color="#602E0E" />
    </linearGradient>
    <linearGradient id="cat-stripes" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4E240F" />
      <stop offset="100%" stop-color="#341507" />
    </linearGradient>
    <linearGradient id="cat-cream" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF9" />
      <stop offset="50%" stop-color="#FFF5E6" />
      <stop offset="100%" stop-color="#FDE8CE" />
    </linearGradient>
    <linearGradient id="cat-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFBEB8" />
      <stop offset="100%" stop-color="#FFAAA3" />
    </linearGradient>
    <linearGradient id="cat-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1F0D05" />
      <stop offset="45%" stop-color="#3D1A0A" />
      <stop offset="85%" stop-color="#7A3912" />
      <stop offset="100%" stop-color="#A4551E" />
    </linearGradient>
    <linearGradient id="cushion-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
  </defs>
  <!-- Sombra en suelo suave -->
  <ellipse cx="100" cy="170" rx="55" ry="7" fill="#28140B" opacity="0.22" class="pet-shadow" />

  <!-- Cola Esponjosa con Rayas (Atrás Izquierda) -->
  <g id="cat-tail" class="" style="transform-origin: 70px 140px; transform: rotate(0deg);">
    <path d="M 72,140 C 52,145 34,130 30,108 C 26,88 38,72 52,76 C 56,78 54,90 48,96 C 42,104 46,120 60,126 C 66,129 71,133 75,138 Z" 
          fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
    <path d="M 36,90 C 42,94 46,100 46,106" stroke="url(#cat-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    <path d="M 40,108 C 47,112 51,118 49,124" stroke="url(#cat-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
    <path d="M 52,124 C 58,128 62,133 58,137" stroke="url(#cat-stripes)" stroke-width="3.5" stroke-linecap="round" fill="none" />
  </g>

  <!-- Muslos traseros redondeados con patitas apoyadas en suelo -->
  <g class="pet-hind-legs">
    <g class="back-foot-left">
      <!-- Muslo Izquierdo -->
      <path d="M 58,132 C 48,142 48,156 55,164 C 60,168 68,168 74,165 C 77,161 76,146 71,136 Z"
            fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 50,146 Q 58,148 63,152" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M 52,154 Q 60,156 65,159" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <ellipse cx="54" cy="165" rx="8" ry="4.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.8" />
    </g>
    <g class="back-foot-right">
      <!-- Muslo Derecho -->
      <path d="M 142,132 C 152,142 152,156 145,164 C 140,168 132,168 126,165 C 123,161 124,146 129,136 Z"
            fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 150,146 Q 142,148 137,152" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M 148,154 Q 140,156 135,159" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
      <ellipse cx="146" cy="165" rx="8" ry="4.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.8" />
    </g>
  </g>

  <!-- Torso & Pecho Esponjoso en Capas -->
  <g class=" pet-body" style="transform-origin: 100px 165px; transform: translateY(-3px) rotate(0deg);">
    <!-- Cuerpo Base Atigrado -->
    <path d="M 68,105 C 63,122 65,148 74,163 C 83,167 117,167 126,163 C 135,148 137,122 132,105 Z" 
          fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />

    <path d="M 70,120 Q 78,123 82,127" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 71,132 Q 79,134 84,138" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 130,120 Q 122,123 118,127" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />
    <path d="M 129,132 Q 121,134 116,138" stroke="url(#cat-stripes)" stroke-width="3.2" stroke-linecap="round" fill="none" />

    <!-- Pechera Esponjosa en Capas Suaves (Cascada de Mechones) -->
    <path d="M 80,94 C 74,108 72,122 79,132 C 84,138 92,144 100,146 C 108,144 116,138 121,132 C 128,122 126,108 120,94 C 112,104 88,104 80,94 Z" 
          fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.8" stroke-linejoin="round" />
    <path d="M 88,128 C 94,136 106,136 112,128" stroke="#34180C" stroke-width="1.4" fill="none" />

    <!-- Patas delanteras redonditas y carnosas con deditos -->
    <g class="pet-front-paws">
      <g class="left-paw">
        <!-- Pata Delantera Izquierda -->
        <path d="M 76,132 L 75,155 C 75,161 78,165 83,165 C 88,165 91,161 91,155 L 90,132 Z"
              fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
        <ellipse cx="83" cy="163" rx="9.5" ry="5.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" />
        <path d="M 79,161 L 79,166" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
        <path d="M 86,161 L 86,166" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
      </g>
      <g class="right-paw">
        <!-- Pata Delantera Derecha -->
        <path d="M 110,132 L 109,155 C 109,161 112,165 117,165 C 122,165 125,161 125,155 L 124,132 Z"
              fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" stroke-linejoin="round" />
        <ellipse cx="117" cy="161" rx="9.5" ry="5.5" fill="url(#cat-cream)" stroke="#34180C" stroke-width="2" />
        <path d="M 113,159 L 113,164" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
        <path d="M 120,159 L 120,164" stroke="#34180C" stroke-width="1.5" stroke-linecap="round" />
      </g>
    </g>
  </g>

  <!-- Cabeza Expresiva Chibi Anime -->
  <g class="pet-head " style="transform-origin: 100px 105px; transform: translateY(-3px) rotate(0deg);">
    <!-- Oreja Izquierda -->
    <g class="pet-ear pet-ear-left" style="transform-origin: 64px 55px;">
      <path d="M 60,58 L 46,26 C 60,29 76,42 76,56 Z" fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 56,54 L 49,33 C 58,36 68,45 66,54 Z" fill="url(#cat-ear-inner)" />
      <path d="M 52,48 Q 57,44 62,51" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" />
    </g>

    <!-- Oreja Derecha -->
    <g class="pet-ear pet-ear-right" style="transform-origin: 136px 55px;">
      <path d="M 140,58 L 154,26 C 140,29 124,42 124,56 Z" fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 144,54 L 151,33 C 142,36 132,45 134,54 Z" fill="url(#cat-ear-inner)" />
      <path d="M 148,48 Q 143,44 138,51" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" />
    </g>

    <!-- Silueta de la Cabeza con 3 Mechones en cada Mejilla -->
    <path d="M 56,62 C 50,52 68,38 100,38 C 132,38 150,52 144,62 
             C 154,66 159,74 152,80 
             C 159,84 161,93 150,97 
             C 154,101 148,109 137,109 
             C 126,115 74,115 63,109 
             C 52,109 46,101 50,97 
             C 39,93 41,84 48,80 
             C 41,74 46,66 56,62 Z" 
          fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" stroke-linejoin="round" />

    <!-- Rayas atigradas de la frente -->
    <path d="M 100,40 L 100,54" stroke="url(#cat-stripes)" stroke-width="3.8" stroke-linecap="round" />
    <path d="M 91,44 Q 93,52 88,56" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 109,44 Q 107,52 112,56" stroke="url(#cat-stripes)" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 82,49 Q 86,56 81,60" stroke="url(#cat-stripes)" stroke-width="2.6" stroke-linecap="round" fill="none" />
    <path d="M 118,49 Q 114,56 119,60" stroke="url(#cat-stripes)" stroke-width="2.6" stroke-linecap="round" fill="none" />

    <!-- Rayitas en mejillas -->
    <path d="M 54,74 Q 63,76 67,74" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 52,83 Q 61,83 67,82" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 146,74 Q 137,76 133,74" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M 148,83 Q 139,83 133,82" stroke="url(#cat-stripes)" stroke-width="2.5" stroke-linecap="round" fill="none" />

    <!-- Bigotes Blancos Finos -->
    <path d="M 54,86 Q 38,84 28,81" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 52,91 Q 36,93 26,97" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 146,86 Q 162,84 172,81" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />
    <path d="M 148,91 Q 164,93 174,97" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.95" />

    <!-- Hocico Crema Redondito -->
    <ellipse cx="100" cy="86" rx="14" ry="10" fill="url(#cat-cream)" stroke="#34180C" stroke-width="1.5" />
    <!-- Nariz Rosita -->
    <path d="M 97,80 L 103,80 L 100,83 Z" fill="#FF8585" stroke="#34180C" stroke-width="1" stroke-linejoin="round" />
    <!-- Boquita Abierta Feliz con Lengüita -->
    <path d="M 95,84 Q 100,87 100,84 Q 100,87 105,84" stroke="#34180C" stroke-width="1.8" fill="none" stroke-linecap="round" />
    <path d="M 97,85 Q 100,91 103,85 Z" fill="#FF7675" stroke="#34180C" stroke-width="1" />

    <!-- Rubor en Mejillas -->
    <ellipse cx="64" cy="86" rx="7" ry="4" fill="#FF7675" opacity="0.45" />
    <ellipse cx="136" cy="86" rx="7" ry="4" fill="#FF7675" opacity="0.45" />

    <!-- Ojos Anime Grandes y Brillantes -->
    <g class="">
      <ellipse cx="82" cy="72" rx="13" ry="15" fill="url(#cat-eye-iris)" stroke="#34180C" stroke-width="2.2" />
      <ellipse cx="82" cy="72" rx="9" ry="11" fill="#0E0502" />
      <circle class="pet-pupil" data-anchor-x="82" data-anchor-y="72" cx="82" cy="72" r="5" fill="#000000" />
      <circle cx="78" cy="66" r="4.5" fill="#FFFFFF" />
      <circle cx="87" cy="77" r="2" fill="#FFFFFF" />
      <circle cx="77" cy="75" r="1.2" fill="#FFFFFF" opacity="0.75" />

      <ellipse cx="118" cy="72" rx="13" ry="15" fill="url(#cat-eye-iris)" stroke="#34180C" stroke-width="2.2" />
      <ellipse cx="118" cy="72" rx="9" ry="11" fill="#0E0502" />
      <circle class="pet-pupil" data-anchor-x="118" data-anchor-y="72" cx="118" cy="72" r="5" fill="#000000" />
      <circle cx="114" cy="66" r="4.5" fill="#FFFFFF" />
      <circle cx="123" cy="77" r="2" fill="#FFFFFF" />
      <circle cx="113" cy="75" r="1.2" fill="#FFFFFF" opacity="0.75" />
    </g>
  </g>
</svg>`;
const catWalkSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cat-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EAA663" />
      <stop offset="50%" stop-color="#D08842" />
      <stop offset="100%" stop-color="#A85F28" />
    </linearGradient>
    <linearGradient id="cat-fur-dark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8C461A" />
      <stop offset="100%" stop-color="#602E0E" />
    </linearGradient>
    <linearGradient id="cat-stripes" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4E240F" />
      <stop offset="100%" stop-color="#341507" />
    </linearGradient>
    <linearGradient id="cat-cream" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF9" />
      <stop offset="50%" stop-color="#FFF5E6" />
      <stop offset="100%" stop-color="#FDE8CE" />
    </linearGradient>
    <linearGradient id="cat-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFBEB8" />
      <stop offset="100%" stop-color="#FFAAA3" />
    </linearGradient>
    <linearGradient id="cat-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1F0D05" />
      <stop offset="45%" stop-color="#3D1A0A" />
      <stop offset="85%" stop-color="#7A3912" />
      <stop offset="100%" stop-color="#A4551E" />
    </linearGradient>
    <linearGradient id="cushion-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="170" rx="56" ry="6.5" fill="#28140B" opacity="0.22" class="pet-shadow" />
  <circle class="pet-pupil" data-anchor-x="42" data-anchor-y="78" cx="42" cy="78" r="4" fill="#000000" />
</svg>`;
const catWalkFrames = [catWalk1SVG, catWalk2SVG, catWalk3SVG, catWalk4SVG];
const catSleepSVG = `<svg id="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cat-fur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EAA663" />
      <stop offset="50%" stop-color="#D08842" />
      <stop offset="100%" stop-color="#A85F28" />
    </linearGradient>
    <linearGradient id="cat-fur-dark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8C461A" />
      <stop offset="100%" stop-color="#602E0E" />
    </linearGradient>
    <linearGradient id="cat-stripes" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4E240F" />
      <stop offset="100%" stop-color="#341507" />
    </linearGradient>
    <linearGradient id="cat-cream" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF9" />
      <stop offset="50%" stop-color="#FFF5E6" />
      <stop offset="100%" stop-color="#FDE8CE" />
    </linearGradient>
    <linearGradient id="cat-ear-inner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFBEB8" />
      <stop offset="100%" stop-color="#FFAAA3" />
    </linearGradient>
    <linearGradient id="cat-eye-iris" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1F0D05" />
      <stop offset="45%" stop-color="#3D1A0A" />
      <stop offset="85%" stop-color="#7A3912" />
      <stop offset="100%" stop-color="#A4551E" />
    </linearGradient>
    <linearGradient id="cushion-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="176" rx="68" ry="10" fill="#1E293B" opacity="0.25" />
  <circle cx="36" cy="152" r="5" fill="#60A5FA" stroke="#1D4ED8" stroke-width="1.5" />
  <circle cx="164" cy="152" r="5" fill="#60A5FA" stroke="#1D4ED8" stroke-width="1.5" />
  <path d="M 36,152 Q 100,136 164,152 Q 148,174 100,176 Q 52,174 36,152 Z" fill="url(#cushion-grad)" stroke="#1E3A8A" stroke-width="2.2" />
  <path d="M 44,152 Q 100,140 156,152" stroke="#93C5FD" stroke-width="2" fill="none" opacity="0.6" />

  <g class="anim-breath" style="transform-origin: 100px 148px;">
    <path d="M 140,130 C 152,143 128,161 96,161 C 72,161 56,148 60,136" stroke="url(#cat-fur)" stroke-width="15" fill="none" stroke-linecap="round" />
    <path d="M 128,146 C 118,153 100,155 92,155" stroke="url(#cat-stripes)" stroke-width="3.8" stroke-linecap="round" fill="none" />

    <ellipse cx="102" cy="126" rx="44" ry="32" fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" />
    <path d="M 112,102 Q 115,114 110,122" stroke="url(#cat-stripes)" stroke-width="3.8" stroke-linecap="round" fill="none" />
    <path d="M 126,108 Q 128,118 123,127" stroke="url(#cat-stripes)" stroke-width="3.8" stroke-linecap="round" fill="none" />

    <g class="pet-head" style="transform-origin: 74px 122px;">
      <circle cx="74" cy="122" r="25" fill="url(#cat-fur)" stroke="#34180C" stroke-width="2.2" />
      <path d="M 64,103 L 52,86 C 63,88 74,97 72,106 Z" fill="url(#cat-fur)" stroke="#34180C" stroke-width="2" />
      <path d="M 62,100 L 55,90 C 62,92 68,98 66,103 Z" fill="#FFAAA3" />

      <path d="M 82,104 L 80,113" stroke="url(#cat-stripes)" stroke-width="2.8" stroke-linecap="round" />
      <path d="M 88,108 L 86,117" stroke="url(#cat-stripes)" stroke-width="2.8" stroke-linecap="round" />

      <path d="M 63,120 Q 68,115 73,120" stroke="#34180C" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <path d="M 78,120 Q 83,115 88,120" stroke="#34180C" stroke-width="2.5" stroke-linecap="round" fill="none" />

      <polygon points="76,126 79,126 77.5,128" fill="#FF8585" />
      <path d="M 74,130 Q 77.5,132 81,130" stroke="#34180C" stroke-width="1.5" fill="none" stroke-linecap="round" />
      <ellipse cx="64" cy="128" rx="5" ry="2.8" fill="#FF7675" opacity="0.5" />
    </g>
  </g>
</svg>`;
const catSitSVG = catIdleSVG;
const catSitBlinkSVG = catIdleSVG;
const catLaySVG = catSleepSVG;
const catLayBreatheSVG = catSleepSVG;
const catStretchSVG = catWalk1SVG;

function getCatPartsForState(state) {
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
    body: scope["cat" + name + "SVG"] || (name === "Idle" || name === "Sit" || name === "SitBlink" ? catIdleSVG : name === "Sleep" || name === "Lay" || name === "LayBreathe" ? catSleepSVG : catWalk1SVG),
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
    getCatPartsForState
  };
}