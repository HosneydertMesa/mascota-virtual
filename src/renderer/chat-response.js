/* ============================================================
   CHAT RESPONSE HELPER — extracts clean text from raw LLM response.
   ============================================================
   The AI service returns responses wrapped in <think>...</think>
   blocks plus a JSON envelope with metadata (emotion, action, sound,
   intent, content). The user should only see the `content` field.

   Real-world variations we have to handle (observed in production):
   - <think>{my reasoning}\n{...JSON...}\n</think>        (think WRAPS JSON)
   - <think>reasoning</think>\n{...JSON...}              (think SEPARATE)
   - {...JSON...}                                        (no think at all)
   - free text without JSON                              (legacy fallback)

   The safest approach: look for a JSON object anywhere in the response
   (even inside a think block) and extract the `content` field. If no
   JSON is found, fall back to the post-think text. If that's empty,
   return the fallback.

   Exposed both as:
   - module.exports.cleanChatResponse  (for node:test)
   - globalThis.cleanChatResponse      (for browser <script>)
   ============================================================ */
(function (root) {
  'use strict';

  /**
   * Try to find and parse a JSON object in any text. Returns the parsed
   * object or null. Accepts:
   * - JSON puro: {"content":"..."}
   * - JSON en markdown: ```json\n{...}\n```
   * - JSON embedded in prose
   * - JSON inside a <think>...</think> block
   */
  function tryFindJson(content) {
    // Strip markdown code fences first
    const cleaned = String(content || '')
      .replace(/```json\s*/gi, '')
      .replace(/```/g, '')
      .trim();

    // JSON object con hasta 1 nivel de anidacion (copied from pet-protocol.js)
    const jsonRegex = /\{(?:[^{}]|\{[^{}]*\})*\}/g;
    const matches = cleaned.match(jsonRegex) || [];
    for (const candidate of matches) {
      try {
        const parsed = JSON.parse(candidate);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (_e) { /* try next */ }
    }
    return null;
  }

  /**
   * Extract the user-facing text from a raw AI chat response.
   *
   * @param {string|object} rawResponse - the raw response from aiSendMessage
   *   (string OR object with .reply field)
   * @param {string} petType - 'cat' or 'dog' (unused for content extraction,
   *   kept for API symmetry with PetProtocol.parsePetReply)
   * @param {string} fallback - text to return if the response is unusable
   * @returns {string} the user-facing text (only the `content` field, never
   *   the <think> block or the JSON envelope)
   */
  function cleanChatResponse(rawResponse, petType, fallback) {
    // Normalize: accept either a string or an object with .reply
    const safeRaw = typeof rawResponse === 'string'
      ? rawResponse
      : (rawResponse && typeof rawResponse.reply === 'string' ? rawResponse.reply : '');

    if (!safeRaw || !safeRaw.trim()) return fallback;

    // Step 1: try to find a JSON object ANYWHERE in the response.
    // This handles both "think wraps JSON" and "think separate from JSON".
    const parsed = tryFindJson(safeRaw);
    if (parsed && typeof parsed.content === 'string' && parsed.content.trim().length > 0) {
      return parsed.content.trim();
    }

    // Step 2: no JSON. Strip the <think> block and return the rest.
    const withoutThink = safeRaw.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '').trim();
    if (withoutThink) {
      // Also strip old [EMOTION:...][ACTION:...] tag format just in case
      return withoutThink
        .replace(/\[EMOTION:\s*[a-z_]+\]/ig, '')
        .replace(/\[ACTION:\s*[a-z_]+\]/ig, '')
        .replace(/\[SOUND:\s*[a-z_]+\]/ig, '')
        .replace(/\[INTENT:\s*[a-z_]+\]/ig, '')
        .trim() || fallback;
    }

    // Step 3: response was just a think block with nothing useful
    return fallback;
  }

  // Dual export: CommonJS (node:test) and global (browser <script>)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { cleanChatResponse, tryFindJson };
  }
  if (typeof root !== 'undefined' && root) {
    root.cleanChatResponse = cleanChatResponse;
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
