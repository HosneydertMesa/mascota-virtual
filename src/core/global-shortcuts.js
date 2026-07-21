'use strict';

// T4 — globalShortcut registration.
//
// Recibe `globalShortcut` (electron) y un objeto `handlers` con callbacks por
// accion. Devuelve un handle con la lista de accelerators efectivamente
// registrados y un `unregisterAll()` para el cleanup del before-quit.
//
// Por que deps inyectadas: Electron no esta disponible en `node --test`, asi
// que poder mockear `globalShortcut` desde el test es obligatorio. Tambien
// deja la logica de "que hacer cuando se aprieta la tecla" en el caller
// (main.js), que es el unico lugar con acceso a windows/IPC state.

const SHORTCUT_DEFS = [
  { accelerator: 'CommandOrControl+Shift+P', label: 'pomodoro-toggle', handlerKey: 'onPomodoroToggle' },
  { accelerator: 'CommandOrControl+Shift+S', label: 'pet-sleep', handlerKey: 'onPetSleep' },
  { accelerator: 'CommandOrControl+Shift+Q', label: 'quick-capture', handlerKey: 'onQuickCapture' }
];

function registerGlobalShortcuts(globalShortcut, logDebug, handlers) {
  const registered = [];
  if (!globalShortcut || typeof globalShortcut.register !== 'function') {
    logDebug('GLOBAL SHORTCUT SKIP: globalShortcut API no disponible');
    return { registered, unregisterAll: () => {} };
  }
  if (!handlers || typeof handlers !== 'object') {
    logDebug('GLOBAL SHORTCUT SKIP: handlers invalidos');
    return { registered, unregisterAll: () => {} };
  }

  for (const def of SHORTCUT_DEFS) {
    const handler = handlers[def.handlerKey];
    if (typeof handler !== 'function') {
      logDebug(`GLOBAL SHORTCUT SKIP [${def.label}]: handler no provisto`);
      continue;
    }

    let ok = false;
    try {
      ok = globalShortcut.register(def.accelerator, () => {
        try {
          handler();
        } catch (error) {
          logDebug(`GLOBAL SHORTCUT HANDLER ERROR [${def.label}]: ${error?.message || String(error)}`);
        }
      });
    } catch (error) {
      ok = false;
      logDebug(`GLOBAL SHORTCUT REGISTER EXCEPTION [${def.label}]: ${error?.message || String(error)}`);
    }

    if (!ok) {
      logDebug(`GLOBAL SHORTCUT UNAVAILABLE [${def.label}]: ${def.accelerator} (ya esta en uso por otra app?)`);
      continue;
    }
    registered.push(def.accelerator);
  }
  logDebug(`GLOBAL SHORTCUTS REGISTERED: ${registered.length}/${SHORTCUT_DEFS.length}`);

  return {
    registered: registered.slice(),
    unregisterAll() {
      for (const accelerator of registered) {
        try {
          globalShortcut.unregister(accelerator);
        } catch (_error) {
          // Soft-fail: si el accelerator ya no esta, no pasa nada.
        }
      }
      registered.length = 0;
    }
  };
}

module.exports = { registerGlobalShortcuts, SHORTCUT_DEFS };
