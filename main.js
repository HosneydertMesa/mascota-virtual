'use strict';

const { app, BrowserWindow, globalShortcut, ipcMain, powerMonitor, safeStorage, screen } = require('electron');
const fs = require('fs');
const path = require('path');
const { getQuickTip, sendMessageToMiniMax } = require('./src/services/ai');
const { createPowerMonitor } = require('./src/services/power-monitor');
const { createIdleMonitor } = require('./src/services/idle-monitor');
const { registerGlobalShortcuts } = require('./src/core/global-shortcuts');
const { executeBehavior, buildMainDeps } = require('./src/core/pet-behavior');
const { loadPetName, savePetName } = require('./src/services/pet-name-store');
const { validatePetName, getPetName } = require('./src/core/pet-micro-presence');
const { loadMood, saveMood } = require('./src/services/mood-store');
const { startMoodTick } = require('./src/services/mood-tick');
const { applyInteraction, buildMoodContext } = require('./src/core/pet-mood');
const {
  loadMemories,
  saveMemories,
  addMemory,
  removeMemory: removeMemoryFromStore,
  clearAllMemories,
  setRedactPII
} = require('./src/services/memories-store');
const { rankByRelevance, formatMemoriesForPrompt } = require('./src/core/pet-memories');
const { extractMemoryFromMessage } = require('./src/services/memory-extractor');
// Track B — I2 + W3 (quick capture + weekly report)
const {
  loadCaptures,
  saveCaptures,
  appendCapture,
  getRecentCaptures,
  clearCaptures: clearAllCaptures
} = require('./src/services/quick-capture-store');
const {
  buildWeeklyReport,
  formatReportAsMarkdown
} = require('./src/core/weekly-report');
const {
  clamp,
  getPetProfile,
  normalizeEmotion,
  normalizeIntent,
  normalizePetAction,
  normalizePetSound,
  normalizePetType,
  stepMotion
} = require('./src/core/pet-motion');

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const WINDOW_SIZE = Object.freeze({ width: 320, height: 250 });
const DASHBOARD_SIZE = Object.freeze({ width: 480, height: 650 });
const PET_VISIBLE_SIZE = Object.freeze({ width: 130, height: 130 });
const MARGIN_SAFETY = 12;
const BOTTOM_SAFETY = 45;
const CURSOR_INTERACTION_DISTANCE = 165;
const CURSOR_STANDOFF_DISTANCE = 115;
const PET_OFFSETS = Object.freeze({
  left: WINDOW_SIZE.width - PET_VISIBLE_SIZE.width,
  top: WINDOW_SIZE.height - PET_VISIBLE_SIZE.height
});

let petWindow = null;
let dashboardWindow = null;
let isDragging = false;
let isSleeping = false;
let isQuitting = false;
let activePetType = 'cat';
let aiState = 'IDLE';
let currentX = 0;
let currentMood = null;
let moodTickHandle = null;
let memoriesStore = null;
let currentTargetX = 0;
let velocityX = 0;
let lastMotionTime = 0;
let lastPositionSent = Number.NaN;
let lastMoveState = { state: null, direction: null };
let dragStartPos = { x: 0, y: 0 };
let dragStartMousePos = { x: 0, y: 0 };
let globalShortcutsHandle = null;

const timers = {
  movement: null,
  fall: null,
  wander: null,
  autonomous: null,
  restart: null
};

function getLogPath() {
  try {
    if (app.isReady()) return path.join(app.getPath('userData'), 'mascota-debug.log');
  } catch (_error) {
    // App may not be ready during an early process failure.
  }
  return path.join(__dirname, 'debug.log');
}

function serializeError(error) {
  if (error instanceof Error) return `${error.name}: ${error.message}\n${error.stack || ''}`;
  return String(error);
}

function logDebug(message) {
  try {
    fs.appendFileSync(getLogPath(), `[${new Date().toISOString()}] ${message}\n`, 'utf8');
  } catch (error) {
    console.error('Logger error:', error);
  }
}

function safeSend(win, channel, payload) {
  if (!win || win.isDestroyed() || win.webContents.isDestroyed()) return false;
  try {
    win.webContents.send(channel, payload);
    return true;
  } catch (error) {
    logDebug(`IPC SEND ERROR ${channel}: ${serializeError(error)}`);
    return false;
  }
}

function clearTimer(name) {
  if (!timers[name]) return;
  if (name === 'wander' || name === 'autonomous') clearInterval(timers[name]);
  else clearTimeout(timers[name]);
  timers[name] = null;
}

function clearAllTimers() {
  Object.keys(timers).forEach(clearTimer);
}

// Punto único de cambio para `isSleeping`. Lo usan el IPC `set-sleeping`
// (renderer→main) y el powerMonitor (OS→main). Centralizar evita que dos
// fuentes compitan por el estado.
function setSleepingState(value, source = 'unknown') {
  isSleeping = Boolean(value);
  if (isSleeping) stopMovement({ notify: false });
  logDebug(`SLEEP STATE: isSleeping=${isSleeping} (source=${source})`);
}

function notifyPetSystemEvent(payload) {
  safeSend(petWindow, 'pet-system-event', payload);
}

function isPetSender(event) {
  return Boolean(petWindow && !petWindow.isDestroyed() && event.sender === petWindow.webContents);
}

function isDashboardSender(event) {
  return Boolean(dashboardWindow && !dashboardWindow.isDestroyed() && event.sender === dashboardWindow.webContents);
}

function isKnownSender(event) {
  return isPetSender(event) || isDashboardSender(event);
}

