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

  update(state) {
    if (!state) return;
    if (this.timeEl && state.formattedTime) {
      this.timeEl.textContent = state.formattedTime;
    }
    if (this.iconEl) {
      if (state.mode === 'break') this.iconEl.textContent = '☕';
      else if (state.mode === 'longBreak') this.iconEl.textContent = '🌴';
      else this.iconEl.textContent = '🍅';
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PomodoroUI };
}
if (typeof window !== 'undefined') {
  window.PomodoroUI = PomodoroUI;
}
