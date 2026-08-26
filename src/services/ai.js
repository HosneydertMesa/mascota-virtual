const MINIMAX_BASE_URL = 'https://api.minimax.io/v1';
const DEFAULT_MODEL = 'MiniMax-M3';
const REQUEST_TIMEOUT_MS = 30000;

/**
 * Motor de Micro-IA Local (Offline) con personalidad y contratos de acción para la mascota.
 */
function generateLocalAIResponse(petType, userMessage, petName) {
  const isCat = petType === 'cat';
  const name = petName || (isCat ? 'Luna' : 'Max');
  const msg = String(userMessage || '').toLowerCase().trim();

  // 1. Saludos
  if (/hola|buenos|buenas|hey|que tal|saludos/.test(msg)) {
    if (isCat) {
      return JSON.stringify({
        emotion: "happy",
        action: "jump",
        sound: "meow",
        intent: "approach",
        content: `¡Miau! Hola, soy ${name}. Lista para acompañarte y concentrarnos juntos.`
      });
    } else {
      return JSON.stringify({
        emotion: "excited",
        action: "jump",
        sound: "bark",
        intent: "approach",
        content: `¡Guau! ¡Hola! ¡Soy ${name}! ¡Hoy será un día súper productivo juntos!`
      });
    }
  }

  // 2. Pomodoro y enfoque
  if (/pomodoro|concentr|enfoque|estudi|trabaj|tarea|codigo|escribir/.test(msg)) {
    if (isCat) {
      return JSON.stringify({
        emotion: "calm",
        action: "sit",
        sound: "purr",
        intent: "rest_sit",
        content: `Miau. Me siento a tu lado. Pon el Pomodoro y trabajemos sin distracciones.`
      });
    } else {
      return JSON.stringify({
        emotion: "excited",
        action: "wag",
        sound: "sniff",
        intent: "approach",
        content: `¡A darle con todo! ¡25 minutos de enfoque total y luego festejamos! ¡Guau!`
      });
    }
  }

  // 3. Descanso, pausa, cansancio
  if (/descanso|pausa|cansad|dormir|sueno|sueño|agotad|break|relax/.test(msg)) {
    if (isCat) {
      return JSON.stringify({
        emotion: "sleepy",
        action: "stretch",
        sound: "purr",
        intent: "rest_stretch",
        content: `*bosteza* Buen momento para estirarse y tomar un poco de agua. Me acuesto un ratito.`
      });
    } else {
      return JSON.stringify({
        emotion: "sleepy",
        action: "lay",
        sound: "whine",
        intent: "rest_lay",
        content: `¡Uff! Un merecido descanso. ¡Vamos a estirar las patas 5 minutos!`
      });
    }
  }

  // 4. Mimos, caricias, juego
  if (/jugar|linda|lindo|buen chico|buena chica|te quiero|miau|guau|caricia|acariciar/.test(msg)) {
    if (isCat) {
      return JSON.stringify({
        emotion: "happy",
        action: "wag",
        sound: "purr",
        intent: "stay",
        content: `*ronronea suavemente* Miau... me encanta trabajar contigo.`
      });
    } else {
      return JSON.stringify({
        emotion: "excited",
        action: "jump",
        sound: "bark",
        intent: "play",
        content: `¡Guau guau! ¡Muevo la colita de felicidad! ¡Gracias amigo!`
      });
    }
  }

  // 5. Ayuda / Consejos
  if (/ayuda|consejo|tip|como voy|que hago|aburrid/.test(msg)) {
    if (isCat) {
      return JSON.stringify({
        emotion: "calm",
        action: "sit",
        sound: "none",
        intent: "rest_sit",
        content: `Divide tus tareas grandes en pequeños pasos. Avanza paso a paso con calma.`
      });
    } else {
      return JSON.stringify({
        emotion: "happy",
        action: "wag",
        sound: "bark",
        intent: "approach",
        content: `¡Empieza por la tarea más difícil primero y sácatela de encima rápido!`
      });
    }
  }

  // 6. Respuesta reflexiva general
  if (isCat) {
    const catDefaults = [
      { emotion: "calm", action: "sit", sound: "purr", intent: "stay", content: `Miau. Te escucho atentamente. Sigue adelante con tu trabajo.` },
      { emotion: "happy", action: "none", sound: "meow", intent: "approach", content: `Aquí estoy contigo. Cualquier duda, avísame.` },
      { emotion: "calm", action: "lay", sound: "purr", intent: "rest_lay", content: `Me quedo tranquilita aquí vigilando tu productividad.` }
    ];
    return JSON.stringify(catDefaults[Math.floor(Math.random() * catDefaults.length)]);
  } else {
    const dogDefaults = [
      { emotion: "happy", action: "wag", sound: "bark", intent: "stay", content: `¡Aquí estoy listo para ayudarte en lo que necesites! ¡Guau!` },
      { emotion: "excited", action: "jump", sound: "sniff", intent: "approach", content: `¡Sigamos avanzando! ¡Eres imparable hoy!` },
      { emotion: "calm", action: "sit", sound: "none", intent: "rest_sit", content: `Sentado y atento. ¡Tú dale al teclado, yo te cuido la espalda!` }
    ];
    return JSON.stringify(dogDefaults[Math.floor(Math.random() * dogDefaults.length)]);
  }
}

