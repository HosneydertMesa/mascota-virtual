'use strict';
// v2.3.0 M1 — Pet renderer with PIXI.js v8
// Replaces the SVG innerHTML swap with a PIXI display tree composed of
// 7 sprites per frame (head, body, tail, 4 legs). State machine: rebuild
// display tree on state change. Walk frame cycling via PIXI.Ticker.
//
// M1 does NOT include animations (tail wag, look-at-cursor, mood lerp) —
// those stay in renderer.js (CSS-driven, harmless when SVG is absent).
// M2 migrates them to PIXI transforms on the bone hierarchy.
//
// Wrapped in an IIFE so internal state doesn't collide with the existing
// renderer.js globals (currentFrameIndex, currentVisualState, etc.).

(function () {
  const PET_FRAME_RATES = {
    idle: Infinity,
    walking: 167,         // 6 fps
    sleeping: Infinity,
    sitting: 2500,        // 0.4 fps (slow blink)
    laying: 3000,         // 0.33 fps (slow breathe)
    stretching: Infinity
  };

  // Render order for stacking (back to front).
  const PART_RENDER_ORDER = [
    'tail', 'backLegLeft', 'backLegRight', 'frontLegLeft', 'frontLegRight',
    'body', 'head'
  ];

  let app = null;
  let currentPetType = 'cat';
  let currentState = 'idle';
  let frameIndex = 0;
  let lastFrameSwapTime = 0;
  let displayTree = null;
  let initialized = false;

  function getFrames(petType, state) {
    const helper = petType === 'cat'
      ? window.getCatPartsForState
      : window.getDogPartsForState;
    if (typeof helper !== 'function') return null;
    const frames = helper(state);
    return Array.isArray(frames) && frames.length > 0 ? frames : null;
  }

  function getCurrentParts() {
    const frames = getFrames(currentPetType, currentState);
    if (!frames) return null;
    return frames[frameIndex] || frames[0] || null;
  }

  function rebuildDisplayTree() {
    if (!app) return;
    const parts = getCurrentParts();
    if (!parts) {
      console.warn('[pet-pixi] no parts for', currentPetType, currentState);
      return;
    }

    if (displayTree) {
      app.stage.removeChild(displayTree);
      displayTree.destroy({ children: true, texture: false });
    }
    displayTree = new PIXI.Container();
    for (const partName of PART_RENDER_ORDER) {
      const svg = parts[partName];
      if (!svg) continue;
      try {
        const sprite = PIXI.Sprite.from(svg);
        displayTree.addChild(sprite);
      } catch (err) {
        console.warn(`[pet-pixi] failed sprite for ${partName}:`, err.message);
      }
    }
    app.stage.addChild(displayTree);
  }

  function setState(newState) {
    if (!initialized) return;
    if (newState === currentState) return;
    currentState = newState;
    frameIndex = 0;
    lastFrameSwapTime = performance.now();
    rebuildDisplayTree();
  }

  function setPetType(newPet) {
    if (!initialized) return;
    if (newPet === currentPetType) return;
    currentPetType = newPet;
    rebuildDisplayTree();
  }

  function startFrameCycling() {
    if (!app || !app.ticker) return;
    app.ticker.add(() => {
      const rate = PET_FRAME_RATES[currentState];
      if (!Number.isFinite(rate)) return;
      const now = performance.now();
      if (now - lastFrameSwapTime < rate) return;
      const frames = getFrames(currentPetType, currentState);
      if (!frames || frames.length <= 1) return;
      frameIndex = (frameIndex + 1) % frames.length;
      rebuildDisplayTree();
      lastFrameSwapTime = now;
    });
  }

  async function init() {
    if (initialized) return true;
    const canvas = document.getElementById('pet-canvas');
    if (!canvas) {
      console.error('[pet-pixi] #pet-canvas not found in DOM');
      return false;
    }
    if (typeof PIXI === 'undefined') {
      console.error('[pet-pixi] PIXI global not loaded — check vendor/pixi.min.js');
      return false;
    }
    app = new PIXI.Application();
    try {
      await app.init({
        canvas,
        width: 200,
        height: 200,
        backgroundColor: 0x000000,
        backgroundAlpha: 0,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true
      });
    } catch (err) {
      console.error('[pet-pixi] PIXI init failed:', err);
      return false;
    }
    // Initial pet type from body dataset (set by renderer.js via applyPetTheme).
    currentPetType = document.body.dataset.pet || 'cat';
    rebuildDisplayTree();
    startFrameCycling();
    initialized = true;
    console.log('[pet-pixi] ready — pet=' + currentPetType + ' state=' + currentState);
    return true;
  }

  window.petPixiRenderer = {
    init,
    setState,
    setPetType,
    isReady: () => initialized
  };
})();
