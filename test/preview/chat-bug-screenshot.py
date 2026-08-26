"""
Visual smoke test for the chat response cleanup fix (B1).
Loads a minimal HTML page that mocks the chat handler with a raw LLM
response containing <think>...</think> + JSON envelope, then verifies
that the rendered chat only shows the content field.

This is the "runtime evidence" the renderer fix needs — node:test
covers the helper logic, but only a real browser verifies that the
chat panel renders cleanly.
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

REPO = Path(__file__).resolve().parent.parent.parent
OUT_DIR = REPO / "docs" / "chat-screenshots"


HTML_TEMPLATE = r"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="../../src/styles/pet.css">
  <style>
    body { background: #0a3d2e; padding: 40px; font-family: sans-serif; }
    #pet-window-container { position: relative; width: 400px; height: 400px; }
    #pet-container { position: relative; width: 200px; height: 200px; }
    .interactive { pointer-events: auto !important; }
    /* Override the max-height for the test so we can see the full panel */
    #quick-chat-panel { max-height: none !important; }
  </style>
</head>
<body>
  <div id="pet-window-container">
    <div id="pet-container" class="interactive">
      <section id="quick-chat-panel" class="interactive" aria-label="Chat rápido">
        <header class="quick-chat-header">
          <div>
            <strong id="quick-chat-title">Habla con Luna</strong>
            <span id="quick-chat-subtitle">Tu compa&ntilde;era est&aacute; escuchando</span>
          </div>
          <button id="quick-chat-close" type="button" aria-label="Cerrar chat rápido">&times;</button>
        </header>
        <div id="quick-chat-reply" class="quick-chat-reply">Pensando...</div>
        <div class="quick-chat-input-row">
          <input id="quick-chat-input" type="text" maxlength="500">
          <button id="quick-chat-send" type="button">Send</button>
        </div>
      </section>
    </div>
  </div>
  <script src="../../src/renderer/chat-response.js"></script>
  <script>
    // Mock: simulate a raw LLM response with <think> + JSON envelope.
    const MOCK_RAW = '<think>\n{"emotion":"sleepy","action":"stretch","sound":"purr","intent":"rest_stretch","content":"Miau... hola. Me estaba estirando aca a tu lado."}\n</think>';
    const replyEl = document.getElementById('quick-chat-reply');
    const result = cleanChatResponse(MOCK_RAW, 'cat', 'fallback');
    replyEl.textContent = result;
    window.__lastClean = result;
    window.__wasFixed = !result.includes('<think>') && !result.includes('"emotion"');
  </script>
</body>
</html>
"""


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    html_path = OUT_DIR / "_chat-test.html"
    html_path.write_text(HTML_TEMPLATE, encoding="utf-8")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 800, "height": 700})
        page.goto(f"file://{html_path.as_posix()}")
        page.wait_for_load_state("networkidle")

        # Read the actual rendered text
        rendered = page.locator("#quick-chat-reply").text_content() or ""
        was_fixed = page.evaluate("window.__wasFixed")
        last_clean = page.evaluate("window.__lastClean")

        # Take screenshot of just the chat panel area
        page.locator("#quick-chat-panel").screenshot(path=str(OUT_DIR / "chat-fixed.png"))

        # Also full page for context
        page.screenshot(path=str(OUT_DIR / "chat-page.png"), full_page=True)

        browser.close()

    print("=== chat response cleanup runtime evidence ===")
    print(f"mock raw:        <think>{{...JSON...content:\"Miau...\"}}</think>")
    print(f"rendered text:   {rendered!r}")
    print(f"window.__lastClean: {last_clean!r}")
    print(f"window.__wasFixed:  {was_fixed}")
    print(f"screenshot:      {OUT_DIR / 'chat-fixed.png'}")

    failures = []
    if "<think>" in rendered:
        failures.append("FAIL: rendered text still contains <think>")
    if "</think>" in rendered:
        failures.append("FAIL: rendered text still contains </think>")
    if '"emotion"' in rendered or '"action"' in rendered or '"sound"' in rendered or '"intent"' in rendered:
        failures.append("FAIL: rendered text still contains JSON envelope keys")
    if "Miau" not in rendered:
        failures.append("FAIL: rendered text missing the actual content (Miau...)")
    if not was_fixed:
        failures.append("FAIL: window.__wasFixed flag is false")

    if failures:
        print()
        for f in failures:
            print(f)
        sys.exit(1)
    else:
        print()
        print("PASS — chat renders only the content, no leak of <think> or JSON envelope.")


if __name__ == "__main__":
    main()
