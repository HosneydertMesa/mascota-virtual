'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  sendMessageToMiniMax,
  getQuickTip,
  getFallbackTip
} = require('../src/services/ai');

const MINIMAX_URL = 'https://api.minimax.io/v1/chat/completions';

// Helper: ejecuta body() con globalThis.fetch mockeado, restaurando al final.
async function withMockFetch(response, body) {
  const prevFetch = globalThis.fetch;
  const prevConsoleError = console.error;
  globalThis.fetch = async (url, options) => {
    if (typeof response === 'function') return response(url, options);
    return response;
  };
  // Silenciar el console.error que ai.js hace en su catch.
  console.error = () => {};
  try {
    return await body();
  } finally {
    globalThis.fetch = prevFetch;
    console.error = prevConsoleError;
  }
}

function okResponse(content) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content } }] })
  };
}

function errorResponse(status, payload) {
  return {
    ok: false,
    status,
    json: async () => payload
  };
}

// =====================================================================
// sendMessageToMiniMax
// =====================================================================

test('rechaza llamadas sin API key', async () => {
  await assert.rejects(
    () => sendMessageToMiniMax('', 'cat', [], 'hola'),
    /API Key no configurada/
  );
});

test('hace POST al endpoint correcto con headers y body bien formado', async () => {
  let capturedUrl = null;
  let capturedOptions = null;

  await withMockFetch(okResponse('Hola humano'), async () => {
    const reply = await sendMessageToMiniMax('test-key-1234567890', 'cat', [], 'hola');
    assert.equal(reply, 'Hola humano');
  });

  // Re-mock para capturar la request (withMockFetch no expone lo capturado).
  const prevFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    capturedUrl = url;
    capturedOptions = options;
    return okResponse('Hola humano');
  };
  try {
    await sendMessageToMiniMax('test-key-1234567890', 'cat', [], 'hola');
  } finally {
    globalThis.fetch = prevFetch;
  }

  assert.equal(capturedUrl, MINIMAX_URL);
  assert.equal(capturedOptions.method, 'POST');
  assert.equal(capturedOptions.headers['Content-Type'], 'application/json');
  assert.equal(capturedOptions.headers['Authorization'], 'Bearer test-key-1234567890');
  assert.ok(capturedOptions.signal, 'debe pasar un AbortSignal');

  const body = JSON.parse(capturedOptions.body);
  assert.equal(body.model, 'MiniMax-M2.5');
  assert.equal(body.temperature, 0.7);
  assert.equal(body.messages[0].role, 'system');
  assert.match(body.messages[0].content, /Luna/);
  assert.equal(body.messages[body.messages.length - 1].role, 'user');
  assert.equal(body.messages[body.messages.length - 1].content, 'hola');
});

test('el system prompt cambia segun la mascota (cat vs dog)', async () => {
  let captured;
  const prevFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    captured = options;
    return okResponse('ok');
  };
  try {
    await sendMessageToMiniMax('test-key-1234567890', 'cat', [], 'a');
    const catBody = JSON.parse(captured.body);
    assert.match(catBody.messages[0].content, /Luna/);
    assert.doesNotMatch(catBody.messages[0].content, /Max/);

    await sendMessageToMiniMax('test-key-1234567890', 'dog', [], 'a');
    const dogBody = JSON.parse(captured.body);
    assert.match(dogBody.messages[0].content, /Max/);
    assert.doesNotMatch(dogBody.messages[0].content, /Luna/);
  } finally {
    globalThis.fetch = prevFetch;
  }
});

test('los system prompts mencionan los 6 intents validos (cat y dog)', async () => {
  const captured = [];
  const prevFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    captured.push(options.body);
    return okResponse('ok');
  };
  try {
    await sendMessageToMiniMax('test-key-1234567890', 'cat', [], 'a');
    await sendMessageToMiniMax('test-key-1234567890', 'dog', [], 'a');
  } finally {
    globalThis.fetch = prevFetch;
  }

  const catBody = JSON.parse(captured[0]);
  const dogBody = JSON.parse(captured[1]);
  const intents = ['approach', 'retreat', 'play', 'sleep', 'wander', 'stay'];
  for (const intent of intents) {
    assert.match(catBody.messages[0].content, new RegExp(intent, 'i'), `cat prompt missing ${intent}`);
    assert.match(dogBody.messages[0].content, new RegExp(intent, 'i'), `dog prompt missing ${intent}`);
  }
});

