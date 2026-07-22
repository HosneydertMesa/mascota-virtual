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
  buildMorningBriefing,
  buildEveningSummary,
  shouldShowBriefing,
  getLocalDateKey
} = require('./src/core/daily-briefing');
const {
  loadBriefingState,
  markShown: markBriefingShown,
  setEnabled: setBriefingEnabled
} = require('./src/services/daily-briefing-store');
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
const {
  loadConfig: loadPomodoroConfig,
  saveConfig: savePomodoroConfig,
  loadSessions: loadPomodoroSessions,
  appendSession: appendPomodoroSession,
  getStatsToday: getPomodoroStatsToday,
  getStatsThisWeek: getPomodoroStatsThisWeek,
  getCompletedDays: getPomodoroCompletedDays
} = require('./src/services/pomodoro-store');
const {
  nextBreakKind,
  DEFAULT_LONG_BREAK_EVERY,
  DEFAULT_LONG_BREAK_MIN
} = require('./src/core/pomodoro-adaptive');
const {
  computeStreak,
  computeLongestStreak,
  isStreakMilestone,
  getStreakMilestoneMessage
} = require('./src/core/pomodoro-streak');
const {
  getTemplate: getPomodoroTemplate,
  validateTemplate: validatePomodoroTemplate
} = require('./src/core/pomodoro-templates');
// Track A — T6 (electron-updater). Se carga lazy dentro de app.whenReady
// para que main.js pueda ser parseado por `node --check` sin necesitar
// electron-updater instalado en ese momento (los tests de pure modules
// no importan main.js, pero otros scripts como `sdlc dev` corren check
// contra main.js).
let autoUpdater = null;

// Track B — W1 silent mode + W2 calendar .ics
const {
  isSilentModeActive: isSilentModeActivePure,
  applySilentModeToContext,
  getPetVisualState
} = require('./src/core/silent-mode');
const calendarService = require('./src/services/calendar-service');
const {
  loadPetConfig,
  setSilentMode: setSilentModeInStore,
  setCalendarIcsPath: setCalendarIcsPathInStore
} = require('./src/services/pet-config-store');

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

// Track B — W1 silent mode + W2 calendar .ics (state en main process).
// petConfig se carga en app.whenReady() desde <userData>/pet-config.json.
let petConfig = null;
// Timestamp (ms) hasta el cual la mascota está en retreat. 0 = sin retreat.
let retreatUntil = 0;
// Eventos cacheados del .ics (W2). Se re-parsean cuando el usuario edita
// el .ics o cambia la config. Vacío = W2 inerte.
let currentEvents = [];
// Watcher sobre el .ics. Se reemplaza al cambiar el path.
let calendarWatcherHandle = { close: () => {} };
// Last broadcast de retreat (para evitar spam en el setInterval de 30s).
let lastRetreatBroadcast = { active: false, summary: null, until: 0 };

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

