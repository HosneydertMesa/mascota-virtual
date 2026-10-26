/* ============================================================
   POMODORO UI MODULE — Mini badge controller for floating mascot
   ============================================================ */

class PomodoroUI {
  constructor(options = {}) {
    this.badgeEl = options.badgeEl || document.getElementById('pet-pomodoro-badge');
    this.timeEl = options.timeEl || document.getElementById('pet-pomodoro-time');
    this.iconEl = options.iconEl || document.getElementById('pet-pomodoro-icon');
  }

  init() {
    if (!this.badgeEl) return;
    this.badgeEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.api?.togglePomodoro) window.api.togglePomodoro();
    });
  }

  /**
   * Actualiza el badge con el estado del Pomodoro.
   *
   * Payload real (main.js:1283 broadcastPomodoroState):
   *   { status, mode, totalDurationSec, remainingSec,
   *     focusBlocksCompleted, lastBreakWasLong, eventKind }
   *
   * OJO: el payload NO trae `formattedTime` — hay que calcularlo desde
   * remainingSec. Y `mode` usa los valores 'focus' | 'break' | 'long_break'
   * (no 'longBreak').
   */
  update(state) {
    if (!state) return;

    if (this.timeEl && typeof state.remainingSec === 'number') {
      this.timeEl.textContent = formatClock(state.remainingSec);
    }

    if (this.iconEl) {
      if (state.mode === 'break') this.iconEl.textContent = '☕';
      else if (state.mode === 'long_break' || state.mode === 'longBreak') this.iconEl.textContent = '🌴';
      else this.iconEl.textContent = '🍅';
    }
  }
}

/** Segundos → "MM:SS" (mismo formato que el dashboard). */
function formatClock(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const rest = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${rest}`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PomodoroUI, formatClock };
}
if (typeof window !== 'undefined') {
  window.PomodoroUI = PomodoroUI;
  window.formatPomodoroClock = formatClock;
}
