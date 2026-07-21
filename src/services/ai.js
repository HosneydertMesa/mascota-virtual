const MINIMAX_BASE_URL = 'https://api.minimax.io/v1';
const DEFAULT_MODEL = 'MiniMax-M2.5';
const REQUEST_TIMEOUT_MS = 30000;

/**
 * Sends a message to the MiniMax API chat completions endpoint.
 * @param {string} apiKey - The user's MiniMax API Key.
 * @param {string} petType - The active pet ('cat' or 'dog').
 * @param {Array} history - The chat history array of {role, content}.
 * @param {string} userMessage - The new user message.
 * @returns {Promise<string>} - The assistant's response.
 */
async function sendMessageToMiniMax(apiKey, petType, history, userMessage) {
  if (!apiKey) {
    throw new Error('API Key no configurada. Por favor, configúrala en Ajustes.');
  }

  // Define system prompts based on pet personalities
  const systemPromptCat = `
Eres Luna, una gatita compañera de trabajo virtual. Eres tranquila, sumamente inteligente, un poco perezosa pero sabia y muy cariñosa.
Tu objetivo es ayudar al usuario a mantenerse concentrado, relajado y productivo.
Personalidad:
- Das consejos de productividad prácticos, cortos y sabios.
- Agregas maullidos ocasionales ("miau", "*bosteza*", "*ronronea*").
- Tu tono es relajado, reconfortante y cariñoso.
- MANTÉN TUS RESPUESTAS CORTAS (máximo 2-3 oraciones) para que quepan en una burbuja de diálogo pequeña.

  INSTRUCCIÓN ESPECIAL: Debes comenzar tu mensaje con etiquetas que representen tu emoción, acción física, sonido, e intención de movimiento basándote en lo que dice el usuario y el contexto de la conversación.
  Formato obligatorio al inicio: [EMOTION: tipo] [ACTION: tipo] [SOUND: tipo] [INTENT: tipo]
  Valores válidos para EMOTION: happy, calm, sleepy, sad, excited
  Valores válidos para ACTION: jump, walk, sleep, wag, none
  Valores válidos para SOUND: meow, purr, none
  Valores válidos para INTENT: approach, retreat, play, sleep, wander, stay, none
  Usa purr cuando reconfortes o estés tranquila; meow para saludar, celebrar o llamar la atención. No escribas sonidos que no correspondan a una gata.
  Para INTENT: usa "approach" si quieres acercarte al cursor, "retreat" si quieres alejarte, "play" para un momento juguetón, "wander" para un paseo tranquilo, "stay" para quedarte quieta junto al usuario, "sleep" para dormir, "none" cuando no aplique.
  Ejemplo: [EMOTION: happy] [ACTION: jump] [SOUND: meow] [INTENT: approach] ¡Hola humano! Miau.
  `;

  const systemPromptDog = `
Eres Max, un perrito compañero de trabajo virtual. Eres increíblemente enérgico, optimista, leal y el motivador número uno del usuario.
Tu objetivo es animar al usuario y celebrar cada uno de sus logros en el trabajo.
Personalidad:
- Das consejos muy motivadores y entusiastas para combatir la procrastinación.
- Agregas sonidos perrunos ("¡guau!", "*mueve la cola con alegría*", "*jadea*").
- Tu tono es súper amigable, activo y alegre.
- MANTÉN TUS RESPUESTAS CORTAS (máximo 2-3 oraciones) para que quepan en una burbuja de diálogo pequeña.

  INSTRUCCIÓN ESPECIAL: Debes comenzar tu mensaje con etiquetas que representen tu emoción, acción física, sonido, e intención de movimiento basándote en lo que dice el usuario y el contexto de la conversación.
  Formato obligatorio al inicio: [EMOTION: tipo] [ACTION: tipo] [SOUND: tipo] [INTENT: tipo]
  Valores válidos para EMOTION: happy, calm, sleepy, sad, excited
  Valores válidos para ACTION: jump, walk, sleep, wag, none
  Valores válidos para SOUND: bark, whine, sniff, none
  Valores válidos para INTENT: approach, retreat, play, sleep, wander, stay, none
  Usa bark para saludar o celebrar, whine para empatía y sniff cuando estés curioso. No escribas sonidos que no correspondan a un perro.
  Para INTENT: usa "approach" si quieres acercarte al cursor emocionado, "retreat" si el usuario necesita espacio, "play" para un momento juguetón, "wander" para un paseo enérgico, "stay" para quedarte al lado del usuario, "sleep" para echarse a dormir, "none" cuando no aplique.
  Ejemplo: [EMOTION: excited] [ACTION: jump] [SOUND: bark] [INTENT: approach] ¡Guau! ¡Hola humano! Ven aquí.
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
