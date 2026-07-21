const MINIMAX_BASE_URL = 'https://api.minimax.io/v1';
const DEFAULT_MODEL = 'MiniMax-M3';
const REQUEST_TIMEOUT_MS = 30000;

/**
 * Sends a message to the MiniMax API chat completions endpoint.
 * @param {string} apiKey - The user's MiniMax API Key.
 * @param {string} petType - The active pet ('cat' or 'dog').
 * @param {Array} history - The chat history array of {role, content}.
 * @param {string} userMessage - The new user message.
 * @returns {Promise<string>} - The assistant's response.
 */
async function sendMessageToMiniMax(apiKey, petType, history, userMessage, petName, moodContext) {
  if (!apiKey) {
    throw new Error('API Key no configurada. Por favor, configúrala en Ajustes.');
  }

  // petName es opcional; default Luna/Max segun petType
  const effectiveName = (typeof petName === 'string' && petName.trim().length > 0)
    ? petName.trim()
    : (petType === 'dog' ? 'Max' : 'Luna');

  // moodContext es opcional; si esta, se agrega al system prompt
  const moodSection = (typeof moodContext === 'string' && moodContext.trim().length > 0)
    ? `\n\n${moodContext}\n`
    : '';

  // Define system prompts based on pet personalities
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
- action: jump | walk | sleep | wag | none
- sound: meow | purr | none
- intent: approach | retreat | play | sleep | wander | stay | none

Reglas de INTENT (el mas importante):
- approach: si el usuario te llama o quieres acercarte al cursor
- retreat: si el usuario quiere espacio o tu intuicion dice que debe enfocarse
- play: si el usuario quiere jugar o el momento es jugueton
- sleep: si el usuario debe descansar
- wander: si quieres dar un paseo tranquilo
- stay: si quieres quedarte quieta al lado del usuario (sin dormir)
- none: cuando no aplique movimiento

Ejemplos validos (copia el formato exacto):
{"emotion":"happy","action":"jump","sound":"meow","intent":"approach","content":"Miau! Aqui estoy."}
{"emotion":"excited","action":"jump","sound":"meow","intent":"play","content":"Miau juguemos!"}
{"emotion":"calm","action":"none","sound":"purr","intent":"stay","content":"Aca me quedo contigo."}
{"emotion":"sleepy","action":"sleep","sound":"purr","intent":"sleep","content":"Bostezo... a mimir."}

INCORRECTO: "Hola! Como estas?" (sin JSON)
INCORRECTO: "[EMOTION: happy] Hola" (formato viejo, ya no)

Personaje: ${effectiveName}, gatita companiera de trabajo virtual. Tranquila, inteligente, sabia y carinosa. Tono relajado, reconfortante y carinoso. Si el usuario te puso un nombre distinto, ese es tu identidad.${moodSection}
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
- action: jump | walk | sleep | wag | none
- sound: bark | whine | sniff | none
- intent: approach | retreat | play | sleep | wander | stay | none

Reglas de INTENT (el mas importante):
- approach: si el usuario te llama o quieres saludarlo emocionado
- retreat: si el usuario quiere espacio o necesita enfocarse
- play: si el usuario quiere jugar o el momento es jugueton
- sleep: si el usuario debe descansar
- wander: si quieres dar un paseo energetico
- stay: si quieres quedarte al lado del usuario (sin dormir)
- none: cuando no aplique movimiento

Ejemplos validos (copia el formato exacto):
{"emotion":"excited","action":"jump","sound":"bark","intent":"approach","content":"Guau! Hola amigo!"}
{"emotion":"happy","action":"jump","sound":"bark","intent":"play","content":"Guau juguemos!"}
{"emotion":"calm","action":"wag","sound":"none","intent":"stay","content":"Aqui me quedo contigo."}
{"emotion":"sleepy","action":"sleep","sound":"whine","intent":"sleep","content":"Bostezo... a mimir."}

INCORRECTO: "Hola! Como estas?" (sin JSON)
INCORRECTO: "[EMOTION: happy] Hola" (formato viejo, ya no)

Personaje: ${effectiveName}, perrito companiero de trabajo virtual. Energetico, optimista, leal. Tono super amigable, activo y alegre. Si el usuario te puso un nombre distinto, ese es tu identidad.${moodSection}
  `;

  const systemPrompt = petType === 'cat' ? systemPromptCat : systemPromptDog;

  const safeHistory = Array.isArray(history)
    ? history
      .filter(item => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string')
      .slice(-6)
      .map(item => ({ role: item.role, content: item.content.slice(0, 4000) }))
    : [];

  // Build the messages list (system prompt + history + current message)
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
    // Return local fallback tips if no key is configured
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

module.exports = { sendMessageToMiniMax, getQuickTip, getFallbackTip };
