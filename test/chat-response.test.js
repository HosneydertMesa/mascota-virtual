'use strict';

// Tests para cleanChatResponse — helper que extrae solo el content del
// response crudo del LLM (que viene con <think>...</think> + JSON envoltorio).
// Sin este helper, el chat mostraba el raw response al usuario
// (ver docs/plans/chat-bugs-leak-and-close-2026-08-25.md, bug B1).

const test = require('node:test');
const assert = require('node:assert/strict');

const { cleanChatResponse } = require('../src/renderer/chat-response');

const FALLBACK_CAT = '¡Miau! Hola amigo.';
const FALLBACK_DOG = '¡Guau! Hola amigo.';

test('cleanChatResponse: extrae solo el content de un response JSON con <think>', () => {
  const raw = `<think>
{"emotion":"sleepy","action":"stretch","sound":"purr","intent":"rest_stretch","content":"Miau... hola. Me estaba estirando."}
</think>`;
  const out = cleanChatResponse(raw, 'cat', FALLBACK_CAT);
  assert.equal(out, 'Miau... hola. Me estaba estirando.');
});

test('cleanChatResponse: extrae content de JSON sin <think> (MiniMax API directo)', () => {
  const raw = '{"emotion":"happy","action":"wag","sound":"meow","intent":"stay","content":"Aqui estoy contigo."}';
  const out = cleanChatResponse(raw, 'cat', FALLBACK_CAT);
  assert.equal(out, 'Aqui estoy contigo.');
});

test('cleanChatResponse: extrae content de JSON en una sola linea con todo junto', () => {
  // Caso real del screenshot del usuario: el LLM devuelve think + JSON
  // en el mismo bloque, sin newline.
  const raw = '<think>{"emotion":"sleepy","action":"stretch","sound":"purr","intent":"rest_stretch","content":"Miau... hola. Me estab"}';
  const out = cleanChatResponse(raw, 'cat', FALLBACK_CAT);
  assert.equal(out, 'Miau... hola. Me estab');
});

test('cleanChatResponse: maneja response con reply wrapper (objeto en vez de string)', () => {
  const rawObj = { reply: '<think>{"content":"Guau! Vamos a jugar."}</think>' };
  const out = cleanChatResponse(rawObj, 'dog', FALLBACK_DOG);
  assert.equal(out, 'Guau! Vamos a jugar.');
});

test('cleanChatResponse: cae al fallback si el response esta vacio o es solo <think>', () => {
  assert.equal(cleanChatResponse('', 'cat', FALLBACK_CAT), FALLBACK_CAT);
  assert.equal(cleanChatResponse('   ', 'cat', FALLBACK_CAT), FALLBACK_CAT);
  assert.equal(cleanChatResponse(null, 'cat', FALLBACK_CAT), FALLBACK_CAT);
  assert.equal(cleanChatResponse(undefined, 'cat', FALLBACK_CAT), FALLBACK_CAT);
  assert.equal(cleanChatResponse('<think>solo thinking sin JSON</think>', 'cat', FALLBACK_CAT), FALLBACK_CAT);
});

test('cleanChatResponse: maneja JSON malformado con fallback graceful', () => {
  const raw = '<think>{"content": broken json sin cerrar';
  const out = cleanChatResponse(raw, 'cat', FALLBACK_CAT);
  // Sin JSON parseable, deberia mostrar el texto despues de quitar el think
  // (mejor que mostrar JSON roto al usuario)
  assert.ok(!out.includes('<think>'));
  assert.ok(!out.includes('{"'));
});

test('cleanChatResponse: usa fallback de dog cuando petType=dog', () => {
  const out = cleanChatResponse(null, 'dog', FALLBACK_DOG);
  assert.equal(out, FALLBACK_DOG);
});

test('cleanChatResponse: NO expone <think> ni el JSON envoltorio al usuario', () => {
  const casos = [
    '<think>{"content":"hola"}</think>',
    '<think>\n{"emotion":"x","content":"hola"}\n</think>',
    '{"emotion":"x","content":"hola"}',
    '<think>{"content":"hola"}',
  ];
  for (const raw of casos) {
    const out = cleanChatResponse(raw, 'cat', FALLBACK_CAT);
    assert.ok(!out.includes('<think>'), `<think> leak in output: ${out}`);
    assert.ok(!out.includes('</think>'), `</think> leak in output: ${out}`);
    assert.ok(!out.includes('"emotion"'), `"emotion" key leak in output: ${out}`);
    assert.ok(!out.includes('"action"'), `"action" key leak in output: ${out}`);
    assert.ok(!out.includes('"sound"'), `"sound" key leak in output: ${out}`);
    assert.ok(!out.includes('"intent"'), `"intent" key leak in output: ${out}`);
  }
});
