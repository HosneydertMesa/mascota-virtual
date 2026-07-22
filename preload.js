'use strict';

const { contextBridge, ipcRenderer } = require('electron');

function subscribe(channel, callback) {
  if (typeof callback !== 'function') return () => {};
  const listener = (_event, data) => callback(data);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld('api', {
  setIgnoreMouseEvents: (ignore, options) => {
    ipcRenderer.send('set-ignore-mouse-events', Boolean(ignore), {
      forward: Boolean(options?.forward)
    });
  },

  dragStart: () => ipcRenderer.send('drag-start'),
  dragMove: () => ipcRenderer.send('drag-move'),
  dragEnd: () => ipcRenderer.send('drag-end'),

  openDashboard: (tab) => ipcRenderer.send('open-dashboard', tab),
  closeDashboard: () => ipcRenderer.send('close-dashboard'),

  syncSettings: (settings) => ipcRenderer.send('sync-settings', {
    pet: settings?.pet === 'dog' ? 'dog' : 'cat',
    soundEnabled: settings?.soundEnabled !== false
  }),
  triggerPetAction: (action) => ipcRenderer.send('trigger-pet-action', action),
  setSleeping: (sleeping) => ipcRenderer.send('set-sleeping', Boolean(sleeping)),

  getAiStatus: () => ipcRenderer.invoke('ai:get-status'),
  saveApiKey: (apiKey) => ipcRenderer.invoke('ai:save-key', apiKey),
  clearApiKey: () => ipcRenderer.invoke('ai:clear-key'),
  aiSendMessage: (payload) => ipcRenderer.invoke('ai:send-message', payload),
  aiQuickTip: (payload) => ipcRenderer.invoke('ai:quick-tip', payload),

  // P7 — pet name
  getPetName: () => ipcRenderer.invoke('pet-name:get'),
  setPetName: (name) => ipcRenderer.invoke('pet-name:set', name),

  // A1 — mood system
  getMood: () => ipcRenderer.invoke('mood:get'),

  // P3 — memories persistentes
  getMemories: () => ipcRenderer.invoke('memories:list'),
  removeMemory: (id) => ipcRenderer.invoke('memories:remove', id),
  clearMemories: () => ipcRenderer.invoke('memories:clear'),
  setMemoryRedact: (enabled) => ipcRenderer.invoke('memories:set-redact', enabled),

  // A4 — Do Not Disturb (typing rate monitor)
  setDoNotDisturb: (isActive) => ipcRenderer.invoke('dnd:update', isActive),

  // I2 — Quick capture (overlay Cmd/Ctrl+Shift+Q)
  quickCaptureSave: (text) => ipcRenderer.invoke('quick-capture:save', text),
  quickCaptureList: () => ipcRenderer.invoke('quick-capture:list'),
  quickCaptureClear: () => ipcRenderer.invoke('quick-capture:clear'),

  // W3 — Weekly report
  weeklyReportGet: (opts) => ipcRenderer.invoke('weekly-report:get', opts || {}),

  // Track A — Pomodoro (config + sesiones + stats + adaptive + streak)
  pomodoroGetConfig: () => ipcRenderer.invoke('pomodoro:get-config'),
  pomodoroSetConfig: (config) => ipcRenderer.invoke('pomodoro:set-config', config),
  pomodoroRegisterSession: (session) => ipcRenderer.invoke('pomodoro:register-session', session),
  pomodoroGetStats: () => ipcRenderer.invoke('pomodoro:get-stats'),
  pomodoroGetNextBreakKind: (params) => ipcRenderer.invoke('pomodoro:get-next-break-kind', params),

  onSwitchTab: (callback) => subscribe('switch-tab', callback),
  onPetMoveState: (callback) => subscribe('pet-move-state', callback),
  onPetAction: (callback) => subscribe('pet-action', callback),
  onSettingsUpdated: (callback) => subscribe('settings-updated', callback),
  onDashboardClosed: (callback) => subscribe('dashboard-closed', callback),
  onWindowModeBar: (callback) => subscribe('window-mode-bar', callback),
  onWindowModeDrag: (callback) => subscribe('window-mode-drag', callback),
  onUpdatePetPosition: (callback) => subscribe('update-pet-position', callback),
  onTriggerAutonomousTip: (callback) => subscribe('trigger-autonomous-tip', callback),
  onSystemEvent: (callback) => subscribe('pet-system-event', callback),

  // T4 — globalShortcut IPC channels
  onPomodoroToggle: (callback) => subscribe('pomodoro-toggle', callback),
  onPetSleep: (callback) => subscribe('pet-sleep', callback),
  onQuickCaptureTrigger: (callback) => subscribe('quick-capture-trigger', callback),

  // Track A — Streak milestone (emitido por main al petWindow)
  onStreakMilestone: (callback) => subscribe('streak-milestone', callback),

  // I7 + I8 — daily briefing / evening summary
  onMorningBriefing: (callback) => subscribe('morning-briefing', callback),
  onEveningSummary: (callback) => subscribe('evening-summary', callback),
  briefingGetState: () => ipcRenderer.invoke('briefing:get-state'),
  briefingSetEnabled: (enabled) => ipcRenderer.invoke('briefing:set-enabled', Boolean(enabled)),
  briefingShowNow: (kind) => ipcRenderer.invoke('briefing:show-now', kind === 'evening' ? 'evening' : 'morning'),

  // T6 — electron-updater status (main → renderer). El main process
  // emite 'app:update-status' cuando hay un update disponible o
  // descargado. El renderer lo recibe y muestra un speech bubble.
  onUpdateStatus: (callback) => subscribe('app:update-status', callback),

  // Track B — W1 silent mode + W2 calendar .ics
  configGetSilentMode: () => ipcRenderer.invoke('config:get-silent-mode'),
  configSetSilentMode: (enabled) => ipcRenderer.invoke('config:set-silent-mode', Boolean(enabled)),
  configGetCalendarPath: () => ipcRenderer.invoke('config:get-calendar-path'),
  configSetCalendarPath: (filePath) => ipcRenderer.invoke('config:set-calendar-path', filePath),
  calendarGetNextEvents: (opts) => ipcRenderer.invoke('calendar:get-next-events', opts || {}),
  calendarTestPath: (filePath) => ipcRenderer.invoke('calendar:test-path', filePath),
  onSilentModeChanged: (callback) => subscribe('pet:silent-mode-changed', callback),
  onRetreatChanged: (callback) => subscribe('pet:retreat-changed', callback)
});
