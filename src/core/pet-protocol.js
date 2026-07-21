'use strict';

(function (root) {
  // Pet protocol: parser de respuestas de la IA + allow-lists compartidos.
  // IIFE para que los consts internos (ALLOWED_*, etc.) no contaminen el
  // scope global del browser. Usado por los dos renderers (pet + dashboard)
  // y testeable desde Node via module.exports.

  const ALLOWED_EMOTIONS = new Set(['happy', 'calm', 'sleepy', 'sad', 'excited']);
  const ALLOWED_ACTIONS = new Set(['jump', 'walk', 'sleep', 'wag', 'none']);
  const ALLOWED_SOUNDS = {
    cat: new Set(['meow', 'purr', 'none']),
    dog: new Set(['bark', 'whine', 'sniff', 'none'])
  };
  const ALLOWED_INTENTS = new Set(['approach', 'retreat', 'play', 'sleep', 'wander', 'stay', 'none']);

  function allowedSoundsFor(petType) {
    return ALLOWED_SOUNDS[petType] || new Set(['none']);
  }

  // Extrae el thinking tag si existe.
  function extractThinking(content) {
    const thinkMatch = content.match(/<think>([\s\S]*?)(?:<\/think>|$)/i);
    if (!thinkMatch) return { thinking: '', content };
    return {
      thinking: thinkMatch[1].trim(),
      content: content.replace(thinkMatch[0], '').trim()
    };
  }

  // Intenta extraer un JSON object. Acepta:
  // - JSON puro: {"emotion":"happy",...}
  // - JSON en markdown: ```json\n{...}\n```
  // - JSON con prosa alrededor
  // Devuelve { parsed, error }.
  function tryParseJsonReply(content) {
    const cleaned = String(content || '')
      .replace(/```json\s*/gi, '')
      .replace(/```/g, '')
      .trim();

    // Regex estricto: JSON object con hasta 1 nivel de anidacion.
    const jsonRegex = /\{(?:[^{}]|\{[^{}]*\})*\}/g;
    const matches = cleaned.match(jsonRegex) || [];

    for (const candidate of matches) {
      try {
        const parsed = JSON.parse(candidate);
        if (parsed && typeof parsed === 'object') return { parsed, error: null };
      } catch (_e) {
        // intenta el siguiente match
      }
    }
    return {
      parsed: null,
      error: matches.length > 0 ? 'JSON found but parse failed' : 'no JSON object in response'
    };
  }

  // Parser principal: intenta JSON, fallback a tags viejos, fallback a texto libre.
  function parsePetReply(reply, petType) {
    petType = petType === 'dog' ? 'dog' : 'cat';
    const allowedSounds = allowedSoundsFor(petType);

    const { content, thinking } = extractThinking(String(reply || ''));

    // Camino primario: JSON
    const { parsed, error: jsonError } = tryParseJsonReply(content);
    if (parsed) {
      return {
        thinking,
        content: typeof parsed.content === 'string' ? parsed.content.trim() : '',
        emotion: ALLOWED_EMOTIONS.has(parsed.emotion) ? parsed.emotion : 'happy',
        action: ALLOWED_ACTIONS.has(parsed.action) ? parsed.action : 'none',
        sound: allowedSounds.has(parsed.sound) ? parsed.sound : 'none',
        intent: ALLOWED_INTENTS.has(parsed.intent) ? parsed.intent : 'none'
      };
    }

    // Fallback: tags viejos
    const emotionMatch = content.match(/\[EMOTION:\s*([a-z_]+)\]/i);
    const actionMatch = content.match(/\[ACTION:\s*([a-z_]+)\]/i);
    const soundMatch = content.match(/\[SOUND:\s*([a-z_]+)\]/i);
    const intentMatch = content.match(/\[INTENT:\s*([a-z_]+)\]/i);
    if (emotionMatch || actionMatch || soundMatch || intentMatch) {
      const emotionCandidate = emotionMatch?.[1]?.toLowerCase();
      const actionCandidate = actionMatch?.[1]?.toLowerCase();
      const soundCandidate = soundMatch?.[1]?.toLowerCase();
      const intentCandidate = intentMatch?.[1]?.toLowerCase();
      const cleanedContent = content
        .replace(/\[EMOTION:\s*[a-z_]+\]/ig, '')
        .replace(/\[ACTION:\s*[a-z_]+\]/ig, '')
        .replace(/\[SOUND:\s*[a-z_]+\]/ig, '')
        .replace(/\[INTENT:\s*[a-z_]+\]/ig, '')
        .trim();
      return {
        thinking,
        content: cleanedContent,
        emotion: ALLOWED_EMOTIONS.has(emotionCandidate) ? emotionCandidate : 'happy',
        action: ALLOWED_ACTIONS.has(actionCandidate) ? actionCandidate : 'none',
        sound: allowedSounds.has(soundCandidate) ? soundCandidate : 'none',
        intent: ALLOWED_INTENTS.has(intentCandidate) ? intentCandidate : 'none'
      };
    }

    // Sin JSON ni tags: warn + fallback
    if (content.length > 0) {
      console.warn(`[parsePetReply] ${jsonError || 'no JSON, no tags'}. Snippet:`, JSON.stringify(content).slice(0, 200));
    }
    return {
      thinking,
      content,
      emotion: 'happy',
      action: 'none',
      sound: 'none',
      intent: 'none'
    };
  }

  const petProtocolApi = {
    ALLOWED_EMOTIONS,
    ALLOWED_ACTIONS,
    ALLOWED_SOUNDS,
    ALLOWED_INTENTS,
    extractThinking,
    tryParseJsonReply,
    parsePetReply,
    allowedSoundsFor
  };

  // UMD-lite: expone en module.exports (Node) o window.PetProtocol (browser).
  // La IIFE mantiene los consts internos (ALLOWED_*, funciones) privados.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = petProtocolApi;
  } else {
    root.PetProtocol = petProtocolApi;
  }
})(typeof window !== 'undefined' ? window : globalThis);
