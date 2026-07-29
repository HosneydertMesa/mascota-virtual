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

  // === v2.3.0 M2 — Bone hierarchy + animations ===
  // Pivot points in SVG viewBox coords (0-200).
  //   head: rotates around the neck (100, 110) — visible but subtle.
  //   tail: rotates around its base (130, 130) — natural swing.
  const PIVOT_HEAD = { x: 100, y: 110 };
  const PIVOT_TAIL = { x: 130, y: 130 };
  const HEAD_FOLLOW_DISTANCE_PX = 250;
  const HEAD_ROTATION_RANGE_DEG = 15;
  const TAIL_LERP_FACTOR = 0.05;  // ~20 frames to converge (333ms @ 60fps)

  let mouseX = 0;
  let mouseY = 0;
  let tailTime = 0;                       // seconds
  let tailWagSpeedTarget = 0.04;          // rad/s
  let tailWagAmplitudeTarget = 12;        // degrees
  let tailWagSpeedCurrent = 0.04;         // lerped toward target
  let tailWagAmplitudeCurrent = 12;
  // Container refs (re-assigned on every display-tree rebuild).
  let headContainer = null;
  let tailContainer = null;

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
    headContainer = null;
    tailContainer = null;

    async function loadPartSprite(svg) {
      if (!svg) return null;
      try {
        const tex = await loadSvgTexture(svg);
        return new PIXI.Sprite(tex);
      } catch (err) {
        console.warn('[pet-pixi] failed part:', err.message);
        return null;
      }
    }

    // Tail container (animated — rotates around the tail base).
    const tailSprite = await loadPartSprite(parts.tail);
    if (tailSprite) {
      tailContainer = new PIXI.Container();
      tailContainer.pivot.set(PIVOT_TAIL.x, PIVOT_TAIL.y);
      tailContainer.addChild(tailSprite);
      displayTree.addChild(tailContainer);
    }

    // Legs (static — their per-frame pose is baked into the walk cycle).
    for (const legName of ['backLegLeft', 'backLegRight', 'frontLegLeft', 'frontLegRight']) {
      const sprite = await loadPartSprite(parts[legName]);
      if (sprite) displayTree.addChild(sprite);
    }

    // Body (static for M2 — M4 will add breathing via container scale).
    const bodySprite = await loadPartSprite(parts.body);
    if (bodySprite) displayTree.addChild(bodySprite);

    // Head container (animated — rotates around the neck for look-at-cursor).
    const headSprite = await loadPartSprite(parts.head);
    if (headSprite) {
      headContainer = new PIXI.Container();
      headContainer.pivot.set(PIVOT_HEAD.x, PIVOT_HEAD.y);
      headContainer.addChild(headSprite);
      displayTree.addChild(headContainer);
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
    let lastTickerTime = performance.now();
    app.ticker.add(() => {
      const now = performance.now();
      const deltaSeconds = Math.min((now - lastTickerTime) / 1000, 0.1);
      lastTickerTime = now;

      // v2.3.0 M2 — head turn + tail wag every frame (smooth at 60fps).
      updateHeadRotation();
      updateTailWag(deltaSeconds);

      // Walk/sit/lay frame cycling — only when finite rate.
      const rate = PET_FRAME_RATES[currentState];
      if (!Number.isFinite(rate)) return;
      if (now - lastFrameSwapTime < rate) return;
      const frames = getFrames(currentPetType, currentState);
      if (!frames || frames.length <= 1) return;
      frameIndex = (frameIndex + 1) % frames.length;
      rebuildDisplayTree();
      lastFrameSwapTime = now;
    });
  }

  // === v2.3.0 M2 — animation update functions ===

  function updateHeadRotation() {
    if (!headContainer || !app || !app.canvas) return;
    const rect = app.canvas.getBoundingClientRect();
    const petCenterX = rect.left + rect.width / 2;
    const petCenterY = rect.top + rect.height / 2;
    const dx = mouseX - petCenterX;
    const dy = mouseY - petCenterY;
    const distance = Math.hypot(dx, dy);
    if (distance > HEAD_FOLLOW_DISTANCE_PX) {
      // Cursor far: head returns to neutral.
      headContainer.rotation = 0;
      return;
    }
    // Head "front" in profile (cat looks left) is (-1, 0) in screen coords.
    // For head to point at cursor: rot = atan2(dy, -dx), capped to ±15°.
    const rawDeg = Math.atan2(dy, -dx) * 180 / Math.PI;
    const rotDeg = Math.max(-HEAD_ROTATION_RANGE_DEG, Math.min(HEAD_ROTATION_RANGE_DEG, rawDeg));
    headContainer.rotation = rotDeg * Math.PI / 180;
  }

  function updateTailWag(deltaSeconds) {
    if (!tailContainer) return;
    // Lerp toward targets (smooth transitions, ~333ms to converge).
    tailWagSpeedCurrent += (tailWagSpeedTarget - tailWagSpeedCurrent) * TAIL_LERP_FACTOR;
    tailWagAmplitudeCurrent += (tailWagAmplitudeTarget - tailWagAmplitudeCurrent) * TAIL_LERP_FACTOR;
    tailTime += tailWagSpeedCurrent * deltaSeconds;
    // PIXI rotation is in radians; amplitude target is in degrees.
    tailContainer.rotation = Math.sin(tailTime) * tailWagAmplitudeCurrent * Math.PI / 180;
  }

  function setTailWagTargets(speed, amplitude) {
    if (typeof speed === 'number' && Number.isFinite(speed)) tailWagSpeedTarget = speed;
    if (typeof amplitude === 'number' && Number.isFinite(amplitude)) tailWagAmplitudeTarget = amplitude;
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
    // v2.3.0 M2 — track mouse for head turn.
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
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
    setTailWagTargets,   // v2.3.0 M2 — mood affecting tail wag (lerps internally)
    isReady: () => initialized
  };
})();