function getSecureSettingsPath() {
  return path.join(app.getPath('userData'), 'secure-settings.json');
}

function readEncryptedApiKey() {
  const settingsPath = getSecureSettingsPath();
  if (!fs.existsSync(settingsPath)) return '';
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('El almacenamiento seguro del sistema no está disponible.');
  }

  const stored = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  if (!stored?.apiKey || typeof stored.apiKey !== 'string') return '';
  return safeStorage.decryptString(Buffer.from(stored.apiKey, 'base64'));
}

function writeEncryptedApiKey(apiKey) {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('El almacenamiento seguro del sistema no está disponible.');
  }
  const encrypted = safeStorage.encryptString(apiKey);
  fs.writeFileSync(
    getSecureSettingsPath(),
    JSON.stringify({ version: 1, apiKey: encrypted.toString('base64') }),
    { encoding: 'utf8', mode: 0o600 }
  );
}

function clearEncryptedApiKey() {
  const settingsPath = getSecureSettingsPath();
  if (fs.existsSync(settingsPath)) fs.rmSync(settingsPath);
}

function constrainPositionToScreen(x, y, targetDisplay = null) {
  const display = targetDisplay || screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const area = display.workArea;
  return {
    x: clamp(x, area.x + MARGIN_SAFETY, area.x + area.width - MARGIN_SAFETY - WINDOW_SIZE.width),
    y: clamp(y, area.y + MARGIN_SAFETY, area.y + area.height - BOTTOM_SAFETY - WINDOW_SIZE.height)
  };
}

function sendMoveState(state, direction = null) {
  if (lastMoveState.state === state && lastMoveState.direction === direction) return;
  lastMoveState = { state, direction };
  safeSend(petWindow, 'pet-move-state', { state, direction });
}

function sendPetPosition(force = false) {
  if (!force && Number.isFinite(lastPositionSent) && Math.abs(currentX - lastPositionSent) < 0.25) return;
  lastPositionSent = currentX;
  safeSend(petWindow, 'update-pet-position', { x: currentX, y: 0 });
}

function stopMovement({ notify = true, state = 'IDLE' } = {}) {
  clearTimer('movement');
  velocityX = 0;
  lastMotionTime = 0;
  aiState = state;
  if (notify && !isSleeping) sendMoveState('idle');
}

function getCursorTrackingState() {
  if (!petWindow || petWindow.isDestroyed()) return { active: false, close: false, target: null };
  const cursor = screen.getCursorScreenPoint();
  const bounds = petWindow.getBounds();
  const withinFloorBand = cursor.y >= bounds.y - 120 && cursor.y <= bounds.y + bounds.height;
  const withinDisplay = cursor.x >= bounds.x && cursor.x <= bounds.x + bounds.width;
  if (!withinFloorBand || !withinDisplay) return { active: false, close: false, target: null };

  const absolutePetCenter = bounds.x + currentX + PET_VISIBLE_SIZE.width / 2;
  const cursorDelta = cursor.x - absolutePetCenter;
  if (Math.abs(cursorDelta) <= CURSOR_INTERACTION_DISTANCE) {
    return { active: true, close: true, target: currentX };
  }

  const targetCenter = cursor.x - Math.sign(cursorDelta) * CURSOR_STANDOFF_DISTANCE;
  const target = clamp(
    targetCenter - bounds.x - PET_VISIBLE_SIZE.width / 2,
    MARGIN_SAFETY,
    bounds.width - MARGIN_SAFETY - PET_VISIBLE_SIZE.width
  );
  return { active: true, close: false, target };
}

function scheduleMotionTick(delay = 16) {
  clearTimer('movement');
  timers.movement = setTimeout(tickMovement, delay);
}

function startMovement(targetX, state = 'WANDER') {
  if (!petWindow || petWindow.isDestroyed() || isDragging || timers.fall || isSleeping) return;
  const bounds = petWindow.getBounds();
  currentTargetX = clamp(
    targetX,
    MARGIN_SAFETY,
    bounds.width - MARGIN_SAFETY - PET_VISIBLE_SIZE.width
  );
  aiState = state;
  lastMotionTime = performance.now();
  const direction = currentTargetX >= currentX ? 'right' : 'left';
  sendMoveState('walking', direction);
  scheduleMotionTick(0);
}

function tickMovement() {
  timers.movement = null;
  if (!petWindow || petWindow.isDestroyed() || isDragging || timers.fall || isSleeping) {
    stopMovement({ notify: false });
    return;
  }

  try {
    const now = performance.now();
    const deltaSeconds = lastMotionTime ? (now - lastMotionTime) / 1000 : 0.016;
    lastMotionTime = now;
    const bounds = petWindow.getBounds();
    const minX = MARGIN_SAFETY;
    const maxX = bounds.width - MARGIN_SAFETY - PET_VISIBLE_SIZE.width;

    if (aiState === 'CURIOUS' || aiState === 'PLAYING') {
      const cursorTracking = getCursorTrackingState();
      if (!cursorTracking.active) {
        stopMovement();
        scheduleRandomMovement(3000);
        return;
      }
      if (cursorTracking.close) {
        stopMovement();
        return;
      }
      currentTargetX = cursorTracking.target;
    }

    const profile = getPetProfile(activePetType);
    const distance = currentTargetX - currentX;

    if (aiState === 'PLAYING' && Math.abs(distance) <= profile.arrivalRadius + 5) {
      sendMoveState('playing');
      velocityX = 0;
      scheduleMotionTick(80);
      return;
    }

    if (aiState === 'PLAYING') aiState = 'CURIOUS';
    const result = stepMotion({
      position: currentX,
      velocity: velocityX,
      target: currentTargetX,
      deltaSeconds,
      min: minX,
      max: maxX,
      profile
    });

    currentX = result.position;
    velocityX = result.velocity;
    if (Math.abs(distance) > 12) {
      sendMoveState('walking', distance > 0 ? 'right' : 'left');
    }
    sendPetPosition();

    if (result.arrived) {
      if (aiState === 'CURIOUS') {
        aiState = 'PLAYING';
        sendMoveState('playing');
        scheduleMotionTick(80);
      } else {
        stopMovement();
      }
      return;
    }

    scheduleMotionTick(16);
  } catch (error) {
    logDebug(`MOVEMENT ERROR: ${serializeError(error)}`);
    stopMovement();
  }
}

