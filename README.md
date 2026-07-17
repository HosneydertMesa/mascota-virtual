# Mascota Virtual

Compañero de escritorio virtual con IA y temporizador Pomodoro. Vive en una
ventana transparente que se asienta en la barra de tareas, se deja arrastrar
por la pantalla, persigue el cursor y responde por chat con dos mascotas
(Luna, la gata tranquila; Max, el perro enérgico).

Stack: **JavaScript puro + Electron 43** (sin TypeScript, sin bundler, sin
framework de UI). El render es directo contra `webContents` con `contextIsolation`
y `sandbox`.

---

## Requisitos

- Node.js 18+ (la API `fetch` global se usa en `src/services/ai.js`)
- Windows / macOS / Linux
- Una **MiniMax API Key** (almacenada cifrada con `safeStorage` del SO)

## Instalación

```bash
npm install
```

## Correr

```bash
npm start
```

Se abre la ventana de la mascota en la esquina inferior derecha. Doble clic
sobre la mascota abre el panel de control (Pomodoro · Chat · Ajustes). Arrastrar
con click izquierdo la mueve; al soltarla, cae con gravedad y se asienta en
la barra inferior.

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

Usa el runner nativo `node --test`. Hoy cubre:

- `test/pet-motion.test.js` — normalización de entradas de IA y física de
  movimiento (`stepMotion`).

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
├── core/
│   └── pet-motion.js            # física pura (testeable)
├── services/
│   ├── ai.js                    # cliente HTTP a MiniMax
│   └── pet-audio.js             # sonidos sintetizados en runtime
└── assets/
    ├── cat.js                   # SVG inline de Luna (idle/walk/sleep)
    └── dog.js                   # SVG inline de Max
test/
└── pet-motion.test.js
.mavis/skills/                   # skills del SDLC (sdlc-plan/team/review/doc)
AGENTS.md                        # memoria del proyecto para Mavis/Grok
```

## Notas de seguridad

- `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false` en
  ambas ventanas.
- CSP estricta por ventana (sin `connect-src` en la mascota: toda llamada a
  la API pasa por el main process).
- Cada handler de IPC valida el `event.sender` antes de procesar nada.
- API Key nunca en `localStorage`; se borra en cada `initSettings` (migración
  silenciosa desde builds antiguos).
- Inputs de IA se validan con allow-lists en
  `src/core/pet-motion.js` (`normalizeEmotion`/`normalizePetAction`/
  `normalizePetSound`).

## Licencia

MIT.
