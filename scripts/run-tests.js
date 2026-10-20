'use strict';

/**
 * Cross-platform test runner.
 * `node --test test/*.test.js` does not expand the glob on Windows
 * PowerShell (CI: "Could not find ...\test\*.test.js"). Listing files
 * ourselves works on Node 18/20/22 and win/mac/linux.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const testDir = path.join(__dirname, '..', 'test');
const files = fs.readdirSync(testDir)
  .filter((name) => name.endsWith('.test.js'))
  .map((name) => path.join('test', name))
  .sort();

if (files.length === 0) {
  process.stderr.write('No test/*.test.js files found\n');
  process.exit(1);
}

const result = spawnSync(process.execPath, ['--test', ...files], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
  env: process.env
});

process.exit(result.status === null ? 1 : result.status);
