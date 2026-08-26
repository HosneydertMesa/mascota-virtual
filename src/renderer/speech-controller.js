/* ============================================================
   SPEECH CONTROLLER MODULE — Dialogue & Speech Bubble Manager
   Handles bubble visibility, typewriter/fade, and auto-dismiss.
   ============================================================ */

class SpeechController {
  constructor(options = {}) {
    this.bubbleEl = options.bubbleEl || document.getElementById('speech-bubble');
    this.textEl = options.textEl || document.getElementById('speech-text');
    this.dismissTimer = null;
  }

  show(message, durationMs = 4500) {
    if (!this.bubbleEl || !this.textEl) return;
    if (!message || typeof message !== 'string') return;

    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }

    this.textEl.textContent = message.trim();
    this.bubbleEl.classList.add('visible');

    if (durationMs > 0) {
      this.dismissTimer = setTimeout(() => {
        this.hide();
      }, durationMs);
    }
  }

  hide() {
    if (!this.bubbleEl) return;
    this.bubbleEl.classList.remove('visible');
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
  }

  isVisible() {
    return this.bubbleEl ? this.bubbleEl.classList.contains('visible') : false;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SpeechController };
}
if (typeof window !== 'undefined') {
  window.SpeechController = SpeechController;
}
