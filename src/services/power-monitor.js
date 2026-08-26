'use strict';

// Bridge entre `electron.powerMonitor` y el estado de la mascota.
//
// Eventos que escuchamos:
//   'lock-screen'  → el OS entró a lock screen (screensaver con password).
//   'unlock-screen'→ el OS salió del lock screen.
//   'suspend'      → laptop suspendida / sleep.
//   'resume'       → laptop resumida.
//
// Por qué existe como módulo separado:
//   - Permite mockear `powerMonitor` en tests sin levantar Electron.
//   - Encapsula el delay de 5s (no asustar al usuario cuando vuelve del lock).
//   - Encapsula el try/catch defensivo (no todos los OS exponen los 4 eventos).
//
// API:
//   const handle = createPowerMonitor({
//     powerMonitor,        // electron.powerMonitor (o un EventEmitter mock)
//     setSleeping,         // fn(value: boolean) → setea isSleeping en main
//     notifyRenderer,      // fn({event,source,ts}) → safeSend al petWindow
//     logDebug,            // fn(message: string) → logger del main
//     wakeUpDelayMs        // opcional, default 5000
//   });
//   handle.detach()  → cleanup antes de quit

const SUPPORTED_EVENTS = Object.freeze([
  'lock-screen',
  'unlock-screen',
  'suspend',
  'resume'
]);

const DEFAULT_WAKE_UP_DELAY_MS = 5000;

function nowIso() {
  return new Date().toISOString();
}

function createPowerMonitor(deps) {
  const {
    powerMonitor,
    setSleeping,
    notifyRenderer,
    logDebug = () => {},
    wakeUpDelayMs = DEFAULT_WAKE_UP_DELAY_MS,
    setTimeoutFn = setTimeout,
    clearTimeoutFn = clearTimeout
  } = deps || {};

  // Defensivo: si por alguna razón electron no expone powerMonitor
  // (por ej. en tests sin electron, o un OS raro), devolvemos un no-op
  // en vez de crashear el main process.
  if (!powerMonitor || typeof powerMonitor.on !== 'function') {
    return { detach() {} };
  }

  const attached = [];
  let wakeUpTimer = null;

  function clearWakeUpTimer() {
    if (wakeUpTimer) {
      clearTimeoutFn(wakeUpTimer);
      wakeUpTimer = null;
    }
  }

  function goToSleep({ event, source }) {
    // Cualquier evento de "sleep" cancela un wake-up pendiente.
    clearWakeUpTimer();
    logDebug(`powermonitor:${event} (source=${source}) → isSleeping=true`);
    setSleeping(true);
    notifyRenderer({ event, source, ts: nowIso() });
  }

  function scheduleWakeUp({ event, source }) {
    // Si había un wake-up pendiente, lo reemplazamos.
    clearWakeUpTimer();
    logDebug(`powermonitor:${event} (source=${source}) → wake in ${wakeUpDelayMs}ms`);
    notifyRenderer({ event, source, ts: nowIso() });
    wakeUpTimer = setTimeoutFn(() => {
      wakeUpTimer = null;
      setSleeping(false);
    }, wakeUpDelayMs);
  }

  const handlers = {
    'lock-screen': () => goToSleep({ event: 'lock', source: 'os' }),
    'unlock-screen': () => scheduleWakeUp({ event: 'unlock', source: 'os' }),
    suspend: () => goToSleep({ event: 'suspend', source: 'os' }),
    resume: () => scheduleWakeUp({ event: 'resume', source: 'os' })
  };

  for (const eventName of SUPPORTED_EVENTS) {
    try {
      const handler = handlers[eventName];
      powerMonitor.on(eventName, handler);
      attached.push({ eventName, handler });
    } catch (error) {
      // Algunos OS no exponen todos los eventos (ej. Linux sin systemd-logind
      // puede no emitir 'lock-screen'). No es fatal: logueamos y seguimos.
      logDebug(`powermonitor:attach-error event=${eventName}: ${error && error.message ? error.message : String(error)}`);
    }
  }

  function detach() {
    clearWakeUpTimer();
    for (const { eventName, handler } of attached) {
      try {
        if (typeof powerMonitor.removeListener === 'function') {
          powerMonitor.removeListener(eventName, handler);
        }
      } catch (error) {
        logDebug(`powermonitor:detach-error event=${eventName}: ${error && error.message ? error.message : String(error)}`);
      }
    }
    attached.length = 0;
  }

  return { detach };
}

module.exports = {
  createPowerMonitor,
  DEFAULT_WAKE_UP_DELAY_MS,
  SUPPORTED_EVENTS
};
