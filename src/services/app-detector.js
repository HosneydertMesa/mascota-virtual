'use strict';

// v2.2.0 — App-aware mascota
// Polls the foreground window via PowerShell (Windows-only).
// Returns the process name + window title, classified into a category.
// onChange callback fires ONLY when the category changes (not every poll).

const { exec } = require('child_process');
const { categorize } = require('../core/app-categories');

const DEFAULT_POLL_INTERVAL_MS = 8000;
const QUERY_TIMEOUT_MS = 5000;

// PowerShell script que devuelve JSON { name, title, pid } de la ventana
// foreground. Usa Win32 API (GetForegroundWindow, GetWindowThreadProcessId,
// GetWindowText). Si no hay ventana o falla, devuelve '{}' (interpretado
// como "no change" por el caller).
const PS_SCRIPT = `
$src = @'
using System;
using System.Runtime.InteropServices;
using System.Text;
public class Win32AppDetector {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll", CharSet=CharSet.Auto)] public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
}
'@
Add-Type -TypeDefinition $src -Language CSharp
$hwnd = [Win32AppDetector]::GetForegroundWindow()
$pid = 0
[Win32AppDetector]::GetWindowThreadProcessId($hwnd, [ref]$pid) | Out-Null
$proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
if ($proc -and $proc.MainWindowHandle -ne 0) {
  @{ name = $proc.ProcessName; title = $proc.MainWindowTitle; pid = $pid } | ConvertTo-Json -Compress
}
`.trim().replace(/\s+/g, ' ');

function queryForegroundApp(executor, timeoutMs = QUERY_TIMEOUT_MS) {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') {
      return resolve({ name: '', title: '', pid: 0, platform: process.platform });
    }
    // Escape quotes for the PowerShell -Command argument.
    const command = `powershell -NoProfile -ExecutionPolicy Bypass -Command "${PS_SCRIPT.replace(/"/g, '\\"')}"`;
    executor(command, { timeout: timeoutMs, windowsHide: true }, (err, stdout) => {
      if (err || !stdout) {
        return resolve({ name: '', title: '', pid: 0, error: err ? err.message : 'empty stdout' });
      }
      try {
        const trimmed = stdout.trim();
        if (!trimmed || trimmed === '{}') {
          return resolve({ name: '', title: '', pid: 0 });
        }
        const data = JSON.parse(trimmed);
        resolve({
          name: data.name || '',
          title: data.title || '',
          pid: data.pid || 0
        });
      } catch (_parseErr) {
        resolve({ name: '', title: '', pid: 0, error: 'parse failed' });
      }
    });
  });
}

let pollTimer = null;
let pollClearTimer = null;
let polling = false;

function startDetector(onChange, options = {}) {
  if (typeof onChange !== 'function') {
    throw new TypeError('startDetector requiere callback onChange');
  }
  const intervalMs = options.intervalMs || DEFAULT_POLL_INTERVAL_MS;
  const executor = options.exec || exec;
  const setTimerFn = options.setTimer || setInterval;
  const clearTimerFn = options.clearTimer || clearInterval;

  let lastCategory = null;

  async function tick() {
    if (polling) return; // skip si el poll anterior sigue corriendo
    polling = true;
    try {
      const data = await queryForegroundApp(executor);
      if (!data.name) return; // no hay ventana o no se pudo detectar
      const category = categorize(data.name);
      if (category !== lastCategory) {
        lastCategory = category;
        onChange({
          processName: data.name,
          windowTitle: data.title || '',
          pid: data.pid || 0,
          category
        });
      }
    } catch (_e) {
      // ignore — el siguiente poll lo intenta de nuevo
    } finally {
      polling = false;
    }
  }

  // Initial poll + interval
  tick();
  pollTimer = setTimerFn(tick, intervalMs);
  pollClearTimer = clearTimerFn;

  return {
    stop() {
      if (pollTimer !== null) {
        pollClearTimer(pollTimer);
        pollTimer = null;
      }
    },
    isRunning: () => pollTimer !== null,
    // Internal — solo para tests
    _getLastCategory: () => lastCategory
  };
}

function stopDetector() {
  if (pollTimer !== null) {
    pollClearTimer(pollTimer);
    pollTimer = null;
  }
}

module.exports = {
  startDetector,
  stopDetector,
  queryForegroundApp,
  POLL_INTERVAL_MS: DEFAULT_POLL_INTERVAL_MS
};