function chooseNewTarget(reason = 'WANDER') {
  if (!petWindow || petWindow.isDestroyed()) return;
  const bounds = petWindow.getBounds();
  const profile = getPetProfile(activePetType);
  const direction = Math.random() < 0.5 ? -1 : 1;
  const distance = profile.minWanderDistance
    + Math.random() * (profile.maxWanderDistance - profile.minWanderDistance);
  const target = clamp(
    currentX + direction * distance,
    MARGIN_SAFETY + 18,
    bounds.width - MARGIN_SAFETY - PET_VISIBLE_SIZE.width - 18
  );

  logDebug(`WALK TARGET: pet=${activePetType}, reason=${reason}, from=${currentX.toFixed(1)}, to=${target.toFixed(1)}`);
  startMovement(target, reason);
}

function startRandomMovementCycle() {
  clearTimer('restart');
  clearTimer('wander');
  timers.wander = setInterval(() => {
    if (isDragging || timers.fall || isSleeping || !petWindow || petWindow.isDestroyed()) return;

    const cursorTracking = getCursorTrackingState();
    if (cursorTracking.close) {
      if (aiState !== 'IDLE') stopMovement();
      return;
    }
    if (cursorTracking.active) {
      if (aiState !== 'CURIOUS' && aiState !== 'PLAYING') startMovement(cursorTracking.target, 'CURIOUS');
      else currentTargetX = cursorTracking.target;
      return;
    }

    if (aiState === 'CURIOUS' || aiState === 'PLAYING') {
      stopMovement();
      return;
    }

    if (aiState === 'IDLE' && Math.random() < getPetProfile(activePetType).wanderChance) {
      chooseNewTarget('WANDER');
    }
  }, 1200);
}

function scheduleRandomMovement(delay = 2500) {
  clearTimer('restart');
  timers.restart = setTimeout(startRandomMovementCycle, delay);
}

function startAutonomousCycle() {
  clearTimer('autonomous');
  timers.autonomous = setInterval(() => {
    if (isSleeping || isDragging || isDoNotDisturb || timers.fall || !petWindow || petWindow.isDestroyed()) return;
    if (Math.random() < 0.15) safeSend(petWindow, 'trigger-autonomous-tip');
  }, 270000);
}

function settleInBarMode(win, display, absolutePetLeft, bounce) {
  if (!win || win.isDestroyed()) return;
  const area = display.workArea;
  const floorY = area.y + area.height - BOTTOM_SAFETY - WINDOW_SIZE.height;
  currentX = clamp(
    absolutePetLeft - area.x,
    MARGIN_SAFETY,
    area.width - MARGIN_SAFETY - PET_VISIBLE_SIZE.width
  );
  velocityX = 0;
  aiState = 'IDLE';
  lastPositionSent = Number.NaN;

  win.setBounds({
    x: area.x,
    y: Math.round(floorY),
    width: area.width,
    height: WINDOW_SIZE.height
  });
  win.setIgnoreMouseEvents(true, { forward: true });
  safeSend(win, 'window-mode-bar', { petX: currentX, bounce: Boolean(bounce) });
  sendMoveState('idle');
  scheduleRandomMovement(1800);
}

function runGravityFall(win, startX, startY, targetDisplay) {
  clearTimer('fall');
  const area = targetDisplay.workArea;
  const targetFloorY = area.y + area.height - BOTTOM_SAFETY - WINDOW_SIZE.height;
  const absolutePetLeft = startX + PET_OFFSETS.left;
  let currentWindowY = startY;
  let fallVelocity = 0;
  let lastFallTime = performance.now();

  const tick = () => {
    timers.fall = null;
    if (isDragging || !win || win.isDestroyed()) return;

    const now = performance.now();
    const deltaSeconds = clamp((now - lastFallTime) / 1000, 0, 0.05);
    lastFallTime = now;
    fallVelocity += 2100 * deltaSeconds;
    currentWindowY += fallVelocity * deltaSeconds;

    if (currentWindowY >= targetFloorY) {
      currentWindowY = targetFloorY;
      if (Math.abs(fallVelocity) < 145) {
        settleInBarMode(win, targetDisplay, absolutePetLeft, true);
        return;
      }
      fallVelocity = -fallVelocity * 0.28;
    }

    win.setBounds({
      x: Math.round(startX),
      y: Math.round(currentWindowY),
      width: WINDOW_SIZE.width,
      height: WINDOW_SIZE.height
    });
    timers.fall = setTimeout(tick, 16);
  };

  timers.fall = setTimeout(tick, 0);
}

