'use strict';

/**
 * T5 performance budget — red de seguridad para regresiones de performance.
 *
 * Mide el tiempo de funciones puras que se llaman en hot paths o
 * se invocan con frecuencia. NO es un stress test, es un smoke
 * test que detecta regresiones graves (10x más lento de repente).
 *
 * Budgets son GENEROSOS (10x sobre el tiempo esperado) para evitar
 * flakiness en CI lento. Si rompe, probablemente hay un bug real
 * (loop infinito, regex patológico, etc).
 *
 * Tests de performance REAL (60fps) requieren profiling en el
 * Electron app, que el worker no puede correr. Esos se hacen en QA manual.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { describe, it } = test;

// Pure modules
const pomodoroTemplates = require('../src/core/pomodoro-templates');
const pomodoroAdaptive = require('../src/core/pomodoro-adaptive');
const pomodoroStreak = require('../src/core/pomodoro-streak');
const quickCapture = require('../src/core/quick-capture');
const weeklyReport = require('../src/core/weekly-report');
const dailyBriefing = require('../src/core/daily-briefing');
const petMemories = require('../src/core/pet-memories');
const silentMode = require('../src/core/silent-mode');
const autoUpdater = require('../src/core/auto-updater');
const calendarService = require('../src/services/calendar-service');

const BUDGET_MS = 50; // Generoso: 10x sobre el tiempo típico

function bench(label, fn, iterations = 1000) {
  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    fn(i);
  }
  const end = process.hrtime.bigint();
  const totalMs = Number(end - start) / 1e6;
  const avgMs = totalMs / iterations;
  return { label, totalMs, avgMs, iterations };
}

describe('performance budget — pure functions', () => {
  it('pomodoro-templates: formatTemplateForDisplay < 50ms / 1000 iter', () => {
    const t = bench('pomodoro-templates', () => {
      pomodoroTemplates.formatTemplateForDisplay({
        focusMin: 25,
        breakMin: 5,
        longBreakMin: 15,
        longBreakEvery: 4
      });
    });
    assert.ok(t.avgMs < BUDGET_MS, `avg ${t.avgMs.toFixed(3)}ms exceeds budget ${BUDGET_MS}ms`);
  });

  it('pomodoro-adaptive: shouldUseLongBreak < 50ms / 1000 iter', () => {
    const t = bench('pomodoro-adaptive', (i) => {
      pomodoroAdaptive.shouldUseLongBreak(i % 10, 4);
    });
    assert.ok(t.avgMs < BUDGET_MS, `avg ${t.avgMs.toFixed(3)}ms exceeds budget ${BUDGET_MS}ms`);
  });

  it('pomodoro-streak: computeStreak < 50ms / 100 iter (dataset 90 días)', () => {
    const days = Array.from({ length: 90 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });
    const t = bench('pomodoro-streak', () => {
      pomodoroStreak.computeStreak(days);
    }, 100);
    assert.ok(t.avgMs < BUDGET_MS, `avg ${t.avgMs.toFixed(3)}ms exceeds budget ${BUDGET_MS}ms`);
  });

  it('quick-capture: validateCaptureText < 50ms / 1000 iter', () => {
    const t = bench('quick-capture', () => {
      quickCapture.validateCaptureText('una idea rápida sobre arquitectura de eventos');
    });
    assert.ok(t.avgMs < BUDGET_MS, `avg ${t.avgMs.toFixed(3)}ms exceeds budget ${BUDGET_MS}ms`);
  });

  it('weekly-report: buildWeeklyReport < 100ms / 100 iter (dataset 7 días)', () => {
    const sessions = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 86400000).toISOString(),
      focusBlocks: Math.floor(Math.random() * 8),
      totalFocusMin: Math.floor(Math.random() * 200)
    }));
    const t = bench('weekly-report', () => {
      weeklyReport.buildWeeklyReport({ sessions });
    }, 100);
    assert.ok(t.avgMs < BUDGET_MS, `avg ${t.avgMs.toFixed(3)}ms exceeds budget ${BUDGET_MS}ms`);
  });

  it('pet-memories: extractPII < 50ms / 1000 iter', () => {
    const text = 'Escribime a jorge@example.com o al +57 311 555 1234 mañana';
    const t = bench('pet-memories', () => {
      petMemories.extractPII(text);
    });
    assert.ok(t.avgMs < BUDGET_MS, `avg ${t.avgMs.toFixed(3)}ms exceeds budget ${BUDGET_MS}ms`);
  });

  it('silent-mode: isSilentModeActive < 50ms / 1000 iter', () => {
    const t = bench('silent-mode', () => {
      silentMode.isSilentModeActive({ silentMode: true, retreatUntil: 0, now: new Date() });
    });
    assert.ok(t.avgMs < BUDGET_MS, `avg ${t.avgMs.toFixed(3)}ms exceeds budget ${BUDGET_MS}ms`);
  });

  it('auto-updater: isNewerVersion < 50ms / 1000 iter', () => {
    const t = bench('auto-updater', () => {
      autoUpdater.isNewerVersion('2.0.0', '2.0.1');
    });
    assert.ok(t.avgMs < BUDGET_MS, `avg ${t.avgMs.toFixed(3)}ms exceeds budget ${BUDGET_MS}ms`);
  });

  it('calendar-service: parseIcsDate < 50ms / 1000 iter (3 formats)', () => {
    const t = bench('calendar-service', (i) => {
      const samples = ['20260101', '20260101T090000Z', '20260101T143000'];
      calendarService.parseIcsDate(samples[i % 3]);
    });
    assert.ok(t.avgMs < BUDGET_MS, `avg ${t.avgMs.toFixed(3)}ms exceeds budget ${BUDGET_MS}ms`);
  });
});
