'use strict';
// M1b smoke runner — launches Electron, loads the production pet window
// (src/index.html), captures console messages, and quits after 8s.
// Use to verify PIXI is actually rendering the pet (not the SVG fallback).

const { app, BrowserWindow } = require('electron');
const path = require('path');

const SMOKE_DURATION_MS = 8000;

app.commandLine.appendSwitch('disable-gpu-sandbox');

app.whenReady().then(() => {
  // Use the same webPreferences the production main.js uses for the pet window.
  const win = new BrowserWindow({
    width: 820,
    height: 360,
    show: true,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  const logs = [];
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

  win.loadFile(path.join(__dirname, '..', 'src', 'index.html'));

  setTimeout(() => {
    process.stdout.write('\n=== M1b SMOKE LOGS ===\n');
    process.stdout.write(logs.join('\n') + '\n');
    process.stdout.write('=== END LOGS ===\n');
    app.quit();
  }, SMOKE_DURATION_MS);
});

app.on('window-all-closed', () => app.quit());
