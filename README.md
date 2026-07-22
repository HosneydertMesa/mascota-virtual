# Mascota Virtual

[![CI](https://github.com/HosneydertMesa/mascota-virtual/actions/workflows/ci.yml/badge.svg)](https://github.com/HosneydertMesa/mascota-virtual/actions/workflows/ci.yml)
[![Release](https://github.com/HosneydertMesa/mascota-virtual/actions/workflows/release.yml/badge.svg)](https://github.com/HosneydertMesa/mascota-virtual/releases)

Compañero de escritorio virtual con IA y temporizador Pomodoro. Vive en una
ventana transparente que se asienta en la barra de tareas, se deja arrastrar
por la pantalla, persigue el cursor y responde por chat con dos mascotas
(Luna, la gata tranquila; Max, el perro enérgico).

Stack: **JavaScript puro + Electron 43** (sin TypeScript, sin bundler, sin
framework de UI). El render es directo contra `webContents` con `contextIsolation`
y `sandbox`.

---

## Instalación (Windows)

1. Ir a [Releases](https://github.com/HosneydertMesa/mascota-virtual/releases)
2. Descargar `MascotaVirtual-Setup-X.X.X.exe` de la última release
3. Ejecutar el instalador
4. Si Windows SmartScreen muestra advertencia: **"More info → Run anyway"**
   (es código sin firmar aún — ver [Code signing](#code-signing) más abajo)

> **macOS / Linux**: no hay builds oficiales todavía. Si los necesitás,
> ver [Build desde código fuente](#build-desde-código-fuente) más abajo.

### Auto-updates

Una vez instalada, la app chequea updates al abrirla y cada 6 horas. Cuando
hay un update disponible, se descarga en background y muestra un speech
bubble. Se aplica al cerrar la app (no interrumpe).

Si querés forzar la actualización sin esperar el próximo cierre: cerrá la
app y volvela a abrir (la próxima sesión carga la versión nueva).

### Code signing

Los builds de v2.x son **self-signed** (sin cert EV). Esto significa:

- ✅ Funciona normal para early adopters que hacen "More info → Run anyway"
- ⚠️ Windows SmartScreen muestra una advertencia la primera vez
- 🔮 Cert EV ($300/yr) está planeado para v2.1.0 si la adopción lo justifica

---

## Requisitos para desarrollo

- Node.js 18+ (la API `fetch` global se usa en `src/services/ai.js`)
- Windows / macOS / Linux
- Una **MiniMax API Key** (almacenada cifrada con `safeStorage` del SO)

## Build desde código fuente

```bash
npm install
```

### Modo desarrollo (rápido)

```bash
npm start
```

Se abre la ventana de la mascota en la esquina inferior derecha. Doble clic
sobre la mascota abre el panel de control (Pomodoro · Chat · Ajustes).
Arrastrar con click izquierdo la mueve; al soltarla, cae con gravedad y
se asienta en la barra inferior.

### Build portable (sin instalador, solo test)

```bash
npm run build:dir
# Output: dist/win-unpacked/Mascota Virtual.exe
```

### Build instalador NSIS (release)

```bash
npm run build
# Output: dist/MascotaVirtual-Setup-X.X.X.exe (~225MB)
```

> **Nota sobre build en Windows sin admin**: electron-builder 25.x tiene
> un [issue conocido](https://github.com/electron-userland/electron-builder/issues/8149)
> con symlinks en la extracción de `winCodeSign`. Si ves el error
> `Cannot create symbolic link : A required privilege is not held by the client`,
> hay dos workarounds:
>
> 1. **Habilitar Developer Mode** (Settings → Privacy & security → For developers → Developer Mode ON)
> 2. **Build en CI** (GitHub Actions `windows-latest` lo tiene resuelto por default — ver `.github/workflows/release.yml`)
> 3. **Build en Linux/macOS** (electron-builder usa `wine` para rcedit; anda OK)
>
> Los builds de CI en `.github/workflows/release.yml` ya están configurados
> para evitar el problema y generar el .exe + publicarlo automáticamente.

## Configurar la API Key (una sola vez)

1. Click en el engranaje de la mascota o doble clic para abrir el panel.
2. Tab **Ajustes** → pega tu MiniMax API Key → **Guardar ajustes**.
3. La clave se cifra con `safeStorage` (Keychain en macOS, DPAPI en Windows,
   libsecret en Linux) y se guarda en
   `<userData>/secure-settings.json`. Nunca toca `localStorage`.

Para eliminarla: tab Ajustes → **Eliminar clave guardada**.

## Tests

```bash
npm test
```

Usa el runner nativo `node --test`. Hoy cubre **~700 tests** en 30 archivos:
normalización de entradas de IA, física de movimiento, mood system, memories,
pomodoros (adaptive, templates, streaks), quick capture, weekly reports,
daily briefing, global shortcuts, context awareness, pet assets, y el pure
module de auto-updater (T6).

## Estructura

```
main.js                          # proceso main de Electron
preload.js                       # contextBridge (API expuesta al renderer)
src/
├── index.html                   # ventana de la mascota
├── dashboard.html               # panel de control
├── styles.css
├── renderer.js                  # lógica de la mascota (drag, IA, sonidos)
├── dashboard-renderer.js        # lógica del panel (Pomodoro, chat, ajustes)
├── quick-capture-renderer.js    # overlay de captura rápida (Cmd/Ctrl+Shift+Q)
├── core/
│   ├── pet-motion.js            # física pura (testeable)
│   ├── pet-mood.js              # sistema de mood (energy/happiness/...)
│   ├── pet-memories.js          # recuerdos persistentes + PII redaction
│   ├── pet-micro-presence.js    # breathing, blink, eye tracking
│   ├── pet-behavior.js          # FSM de comportamiento de la mascota
│   ├── pet-protocol.js          # allow-lists de respuestas de la IA
│   ├── pet-mood-labels.js       # labels de mood (UI)
│   ├── context-awareness.js     # tips, A3, A4
│   ├── global-shortcuts.js      # registro de atajos globales
│   ├── daily-briefing.js        # I7+I8 morning briefing / evening summary
│   ├── weekly-report.js         # W3 reporte semanal
│   ├── quick-capture.js         # I2 captura rápida
│   ├── pomodoro-templates.js    # W4 templates Classic/Long/Deep/Custom
│   ├── pomodoro-adaptive.js     # I1 adaptive breaks
│   ├── pomodoro-streak.js       # W5 streaks
│   └── auto-updater.js          # T6 pure helper (no Electron)
├── services/
│   ├── ai.js                    # cliente HTTP a MiniMax
│   ├── logger.js                # logger con redaction
│   ├── pet-audio.js             # sonidos sintetizados en runtime
│   ├── pet-name-store.js        # P7 nombre de la mascota
│   ├── memories-store.js        # P3 recuerdos (JSON en userData)
│   ├── quick-capture-store.js   # I2 capturas (JSON en userData)
│   ├── mood-store.js            # A1 mood (JSON en userData)
│   ├── mood-tick.js             # A1 decay tick
│   ├── pomodoro-store.js        # sesiones + config
│   ├── daily-briefing-store.js  # I7+I8 state
│   ├── idle-monitor.js          # A3 idle detection
│   ├── power-monitor.js         # OS suspend/resume
│   └── memory-extractor.js      # P3 extraction (background)
└── assets/
    ├── cat.js                   # SVG inline de Luna (idle/walk/sleep)
    └── dog.js                   # SVG inline de Max
assets/                          # electron-builder assets (icon, etc)
test/                            # 30 test files, 700+ tests
docs/                            # planes, audit, reviews, deliverables
.github/workflows/               # CI + release
.mavis/skills/                   # skills del SDLC (sdlc-plan/team/review/doc)
AGENTS.md                        # memoria del proyecto para Mavis/Grok
```

## Notas de seguridad

- `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false` en
  ambas ventanas.
- CSP estricta por ventana (`connect-src 'none'` en la mascota, `'self' https:`
  en el dashboard). Ninguna llamada a APIs externas desde el renderer: todo
  pasa por el main process, que valida el sender.
- Cada handler de IPC valida el `event.sender` antes de procesar nada.
- API Key nunca en `localStorage`; se cifra con `safeStorage` del SO
  (Keychain en macOS, DPAPI en Windows, libsecret en Linux) y se guarda en
  `<userData>/secure-settings.json`.
- Inputs de IA se validan con allow-lists en `src/core/pet-protocol.js`
  (`normalizeEmotion`/`normalizePetAction`/`normalizePetSound`).
- PII (emails, teléfonos, tarjetas) se redacta automáticamente en memories
  y quick-capture cuando el toggle `redactPII` está ON.

## Licencia

MIT.
