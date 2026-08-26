'use strict';

/**
 * Pet mood labels — mapeo estado -> emoji + texto (con género según mascota).
 *
 * Compartido entre el dashboard (browser) y los tests (Node). UMD-lite:
 * - En Node: module.exports
 * - En browser: window.PetMoodLabels
 *
 * Los 5 estados deben coincidir con los que devuelve PetMood.deriveState()
 * (ver src/core/pet-mood.js). Si agregás un estado nuevo, agregá su label acá.
 */

const MOOD_LABELS = {
  cat: {
    happy:  { emoji: '😺', text: 'Contenta' },
    calm:   { emoji: '😌', text: 'Calmada' },
    sleepy: { emoji: '😴', text: 'Adormilada' },
    sad:    { emoji: '😿', text: 'Triste' },
    bored:  { emoji: '😐', text: 'Aburrida' }
  },
  dog: {
    happy:  { emoji: '🐶', text: 'Contento' },
    calm:   { emoji: '😌', text: 'Calmado' },
    sleepy: { emoji: '😴', text: 'Adormilado' },
    sad:    { emoji: '🥺', text: 'Triste' },
    bored:  { emoji: '😐', text: 'Aburrido' }
  }
};

const MOOD_STATS = ['energy', 'happiness', 'curiosity', 'hunger'];

/**
 * Devuelve el {emoji, text} para un petType + estado. Fallback a 'calm'
 * si el estado o el petType son desconocidos.
 */
function getMoodLabel(petType, state) {
  const labels = MOOD_LABELS[petType] || MOOD_LABELS.cat;
  return labels[state] || labels.calm;
}

const PetMoodLabels = { MOOD_LABELS, MOOD_STATS, getMoodLabel };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PetMoodLabels;
} else if (typeof window !== 'undefined') {
  window.PetMoodLabels = PetMoodLabels;
}
