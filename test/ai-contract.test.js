'use strict';

// Tests del CONTRACT entre la IA (M3) y la mascota.
// No tocan runtime: solo validan que el system prompt que recibe M3
// y el parser que recibe la respuesta estan alineados.
//
// Estos tests cubren los huecos que detectamos en el review retroactivo:
// la IA puede mandar cualquier cosa y la mascota "se comporta raro" porque
// el contract no estaba testeado end-to-end. Con estos tests, cualquier
// drift entre lo que la IA cree que puede mandar y lo que la mascota
// entiende va a gritar en CI.

const test = require('node:test');
const assert = require('node:assert/strict');
const { sendMessageToMiniMax } = require('../src/services/ai');
const {
  parsePetReply,
  ALLOWED_INTENTS,
  ALLOWED_ACTIONS,
  ALLOWED_EMOTIONS
} = require('../src/core/pet-protocol');

// --- Helpers ---------------------------------------------------------------

async function captureRequestBody(petType, userMessage) {
  let captured;
  const prevFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => ({
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content: '{"intent":"none"}' } }] })
  });
  try {
    await sendMessageToMiniMax('test-key-1234567890', petType, [], userMessage);
  } finally {
    globalThis.fetch = prevFetch;
  }
  return JSON.parse(captured.body);
}

// Helper que captura la request REAL (no la del withMockFetch que hay en ai.test.js).
async function captureRealRequest(petType, userMessage) {
  let captured;
  const prevFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    captured = options;
    return {
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: '{"intent":"none"}' } }] })
    };
  };
  try {
    await sendMessageToMiniMax('test-key-1234567890', petType, [], userMessage);
  } finally {
    globalThis.fetch = prevFetch;
  }
  return JSON.parse(captured.body);
}

// =====================================================================
// TEST 1: el prompt que la IA recibe NO contradice el allow-list del parser
// =====================================================================
//
// Falla si alguien agrega un intent al allow-list del parser pero se olvida
// de documentarlo en el prompt, o viceversa. Hoy esto es drift silencioso.

test('contract: el prompt menciona los 6 intents que el parser acepta', async () => {
  for (const petType of ['cat', 'dog']) {
    const body = await captureRealRequest(petType, 'hola');
    const systemPrompt = body.messages[0].content;

    for (const intent of ALLOWED_INTENTS) {
      if (intent === 'none') continue; // 'none' es el default, no necesita documentacion
      assert.match(
        systemPrompt,
        new RegExp(`\\b${intent}\\b`, 'i'),
        `[${petType}] prompt missing intent "${intent}" que el parser SI acepta`
      );
    }
  }
});

test('contract: el prompt NO le pide a la IA valores fuera del allow-list', async () => {
  // Si el prompt le dice a la IA "intent puede ser run" pero el parser solo
  // acepta ['approach','retreat',...], cada respuesta va a caer al default.
  // Esto detecta drift entre lo que la IA cree que puede mandar y lo que
  // la mascota entiende.
  for (const petType of ['cat', 'dog']) {
    const body = await captureRealRequest(petType, 'hola');
    const systemPrompt = body.messages[0].content;

    // Extraer SOLO la linea "intent: valor1 | valor2 | ..." (parar en newline).
    const intentLine = systemPrompt.match(/intent:\s*([a-z_| \t\r]+?)(?:\n|$)/im);
    assert.ok(intentLine, `[${petType}] prompt no tiene linea "intent: ..."`);
    const documented = intentLine[1]
      .split('|')
      .map(s => s.trim().toLowerCase())
      .filter(s => /^[a-z_]+$/.test(s)); // solo tokens puros sin espacios extra

    assert.ok(documented.length > 0, `[${petType}] no se extrajeron intents del prompt`);

    // Todos los documentados deben estar en el allow-list del parser
    for (const intent of documented) {
      assert.ok(
        ALLOWED_INTENTS.has(intent),
        `[${petType}] prompt documenta intent "${intent}" que el parser NO acepta`
      );
    }
  }
});

// =====================================================================
// TEST 2: respuestas tipicas de M3 son parseables
// =====================================================================
//
// M3 (o cualquier modelo) puede responder de 3 formas:
//   a) JSON valido con todos los campos
//   b) JSON valido pero con campos invalidos (debe caer al default)
//   c) Texto libre / sin JSON (debe caer al default con warn)
//
// Estos tests simulan cada caso con respuestas realistas.

test('contract: M3 responde JSON valido y el parser extrae intent correcto', () => {
  // Caso a) El gato quiere saludar al usuario que volvio.
  const reply = '{"emotion":"happy","action":"jump","sound":"meow","intent":"approach","content":"Miau! Aqui estoy."}';
  const parsed = parsePetReply(reply, 'cat');
  assert.equal(parsed.intent, 'approach');
  assert.equal(parsed.emotion, 'happy');
  assert.equal(parsed.action, 'jump');
  assert.equal(parsed.sound, 'meow');
  assert.equal(parsed.content, 'Miau! Aqui estoy.');
});

