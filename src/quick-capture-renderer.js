'use strict';

/**
 * Quick capture renderer — controla el overlay flotante que aparece en el
 * pet window cuando el usuario aprieta Cmd/Ctrl+Shift+Q.
 *
 * El shortcut lo dispara main.js (`quick-capture-trigger` IPC). El preload
 * ya expone `window.api.onQuickCaptureTrigger(callback)` que llama a `show()`
 * cuando llega el trigger.
 *
 * Comportamiento:
 *   - Enter en textarea → save
 *   - Esc en textarea → cancel
 *   - Click fuera del box → cancel
 *   - Boton save → save
 *   - Boton cancel → cancel
 *
 * Despues de guardar:
 *   - Llama a `window.api.quickCaptureSave(text)` que es IPC al main.
 *   - Cierra el overlay.
 *   - Despacha un CustomEvent 'quick-capture-saved' en window con detail.text
 *     para que renderer.js (si quiere) muestre feedback via showSpeech.
 *   - Tambien emite `window.api.triggerPetAction(...)` con un speak happy
 *     como feedback inmediato en la mascota.
 *
 * Si la captura falla (text vacio, error IPC), el overlay sigue abierto
 * con el texto que el usuario escribio, para que pueda reintentar.
 */

(function () {
  const overlay = document.getElementById('quick-capture-overlay');
  const box = overlay ? overlay.querySelector('.quick-capture-box') : null;
  const textarea = document.getElementById('quick-capture-text');
  const counter = document.getElementById('quick-capture-counter');
  const saveBtn = document.getElementById('quick-capture-save');
  const cancelBtn = document.getElementById('quick-capture-cancel');

  if (!overlay || !box || !textarea || !counter || !saveBtn || !cancelBtn) {
    console.warn('quick-capture-renderer: DOM elements missing, overlay disabled');
    return;
  }

  function updateCounter() {
    counter.textContent = `${textarea.value.length}/200`;
  }

  function show() {
    textarea.value = '';
    updateCounter();
    overlay.hidden = false;
    // Focus en el textarea despues de que se muestre. setTimeout 0 asegura
    // que el focus funcione despues de que el browser procese el hidden=false.
    setTimeout(() => textarea.focus(), 0);
  }

  function hide() {
    overlay.hidden = true;
    textarea.value = '';
    updateCounter();
  }

  function cancel() {
    hide();
  }

  async function save() {
    const text = textarea.value;
    // Validacion basica en el cliente (el server re-valida).
    if (typeof text !== 'string' || text.trim().length === 0) {
      cancel();
      return;
    }
    saveBtn.disabled = true;
    cancelBtn.disabled = true;
    try {
      const result = await window.api.quickCaptureSave(text);
      if (result && result.added) {
        const savedText = result.capture ? result.capture.text : text.trim();
        // Despachar evento para que renderer.js pueda reaccionar (showSpeech, etc)
        window.dispatchEvent(new CustomEvent('quick-capture-saved', { detail: { text: savedText } }));
        // Feedback inmediato via la mascota
        window.api.triggerPetAction({
          type: 'speak',
          text: '¡Guardado!',
          emotion: 'happy',
          action: 'none',
          sound: 'none',
          intent: 'none'
        });
        hide();
      } else {
        // Si fallo (validacion server-side, etc), dejamos el overlay abierto
        // y dejamos que el usuario vea que paso. No cerramos.
        const reason = result && result.reason ? result.reason : 'No se pudo guardar';
        console.warn('quick-capture-save failed:', reason);
      }
    } catch (error) {
      console.error('quick-capture-save error:', error);
    } finally {
      saveBtn.disabled = false;
      cancelBtn.disabled = false;
    }
  }

  // Event listeners
  textarea.addEventListener('input', updateCounter);
  textarea.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      save();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
  });
  saveBtn.addEventListener('click', save);
  cancelBtn.addEventListener('click', cancel);

  // Click en el overlay (fuera del box) → cancel. El box tiene stopPropagation.
  overlay.addEventListener('click', event => {
    if (event.target === overlay) cancel();
  });
  if (box) {
    box.addEventListener('click', event => event.stopPropagation());
  }

  // Trigger desde el main (globalShortcut Cmd/Ctrl+Shift+Q)
  if (window.api && typeof window.api.onQuickCaptureTrigger === 'function') {
    window.api.onQuickCaptureTrigger(() => {
      if (overlay.hidden) show();
      else hide();
    });
  }
})();