// T1 — refactor: executePetBehavior ahora delega al modulo puro
// src/core/pet-behavior.js. La logica de decision vive en el modulo
// (testeable sin Electron); main.js solo provee el contexto.
let mainDeps = null;
function initMainDeps() {
  mainDeps = buildMainDeps({
    screen,
    getPetWindow: () => petWindow,
    setIsSleeping: (value) => { isSleeping = Boolean(value); },
    getCurrentX: () => currentX,
    startMovement,
    stopMovement,
    chooseNewTarget,
    getCursorTrackingState,
    logDebug,
    constants: { MARGIN_SAFETY, PET_VISIBLE_SIZE }
  });
}

function executePetBehavior(sanitizedAction) {
  if (!mainDeps) {
    logDebug('WARN: executePetBehavior called before initMainDeps');
    return { did: 'noop' };
  }
  return executeBehavior(sanitizedAction, mainDeps);
}

function attachWindowDiagnostics(win, label) {
  win.on('unresponsive', () => logDebug(`${label} UNRESPONSIVE`));
  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    logDebug(`${label} LOAD FAILED: code=${errorCode}, description=${errorDescription}, url=${validatedURL}`);
  });
  win.webContents.on('console-message', (_event, detailsOrLevel, legacyMessage, legacyLine, legacySourceId) => {
    const isDetailsObject = detailsOrLevel && typeof detailsOrLevel === 'object';
    const message = isDetailsObject ? detailsOrLevel.message : legacyMessage;
    const level = isDetailsObject ? detailsOrLevel.level : detailsOrLevel;
    const line = isDetailsObject ? detailsOrLevel.lineNumber : legacyLine;
    const source = isDetailsObject ? detailsOrLevel.sourceId : legacySourceId;
    if (message) logDebug(`${label} CONSOLE ${level}: ${message} (${source || 'unknown'}:${line || 0})`);
  });
  win.webContents.on('render-process-gone', (_event, details) => {
    logDebug(`${label} RENDER GONE: reason=${details.reason}, exitCode=${details.exitCode}`);
  });
}

async function logPetRendererSnapshot() {
  if (!petWindow || petWindow.isDestroyed()) return;
  try {
    const snapshot = await petWindow.webContents.executeJavaScript(`JSON.stringify((() => {
      const pet = document.getElementById('pet-container');
      const wrapper = document.getElementById('pet-svg-wrapper');
      const petRect = pet?.getBoundingClientRect();
      return {
        bodyClass: document.body.className,
        petType: document.body.dataset.pet,
        petDisplay: pet ? getComputedStyle(pet).display : 'missing',
        petRect: petRect ? { x: petRect.x, y: petRect.y, width: petRect.width, height: petRect.height } : null,
        svgLength: wrapper?.innerHTML?.length || 0,
        quickButton: Boolean(document.getElementById('quick-chat-btn'))
      };
    })())`, true);
    logDebug(`PET DOM SNAPSHOT: ${snapshot}`);
  } catch (error) {
    logDebug(`PET DOM SNAPSHOT ERROR: ${serializeError(error)}`);
  }
}

function createPetWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const area = primaryDisplay.workArea;
  const floorY = area.y + area.height - BOTTOM_SAFETY - WINDOW_SIZE.height;
  currentX = area.width - PET_VISIBLE_SIZE.width - MARGIN_SAFETY;
  logDebug(`INIT WINDOW: x=${area.x}, y=${area.y}, w=${area.width}, h=${area.height}`);

  petWindow = new BrowserWindow({
    width: area.width,
    height: WINDOW_SIZE.height,
    x: area.x,
    y: Math.round(floorY),
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  attachWindowDiagnostics(petWindow, 'PET');
  petWindow.setIgnoreMouseEvents(true, { forward: true });
  petWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  petWindow.webContents.on('did-finish-load', () => {
    if (!petWindow || petWindow.isDestroyed()) return;
    petWindow.showInactive();
    safeSend(petWindow, 'window-mode-bar', { petX: currentX, bounce: false });
    sendMoveState('idle');
    scheduleRandomMovement(2500);
    startAutonomousCycle();
    setTimeout(logPetRendererSnapshot, 500);
  });

  petWindow.on('closed', () => {
    petWindow = null;
    clearAllTimers();
    if (dashboardWindow && !dashboardWindow.isDestroyed()) dashboardWindow.close();
  });
}

function createDashboardWindow(defaultTab = 'pomodoro') {
  const safeTab = ['pomodoro', 'chat', 'settings'].includes(defaultTab) ? defaultTab : 'pomodoro';
  if (dashboardWindow && !dashboardWindow.isDestroyed()) {
    dashboardWindow.focus();
    safeSend(dashboardWindow, 'switch-tab', safeTab);
    return;
  }

  let targetDisplay = screen.getPrimaryDisplay();
  if (petWindow && !petWindow.isDestroyed()) {
    const bounds = petWindow.getBounds();
    targetDisplay = screen.getDisplayNearestPoint({
      x: Math.round(bounds.x + currentX + PET_VISIBLE_SIZE.width / 2),
      y: Math.round(bounds.y + WINDOW_SIZE.height / 2)
    });
  }
  const area = targetDisplay.workArea;

  dashboardWindow = new BrowserWindow({
    width: DASHBOARD_SIZE.width,
    height: DASHBOARD_SIZE.height,
    x: Math.round(area.x + area.width - DASHBOARD_SIZE.width - 40),
    y: Math.round(area.y + area.height - DASHBOARD_SIZE.height - 50),
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  attachWindowDiagnostics(dashboardWindow, 'DASHBOARD');
  dashboardWindow.setAlwaysOnTop(true, 'pop-up-menu');
  dashboardWindow.loadFile(path.join(__dirname, 'src', 'dashboard.html'), { hash: safeTab });
  dashboardWindow.on('closed', () => {
    dashboardWindow = null;
    safeSend(petWindow, 'dashboard-closed');
  });
}

ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  if (!isPetSender(event) || !petWindow || petWindow.isDestroyed() || isDragging) return;
  const shouldIgnore = Boolean(ignore);
  petWindow.setIgnoreMouseEvents(
    shouldIgnore,
    shouldIgnore && options?.forward ? { forward: true } : undefined
  );
});

ipcMain.on('drag-start', event => {
  if (!isPetSender(event) || isDragging || !petWindow || petWindow.isDestroyed()) return;
  try {
    isDragging = true;
    clearTimer('restart');
    clearTimer('fall');
    stopMovement();

    const bounds = petWindow.getBounds();
    const absolutePetLeft = bounds.x + currentX;
    const absolutePetCenter = absolutePetLeft + PET_VISIBLE_SIZE.width / 2;
    const activeDisplay = screen.getDisplayNearestPoint({
      x: Math.round(absolutePetCenter),
      y: Math.round(bounds.y + WINDOW_SIZE.height / 2)
    });
    const cursor = screen.getCursorScreenPoint();
    dragStartPos = { x: absolutePetLeft - PET_OFFSETS.left, y: bounds.y };
    dragStartMousePos = { x: cursor.x, y: cursor.y };

    petWindow.setBounds({
      x: Math.round(dragStartPos.x),
      y: Math.round(dragStartPos.y),
      width: WINDOW_SIZE.width,
      height: WINDOW_SIZE.height
    });
    petWindow.setIgnoreMouseEvents(false);
    safeSend(petWindow, 'window-mode-drag', { displayId: activeDisplay.id });
  } catch (error) {
    isDragging = false;
    logDebug(`DRAG START ERROR: ${serializeError(error)}`);
  }
});

ipcMain.on('drag-move', event => {
  if (!isPetSender(event) || !isDragging || !petWindow || petWindow.isDestroyed()) return;
  try {
    const cursor = screen.getCursorScreenPoint();
    const targetDisplay = screen.getDisplayNearestPoint(cursor);
    const constrained = constrainPositionToScreen(
      dragStartPos.x + cursor.x - dragStartMousePos.x,
      dragStartPos.y + cursor.y - dragStartMousePos.y,
      targetDisplay
    );
    petWindow.setPosition(Math.round(constrained.x), Math.round(constrained.y));
  } catch (error) {
    logDebug(`DRAG MOVE ERROR: ${serializeError(error)}`);
  }
});

ipcMain.on('drag-end', event => {
  if (!isPetSender(event) || !isDragging || !petWindow || petWindow.isDestroyed()) return;
  try {
    isDragging = false;
    const bounds = petWindow.getBounds();
    const center = {
      x: bounds.x + WINDOW_SIZE.width / 2,
      y: bounds.y + WINDOW_SIZE.height / 2
    };
    const targetDisplay = screen.getDisplayNearestPoint(center);
    const area = targetDisplay.workArea;
    const floorY = area.y + area.height - BOTTOM_SAFETY - WINDOW_SIZE.height;
    const absolutePetLeft = bounds.x + PET_OFFSETS.left;

    if (bounds.y < floorY - 15) {
      runGravityFall(petWindow, bounds.x, bounds.y, targetDisplay);
    } else {
      settleInBarMode(petWindow, targetDisplay, absolutePetLeft, false);
    }
  } catch (error) {
    isDragging = false;
    logDebug(`DRAG END ERROR: ${serializeError(error)}`);
  }
});

ipcMain.on('open-dashboard', (event, tab) => {
  if (isPetSender(event)) createDashboardWindow(tab);
});

ipcMain.on('close-dashboard', event => {
  if (isDashboardSender(event) && dashboardWindow && !dashboardWindow.isDestroyed()) dashboardWindow.close();
});

ipcMain.on('sync-settings', (event, settings) => {
  if (!isKnownSender(event)) return;
  activePetType = normalizePetType(settings?.pet);
  const sanitized = { pet: activePetType, soundEnabled: settings?.soundEnabled !== false };
  if (isPetSender(event)) safeSend(dashboardWindow, 'settings-updated', sanitized);
  else safeSend(petWindow, 'settings-updated', sanitized);
});

ipcMain.on('trigger-pet-action', (event, action) => {
  if (!isKnownSender(event) || !action || action.type !== 'speak') return;
  const sanitized = {
    type: 'speak',
    text: String(action.text || '').slice(0, 1000),
    emotion: normalizeEmotion(action.emotion),
    action: normalizePetAction(action.action),
    sound: normalizePetSound(action.sound),
    intent: normalizeIntent(action.intent)
  };
  if (isDashboardSender(event)) safeSend(petWindow, 'pet-action', sanitized);
  executePetBehavior(sanitized);
});

ipcMain.on('set-sleeping', (event, sleeping) => {
  if (!isPetSender(event)) return;
  setSleepingState(Boolean(sleeping), 'renderer');
});

ipcMain.handle('ai:get-status', event => {
  if (!isKnownSender(event)) throw new Error('Solicitud no autorizada.');
  try {
    return { configured: Boolean(readEncryptedApiKey()) };
  } catch (error) {
    logDebug(`AI STATUS ERROR: ${serializeError(error)}`);
    return { configured: false, error: error.message };
  }
});

ipcMain.handle('ai:save-key', (event, apiKey) => {
  if (!isDashboardSender(event)) throw new Error('Solicitud no autorizada.');
  const normalized = typeof apiKey === 'string' ? apiKey.trim() : '';
  if (normalized.length < 12 || normalized.length > 512) throw new Error('La API Key no tiene un formato válido.');
  writeEncryptedApiKey(normalized);
  return { configured: true };
});

ipcMain.handle('ai:clear-key', event => {
  if (!isDashboardSender(event)) throw new Error('Solicitud no autorizada.');
  clearEncryptedApiKey();
  return { configured: false };
});

// Pet name (P7) — guardado en <userData>/pet-name.json
ipcMain.handle('pet-name:get', event => {
  if (!isKnownSender(event)) throw new Error('Solicitud no autorizada.');
  const stored = loadPetName(app.getPath('userData'));
  return { name: stored };
});

ipcMain.handle('pet-name:set', (event, candidate) => {
  if (!isDashboardSender(event)) throw new Error('Solicitud no autorizada.');
  const validated = validatePetName(candidate);
  if (!validated) throw new Error('Nombre inválido. Usá letras, números, espacios y los caracteres . _ - \'.');
  savePetName(app.getPath('userData'), validated);
  return { name: validated };
});

ipcMain.handle('ai:send-message', async (event, payload) => {
  if (!isKnownSender(event)) throw new Error('Solicitud no autorizada.');
  const apiKey = readEncryptedApiKey();
  const userMessage = typeof payload?.userMessage === 'string' ? payload.userMessage.trim() : '';
  if (!userMessage || userMessage.length > 4000) throw new Error('El mensaje está vacío o es demasiado largo.');
  const petType = normalizePetType(payload?.petType);
  const storedName = loadPetName(app.getPath('userData'));
  const petName = getPetName(storedName, petType);
  // A1 — mood system: aplicar interaction chat (boost happiness + curiosity)
  if (currentMood) {
    currentMood = applyInteraction(currentMood, 'chat');
    try { saveMood(app.getPath('userData'), currentMood); } catch (e) { logDebug('MOOD SAVE: ' + e.message); }
  }
  const moodContext = currentMood ? buildMoodContext(currentMood) : '';

  // P3 — recuerdos persistentes: rankear por relevance contra el mensaje actual
  // y pasar los top 5 al system prompt (si los hay).
  let memoriesContext = '';
  if (memoriesStore && Array.isArray(memoriesStore.memories) && memoriesStore.memories.length > 0) {
    const relevant = rankByRelevance(memoriesStore.memories, userMessage, 5);
    memoriesContext = formatMemoriesForPrompt(relevant);
  }

  const reply = await sendMessageToMiniMax(
    apiKey,
    petType,
    Array.isArray(payload?.history) ? payload.history : [],
    userMessage,
    petName,
    moodContext,
    memoriesContext
  );

  // P3 — extraer 0-1 recuerdos del mensaje del usuario (background, no bloquea el reply).
  // Si la IA devuelve un recuerdo, agregamos al store (con dedup + PII redaction).
  // Si falla (network, timeout, no hay memoria), silencioso.
  extractAndStoreMemory(apiKey, userMessage, Array.isArray(payload?.history) ? payload.history : []).catch(e => {
    logDebug('MEMORY EXTRACT ERROR: ' + e.message);
  });

  return reply;
});

/**
 * Extrae un recuerdo del mensaje del usuario y lo guarda si es nuevo.
 * Best-effort: cualquier falla (network, parser, no memorable) → silencioso.
 * No bloquea: corre en background.
 */
async function extractAndStoreMemory(apiKey, userMessage, history) {
  if (!memoriesStore) return;
  if (!apiKey) return;
  // recentContext: ultimos 1-2 mensajes para que el extractor entienda el contexto
  const recentContext = history
    .slice(-2)
    .map(m => `${m.role === 'user' ? 'Usuario' : 'Mascota'}: ${typeof m.content === 'string' ? m.content.slice(0, 200) : ''}`)
    .join('\n');
  const extracted = await extractMemoryFromMessage(apiKey, userMessage, recentContext);
  if (!extracted) return;
  const result = addMemory(app.getPath('userData'), memoriesStore, { text: extracted.text });
  if (result.added) {
    try { saveMemories(app.getPath('userData'), memoriesStore); }
    catch (e) { logDebug('MEMORY SAVE: ' + e.message); }
    logDebug('MEMORY ADDED', { id: result.memory.id, text: result.memory.text.slice(0, 50) });
  } else {
    logDebug('MEMORY SKIP', { reason: result.reason });
  }
}

// A1 — IPC para que el dashboard pueda ver el mood actual
ipcMain.handle('mood:get', event => {
  if (!isKnownSender(event)) throw new Error('Solicitud no autorizada.');
  return currentMood || null;
});

// P3 — IPC para que el dashboard gestione los recuerdos persistentes
ipcMain.handle('memories:list', event => {
  if (!isKnownSender(event)) throw new Error('Solicitud no autorizada.');
  return memoriesStore || null;
});

ipcMain.handle('memories:remove', (event, memoryId) => {
  if (!isDashboardSender(event)) throw new Error('Solicitud no autorizada.');
  if (!memoriesStore) return false;
  const removed = removeMemoryFromStore(memoriesStore, memoryId);
  if (removed) {
    try { saveMemories(app.getPath('userData'), memoriesStore); }
    catch (e) { logDebug('MEMORY REMOVE SAVE: ' + e.message); }
  }
  return removed;
});

ipcMain.handle('memories:clear', event => {
  if (!isDashboardSender(event)) throw new Error('Solicitud no autorizada.');
  if (!memoriesStore) return 0;
  const count = clearAllMemories(memoriesStore);
  try { saveMemories(app.getPath('userData'), memoriesStore); }
  catch (e) { logDebug('MEMORY CLEAR SAVE: ' + e.message); }
  return count;
});

ipcMain.handle('memories:set-redact', (event, enabled) => {
  if (!isDashboardSender(event)) throw new Error('Solicitud no autorizada.');
  if (!memoriesStore) return { changed: false, redactedCount: 0 };
  const result = setRedactPII(memoriesStore, enabled === true);
  try { saveMemories(app.getPath('userData'), memoriesStore); }
  catch (e) { logDebug('MEMORY REDACT SAVE: ' + e.message); }
  return result;
});

// A4 — IPC para que el dashboard setee el estado Do Not Disturb.
// Se activa cuando el usuario esta typing rapido (>= 80 WPM por 2+ min),
// se desactiva cuando baja (< 60 WPM por 30s).
ipcMain.handle('dnd:update', (event, isActive) => {
  if (!isDashboardSender(event)) throw new Error('Solicitud no autorizada.');
  const wasActive = isDoNotDisturb;
  isDoNotDisturb = Boolean(isActive);
  if (wasActive !== isDoNotDisturb) {
    logDebug(`DND: ${isDoNotDisturb ? 'ON' : 'OFF'}`);
  }
  return { isDoNotDisturb };
});

// === Track B — I2 (Quick Capture) + W3 (Weekly Report) ===

let capturesStore = null;
// pomodoro-store vive en el worktree de Track A. Dynamic require con try/catch
// para que este worktree no rompa al cargar (devuelve null si no existe). El
// merge final consolidara las dependencias. Para el reporte semanal usamos
// sessions de pomodoro-store si esta disponible; si no, [].
let pomodoroStoreModule = null;
try {
  pomodoroStoreModule = require('./src/services/pomodoro-store');
} catch (_e) {
  pomodoroStoreModule = null;
  logDebug('POMODORO STORE: no disponible en este worktree (Track A no mergeado), usando fallback');
}

ipcMain.handle('quick-capture:save', (event, text) => {
  if (!isKnownSender(event)) throw new Error('Solicitud no autorizada.');
  if (!capturesStore) return { added: false, capture: null, reason: 'store_uninitialized' };
  // El toggle global de PII viene del memoriesStore (mismo flag para todo).
  // Default ON si memoriesStore no esta disponible (defensivo).
  const redactPII = memoriesStore ? memoriesStore.redactPII === true : true;
  const result = appendCapture(app.getPath('userData'), capturesStore, text, { redactPII });
  if (result.added) {
    try { saveCaptures(app.getPath('userData'), capturesStore); }
    catch (e) { logDebug('CAPTURE SAVE: ' + e.message); }
  }
  return result;
});

ipcMain.handle('quick-capture:list', (event, limit) => {
  if (!isKnownSender(event)) throw new Error('Solicitud no autorizada.');
  if (!capturesStore) return [];
  return getRecentCaptures(app.getPath('userData'), capturesStore, typeof limit === 'number' ? limit : 50);
});

ipcMain.handle('quick-capture:clear', event => {
  if (!isDashboardSender(event)) throw new Error('Solicitud no autorizada.');
  if (!capturesStore) return 0;
  const count = clearAllCaptures(app.getPath('userData'), capturesStore);
  try { saveCaptures(app.getPath('userData'), capturesStore); }
  catch (e) { logDebug('CAPTURE CLEAR SAVE: ' + e.message); }
  return count;
});

ipcMain.handle('weekly-report:get', (event, opts) => {
  if (!isDashboardSender(event)) throw new Error('Solicitud no autorizada.');
  // 1. Cargar sesiones de pomodoro (si pomodoro-store esta disponible).
  let sessions = [];
  let longestStreak = 0;
  let currentStreak = 0;
  if (pomodoroStoreModule) {
    try {
      const sessionsStore = pomodoroStoreModule.loadSessions(app.getPath('userData'));
      sessions = Array.isArray(sessionsStore?.sessions) ? sessionsStore.sessions : [];
    } catch (e) {
      logDebug('POMODORO LOAD SESSIONS: ' + e.message);
      sessions = [];
    }
    try {
      const streak = pomodoroStoreModule.computeCurrentStreak(app.getPath('userData'), new Date());
      currentStreak = typeof streak === 'number' ? streak : 0;
      const longest = pomodoroStoreModule.computeLongestStreak(app.getPath('userData'));
      longestStreak = typeof longest === 'number' ? longest : 0;
    } catch (e) {
      logDebug('POMODORO STREAK: ' + e.message);
    }
  }
  // 2. Cargar capturas (si tenemos store).
  let captures = [];
  if (capturesStore) {
    captures = Array.isArray(capturesStore.captures) ? capturesStore.captures : [];
  }
  // 3. Opciones del usuario.
  const weekStart = opts && opts.weekStart === 'sunday' ? 'sunday' : 'monday';
  const today = opts && opts.today ? new Date(opts.today) : new Date();
  // 4. Build report + format markdown.
  const report = buildWeeklyReport({
    sessions,
    captures,
    streak: currentStreak,
    longestStreak,
    weekStart,
    today,
    petType: activePetType
  });
  const markdown = formatReportAsMarkdown(report);
  return { report, markdown };
});

ipcMain.handle('ai:quick-tip', async (event, payload) => {
  if (!isKnownSender(event)) throw new Error('Solicitud no autorizada.');
  let apiKey = '';
  try {
    apiKey = readEncryptedApiKey();
  } catch (error) {
    logDebug(`AI KEY READ ERROR: ${serializeError(error)}`);
  }
  const allowedContexts = new Set(['focus_start', 'break_start', 'work_tip']);
  const context = allowedContexts.has(payload?.context) ? payload.context : 'work_tip';
  return getQuickTip(apiKey, normalizePetType(payload?.petType), context);
});

process.on('uncaughtException', error => logDebug(`UNCAUGHT EXCEPTION: ${serializeError(error)}`));
process.on('unhandledRejection', reason => logDebug(`UNHANDLED REJECTION: ${serializeError(reason)}`));

// PowerMonitor (T3) y globalShortcut (T4) coexisten aquí. Cada uno se
// inicializa una vez (app.whenReady) y se libera en before-quit.
let powerMonitorHandle = null;

// A3 — idle monitor (sugiere breaks al usuario cuando lleva X min idle).
let idleMonitorHandle = null;

// A4 — Do Not Disturb (suprime autonomous tips cuando el usuario esta
// typing rapido). Se activa desde el dashboard via IPC `dnd:update`.
let isDoNotDisturb = false;

// T4 — globalShortcut handlers. Viven en main porque necesitan acceso a
// windows + IPC state. El modulo core/global-shortcuts solo se encarga del
// "register / unregister" con manejo de errores.

function handlePomodoroToggleShortcut() {
  if (dashboardWindow && !dashboardWindow.isDestroyed()) {
    safeSend(dashboardWindow, 'pomodoro-toggle');
    if (typeof dashboardWindow.focus === 'function') dashboardWindow.focus();
    return;
  }
  createDashboardWindow('pomodoro');
}

function handlePetSleepShortcut() {
  if (!petWindow || petWindow.isDestroyed()) return;
  isSleeping = true;
  stopMovement({ notify: false });
  safeSend(petWindow, 'pet-sleep');
}

function handleQuickCaptureShortcut() {
  if (!petWindow || petWindow.isDestroyed()) return;
  safeSend(petWindow, 'quick-capture-trigger');
}

app.whenReady().then(() => {
  createPetWindow();
  initMainDeps();
  // A1 — mood system: cargar mood desde disco + iniciar tick periodico
  try {
    currentMood = loadMood(app.getPath('userData'));
    logDebug('MOOD INIT', { energy: currentMood.energy, happiness: currentMood.happiness });
  } catch (error) {
    logDebug('MOOD INIT ERROR: ' + error.message);
    currentMood = null;
  }
  // P3 — recuerdos persistentes: cargar store desde disco
  try {
    memoriesStore = loadMemories(app.getPath('userData'));
    logDebug('MEMORIES INIT', { count: memoriesStore.memories.length, redactPII: memoriesStore.redactPII });
  } catch (error) {
    logDebug('MEMORIES INIT ERROR: ' + error.message);
    memoriesStore = { version: 1, redactPII: true, memories: [] };
  }
  // I2 — quick captures: cargar store desde disco
  try {
    capturesStore = loadCaptures(app.getPath('userData'));
    logDebug('CAPTURES INIT', { count: capturesStore.captures.length });
  } catch (error) {
    logDebug('CAPTURES INIT ERROR: ' + error.message);
    capturesStore = { version: 1, captures: [] };
  }
  moodTickHandle = startMoodTick({
    getMood: () => currentMood,
    setMood: (m) => {
      currentMood = m;
      try { saveMood(app.getPath('userData'), m); } catch (e) { logDebug('MOOD TICK SAVE: ' + e.message); }
    },
    intervalMs: 60_000,
    logDebug
  });
  powerMonitorHandle = createPowerMonitor({
    powerMonitor,
    setSleeping: value => setSleepingState(value, 'powermonitor'),
    notifyRenderer: payload => notifyPetSystemEvent(payload),
    logDebug
  });
  // A3 — idle monitor: detecta inactividad system-wide y sugiere breaks.
  // Emite un evento al pet window con el texto del tip. El renderer
  // (pet) lo muestra como speech bubble.
  idleMonitorHandle = createIdleMonitor({
    powerMonitor,
    onBreakSuggest: ({ idleFormatted }) => {
      const tip = `Llevas ${idleFormatted} sin actividad. ¿Un break?`;
      notifyPetSystemEvent({ event: 'idle-break', source: 'idle-monitor', text: tip, ts: new Date().toISOString() });
    },
    logDebug
  });
  globalShortcutsHandle = registerGlobalShortcuts(globalShortcut, logDebug, {
    onPomodoroToggle: handlePomodoroToggleShortcut,
    onPetSleep: handlePetSleepShortcut,
    onQuickCapture: handleQuickCaptureShortcut
  });
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createPetWindow();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
  clearAllTimers();
  if (moodTickHandle) {
    moodTickHandle.stop();
    moodTickHandle = null;
  }
  if (powerMonitorHandle) {
    try {
      powerMonitorHandle.detach();
    } catch (error) {
      logDebug(`POWERMONITOR DETACH ERROR: ${serializeError(error)}`);
    }
    powerMonitorHandle = null;
  }
  if (idleMonitorHandle) {
    try {
      idleMonitorHandle.detach();
    } catch (error) {
      logDebug(`IDLE MONITOR DETACH ERROR: ${serializeError(error)}`);
    }
    idleMonitorHandle = null;
  }
  if (globalShortcutsHandle) {
    globalShortcutsHandle.unregisterAll();
    globalShortcutsHandle = null;
  }
});

app.on('child-process-gone', (_event, details) => {
  logDebug(`CHILD PROCESS GONE: type=${details.type}, reason=${details.reason}, exitCode=${details.exitCode}`);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && !isQuitting) app.quit();
});
