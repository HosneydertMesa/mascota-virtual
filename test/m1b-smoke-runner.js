'use strict';
// M1b smoke runner — launches Electron, loads the production pet window
// (src/index.html), captures console messages, AND captures a screenshot
// of the window before quitting. Use to verify PIXI is actually rendering
// the pet (not the SVG fallback).

const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const SMOKE_DURATION_MS = 5000;
const SCREENSHOT_PATH = path.join(__dirname, '..', 'docs', 'm1b-smoke-screenshot.png');

app.commandLine.appendSwitch('disable-gpu-sandbox');

app.whenReady().then(() => {
  // Use a wider window to give the pet room and to see the layout.
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

  setTimeout(async () => {
    // Capture a screenshot so the user can verify what PIXI actually rendered.
    try {
      const image = await win.webContents.capturePage();
      fs.mkdirSync(path.dirname(SCREENSHOT_PATH), { recursive: true });
      fs.writeFileSync(SCREENSHOT_PATH, image.toPNG());
      logs.push(`[runner] screenshot saved: ${SCREENSHOT_PATH}`);
    } catch (err) {
      logs.push(`[runner] screenshot failed: ${err.message}`);
    }
    process.stdout.write('\n=== M1b SMOKE LOGS ===\n');
    process.stdout.write(logs.join('\n') + '\n');
    process.stdout.write('=== END LOGS ===\n');
    app.quit();
  }, SMOKE_DURATION_MS);
});

app.on('window-all-closed', () => app.quit());
