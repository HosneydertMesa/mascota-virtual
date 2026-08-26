"""
Side-by-side BEFORE comparison for the chat response cleanup fix.
Simulates the BUG behavior (raw LLM response dumped to DOM) to show
the visual difference after the fix.
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

REPO = Path(__file__).resolve().parent.parent.parent
OUT_DIR = REPO / "docs" / "chat-screenshots"

# Same mock raw response that the user saw in the bug screenshot
MOCK_RAW = '<think>\n{"emotion":"sleepy","action":"stretch","sound":"purr","intent":"rest_stretch","content":"Miau... hola. Me estaba estirando aca a tu lado."}\n</think>'

HTML_BEFORE = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="../../src/styles/pet.css">
  <style>
    body {{ background: #0a3d2e; padding: 40px; font-family: sans-serif; }}
    #pet-window-container {{ position: relative; width: 400px; height: 400px; }}
    #pet-container {{ position: relative; width: 200px; height: 200px; }}
    .interactive {{ pointer-events: auto !important; }}
    #quick-chat-panel {{ max-height: none !important; }}
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
  <script>
    // Simulate the BUG: dump the raw LLM response to the chat
    document.getElementById('quick-chat-reply').textContent = {repr(MOCK_RAW)};
  </script>
</body>
</html>
"""


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    html_path = OUT_DIR / "_chat-before.html"
    html_path.write_text(HTML_BEFORE, encoding="utf-8")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 800, "height": 700})
        page.goto(f"file://{html_path.as_posix()}")
        page.wait_for_load_state("networkidle")
        page.locator("#quick-chat-panel").screenshot(path=str(OUT_DIR / "chat-before.png"))
        browser.close()

    print(f"Wrote {OUT_DIR / 'chat-before.png'}")


if __name__ == "__main__":
    main()
