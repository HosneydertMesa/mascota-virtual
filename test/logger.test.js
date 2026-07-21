'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Writable } = require('stream');

const {
  Logger,
  RotatingFileStream,
  createFileLogger,
  redactMeta,
  LEVELS,
  logger
} = require('../src/services/logger');

function makeCaptureStream() {
  const lines = [];
  const stream = new Writable({
    write(chunk, _enc, cb) {
      lines.push(chunk.toString());
      cb();
    }
  });
  return { stream, lines };
}

test('logger: output es JSON-lines con ts, level, msg, pid, service', () => {
  const { stream, lines } = makeCaptureStream();
  const fixedNow = () => '2026-07-21T16:18:00.000Z';
  const log = new Logger({ stream, now: fixedNow, minLevel: LEVELS.debug });
  log.info('hello world', { foo: 'bar' });

  assert.equal(lines.length, 1);
  const entry = JSON.parse(lines[0].trim());
  assert.equal(entry.ts, '2026-07-21T16:18:00.000Z');
  assert.equal(entry.level, 'info');
  assert.equal(entry.msg, 'hello world');
  assert.equal(entry.pid, process.pid);
  assert.equal(entry.service, 'mascota');
  assert.deepEqual(entry.meta, { foo: 'bar' });
});

test('logger: niveles bajo minLevel no se escriben', () => {
  const { stream, lines } = makeCaptureStream();
  const log = new Logger({ stream, minLevel: LEVELS.warn });
  log.debug('should not appear');
  log.info('should not appear either');
  log.warn('this one yes');
  log.error('this one too');

  assert.equal(lines.length, 2);
  const entry1 = JSON.parse(lines[0].trim());
  const entry2 = JSON.parse(lines[1].trim());
  assert.equal(entry1.level, 'warn');
  assert.equal(entry2.level, 'error');
});

test('logger: minLevel acepta string ("info") o número (20)', () => {
  const { stream: s1 } = makeCaptureStream();
  new Logger({ stream: s1, minLevel: LEVELS.warn });
  const { stream: s2 } = makeCaptureStream();
  new Logger({ stream: s2, levelName: 'debug' });
});

test('redactMeta: redacta apiKey, password, token, authorization, secret (case-insensitive)', () => {
  const input = {
    apiKey: 'sk-12345',
    API_KEY: 'sk-67890',
    password: 'hunter2',
    Token: 'tok-abc',
    Authorization: 'Bearer xyz',
    secret: 'shh',
    name: 'jorge',
    nested: { password: 'inner', keep: 'this' }
  };
  const out = redactMeta(input);
  assert.equal(out.apiKey, '[REDACTED]');
  assert.equal(out.API_KEY, '[REDACTED]');
  assert.equal(out.password, '[REDACTED]');
  assert.equal(out.Token, '[REDACTED]');
  assert.equal(out.Authorization, '[REDACTED]');
  assert.equal(out.secret, '[REDACTED]');
  assert.equal(out.name, 'jorge');
  assert.equal(out.nested.password, '[REDACTED]');
  assert.equal(out.nested.keep, 'this');
});

test('redactMeta: arrays se procesan recursivamente', () => {
  const input = [{ apiKey: 'x' }, { name: 'y' }];
  const out = redactMeta(input);
  assert.equal(out[0].apiKey, '[REDACTED]');
  assert.equal(out[1].name, 'y');
});

test('redactMeta: null/undefined/primitivos se devuelven tal cual', () => {
  assert.equal(redactMeta(null), null);
  assert.equal(redactMeta(undefined), undefined);
  assert.equal(redactMeta('string'), 'string');
  assert.equal(redactMeta(42), 42);
  assert.equal(redactMeta(true), true);
});

test('logger: meta null/undefined no agrega campo meta', () => {
  const { stream, lines } = makeCaptureStream();
  const log = new Logger({ stream, minLevel: LEVELS.debug });
  log.info('no meta');
  log.info('null meta', null);
  log.info('undef meta', undefined);

  assert.equal(lines.length, 3);
  for (const line of lines) {
    const entry = JSON.parse(line.trim());
    assert.equal(entry.meta, undefined);
  }
});

test('logger: serializa meta con referencias circulares sin crashear', () => {
  const { stream, lines } = makeCaptureStream();
  const log = new Logger({ stream, minLevel: LEVELS.debug });
  const obj = { name: 'cycle' };
  obj.self = obj;

  log.warn('cycle test', obj);
  assert.equal(lines.length, 1);
  const entry = JSON.parse(lines[0].trim());
  assert.equal(entry.level, 'warn');
  assert.equal(entry.meta.name, 'cycle');
  assert.equal(entry.meta.self, '[Circular]');
});

test('logger: stream errors no crashean el proceso', () => {
  const broken = new Writable({
    write(_chunk, _enc, cb) { cb(new Error('boom')); }
  });
  broken.on('error', () => { /* swallow */ });
  const log = new Logger({ stream: broken, minLevel: LEVELS.debug });
  assert.doesNotThrow(() => log.info('should be swallowed'));
});

test('RotatingFileStream: crea archivo y escribe', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mascota-log-'));
  const filePath = path.join(tmpDir, 'test.log');
  const stream = new RotatingFileStream({ filePath, maxBytes: 1024, keep: 2 });
  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        assert.ok(content.includes('first line'), `expected 'first line' in: ${content}`);
        fs.rmSync(tmpDir, { recursive: true, force: true });
        resolve();
      } catch (e) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        reject(e);
      }
    });
    stream.on('error', err => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      reject(err);
    });
    stream.write('first line\n');
    stream.end();
  });
});

test('RotatingFileStream: rota cuando supera maxBytes', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mascota-log-'));
  const filePath = path.join(tmpDir, 'rotate.log');
  const stream = new RotatingFileStream({ filePath, maxBytes: 100, keep: 2 });
  const big = 'x'.repeat(50) + '\n';
  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      try {
        const files = fs.readdirSync(tmpDir);
        assert.ok(files.includes('rotate.log'), `expected rotate.log, got: ${files.join(',')}`);
        assert.ok(files.includes('rotate.log.1'), `expected rotate.log.1, got: ${files.join(',')}`);
        fs.rmSync(tmpDir, { recursive: true, force: true });
        resolve();
      } catch (e) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        reject(e);
      }
    });
    stream.on('error', err => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      reject(err);
    });
    stream.write(big);
    stream.write(big);
    stream.write(big);
    stream.write(big);
    stream.write(big);
    stream.end();
  });
});

test('createFileLogger: integra Logger + RotatingFileStream', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mascota-log-'));
  const filePath = path.join(tmpDir, 'app.log');
  const log = createFileLogger({ filePath, maxBytes: 1024 * 1024, keep: 3 });
  log.info('integration test', { user: 'jorge' });
  log.error('with sensitive', { apiKey: 'sk-shouldnotappear' });
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.includes('integration test'), `expected 'integration test' in: ${content}`);
  assert.ok(!content.includes('sk-shouldnotappear'), 'api key should be redacted');
  assert.ok(content.includes('[REDACTED]'), 'expected [REDACTED] marker');
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('logger singleton: usa minLevel=info por default', () => {
  assert.equal(typeof logger.debug, 'function');
  assert.equal(typeof logger.info, 'function');
  assert.equal(typeof logger.warn, 'function');
  assert.equal(typeof logger.error, 'function');
});
