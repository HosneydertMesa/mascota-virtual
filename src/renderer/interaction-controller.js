/* ============================================================
   INTERACTION CONTROLLER MODULE
   Handles window drag & drop, mouse passthrough, and double clicks.
   ============================================================ */

class InteractionController {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('pet-container');
    this.hoveredElements = new Set();
    this.isDragging = false;
    this.dragCandidate = null;
    this.dragThresholdPx = 4;
  }

  init() {
    this.setupPassthrough();
    this.setupDrag();
  }

  setupPassthrough() {
    const interactives = document.querySelectorAll('.interactive');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.hoveredElements.add(el);
        this.updateMousePassthrough();
      });
      el.addEventListener('mouseleave', () => {
        this.hoveredElements.delete(el);
        setTimeout(() => this.updateMousePassthrough(), 0);
      });
    });
  }

  updateMousePassthrough() {
    if (typeof window === 'undefined' || !window.api) return;
    const shouldIgnore = !this.isDragging && this.hoveredElements.size === 0;
    window.api.setIgnoreMouseEvents(shouldIgnore, shouldIgnore ? { forward: true } : undefined);
  }

  setupDrag() {
    if (!this.container) return;

    this.container.addEventListener('mousedown', (e) => {
      if (e.button !== 0 || e.target.closest('#settings-btn, #quick-chat-btn, #pet-pomodoro-badge')) return;
      this.dragCandidate = { x: e.screenX, y: e.screenY };
      this.container.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (this.dragCandidate && !this.isDragging) {
        const dx = e.screenX - this.dragCandidate.x;
        const dy = e.screenY - this.dragCandidate.y;
        if (Math.hypot(dx, dy) >= this.dragThresholdPx) {
          this.isDragging = true;
          document.body.classList.add('drag-mode');
          document.body.classList.remove('bar-mode');
          if (window.api?.dragStart) window.api.dragStart();
        }
      }
      if (this.isDragging) {
        if (window.api?.dragMove) window.api.dragMove();
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        if (window.api?.dragEnd) window.api.dragEnd();
      }
      this.dragCandidate = null;
      if (this.container) this.container.style.cursor = 'grab';
      this.updateMousePassthrough();
    });

    this.container.addEventListener('dblclick', (e) => {
      if (e.target.closest('#settings-btn, #quick-chat-btn, #pet-pomodoro-badge')) return;
      if (window.api?.openDashboard) window.api.openDashboard('chat');
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { InteractionController };
}
if (typeof window !== 'undefined') {
  window.InteractionController = InteractionController;
}