test('contract: M3 responde JSON con intent invalido y el parser lo neutraliza', () => {
  // Caso b) La IA alucina un intent que no existe (ej. "run", "fetch").
  // El parser debe mapearlo a 'none' para que la mascota no haga nada raro.
  const reply = '{"emotion":"happy","action":"jump","sound":"meow","intent":"fetch_ball","content":"te traigo la pelota"}';
  const parsed = parsePetReply(reply, 'cat');
  assert.equal(parsed.intent, 'none', 'intent invalido debe caer a "none"');
  assert.equal(parsed.content, 'te traigo la pelota'); // el content igual se muestra
  assert.equal(parsed.emotion, 'happy');
});

test('contract: M3 responde texto libre y el parser cae al fallback seguro', () => {
  // Caso c) M3 alucinó y devolvió prosa pura. La mascota no debe
  // ejecutar NADA, pero el content igual se muestra en el chat bubble.
  const reply = 'Hola amigo! Como te fue hoy? Yo aca cuidandote la casa.';
  const parsed = parsePetReply(reply, 'cat');
  assert.equal(parsed.intent, 'none', 'sin JSON, intent debe ser "none"');
  assert.equal(parsed.action, 'none');
  assert.equal(parsed.sound, 'none');
  assert.equal(parsed.emotion, 'happy'); // default defensivo
  assert.equal(parsed.content, reply);  // el texto igual se muestra al usuario
});

// =====================================================================
// TEST 3: el flow end-to-end "input del usuario → intent que la IA emite"
// =====================================================================
//
// Este test es mas fuerte: valida que para inputs tipicos del usuario,
// el system prompt que la IA recibe contiene la guia necesaria para
// emitir el intent correcto. No validamos la respuesta de M3 (eso es
// un mock que hariamos en otro test), pero validamos que el prompt
// tiene la informacion que la IA necesita para decidir.

test('contract: el prompt guia a la IA con CUANDO usar cada intent', () => {
  // Para cada intent valido (excepto 'none'), el prompt debe tener una
  // frase que le diga a la IA en que situacion emitirlo. Sin esa guia,
  // la IA va a elegir cualquier cosa.
  const expectedTriggers = {
    approach: /llama|acercar|salud|cerca/i,
    retreat:  /espacio|enfoc|trabaj/i,
    play:     /jugar|juguet|jugueton/i,
    sleep:    /descans|dormir|siesta|mimir/i,
    wander:   /paseo| caminar| caminar/i,
    stay:     /quedar|quieto|al lado/i
  };

  for (const petType of ['cat', 'dog']) {
    // Capturamos el system prompt real (sin userMessage para no contaminar).
    return captureRealRequest(petType, 'hola').then(body => {
      const systemPrompt = body.messages[0].content;
      for (const [intent, regex] of Object.entries(expectedTriggers)) {
        assert.match(
          systemPrompt,
          regex,
          `[${petType}] prompt no explica cuando usar "${intent}" (regex: ${regex})`
        );
      }
    });
  }
});

// =====================================================================
// TEST 4 (bonus): simulación completa del round-trip con fetch mockeado
// =====================================================================
//
// Disparamos sendMessageToMiniMax con mocks realistas, validamos que la
// respuesta cruda del API se puede pasar por parsePetReply y produce
// un resultado coherente. Esto es lo más cerca de un test E2E sin
// Electron.

test('contract: round-trip sendMessage → parsePetReply produce intent correcto', async () => {
  const scenarios = [
    { petType: 'cat', userMsg: 'ven aqui', mockReply: '{"emotion":"happy","action":"jump","sound":"meow","intent":"approach","content":"voy!"}', expectedIntent: 'approach' },
    { petType: 'cat', userMsg: 'dejame trabajar', mockReply: '{"emotion":"calm","action":"none","sound":"purr","intent":"retreat","content":"ok"}', expectedIntent: 'retreat' },
    { petType: 'dog', userMsg: 'juguemos!', mockReply: '{"emotion":"excited","action":"jump","sound":"bark","intent":"play","content":"si!"}', expectedIntent: 'play' },
    { petType: 'dog', userMsg: 'tengo sueno', mockReply: '{"emotion":"sleepy","action":"sleep","sound":"whine","intent":"sleep","content":"zzz"}', expectedIntent: 'sleep' }
  ];

  for (const s of scenarios) {
    const prevFetch = globalThis.fetch;
    let capturedPrompt;
    globalThis.fetch = async (_url, options) => {
      capturedPrompt = options.body;
      return {
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: s.mockReply } }] })
      };
    };
    try {
      const rawReply = await sendMessageToMiniMax('test-key-1234567890', s.petType, [], s.userMsg);
      const parsed = parsePetReply(rawReply, s.petType);

      assert.equal(parsed.intent, s.expectedIntent, `round-trip [${s.petType}/${s.userMsg}]: intent esperado "${s.expectedIntent}", recibio "${parsed.intent}"`);
      assert.ok(parsed.content.length > 0, `round-trip [${s.petType}/${s.userMsg}]: content vacio`);

      // Sanity: el prompt capturado menciona los intents correctos
      const body = JSON.parse(capturedPrompt);
      const prompt = body.messages[0].content;
      for (const intent of ['approach', 'retreat', 'play', 'sleep', 'wander', 'stay']) {
        assert.match(prompt, new RegExp(`\\b${intent}\\b`, 'i'), `prompt de ${s.petType} no menciona intent ${intent}`);
      }
    } finally {
      globalThis.fetch = prevFetch;
    }
  }
});
