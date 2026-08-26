/* ============================================================
   EYE TRACKER MODULE — Micro-presence & Cursor Following
   Calculates smooth pupil displacement within iris boundaries.
   ============================================================ */

const PUPIL_MAX_RADIUS = 3.8;

class EyeTracker {
  constructor() {
    this.pupils = [];
    this.isNightTime = false;
  }

  init() {
    this.updateNightMode();
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    setInterval(() => this.updateNightMode(), 60 * 60 * 1000);
  }

  setPupils(pupilElements) {
    this.pupils = Array.from(pupilElements || []);
    this.resetPupilsToAnchor();
  }

  updateNightMode() {
    const h = new Date().getHours();
    this.isNightTime = h >= 20 || h < 7;
    document.body.classList.toggle('pupils-dilated', this.isNightTime);
    this.resetPupilsToAnchor();
  }

  resetPupilsToAnchor() {
    const r = this.isNightTime ? 3.2 : 2.0;
    this.pupils.forEach(pupil => {
      const anchorX = parseFloat(pupil.getAttribute('data-anchor-x') || pupil.getAttribute('cx') || '0');
      const anchorY = parseFloat(pupil.getAttribute('data-anchor-y') || pupil.getAttribute('cy') || '0');
      pupil.setAttribute('r', String(r));
      pupil.setAttribute('cx', String(anchorX));
      pupil.setAttribute('cy', String(anchorY));
    });
  }

  handleMouseMove(event) {
    if (this.pupils.length === 0) return;
    const wrapper = document.getElementById('pet-svg-wrapper');
    if (!wrapper) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    if (wrapperRect.width === 0 || wrapperRect.height === 0) return;

    const scaleX = 200 / wrapperRect.width;
    const scaleY = 200 / wrapperRect.height;
    const cursorSvgX = (event.clientX - wrapperRect.left) * scaleX;
    const cursorSvgY = (event.clientY - wrapperRect.top) * scaleY;

    this.pupils.forEach(pupil => {
      const anchorX = parseFloat(pupil.getAttribute('data-anchor-x') || pupil.getAttribute('cx') || '0');
      const anchorY = parseFloat(pupil.getAttribute('data-anchor-y') || pupil.getAttribute('cy') || '0');
      const dx = cursorSvgX - anchorX;
      const dy = cursorSvgY - anchorY;
      const dist = Math.hypot(dx, dy);

      if (dist <= PUPIL_MAX_RADIUS || dist === 0) {
        pupil.setAttribute('cx', String(anchorX));
        pupil.setAttribute('cy', String(anchorY));
      } else {
        const factor = PUPIL_MAX_RADIUS / dist;
        pupil.setAttribute('cx', String((anchorX + dx * factor).toFixed(2)));
        pupil.setAttribute('cy', String((anchorY + dy * factor).toFixed(2)));
      }
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EyeTracker, PUPIL_MAX_RADIUS };
}
if (typeof window !== 'undefined') {
  window.EyeTracker = EyeTracker;
  window.eyeTracker = new EyeTracker();
}
