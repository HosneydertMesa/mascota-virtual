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

  // PIXI.Texture.from() does NOT accept SVG strings. We need to convert
  // each part-SVG string → data URL → HTMLImageElement → Texture. We use
  // data URLs (not blob URLs) because the browser may revoke the blob URL
  // after PIXI's GPU upload is queued, causing texImage2D to fail with
  // INVALID_VALUE. Data URLs stay valid for the image's lifetime.
  //
  // We also set img.width/height explicitly to match the SVG viewBox
  // (200x200) — without this, the browser may rasterize the SVG at a
  // default 300x150 size, causing PIXI texture-size warnings.
  const textureCache = new Map();  // svg string → Promise<PIXI.Texture>

  function loadSvgTexture(svgString) {
    if (textureCache.has(svgString)) return textureCache.get(svgString);
    // base64-encode the SVG string for use as a data URL.
    // For UTF-8 safety: TextEncoder → bytes → base64.
    const bytes = new TextEncoder().encode(svgString);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const dataUrl = 'data:image/svg+xml;base64,' + btoa(binary);
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Force explicit dimensions so the texture is 200x200 (matches viewBox).
          img.width = 200;
          img.height = 200;
          const texture = PIXI.Texture.from(img);
          resolve(texture);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Image load failed for SVG part'));
      img.src = dataUrl;
    }).catch((err) => {
      textureCache.delete(svgString);
      throw err;
    });
    textureCache.set(svgString, promise);
    return promise;
  }

  async function rebuildDisplayTree() {
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

    const spritePromises = PART_RENDER_ORDER.map(async (partName) => {
      const svg = parts[partName];
      if (!svg) return;
      try {
        const texture = await loadSvgTexture(svg);
        const sprite = new PIXI.Sprite(texture);
        displayTree.addChild(sprite);
      } catch (err) {
        console.warn(`[pet-pixi] failed sprite for ${partName}:`, err.message);
      }
    });
    await Promise.all(spritePromises);
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
    // Await the initial display tree so the pet is visible by the time we log
    // "ready" (no flash of empty canvas).
    await rebuildDisplayTree();
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