test('sanea el history: descarta roles invalidos, no-strings, slice a 6 y trunca a 4000', async () => {
  let captured;
  await withMockFetch(okResponse('ok'), async () => {
    const longContent = 'a'.repeat(5000);
    const dirtyHistory = [
      { role: 'system', content: 'no deberia pasar' },   // role invalido
      { role: 'user', content: 12345 },                   // content no es string
      { role: 'user', content: null },                    // null
      { role: 'user' },                                   // sin content
      { role: 'assistant', content: 'valido 1' },
      { role: 'user', content: 'valido 2' },
      { role: 'assistant', content: 'valido 3' },
      { role: 'user', content: 'valido 4' },
      { role: 'assistant', content: 'valido 5' },
      { role: 'user', content: 'valido 6' },
      { role: 'assistant', content: 'valido 7' },         // 7mo -> descartado por slice(-6)
      { role: 'user', content: longContent }              // trunca a 4000
    ];

    const prevFetch = globalThis.fetch;
    globalThis.fetch = async (_url, options) => {
      captured = options;
      return okResponse('ok');
    };
    try {
      await sendMessageToMiniMax('test-key-1234567890', 'cat', dirtyHistory, 'msg final');
    } finally {
      globalThis.fetch = prevFetch;
    }
  });

  const body = JSON.parse(captured.body);
  // system + 6 history + user final = 8
  assert.equal(body.messages.length, 8);
  // slice(-6) deja los ULTIMOS 6 validos: valido 3, valido 4, valido 5, valido 6, valido 7, longContent
  assert.equal(body.messages[1].content, 'valido 3');
  assert.equal(body.messages[2].content, 'valido 4');
  assert.equal(body.messages[6].content, 'a'.repeat(4000));
  // el user final
  assert.equal(body.messages[7].content, 'msg final');
  // ninguno de los mensajes de history debe tener role system
  const historyRoles = body.messages.slice(1, 7).map(m => m.role);
  assert.ok(historyRoles.every(r => r === 'user' || r === 'assistant'));
  // ninguno debe tener content que no sea string
  assert.ok(body.messages.slice(1, 7).every(m => typeof m.content === 'string'));
  // el mensaje de 5000 chars fue truncado a 4000
  const truncated = body.messages.find(m => m.content === 'a'.repeat(4000));
  assert.ok(truncated, 'debe existir un mensaje de 4000 a');
});

test('history no es un array -> lo trata como vacio', async () => {
  let captured;
  await withMockFetch(okResponse('ok'), async () => {
    const prevFetch = globalThis.fetch;
    globalThis.fetch = async (_url, options) => {
      captured = options;
      return okResponse('ok');
    };
    try {
      await sendMessageToMiniMax('test-key-1234567890', 'cat', 'no-es-array', 'hola');
    } finally {
      globalThis.fetch = prevFetch;
    }
  });
  const body = JSON.parse(captured.body);
  // system + user final = 2
  assert.equal(body.messages.length, 2);
});

test('lanza error con el mensaje del API cuando la respuesta no es OK', async () => {
  await withMockFetch(errorResponse(401, { error: { message: 'Invalid API key' } }), async () => {
    await assert.rejects(
      () => sendMessageToMiniMax('test-key-1234567890', 'cat', [], 'hola'),
      /Invalid API key/
    );
  });
});

test('lanza error generico si el body de error no es JSON', async () => {
  await withMockFetch(
    { ok: false, status: 500, json: async () => { throw new Error('not json'); } },
    async () => {
      await assert.rejects(
        () => sendMessageToMiniMax('test-key-1234567890', 'cat', [], 'hola'),
        /HTTP error 500/
      );
    }
  );
});

