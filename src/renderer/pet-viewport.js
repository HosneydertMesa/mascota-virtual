/* ============================================================
   PET VIEWPORT MODULE — Unified Vector & Canvas Viewport
   Manages pet state frames, transitions, cross-fades, and anims.
   ============================================================ */

const STATE_FRAME_RATE = {
  idle: Infinity,        // static SVG + CSS keyframes
  walking: 167,          // 6 fps (smooth 4-frame cycle)
  sleeping: Infinity,    // static SVG + CSS zzz particles
  sitting: 2500,         // 0.4 fps slow blink
  laying: 3000,          // 0.33 fps slow breathe
  stretching: Infinity   // static
};

const STATE_FADE_MS = 140;

class PetViewport {
  constructor(options = {}) {
    this.wrapper = options.wrapper || document.getElementById('pet-svg-wrapper');
    this.container = options.container || document.getElementById('pet-container');
    this.currentPet = options.currentPet || 'cat';
    this.currentState = 'idle';
    this.currentDirection = 'left';
    this.currentFrameIndex = 0;
    this.frameTimer = null;
    this.cachedPupils = [];
  }

  init(petType = 'cat') {
    this.currentPet = petType;
    document.body.dataset.pet = petType;
    this.setState('idle', null, true);
  }

  getFrames(petType, state) {
    const scope = typeof window !== 'undefined' ? window : {};
    const prefix = petType === 'cat' ? 'cat' : 'dog';
    
    if (state === 'walking') {
      const framesVar = scope[`${prefix}WalkFrames`];
      if (Array.isArray(framesVar) && framesVar.length > 0) return framesVar;
      return [scope[`${prefix}WalkSVG`]];
    }
    if (state === 'sleeping') return [scope[`${prefix}SleepSVG`]];
    if (state === 'sitting') return scope[`${prefix}SitFrames`] || [scope[`${prefix}SitSVG`]];
    if (state === 'laying') return scope[`${prefix}LayFrames`] || [scope[`${prefix}LaySVG`]];
    if (state === 'stretching') return [scope[`${prefix}StretchSVG`]];
    return [scope[`${prefix}IdleSVG`]];
  }

  setState(state, direction = null, force = false) {
    const stateChanged = this.currentState !== state;
    if (force || stateChanged) {
      this.currentState = state;
      this.currentFrameIndex = 0;
      this.renderFrame(stateChanged);
      this.startFrameLoop();
    }

    if (direction) {
      this.currentDirection = direction;
      if (this.container) {
        this.container.classList.toggle('flipped', direction === 'right');
      }
    }

    if (this.container) {
      this.container.classList.toggle('sleeping', state === 'sleeping');
      this.container.classList.toggle('walking-bob', state === 'walking');
      this.container.classList.toggle('sitting', state === 'sitting');
      this.container.classList.toggle('laying', state === 'laying');
      this.container.classList.toggle('stretching', state === 'stretching');
      this.container.classList.toggle('cat-walk', state === 'walking' && this.currentPet === 'cat');
      this.container.classList.toggle('dog-walk', state === 'walking' && this.currentPet === 'dog');
    }
  }

  setPetType(petType) {
    if (this.currentPet === petType) return;
    this.currentPet = petType;
    document.body.dataset.pet = petType;
    this.setState(this.currentState, this.currentDirection, true);
  }

  renderFrame(withFade = false) {
    if (!this.wrapper) return;
    const frames = this.getFrames(this.currentPet, this.currentState);
    if (!frames || frames.length === 0) return;

    const svg = frames[this.currentFrameIndex] || frames[0];
    if (!svg) return;

    if (withFade && this.wrapper.innerHTML) {
      this.wrapper.style.transition = `opacity ${STATE_FADE_MS}ms`;
      this.wrapper.style.opacity = '0';
      setTimeout(() => {
        this.wrapper.innerHTML = svg;
        this.cachePupilElements();
        this.wrapper.style.opacity = '1';
      }, STATE_FADE_MS);
    } else {
      this.wrapper.innerHTML = svg;
      this.cachePupilElements();
      this.wrapper.style.opacity = '1';
    }
  }

  startFrameLoop() {
    if (this.frameTimer) {
      clearInterval(this.frameTimer);
      this.frameTimer = null;
    }

    const rate = STATE_FRAME_RATE[this.currentState];
    if (!Number.isFinite(rate)) return;

    // v2.3.0 walk v2: during walking, the CSS animations (sideWalkSwing*,
    // catBodyWalk, dogBodyWalk, catTailWalk) drive ALL the motion. The
    // innerHTML swap every 167ms was TRUNCATING each CSS cycle to ~25%
    // of its full range (because the swap recreates the elements and
    // resets the animation). Result: visible swing range was only ~22deg
    // even though the keyframe defines 52deg. Now we keep the SVG frame
    // static during walk and let CSS handle the smooth motion. The 4
    // walk frames (catWalk1..4 / dogWalk1..4) differ only by 1-3px in
    // paw y-offset, which is barely visible compared to the CSS body bob.
    // Verified by test/preview/walk-v2-verify.py: without this fix the
    // observed swing was 22.6deg, with this fix it should be ~50deg.
    this.frameTimer = setInterval(() => {
      const frames = this.getFrames(this.currentPet, this.currentState);
      if (!frames || frames.length <= 1) return;
      if (this.currentState === 'walking') return;  // CSS handles motion
      this.currentFrameIndex = (this.currentFrameIndex + 1) % frames.length;
      this.renderFrame(false);
    }, rate);
  }

  cachePupilElements() {
    if (!this.wrapper) return;
    this.cachedPupils = Array.from(this.wrapper.querySelectorAll('.pet-pupil'));
    if (typeof window !== 'undefined' && window.eyeTracker) {
      window.eyeTracker.setPupils(this.cachedPupils);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PetViewport, STATE_FRAME_RATE };
}
if (typeof window !== 'undefined') {
  window.PetViewport = PetViewport;
}
