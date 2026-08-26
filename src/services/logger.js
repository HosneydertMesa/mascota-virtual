'use strict';

/**
 * Logger estructurado para mascotaVirtual.
 *
 * API:
 *   const { logger, createFileLogger, redactMeta, LEVELS } = require('./logger');
 *   logger.info('powermonitor:lock', { source: 'os' });
 *   logger.error('IPC error', { error: err.message, channel });
 *
 * Output: JSON-lines a un stream escribible (default: stdout).
 * Redacción automática de campos sensibles (apiKey, password, token, authorization, secret).
 * Rotación de archivo: 5MB por archivo, últimos 3 archivos (configurable).
 *
 * Para tests, inyectar un stream custom:
 *   const { Writable } = require('stream');
 *   const mem = new Writable({ write(chunk, _enc, cb) { captured.push(chunk.toString()); cb(); } });
 *   const log = new Logger({ stream: mem });
 */

const fs = require('fs');
const path = require('path');
const { Writable } = require('stream');

const LEVELS = Object.freeze({
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
});

const SENSITIVE_KEYS = new Set([
  'apikey', 'api_key',
  'password', 'passwd', 'pwd',
  'token', 'access_token', 'refresh_token',
  'authorization', 'auth',
  'secret', 'client_secret'
]);

function redactMeta(value, seen) {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;

  if (!seen) seen = new WeakSet();
  if (seen.has(value)) return '[Circular]';
  seen.add(value);

  if (Array.isArray(value)) return value.map(v => redactMeta(v, seen));

  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (SENSITIVE_KEYS.has(String(k).toLowerCase())) {
      out[k] = '[REDACTED]';
    } else {
      out[k] = redactMeta(v, seen);
    }
  }
  return out;
}

class Logger {
  constructor(opts = {}) {
    this.minLevel = typeof opts.minLevel === 'number'
      ? opts.minLevel
      : (LEVELS[opts.levelName] || LEVELS.info);
    this.stream = opts.stream || process.stdout;
    this.now = opts.now || (() => new Date().toISOString());
    this.pid = opts.pid || process.pid;
    this.service = opts.service || 'mascota';
  }

  _log(levelName, msg, meta) {
    if (LEVELS[levelName] < this.minLevel) return;
    const entry = {
      ts: this.now(),
      level: levelName,
      service: this.service,
      pid: this.pid,
      msg: String(msg)
    };
    if (meta !== undefined && meta !== null) {
      entry.meta = redactMeta(meta);
    }
    let line;
    try {
      line = JSON.stringify(entry) + '\n';
    } catch (_e) {
      line = JSON.stringify({ ...entry, meta: '[unserializable]' }) + '\n';
    }
    try {
      this.stream.write(line);
    } catch (_e) {
      // Stream errors are non-fatal.
    }
  }

  debug(msg, meta) { this._log('debug', msg, meta); }
  info(msg, meta) { this._log('info', msg, meta); }
  warn(msg, meta) { this._log('warn', msg, meta); }
  error(msg, meta) { this._log('error', msg, meta); }
}

class RotatingFileStream extends Writable {
  constructor(opts = {}) {
    super();
    this.filePath = opts.filePath;
    this.maxBytes = opts.maxBytes || 5 * 1024 * 1024;
    this.keep = opts.keep || 3;
    this.fd = null;
    this.currentSize = 0;
    this._open();
  }

  _open() {
    try {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      try {
        this.currentSize = fs.statSync(this.filePath).size;
      } catch (_e) {
        this.currentSize = 0;
      }
      this.fd = fs.openSync(this.filePath, 'a');
    } catch (_e) {
      this.fd = null;
    }
  }

  _write(chunk, _enc, cb) {
    if (this.fd === null) { cb(); return; }
    try {
      fs.writeSync(this.fd, chunk);
      this.currentSize += chunk.length;
      if (this.currentSize >= this.maxBytes) {
        this._rotate();
      }
      cb();
    } catch (_e) {
      cb();
    }
  }

  _rotate() {
    try { fs.closeSync(this.fd); } catch (_e) {}
    this.fd = null;

    for (let i = this.keep; i >= 1; i--) {
      const src = i === 1 ? this.filePath : `${this.filePath}.${i - 1}`;
      const dst = `${this.filePath}.${i}`;
      if (i === this.keep) {
        try { fs.unlinkSync(dst); } catch (_e) { /* not exists, ok */ }
      } else {
        try { fs.renameSync(src, dst); } catch (_e) { /* not exists, ok */ }
      }
    }
    this._open();
  }

  _destroy(cb) {
    if (this.fd !== null) {
      try { fs.closeSync(this.fd); } catch (_e) {}
      this.fd = null;
    }
    cb();
  }
}

function createFileLogger(opts = {}) {
  const stream = new RotatingFileStream({
    filePath: opts.filePath,
    maxBytes: opts.maxBytes,
    keep: opts.keep
  });
  return new Logger({ ...opts, stream });
}

const logger = new Logger({ minLevel: LEVELS.info });

module.exports = {
  Logger,
  RotatingFileStream,
  createFileLogger,
  redactMeta,
  LEVELS,
  logger
};
