'use strict';

const MINIMAX_BASE_URL = 'https://api.minimax.io/v1';
const DEFAULT_MODEL = 'MiniMax-M3';
const REQUEST_TIMEOUT_MS = 20000; // un poco menos que chat, el extractor es chico

/**
 * Memory extractor — extrae 0-1 recuerdos de un mensaje del usuario.
 *
 * Diseno:
 *   - Llama al M3 con un system prompt dedicado que pide SOLO JSON.
 *   - El JSON tiene formato: { "memory": "texto" } o { "memory": null }
 *   - La funcion pura parseExtractorResponse es testeable sin fetch.
 *   - La funcion extractMemoryFromMessage hace la llamada real (en main process).
 *
 * Por que no usar la personalidad de la mascota? Porque el extractor debe ser
 * neutro y enfocado, no responder al usuario ni comentar.
 *
 * Trade-off: 1 llamada extra al LLM por cada mensaje del user (~200 tokens).
 * Para usuarios activos (20 chats/dia) son ~4000 tokens/dia. Aceptable.
 * Si se quiere optimizar: solo extraer cada Nth mensaje o solo si el
 * mensaje tiene keywords (nombre, lugar, etc). Out of scope para v1.
 */

const EXTRACTOR_SYSTEM_PROMPT = `
FORMATO OBLIGATORIO: Responde UNICAMENTE con un objeto JSON valido, sin texto antes ni despues, sin markdown, sin explicaciones.
Si necesitas pensar, usa <think>...</think> en una linea ANTES del JSON.

Tu unica tarea es decidir si el mensaje del usuario contiene un HECHO MEMORABLE que valga la pena recordar entre sesiones para personalizar futuras conversaciones.

Estructura del JSON:
{ "memory": "<texto corto en espanol, max 1-2 oraciones, o null>" }

Que SI es un recuerdo:
- Datos personales: "El usuario se llama Jorge", "Vive en Bogota"
- Profesion o actividades: "Trabaja como developer", "Estudia diseno"
- Preferencias declaradas: "Le gusta el cafe", "Odia las reuniones largas"
- Hobbies o intereses: "Toca guitarra", "Juega ajedrez"
- Relaciones o mascotas: "Tiene un gato llamado Michi", "Su pareja se llama Ana"
- Eventos importantes mencionados: "Cumple anos el 15 de marzo", "Empezo un nuevo proyecto"
- Metas o proyectos: "Esta escribiendo una novela", "Quiere aprender Rust"

Que NO es un recuerdo (responder { "memory": null }):
- Preguntas al asistente: "Que hora es", "Como se hace X"
- Conversacion trivial: "Hola", "Como estas", "Gracias"
- Estados temporales: "Tengo hambre", "Estoy cansado"
- Opiniones del momento: "Este cafe esta rico" (no es dato durable)
- Pedidos de accion: "Recordame comprar leche" (es para el usuario, no para vos)
- Mensajes muy cortos sin informacion durable

Reglas:
- Si hay info memorable, escribe el recuerdo en 3ra persona: "El usuario se llama X", "Le gusta Y"
- Maximo 1 recuerdo por mensaje
- Si no estas seguro, es null (es mejor no recordar algo dudoso que inventar)
- NO inventes informacion que no este en el mensaje
- NO respondas al usuario, no comentes, no opines
`.trim();

/**
 * Parsea la respuesta cruda del LLM y extrae {text} o null.
 * Pure function: testeable sin fetch.
 *
 * Maneja:
 * - Think tags <think>...</think> que el M3 puede agregar
 * - Markdown ```json ... ```
 * - JSON puro
 * - Texto que dice "null" o "ninguno"
 * - Garbage que no se puede parsear → retorna null
 *
 * @param {string} rawText
 * @returns {{text: string}|null} objeto con text, o null si no hay recuerdo
 */
function parseExtractorResponse(rawText) {
  if (typeof rawText !== 'string') return null;
  let cleaned = rawText.trim();

  // 1. Strip think tags (si el M3 penso antes de responder)
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Strip markdown code blocks
  cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

  // 3. Intentar parsear como JSON
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (_e) {
    // Fallback: buscar { "memory": ... } en el texto
    const match = cleaned.match(/\{[\s\S]*?"memory"[\s\S]*?\}/);
    if (!match) return null;
    try { parsed = JSON.parse(match[0]); }
    catch (_e2) { return null; }
  }

  // 4. Validar estructura
  if (!parsed || typeof parsed !== 'object') return null;
  if (!('memory' in parsed)) return null;
  if (parsed.memory === null || parsed.memory === undefined) return null;
  if (typeof parsed.memory !== 'string') return null;
  const text = parsed.memory.trim();
  if (text.length === 0) return null;
  if (text.length > 500) return null; // limite sano

  return { text };
}

/**
 * Llama al LLM y extrae el recuerdo del mensaje del usuario.
 * En main process. Retorna {text} si hay recuerdo, o null si no.
 *
 * @param {string} apiKey
 * @param {string} userMessage
 * @param {string} [recentContext=''] - ultimos 1-2 mensajes del chat (opcional)
 * @returns {Promise<{text: string}|null>}
 */
async function extractMemoryFromMessage(apiKey, userMessage, recentContext = '') {
  if (typeof apiKey !== 'string' || apiKey.length === 0) {
    return null;
  }
  if (typeof userMessage !== 'string' || userMessage.trim().length === 0) {
    return null;
  }

  const userContent = recentContext && recentContext.trim().length > 0
    ? `Contexto reciente:\n${recentContext.trim().slice(0, 800)}\n\nMensaje actual del usuario:\n${userMessage.trim().slice(0, 2000)}`
    : userMessage.trim().slice(0, 2000);

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
        messages: [
          { role: 'system', content: EXTRACTOR_SYSTEM_PROMPT },
          { role: 'user', content: userContent }
        ],
        temperature: 0.2 // bajo: queremos consistencia, no creatividad
      })
    });
    if (!response.ok) {
      // 401, 429, 500 → no es culpa nuestra, retornar null silencioso
      return null;
    }
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== 'string') return null;
    return parseExtractorResponse(text);
  } catch (_error) {
    // Network error, timeout, etc → no es culpa del user, retornar null
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  parseExtractorResponse,
  extractMemoryFromMessage,
  EXTRACTOR_SYSTEM_PROMPT
};
