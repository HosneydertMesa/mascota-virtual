'use strict';
// M1b smoke runner — launches Electron, loads the production pet window
// (src/index.html), captures console messages, AND captures a screenshot
// of the window before quitting. Use to verify PIXI is actually rendering
// the pet (not the SVG fallback).

const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const SMOKE_DURATION_MS = 8000;
const SCREENSHOT_PATH = path.join(__dirname, '..', 'docs', 'm1b-smoke-screenshot.png');

app.commandLine.appendSwitch('disable-gpu-sandbox');

app.whenReady().then(() => {
  // Match the production pet window size (WINDOW_SIZE in main.js) so the layout
  // is comparable to what the user sees in npm start.
  const win = new BrowserWindow({
    width: 340,
    height: 320,
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
    // v2.3.0 M2 — dispatch a mousemove near the canvas to trigger head turn,
    // so the screenshot shows the head rotated. Pick a position close to the
    // pet (which sits at the bottom-right in bar mode).
    try {
      const cx = 220;  // approx x of the pet center in a 320px window
      const cy = 170;  // approx y of the pet center in a 250px window
      await win.webContents.executeJavaScript(`
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: ${cx}, clientY: ${cy} }));
      `);
      logs.push(`[runner] dispatched mousemove at (${cx}, ${cy})`);
    } catch (err) {
      logs.push(`[runner] mousemove dispatch failed: ${err.message}`);
    }
    // Give the PIXI ticker a few frames to apply the head rotation.
    await new Promise(r => setTimeout(r, 200));

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
