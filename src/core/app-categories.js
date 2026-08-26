'use strict';

// v2.2.0 — App-aware mascota
// Mapea process name (lowercase) → category. Las reglas usan substrings
// case-insensitive para tolerar versiones (e.g., "Code" para VSCode,
// "chrome" para Chrome/Chromium/Edge Chromium).

const CATEGORY_RULES = Object.freeze([
  Object.freeze({
    category: 'code',
    patterns: Object.freeze(['code', 'webstorm', 'sublime', 'atom', 'vim', 'emacs', 'notepad++', 'intellij', 'pycharm', 'cursor', 'rider', 'clion', 'rubymine', 'phpstorm', 'android studio'])
  }),
  Object.freeze({
    category: 'creative',
    patterns: Object.freeze(['photoshop', 'figma', 'sketch', 'illustrator', 'indesign', 'gimp', 'affinity', 'blender', 'canva', 'procreate', 'dribbble', 'figma desktop'])
  }),
  Object.freeze({
    category: 'office',
    patterns: Object.freeze(['excel', 'sheet', 'word', 'doc', 'powerpoint', 'keynote', 'libreoffice', 'soffice', 'numbers', 'pages', 'quip', 'notion'])
  }),
  Object.freeze({
    category: 'browser',
    patterns: Object.freeze(['chrome', 'firefox', 'edge', 'brave', 'opera', 'safari', 'vivaldi', 'arc', 'chromium', 'msedge'])
  }),
  Object.freeze({
    category: 'social',
    patterns: Object.freeze(['slack', 'discord', 'telegram', 'whatsapp', 'teams', 'zoom', 'skype', 'signal', 'messenger', 'thunderbird', 'mailbird'])
  }),
  Object.freeze({
    category: 'game',
    patterns: Object.freeze(['steam', 'epicgames', 'minecraft', 'league', 'valorant', 'csgo', 'cs2', 'overwatch', 'roblox', 'gta', 'riot', 'epic games'])
  }),
  Object.freeze({
    category: 'system',
    patterns: Object.freeze(['explorer', 'finder', 'settings', 'taskmgr', 'task manager', 'control', 'systempreferences', 'dwm', 'logonui'])
  })
]);

// Map de category → emotion target. `null` = no cambiar emotion.
// (Mantenemos las emotions existentes en ALLOWED_EMOTIONS para no
// tocar el parser/protocol: happy | calm | sleepy | sad | excited)
const CATEGORY_MOODS = Object.freeze({
  code: 'calm',
  creative: 'excited',   // excited con tail-wag amplitude baja = "curioso"
  office: 'sleepy',
  browser: 'excited',
  social: 'happy',
  game: 'excited',
  system: 'calm',
  unknown: null          // app no categorizada = no cambiar nada
});

// Map de category → tail wag targets (compatible con M4 mood lerp).
// speed y amplitude son los valores target que el renderer aplica
// al lerp en cada frame.
const CATEGORY_WAG_TARGETS = Object.freeze({
  code:     { speed: 0.04, amplitude: 0.8 },
  creative: { speed: 0.06, amplitude: 1.0 },
  office:   { speed: 0.02, amplitude: 0.5 },
  browser:  { speed: 0.10, amplitude: 1.3 },
  social:   { speed: 0.08, amplitude: 1.2 },
  game:     { speed: 0.12, amplitude: 1.5 },
  system:   { speed: 0.04, amplitude: 0.8 },
  unknown:  null
});

function categorize(processName) {
  if (!processName) return 'unknown';
  const lower = String(processName).toLowerCase();
  for (const rule of CATEGORY_RULES) {
    for (const pattern of rule.patterns) {
      if (lower.includes(pattern)) return rule.category;
    }
  }
  return 'unknown';
}

function getMoodForCategory(category) {
  return CATEGORY_MOODS[category] || null;
}

function getWagTargetsForCategory(category) {
  return CATEGORY_WAG_TARGETS[category] || null;
}

module.exports = {
  categorize,
  getMoodForCategory,
  getWagTargetsForCategory,
  CATEGORY_RULES,
  CATEGORY_MOODS,
  CATEGORY_WAG_TARGETS
};