test('lanza error si la respuesta no tiene content usable', async () => {
  await withMockFetch(okResponse(''), async () => {
    await assert.rejects(
      () => sendMessageToMiniMax('test-key-1234567890', 'cat', [], 'hola'),
      /vac[íi]a o inesperada/
    );
  });

  await withMockFetch({ ok: true, json: async () => ({ choices: [{}] }) }, async () => {
    await assert.rejects(
      () => sendMessageToMiniMax('test-key-1234567890', 'cat', [], 'hola'),
      /vac[íi]a o inesperada/
    );
  });
});

test('convierte AbortError en mensaje amigable (timeout)', async () => {
  await withMockFetch(async () => {
    const error = new Error('aborted');
    error.name = 'AbortError';
    throw error;
  }, async () => {
    await assert.rejects(
      () => sendMessageToMiniMax('test-key-1234567890', 'cat', [], 'hola'),
      /tard[oó] demasiado/
    );
  });
});

// =====================================================================
// getQuickTip
// =====================================================================

test('getQuickTip sin API key retorna fallback del contexto', async () => {
  const catFocus = await getQuickTip('', 'cat', 'focus_start');
  const dogBreak = await getQuickTip('', 'dog', 'break_start');
  assert.equal(catFocus, getFallbackTip('cat', 'focus_start'));
  assert.equal(dogBreak, getFallbackTip('dog', 'break_start'));
});

test('getQuickTip con API key construye el prompt segun el contexto', async () => {
  let captured;
  await withMockFetch(okResponse('a darle!'), async () => {
    const prevFetch = globalThis.fetch;
    globalThis.fetch = async (_url, options) => {
      captured = options;
      return okResponse('a darle!');
    };
    try {
      const tip = await getQuickTip('test-key-1234567890', 'dog', 'break_start');
      assert.equal(tip, 'a darle!');
    } finally {
      globalThis.fetch = prevFetch;
    }
  });
  const body = JSON.parse(captured.body);
  const userMsg = body.messages[body.messages.length - 1];
  assert.match(userMsg.content, /descanso/i);
});

test('getQuickTip con context desconocido usa el prompt generico', async () => {
  let captured;
  await withMockFetch(okResponse('consejo generico'), async () => {
    const prevFetch = globalThis.fetch;
    globalThis.fetch = async (_url, options) => {
      captured = options;
      return okResponse('consejo generico');
    };
    try {
      const tip = await getQuickTip('test-key-1234567890', 'cat', 'cualquier-otro');
      assert.equal(tip, 'consejo generico');
    } finally {
      globalThis.fetch = prevFetch;
    }
  });
  const body = JSON.parse(captured.body);
  const userMsg = body.messages[body.messages.length - 1];
  assert.match(userMsg.content, /productividad|motivacion/i);
});

test('getQuickTip con error de API retorna fallback en vez de tirar', async () => {
  await withMockFetch(errorResponse(429, { error: { message: 'rate limit' } }), async () => {
    const tip = await getQuickTip('test-key-1234567890', 'cat', 'work_tip');
    assert.equal(tip, getFallbackTip('cat', 'work_tip'));
  });
});

// =====================================================================
// getFallbackTip
// =====================================================================

test('getFallbackTip retorna tips distintos por mascota y contexto', () => {
  const tips = new Set([
    getFallbackTip('cat', 'focus_start'),
    getFallbackTip('cat', 'break_start'),
    getFallbackTip('cat', 'work_tip'),
    getFallbackTip('dog', 'focus_start'),
    getFallbackTip('dog', 'break_start'),
    getFallbackTip('dog', 'work_tip')
  ]);
  // 6 entradas unicas
  assert.equal(tips.size, 6);
});

test('los tips de gato contienen marcadores gatunos, los de perro perrunos', () => {
  assert.match(getFallbackTip('cat', 'focus_start'), /miau|ronronea|bosteza/i);
  assert.match(getFallbackTip('dog', 'break_start'), /guau|cola/i);
});

test('getFallbackTip con context desconocido retorna mensaje generico', () => {
  const tip = getFallbackTip('cat', 'random_context');
  assert.match(tip, /trabajar|trabajo/i);
});
