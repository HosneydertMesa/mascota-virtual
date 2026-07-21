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

  onSwitchTab: (callback) => subscribe('switch-tab', callback),
  onPetMoveState: (callback) => subscribe('pet-move-state', callback),
  onPetAction: (callback) => subscribe('pet-action', callback),
  onSettingsUpdated: (callback) => subscribe('settings-updated', callback),
  onDashboardClosed: (callback) => subscribe('dashboard-closed', callback),
  onWindowModeBar: (callback) => subscribe('window-mode-bar', callback),
  onWindowModeDrag: (callback) => subscribe('window-mode-drag', callback),
  onUpdatePetPosition: (callback) => subscribe('update-pet-position', callback),
  onTriggerAutonomousTip: (callback) => subscribe('trigger-autonomous-tip', callback),

  // T4 — globalShortcut IPC channels
  onPomodoroToggle: (callback) => subscribe('pomodoro-toggle', callback),
  onPetSleep: (callback) => subscribe('pet-sleep', callback),
  onQuickCaptureTrigger: (callback) => subscribe('quick-capture-trigger', callback)
});