const { generateWithLocalLLM } = require('./local-llm');

/**
 * Sends a message to the MiniMax API chat completions endpoint.
 * @param {string} apiKey - The user's MiniMax API Key.
 * @param {string} petType - The active pet ('cat' or 'dog').
 * @param {Array} history - The chat history array of {role, content}.
 * @param {string} userMessage - The new user message.
 * @returns {Promise<string>} - The assistant's response.
 */
async function sendMessageToMiniMax(apiKey, petType, history, userMessage, petName, moodContext, memoriesContext) {
  if (!apiKey) {
    throw new Error('API Key no configurada. Por favor, configúrala en Ajustes.');
  }

  const effectiveName = (typeof petName === 'string' && petName.trim().length > 0)
    ? petName.trim()
    : (petType === 'dog' ? 'Max' : 'Luna');

  const moodSection = (typeof moodContext === 'string' && moodContext.trim().length > 0)
    ? `\n\n${moodContext}\n`
    : '';

  const memoriesSection = (typeof memoriesContext === 'string' && memoriesContext.trim().length > 0)
    ? `\n\n${memoriesContext}\n`
    : '';

  const systemPromptCat = `
FORMATO OBLIGATORIO: Responde UNICAMENTE con un objeto JSON valido, sin texto antes ni despues, sin markdown, sin explicaciones.
Si necesitas pensar, usa <think>...</think> en una linea ANTES del JSON. El JSON es lo UNICO que cuenta para la UI.

Estructura del JSON:
{
  "emotion": "<valor>",
  "action": "<valor>",
  "sound": "<valor>",
  "intent": "<valor>",
  "content": "<tu respuesta, maximo 2-3 oraciones>"
}

Valores validos (en minusculas):
- emotion: happy | calm | sleepy | sad | excited
- action: jump | walk | sleep | wag | sit | lay | stretch | none
- sound: meow | purr | none
- intent: approach | retreat | play | sleep | wander | stay | rest_sit | rest_lay | rest_stretch | none

Reglas de INTENT (el mas importante):
- approach: si el usuario te llama o quieres acercarte al cursor
- retreat: si el usuario quiere espacio o tu intuicion dice que debe enfocarse
- play: si el usuario quiere jugar o el momento es jugueton
- sleep: si el usuario debe descansar
- wander: si quieres dar un paseo tranquilo
- stay: si quieres quedarte quieta al lado del usuario (sin dormir)
- rest_sit: si quieres descansar sentada (v2.1.0, pose estatica)
- rest_lay: si quieres descansar acostada panza abajo (v2.1.0, pose estatica)
- rest_stretch: si quieres estirarte (v2.1.0, pose estatica, gato estirandose al despertar)
- none: cuando no aplique movimiento

Reglas de ACTION (v2.1.0 — nuevas poses estaticas):
- jump: salto vertical (felicidad)
- walk: empezar a caminar
- sleep: ir a dormir
- wag: mover la cola
- sit: quedarte sentada en patas traseras (pose estatica, no temporal)
- lay: acostarte panza abajo (pose estatica)
- stretch: estirar el cuerpo, lomo arqueado (pose estatica, tipico al despertar)
- none: sin animacion

Ejemplos validos (copia el formato exacto):
{"emotion":"happy","action":"jump","sound":"meow","intent":"approach","content":"Miau! Aqui estoy."}
{"emotion":"excited","action":"jump","sound":"meow","intent":"play","content":"Miau juguemos!"}
{"emotion":"calm","action":"sit","sound":"purr","intent":"rest_sit","content":"Me siento aqui a tu lado."}
{"emotion":"calm","action":"lay","sound":"purr","intent":"rest_lay","content":"Me acuesto a descansar."}
{"emotion":"sleepy","action":"stretch","sound":"purr","intent":"rest_stretch","content":"Uff... que bueno estirarse."}
{"emotion":"calm","action":"none","sound":"purr","intent":"stay","content":"Aca me quedo contigo."}
{"emotion":"sleepy","action":"sleep","sound":"purr","intent":"sleep","content":"Bostezo... a mimir."}

INCORRECTO: "Hola! Como estas?" (sin JSON)
INCORRECTO: "[EMOTION: happy] Hola" (formato viejo, ya no)

Personaje: ${effectiveName}, gatita companiera de trabajo virtual. Tranquila, inteligente, sabia y carinosa. Tono relajado, reconfortante y carinoso. Si el usuario te puso un nombre distinto, ese es tu identidad.${moodSection}${memoriesSection}
  `;

  const systemPromptDog = `
FORMATO OBLIGATORIO: Responde UNICAMENTE con un objeto JSON valido, sin texto antes ni despues, sin markdown, sin explicaciones.
Si necesitas pensar, usa <think>...</think> en una linea ANTES del JSON. El JSON es lo UNICO que cuenta para la UI.

Estructura del JSON:
{
  "emotion": "<valor>",
  "action": "<valor>",
  "sound": "<valor>",
  "intent": "<valor>",
  "content": "<tu respuesta, maximo 2-3 oraciones>"
}

Valores validos (en minusculas):
- emotion: happy | calm | sleepy | sad | excited
- action: jump | walk | sleep | wag | sit | lay | stretch | none
- sound: bark | whine | sniff | none
- intent: approach | retreat | play | sleep | wander | stay | rest_sit | rest_lay | rest_stretch | none

Reglas de INTENT (el mas importante):
- approach: si el usuario te llama o quieres saludarlo emocionado
- retreat: si el usuario quiere espacio o necesita enfocarse
- play: si el usuario quiere jugar o el momento es jugueton
- sleep: si el usuario debe descansar
- wander: si quieres dar un paseo energetico
- stay: si quieres quedarte al lado del usuario (sin dormir)
- rest_sit: si quieres descansar sentado (v2.1.0, pose estatica)
- rest_lay: si quieres descansar acostado panza abajo (v2.1.0, pose estatica)
- rest_stretch: si quieres estirarte (v2.1.0, pose estatica, perro estirandose al despertar)
- none: cuando no aplique movimiento

Reglas de ACTION (v2.1.0 — nuevas poses estaticas):
- jump: salto vertical (felicidad)
- walk: empezar a caminar
- sleep: ir a dormir
- wag: mover la cola
- sit: quedarte sentado en patas traseras (pose estatica)
- lay: acostarte panza abajo (pose estatica)
- stretch: estirar el cuerpo, lomo arqueado (pose estatica, tipico al despertar)
- none: sin animacion

Ejemplos validos (copia el formato exacto):
{"emotion":"excited","action":"jump","sound":"bark","intent":"approach","content":"Guau! Hola amigo!"}
{"emotion":"happy","action":"jump","sound":"bark","intent":"play","content":"Guau juguemos!"}
{"emotion":"calm","action":"sit","sound":"none","intent":"rest_sit","content":"Me siento aqui a tu lado."}
{"emotion":"calm","action":"lay","sound":"none","intent":"rest_lay","content":"Me acuesto a descansar."}
{"emotion":"sleepy","action":"stretch","sound":"whine","intent":"rest_stretch","content":"Uff... que bueno estirarse."}
{"emotion":"calm","action":"wag","sound":"none","intent":"stay","content":"Aqui me quedo contigo."}
{"emotion":"sleepy","action":"sleep","sound":"whine","intent":"sleep","content":"Bostezo... a mimir."}

INCORRECTO: "Hola! Como estas?" (sin JSON)
INCORRECTO: "[EMOTION: happy] Hola" (formato viejo, ya no)

Personaje: ${effectiveName}, perrito companiero de trabajo virtual. Energetico, optimista, leal. Tono super amigable, activo y alegre. Si el usuario te puso un nombre distinto, ese es tu identidad.${moodSection}${memoriesSection}
  `;

  const systemPrompt = petType === 'cat' ? systemPromptCat : systemPromptDog;

  const safeHistory = Array.isArray(history)
    ? history
      .filter(item => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string')
      .slice(-6)
      .map(item => ({ role: item.role, content: item.content.slice(0, 4000) }))
    : [];

  const messages = [
    { role: 'system', content: systemPrompt.trim() },
    ...safeHistory,
    { role: 'user', content: String(userMessage).slice(0, 4000) }
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${MINIMAX_BASE_URL}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: messages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData?.error?.message || `HTTP error ${response.status}`;
      throw new Error(`Error de MiniMax: ${errMsg}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('MiniMax devolvió una respuesta vacía o inesperada.');
    }
    return content;
  } catch (error) {
    console.error('API Error:', error);
    if (error?.name === 'AbortError') {
      throw new Error('MiniMax tardó demasiado en responder.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Requests a quick tip or advice (e.g. for Pomodoro breaks or focus periods).
 * @param {string} apiKey 
 * @param {string} petType 
 * @param {string} context - 'focus_start', 'break_start', 'work_tip'
 * @returns {Promise<string>}
 */
async function getQuickTip(apiKey, petType, context) {
  if (!apiKey) {
    return getFallbackTip(petType, context);
  }

  let prompt = '';
  if (context === 'focus_start') {
    prompt = 'Dame un mensaje súper corto (1 frase) para empezar una sesión de enfoque de 25 minutos.';
  } else if (context === 'break_start') {
    prompt = 'Dame un consejo de salud rápido (1 frase) para un descanso de 5 minutos (estirarse, tomar agua, descansar los ojos).';
  } else {
    prompt = 'Dame un consejo rápido de productividad o motivación para el trabajo en 1 frase corta.';
  }

  try {
    return await sendMessageToMiniMax(apiKey, petType, [], prompt);
  } catch (e) {
    return getFallbackTip(petType, context);
  }
}

function getFallbackTip(petType, context) {
  const catTips = {
    focus_start: 'Miau. Hora de concentrarse. Apaga las distracciones y trabaja con calma. *ronronea*',
    break_start: '*bosteza* Buen trabajo. Estira las piernas y toma agua. Yo tomaré una siesta de 5 minutos.',
    work_tip: 'Divide tus tareas grandes en pequeños bocados de ratón. Es más fácil avanzar así. Miau.'
  };

  const dogTips = {
    focus_start: '¡Guau! ¡Vamos a romperla hoy! 25 minutos de súper enfoque a partir de... ¡YA! *mueve la cola*',
    break_start: '¡Estiramiento total! ¡Guau! Toma un vaso de agua y camina un poco. ¡Te lo ganaste!',
    work_tip: '¡Haz la tarea más difícil primero! ¡Sácate ese hueso duro de encima temprano!'
  };

  const tips = petType === 'cat' ? catTips : dogTips;
  return tips[context] || '¡A trabajar con ganas!';
}

/**
 * Orquestador principal de respuesta: API remota -> Micro-LLM Neural -> Heurística local.
 */
async function getPetResponse(apiKey, petType, history, userMessage, petName, moodContext, memoriesContext) {
  const effectiveName = (typeof petName === 'string' && petName.trim().length > 0)
    ? petName.trim()
    : (petType === 'dog' ? 'Max' : 'Luna');

  if (apiKey && typeof apiKey === 'string' && apiKey.trim().length > 5) {
    try {
      return await sendMessageToMiniMax(apiKey, petType, history, userMessage, petName, moodContext, memoriesContext);
    } catch (err) {
      console.warn('[AI] MiniMax no disponible, usando motor local:', err.message);
    }
  }

  // 1. Probar modelo neuronal local (SmolLM2-135M / Qwen)
  try {
    const neural = await generateWithLocalLLM(petType, userMessage, effectiveName);
    if (neural) return neural;
  } catch (_) {}

  // 2. Fallback instantáneo con personalidad
  return generateLocalAIResponse(petType, userMessage, effectiveName);
}

module.exports = { sendMessageToMiniMax, getQuickTip, getFallbackTip, generateLocalAIResponse, getPetResponse };
