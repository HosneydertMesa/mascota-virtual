'use strict';
// M0 spike runner — temporal. Carga el HTML del spike en Electron,
// captura los console.log, espera 7s, y cierra. Output va a stdout.
//
// Uso: electron.cmd test/pixi-spike-runner.js

const { app, BrowserWindow } = require('electron');
const path = require('path');

const SPIKE_DURATION_MS = 12000;

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 820,
    height: 760,
    show: true,  // show so the user can also see it (M0 evidence)
    backgroundColor: '#0a0a0a',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  const logs = [];
  // Electron 30+ uses a single object arg: { message, level, lineNumber, sourceId }
  win.webContents.on('console-message', (eventOrArgs) => {
    const isDetails = eventOrArgs && typeof eventOrArgs === 'object' && 'message' in eventOrArgs;
    const message = isDetails ? eventOrArgs.message : String(eventOrArgs);
    const level = isDetails ? eventOrArgs.level : 0;
    const lvlName = ['log', 'warn', 'error', 'info'][level] || `lvl${level}`;
    logs.push(`[${lvlName}] ${message}`);
  });
  win.webContents.on('did-fail-load', (_e, code, desc) => {
    logs.push(`[FAIL] code=${code} desc=${desc}`);
  });

  const htmlPath = path.join(__dirname, 'preview', 'pixi-spike.html');
  win.loadFile(htmlPath);

  setTimeout(() => {
    process.stdout.write('\n=== PIXI SPIKE LOGS ===\n');
    process.stdout.write(logs.join('\n') + '\n');
    process.stdout.write('=== END LOGS ===\n');
    app.quit();
  }, SPIKE_DURATION_MS);
});

app.on('window-all-closed', () => app.quit());