// Track B — broadcast a TODAS las ventanas conocidas (pet + dashboard).
// Usado para que cambios de silent mode / retreat lleguen a ambos renderers.
function broadcastToAllWindows(channel, payload) {
  let count = 0;
  if (petWindow && !petWindow.isDestroyed()) {
    if (safeSend(petWindow, channel, payload)) count++;
  }
  if (dashboardWindow && !dashboardWindow.isDestroyed()) {
    if (safeSend(dashboardWindow, channel, payload)) count++;
  }
  return count;
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

// I7 + I8 — IPC para que el dashboard consulte y configure el briefing diario.
ipcMain.handle('briefing:get-state', event => {
  if (!isKnownSender(event)) throw new Error('Solicitud no autorizada.');
  const userData = app.getPath('userData');
  return loadBriefingState(userData);
});

ipcMain.handle('briefing:set-enabled', (event, enabled) => {
  if (!isDashboardSender(event)) throw new Error('Solicitud no autorizada.');
  const userData = app.getPath('userData');
  return setBriefingEnabled(userData, enabled === true);
});

ipcMain.handle('briefing:show-now', (event, kind) => {
  if (!isDashboardSender(event)) throw new Error('Solicitud no autorizada.');
  if (!petWindow || petWindow.isDestroyed()) return { shown: false, reason: 'pet-window-not-ready' };
  const userData = app.getPath('userData');
  const today = new Date();
  const petName = loadPetName(userData) || null;
  const safeKind = kind === 'evening' ? 'evening' : 'morning';
  const text = safeKind === 'evening'
    ? buildAutoEveningText(today, activePetType, petName)
    : buildAutoMorningText(today, activePetType, petName);
  const channel = safeKind === 'evening' ? 'evening-summary' : 'morning-briefing';
  safeSend(petWindow, channel, { text, ts: today.toISOString(), manual: true });
  return { shown: true, text };
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

// === Track B — W1 (Silent Mode) + W2 (Calendar .ics) ===

// W1 — get/set del flag de silent mode. El renderer (dashboard) usa
// estos IPCs para mostrar y togglear el switch en Settings.
ipcMain.handle('config:get-silent-mode', (event) => {
  if (!isKnownSender(event)) throw new Error('Solicitud no autorizada.');
  return Boolean(petConfig && petConfig.silentMode === true);
});

ipcMain.handle('config:set-silent-mode', (event, enabled) => {
  if (!isDashboardSender(event)) throw new Error('Solicitud no autorizada.');
  const next = enabled === true;
  try {
    petConfig = setSilentModeInStore(app.getPath('userData'), next);
  } catch (error) {
    logDebug('SET SILENT MODE ERROR: ' + error.message);
    throw error;
  }
  broadcastToAllWindows('pet:silent-mode-changed', { silentMode: next });
  // Si activamos silent, forzar re-evaluacion de retreat (saldra del retreat).
  if (next) evaluateRetreatState();
  return { ok: true, silentMode: next };
});

// W2 — get/set del path al .ics. El dashboard usa esto para mostrar el
// input y permitir "Probar" (parsea y muestra los proximos eventos).
ipcMain.handle('config:get-calendar-path', (event) => {
  if (!isKnownSender(event)) throw new Error('Solicitud no autorizada.');
  if (!petConfig) return null;
  return petConfig.calendarIcsPath || null;
});

ipcMain.handle('config:set-calendar-path', (event, filePath) => {
  if (!isDashboardSender(event)) throw new Error('Solicitud no autorizada.');
  // Validacion estricta: null o string. Rechaza cualquier otro tipo
  // para evitar que algo raro llegue al store.
  if (filePath !== null && filePath !== undefined && typeof filePath !== 'string') {
    throw new Error('Path invalido.');
  }
  // Coercion a null si es string vacio (clear path).
  const normalized = (typeof filePath === 'string' && filePath.length > 0) ? filePath : null;
  // Path traversal: rechazar '..' como segmento para evitar que el path
  // escape de <userData>. (No usamos path.join con userData aca, pero
  // el fs.watch sobre el path lo haria; defense in depth.)
  if (normalized !== null && normalized.includes('..')) {
    throw new Error('Path traversal no permitido.');
  }
  try {
    petConfig = setCalendarIcsPathInStore(app.getPath('userData'), normalized);
  } catch (error) {
    logDebug('SET CALENDAR PATH ERROR: ' + error.message);
    throw error;
  }
  // Re-inicializar el watcher con el nuevo path (o limpiar si es null).
  initCalendarWatcher();
  // Re-evaluar retreat inmediatamente
  evaluateRetreatState();
  return { ok: true, calendarIcsPath: normalized };
});

// W2 — devuelve los proximos N eventos en una ventana de tiempo (default
// 60 min). Usado por el dashboard para mostrar el preview de "Probar".
ipcMain.handle('calendar:get-next-events', (event, opts) => {
  if (!isDashboardSender(event)) throw new Error('Solicitud no autorizada.');
  if (!currentEvents.length) return [];
  const safeOpts = opts && typeof opts === 'object' ? opts : {};
  const lookahead = typeof safeOpts.lookaheadMin === 'number' && safeOpts.lookaheadMin > 0
    ? safeOpts.lookaheadMin
    : 60;
  const limit = typeof safeOpts.limit === 'number' && safeOpts.limit > 0
    ? Math.min(20, Math.floor(safeOpts.limit))
    : 5;
  const now = new Date();
  const horizon = new Date(now.getTime() + lookahead * 60 * 1000);
  const nowMs = now.getTime();
  const horizonMs = horizon.getTime();
  return currentEvents
    .filter(ev => ev.start instanceof Date)
    .filter(ev => {
      const t = ev.start.getTime();
      return t >= nowMs && t <= horizonMs;
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, limit)
    .map(ev => ({
      start: ev.start.toISOString(),
      end: ev.end.toISOString(),
      summary: ev.summary
    }));
});

// W2 — parsea un .ics en un path arbitrario (sin guardarlo en config).
// Usado por el boton "Probar" del dashboard para preview sin compromiso.
ipcMain.handle('calendar:test-path', (event, filePath) => {
  if (!isDashboardSender(event)) throw new Error('Solicitud no autorizada.');
  if (typeof filePath !== 'string' || !filePath) {
    return { ok: false, error: 'Path invalido.' };
  }
  if (filePath.includes('..')) {
    return { ok: false, error: 'Path traversal no permitido.' };
  }
  try {
    const events = calendarService.parseIcsFile(filePath);
    return {
      ok: true,
      count: events.length,
      events: events.slice(0, 3).map(ev => ({
        start: ev.start.toISOString(),
        end: ev.end.toISOString(),
        summary: ev.summary
      }))
    };
  } catch (error) {
    return { ok: false, error: error.message };
  }
});

// === Track B — I2 (Quick Capture) + W3 (Weekly Report) ===

let capturesStore = null;

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

// Pomodoro (Track A — I1 + W4 + W5): config, sesiones, stats, adaptive breaks, streak milestone.
// Toda la logica vive en src/core/ y src/services/. main.js solo wire-ea IPC.
let pomodoroConfig = null;

function ensurePomodoroConfigLoaded() {
  if (pomodoroConfig) return pomodoroConfig;
  try {
    pomodoroConfig = loadPomodoroConfig({ userDataDir: app.getPath('userData') });
  } catch (error) {
    logDebug('POMODORO CONFIG INIT ERROR: ' + error.message);
    pomodoroConfig = null;
  }
  return pomodoroConfig;
}

ipcMain.handle('pomodoro:get-config', event => {
  if (!isKnownSender(event)) throw new Error('Solicitud no autorizada.');
  const config = ensurePomodoroConfigLoaded();
  return config;
});

ipcMain.handle('pomodoro:set-config', (event, candidate) => {
  if (!isDashboardSender(event)) throw new Error('Solicitud no autorizada.');
  const current = ensurePomodoroConfigLoaded();
  const incoming = candidate && typeof candidate === 'object' ? candidate : {};
  // Validar templateId contra el catalogo; custom usa los custom values
  const templateId = typeof incoming.templateId === 'string' && incoming.templateId.length > 0
    ? incoming.templateId
    : current.templateId;
  if (!getPomodoroTemplate(templateId)) {
    throw new Error('Template de pomodoro invalido.');
  }
  // Validar custom values (si viene alguno, valida; si no, mantiene los actuales)
  const validation = validatePomodoroTemplate({
    customFocusMin: incoming.customFocusMin !== undefined ? incoming.customFocusMin : current.customFocusMin,
    customBreakMin: incoming.customBreakMin !== undefined ? incoming.customBreakMin : current.customBreakMin,
    customLongBreakMin: incoming.customLongBreakMin !== undefined ? incoming.customLongBreakMin : current.customLongBreakMin,
    customLongBreakEvery: incoming.customLongBreakEvery !== undefined ? incoming.customLongBreakEvery : current.customLongBreakEvery
  });
  if (!validation.ok) {
    throw new Error(validation.error);
  }
  const next = {
    version: 1,
    templateId,
    customFocusMin: validation.value.customFocusMin !== undefined ? validation.value.customFocusMin : current.customFocusMin,
    customBreakMin: validation.value.customBreakMin !== undefined ? validation.value.customBreakMin : current.customBreakMin,
    customLongBreakMin: validation.value.customLongBreakMin !== undefined ? validation.value.customLongBreakMin : current.customLongBreakMin,
    customLongBreakEvery: validation.value.customLongBreakEvery !== undefined ? validation.value.customLongBreakEvery : current.customLongBreakEvery
  };
  savePomodoroConfig({ userDataDir: app.getPath('userData') }, next);
  pomodoroConfig = next;
  logDebug('POMODORO CONFIG SAVED', { templateId });
  return next;
});

/**
 * Devuelve que tipo de break sigue segun el contador de focus blocks.
 * El renderer consulta esto antes de iniciar un break para saber si
 * debe ser long o short. Esto evita meter logica adaptiva en el renderer.
 */
ipcMain.handle('pomodoro:get-next-break-kind', (event, params) => {
  if (!isKnownSender(event)) throw new Error('Solicitud no autorizada.');
  const p = params && typeof params === 'object' ? params : {};
  const kind = nextBreakKind({
    focusBlocksCompleted: typeof p.focusBlocksCompleted === 'number' ? p.focusBlocksCompleted : 0,
    lastBreakWasLong: Boolean(p.lastBreakWasLong),
    longBreakEvery: typeof p.longBreakEvery === 'number' && p.longBreakEvery > 0 ? p.longBreakEvery : DEFAULT_LONG_BREAK_EVERY
  });
  // Tambien devolvemos la duracion sugerida segun el template actual
  const config = ensurePomodoroConfigLoaded();
  let durationMin = null;
  if (kind === 'long') {
    durationMin = config && typeof config.customLongBreakMin === 'number' ? config.customLongBreakMin : DEFAULT_LONG_BREAK_MIN;
  } else {
    durationMin = config && typeof config.customBreakMin === 'number' ? config.customBreakMin : 5;
  }
  return { kind, durationMin, durationSec: durationMin * 60 };
});

ipcMain.handle('pomodoro:register-session', (event, session) => {
  if (!isDashboardSender(event)) throw new Error('Solicitud no autorizada.');
  const s = session && typeof session === 'object' ? session : {};
  const result = appendPomodoroSession({ userDataDir: app.getPath('userData') }, {
    kind: s.kind,
    durationSec: s.durationSec,
    startedAt: s.startedAt,
    endedAt: s.endedAt
  });
  if (!result.added) return result;
  // Solo los focus blocks cuentan para la racha
  if (s.kind === 'focus') {
    try {
      const completed = getPomodoroCompletedDays({ userDataDir: app.getPath('userData') }, new Date(s.endedAt || Date.now()), 100);
      const streak = computeStreak(completed, new Date(s.endedAt || Date.now()));
      logDebug('POMODORO STREAK', { streak });
      if (isStreakMilestone(streak)) {
        const message = getStreakMilestoneMessage(streak, activePetType);
        logDebug('POMODORO STREAK MILESTONE', { days: streak, message });
        // Emitir al petWindow (es donde se muestra el speech bubble)
        safeSend(petWindow, 'streak-milestone', { days: streak, message });
      }
    } catch (error) {
      logDebug('POMODORO STREAK ERROR: ' + error.message);
    }
  }
  return result;
});

ipcMain.handle('pomodoro:get-stats', event => {
  if (!isKnownSender(event)) throw new Error('Solicitud no autorizada.');
  const deps = { userDataDir: app.getPath('userData') };
  return {
    today: getPomodoroStatsToday(deps),
    week: getPomodoroStatsThisWeek(deps)
  };
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
  // 1. Cargar sesiones de pomodoro.
  let sessions = [];
  let longestStreak = 0;
  let currentStreak = 0;
  try {
    const sessionsStore = loadPomodoroSessions({ userDataDir: app.getPath('userData') });
    sessions = Array.isArray(sessionsStore?.sessions) ? sessionsStore.sessions : [];
  } catch (e) {
    logDebug('POMODORO LOAD SESSIONS: ' + e.message);
    sessions = [];
  }
  try {
    const completed = getPomodoroCompletedDays({ userDataDir: app.getPath('userData') }, new Date(), 100);
    currentStreak = computeStreak(completed, new Date());
    longestStreak = computeLongestStreak(completed);
  } catch (e) {
    logDebug('POMODORO STREAK: ' + e.message);
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

// Track B — W1: toggle de silent mode desde el global shortcut.
// Invierte el flag actual y broadcast a todas las ventanas.
function handleSilentModeToggleShortcut() {
  if (!petConfig) return;
  const next = !petConfig.silentMode;
  try {
    petConfig = setSilentModeInStore(app.getPath('userData'), next);
    broadcastToAllWindows('pet:silent-mode-changed', { silentMode: next });
    logDebug(`SILENT MODE TOGGLE: ${next}`);
    // Si acabamos de activar, forzar re-evaluacion de retreat.
    if (next) evaluateRetreatState();
  } catch (error) {
    logDebug('SILENT MODE TOGGLE ERROR: ' + error.message);
  }
}

// I7 + I8 — Daily briefing + evening summary.
//
// El trigger automatico (morning al abrir, evening al cerrar) usa un texto
// simple que NO depende de pomodoro-store ni quick-capture-store. Esos
// servicios los daran los tracks A y B en el merge final; el dashboard
// puede construir briefings enriquecidos via el IPC `briefing:get-today`.

function pickBriefingToneWord(petType, kind) {
  const cat = {
    morning: ['Miau', 'Ronroneo', 'Bigotes al viento', 'A cazar ideas'],
    evening: ['Miau', 'Ronroneo de cierre', 'Camita lista', 'Buenas lunas']
  };
  const dog = {
    morning: ['Guau', 'Cola en marcha', 'A pasear ideas', 'Patas listas'],
    evening: ['Guau', 'Camita lista', 'Buenas lunas', 'Acurrucadito']
  };
  const pool = petType === 'dog' ? dog[kind] : cat[kind];
  if (!pool || pool.length === 0) return '';
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

function buildAutoMorningText(today, petType, petName) {
  const { buildMorningBriefing } = require('./src/core/daily-briefing');
  const nameBit = petName ? `, ${petName}` : '';
  const tone = pickBriefingToneWord(petType, 'morning');
  const tail = tone ? ` ${tone}.` : '';
  const baseGreeting = buildMorningBriefing({ today, petType, petName });
  return `${baseGreeting}${tail}`;
}

function buildAutoEveningText(today, petType, petName) {
  const { buildEveningSummary } = require('./src/core/daily-briefing');
  const nameBit = petName ? `, ${petName}` : '';
  const tone = pickBriefingToneWord(petType, 'evening');
  const tail = tone ? ` ${tone}.` : '';
  const baseSummary = buildEveningSummary({ today, petType, petName });
  return `${baseSummary}${tail}`;
}

function maybeShowMorningBriefing() {
  if (!petWindow || petWindow.isDestroyed()) return;
  // Track B — W1: respeta silent mode. Si esta activa, el briefing se
  // skipea (el mood no cambia, la visual solo se reduce, no se inicia chat).
  if (petConfig && isSilentModeActivePure({
    silentMode: petConfig.silentMode,
    retreatUntil,
    now: Date.now()
  })) {
    return;
  }
  try {
    const userData = app.getPath('userData');
    const state = loadBriefingState(userData);
    const today = new Date();
    if (!shouldShowBriefing({
      hour: today.getHours(),
      lastShownDate: state.lastShownDate,
      kind: 'morning',
      today,
      enabled: state.enabled
    })) return;
    const petName = loadPetName(userData) || null;
    const text = buildAutoMorningText(today, activePetType, petName);
    safeSend(petWindow, 'morning-briefing', { text, ts: today.toISOString() });
    markBriefingShown(userData, today);
    logDebug(`MORNING BRIEFING SHOWN: ${text.slice(0, 60)}...`);
  } catch (error) {
    logDebug(`MORNING BRIEFING ERROR: ${serializeError(error)}`);
  }
}

function maybeShowEveningSummary() {
  if (!petWindow || petWindow.isDestroyed()) return;
  // Track B — W1: respeta silent mode.
  if (petConfig && isSilentModeActivePure({
    silentMode: petConfig.silentMode,
    retreatUntil,
    now: Date.now()
  })) {
    return;
  }
  try {
    const userData = app.getPath('userData');
    const state = loadBriefingState(userData);
    const today = new Date();
    if (!shouldShowBriefing({
      hour: today.getHours(),
      lastShownDate: state.lastShownDate,
      kind: 'evening',
      today,
      enabled: state.enabled
    })) return;
    const petName = loadPetName(userData) || null;
    const text = buildAutoEveningText(today, activePetType, petName);
    safeSend(petWindow, 'evening-summary', { text, ts: today.toISOString() });
    markBriefingShown(userData, today);
    logDebug(`EVENING SUMMARY SHOWN: ${text.slice(0, 60)}...`);
  } catch (error) {
    logDebug(`EVENING SUMMARY ERROR: ${serializeError(error)}`);
  }
}

// Track B — W2 calendar: re-inicializa el watcher y re-parsea el .ics.
// Llamada cuando el usuario cambia el path o al startup. Si no hay path,
// limpia todo (W2 inerte, no rompe nada).
function initCalendarWatcher() {
  if (calendarWatcherHandle && typeof calendarWatcherHandle.close === 'function') {
    try { calendarWatcherHandle.close(); } catch (_e) { /* swallow */ }
  }
  calendarWatcherHandle = { close: () => {} };
  currentEvents = [];
  if (!petConfig || !petConfig.calendarIcsPath) return;
  const icsPath = petConfig.calendarIcsPath;
  try {
    currentEvents = calendarService.parseIcsFile(icsPath);
    logDebug(`CALENDAR INIT: ${currentEvents.length} events from ${icsPath}`);
  } catch (error) {
    logDebug('CALENDAR INIT ERROR', { error: error.message, path: icsPath });
    return;
  }
  calendarWatcherHandle = calendarService.watchIcsFile(icsPath, () => {
    try {
      const reloaded = calendarService.parseIcsFile(icsPath);
      currentEvents = reloaded;
      logDebug(`CALENDAR RELOADED: ${reloaded.length} events`);
      // Re-evaluar retreat inmediatamente
      evaluateRetreatState();
    } catch (error) {
      logDebug('CALENDAR RELOAD ERROR', { error: error.message });
    }
  });
}

// Track B — W2 retreat scheduler: cada 30s revisa si hay reunion activa
// o empezando en los proximos 5 min. Broadcast al petWindow para que
// aplique la visual de retreat.
function evaluateRetreatState() {
  if (!petConfig) return;
  const now = new Date();
  // Si silentMode está activo, retreat es no-op (la silent mode manda).
  if (petConfig.silentMode) {
    if (lastRetreatBroadcast.active) {
      lastRetreatBroadcast = { active: false, summary: null, until: 0 };
      retreatUntil = 0;
      broadcastToAllWindows('pet:retreat-changed', { active: false });
    }
    return;
  }
  if (!currentEvents.length) {
    if (lastRetreatBroadcast.active) {
      lastRetreatBroadcast = { active: false, summary: null, until: 0 };
      retreatUntil = 0;
      broadcastToAllWindows('pet:retreat-changed', { active: false });
    }
    return;
  }
  const active = calendarService.getActiveEvent(currentEvents, now);
  if (active) {
    const newUntil = active.end.getTime();
    if (lastRetreatBroadcast.until !== newUntil || !lastRetreatBroadcast.active) {
      lastRetreatBroadcast = { active: true, summary: active.summary, until: newUntil };
      retreatUntil = newUntil;
      broadcastToAllWindows('pet:retreat-changed', {
        active: true,
        summary: active.summary,
        until: active.end.toISOString()
      });
      logDebug(`RETREAT ON: ${active.summary} until ${active.end.toISOString()}`);
    }
    return;
  }
  const upcoming = calendarService.getNextEvent(currentEvents, now, 5);
  if (upcoming) {
    const newUntil = upcoming.end.getTime();
    if (lastRetreatBroadcast.until !== newUntil || !lastRetreatBroadcast.active) {
      lastRetreatBroadcast = { active: true, summary: upcoming.summary, until: newUntil };
      retreatUntil = newUntil;
      broadcastToAllWindows('pet:retreat-changed', {
        active: true,
        summary: upcoming.summary,
        until: upcoming.end.toISOString()
      });
      logDebug(`RETREAT SOON: ${upcoming.summary} starts at ${upcoming.start.toISOString()}`);
    }
    return;
  }
  // Sin evento activo ni proximo → desactivar retreat.
  if (lastRetreatBroadcast.active) {
    lastRetreatBroadcast = { active: false, summary: null, until: 0 };
    retreatUntil = 0;
    broadcastToAllWindows('pet:retreat-changed', { active: false });
    logDebug('RETREAT OFF');
  }
}

// Track B — W1: helpers para chequear silent mode desde el resto del main.
function isPetSilentNow() {
  if (!petConfig) return false;
  return isSilentModeActivePure({
    silentMode: petConfig.silentMode,
    retreatUntil,
    now: Date.now()
  });
}

app.whenReady().then(() => {
  createPetWindow();
  initMainDeps();
  // Track B — W1 + W2: cargar pet-config (silentMode + calendarIcsPath)
  // y arrancar el calendar watcher + retreat scheduler.
  try {
    petConfig = loadPetConfig(app.getPath('userData'));
    logDebug('PET CONFIG INIT', { silentMode: petConfig.silentMode, hasCalendar: Boolean(petConfig.calendarIcsPath) });
  } catch (error) {
    logDebug('PET CONFIG INIT ERROR: ' + error.message);
    petConfig = { version: 1, silentMode: false, calendarIcsPath: null };
  }
  initCalendarWatcher();
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
  // Track A — Pomodoro: cargar config desde disco (las sesiones se cargan
  // lazy en cada call a loadSessions para evitar cargar 90 dias al startup)
  try {
    ensurePomodoroConfigLoaded();
    logDebug('POMODORO CONFIG INIT', { templateId: pomodoroConfig?.templateId });
  } catch (error) {
    logDebug('POMODORO CONFIG INIT ERROR: ' + error.message);
  }
  moodTickHandle = startMoodTick({
    getMood: () => currentMood,
    setMood: (m) => {
      // Track B — W1: si silent mode activa, NO guardar el decay del mood.
      // El mood value persiste en disco; al desactivar silent, sigue donde
      // quedo. (Esto evita que la mascota "muera" de hambre mientras el
      // usuario trabaja en focus mode.)
      if (isPetSilentNow()) {
        return;
      }
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
      // Track B — W1: no sugerir break si silent mode esta activa.
      if (isPetSilentNow()) return;
      const tip = `Llevas ${idleFormatted} sin actividad. ¿Un break?`;
      notifyPetSystemEvent({ event: 'idle-break', source: 'idle-monitor', text: tip, ts: new Date().toISOString() });
    },
    logDebug
  });
  globalShortcutsHandle = registerGlobalShortcuts(globalShortcut, logDebug, {
    onPomodoroToggle: handlePomodoroToggleShortcut,
    onPetSleep: handlePetSleepShortcut,
    onQuickCapture: handleQuickCaptureShortcut,
    onSilentModeToggle: handleSilentModeToggleShortcut
  });
  // Track B — W2: retreat scheduler (30s) — evalua eventos activos o
  // proximos y broadcast al petWindow. .unref() para no bloquear el quit.
  const retreatTimer = setInterval(evaluateRetreatState, 30 * 1000);
  if (typeof retreatTimer.unref === 'function') retreatTimer.unref();
  // Track B — W2: evalua inmediatamente (no esperamos 30s para el primer
  // check, asi un evento que ya empezo dispara retreat al abrir la app).
  setTimeout(evaluateRetreatState, 2000);
  // I7 — morning briefing: 3s despues de que la ventana este lista.
  setTimeout(maybeShowMorningBriefing, 3000);

  // T6 — electron-updater wire.
  // Solo activo en builds empaquetados (app.isPackaged). En dev, el check
  // seria contra el repo local, no contra GitHub Releases, y no tiene
  // sentido. autoInstallOnAppQuit: el update se aplica al cerrar la app
  // (sin prompt). allowDowngrade: false explicito (es el default, pero lo
  // dejamos documentado para que un cambio futuro no baje la guardia).
  try {
    autoUpdater = require('electron-updater').autoUpdater;
    if (autoUpdater) {
      autoUpdater.autoDownload = true;
      autoUpdater.autoInstallOnAppQuit = true;
      autoUpdater.allowDowngrade = false;
      // Logger custom: si llega a tirar errores, los loggeamos con el
      // mismo canal que el resto de la app (mascota-debug.log).
      autoUpdater.logger = {
        info: (msg) => logDebug(`AUTO-UPDATE: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`),
        warn: (msg) => logDebug(`AUTO-UPDATE WARN: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`),
        error: (msg) => logDebug(`AUTO-UPDATE ERROR: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`),
        debug: () => {} // silencio: el log se llena rapido
      };

      autoUpdater.on('update-available', (info) => {
        logDebug(`AUTO-UPDATE AVAILABLE: version=${info?.version}`);
        for (const win of BrowserWindow.getAllWindows()) {
          if (!win.isDestroyed() && !win.webContents.isDestroyed()) {
            safeSend(win, 'app:update-status', { kind: 'available', version: info?.version || '' });
          }
        }
      });

      autoUpdater.on('update-downloaded', (info) => {
        logDebug(`AUTO-UPDATE DOWNLOADED: version=${info?.version}`);
        for (const win of BrowserWindow.getAllWindows()) {
          if (!win.isDestroyed() && !win.webContents.isDestroyed()) {
            safeSend(win, 'app:update-status', { kind: 'downloaded', version: info?.version || '' });
          }
        }
      });

      autoUpdater.on('error', (err) => {
        const message = err instanceof Error ? err.message : String(err);
        logDebug(`AUTO-UPDATE ERROR: ${message}`);
      });

      // Solo chequea si la app esta empaquetada (electron-builder output).
      // En `npm start` (dev), no hay feed configurado y el check rompe.
      if (app.isPackaged) {
        try {
          autoUpdater.checkForUpdates().catch(err => {
            logDebug(`AUTO-UPDATE CHECK ERROR: ${err?.message || err}`);
          });
        } catch (err) {
          logDebug(`AUTO-UPDATE CHECK THROW: ${err?.message || err}`);
        }
        // Re-check cada 6h. .unref() para que el timer no bloquee el quit.
        setInterval(() => {
          try {
            autoUpdater.checkForUpdates().catch(err => {
              logDebug(`AUTO-UPDATE RE-CHECK ERROR: ${err?.message || err}`);
            });
          } catch (err) {
            logDebug(`AUTO-UPDATE RE-CHECK THROW: ${err?.message || err}`);
          }
        }, 6 * 60 * 60 * 1000).unref();
      } else {
        logDebug('AUTO-UPDATE SKIP: app no empaquetada (dev mode)');
      }
    }
  } catch (err) {
    // electron-updater no esta disponible (ej: deps no instaladas).
    // No es un error critico: la app sigue funcionando, solo no
    // hay auto-update. Log para visibilidad.
    logDebug(`AUTO-UPDATE INIT SKIP: ${err?.message || err}`);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createPetWindow();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
  // I8 — evening summary: antes de limpiar timers y cerrar.
  try { maybeShowEveningSummary(); }
  catch (error) { logDebug(`EVENING SUMMARY BEFORE-QUIT: ${serializeError(error)}`); }
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
  // Track B — W2: cerrar el file watcher del .ics
  if (calendarWatcherHandle && typeof calendarWatcherHandle.close === 'function') {
    try { calendarWatcherHandle.close(); } catch (e) { logDebug('CALENDAR WATCHER CLOSE: ' + e.message); }
    calendarWatcherHandle = { close: () => {} };
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
