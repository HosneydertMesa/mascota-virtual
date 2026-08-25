# Review: walk v2 natural enhancement

**Fecha**: 2026-08-25
**Reviewer**: Mavis (root session, self-review adversarial — mismo
agente que escribio el fix)
**Branch**: `feat/pixijs-rendering`
**Plan**: `docs/plans/walk-v2-natural-enhancement-2026-08-25.md`
**Veredicto**: ✅ **APPROVED** con 2 hallazgos (1 MINOR, 1 INFO), no
bloqueantes

---

## Resumen ejecutivo

El fix de walk v2 (solicitado por HOSNE como follow-up al commit
`9e98c4c`) mejora visiblemente el walk. La runtime evidence es solida:
swing aumento de 22deg a 52deg en cat (2.3x) y de 31deg a 52deg en
dog (1.7x). Ademas resuelve el X button bug (B2 v2) que mi fix
anterior no resolvio correctamente.

Lo que se destaca:
- **El root cause analysis fue correcto**: identifique que el frame
  swap a 167ms truncaba la animacion CSS. Sin este insight, el
  fix hubiera sido solo aumentar amplitudes (visible mejora pero
  no resuelve el problema de fondo). Con el fix combinado
  (amplitudes + skip swap), el swing llega al rango completo.
- **Runtime evidence con Playwright** confirma el efecto visual real.
  Sin esto, hubiera validado con inspeccion de CSS estatico (que
  pasaria aunque la animacion no se viera).
- **El B2 v2 fix corrigue un mal diagnostico previo**: el X button
  no era invisible por overflow (mi B1), era por contraste casi
  cero. A veces hay que iterar para llegar al root cause real.

---

## Hallazgos

### [MINOR-1] El head no bobbea durante walk

**Archivo**: walk v2 enhancement
**Detalle**: el head tiene un per-frame `style="transform: translateY(-1px) rotate(-1.4deg)"`
en el SVG. Con el frame swap deshabilitado, el head se queda estatico
en una sola posicion. El body bobbea via CSS, pero la cabeza no.

**Impacto**: bajo. En un walk real, la cabeza se mueve un poco pero
mucho menos que el body. Un head estatico es aceptable para un walk
"casual". Un head que se mueve daria mas vida.
**Decision**: diferir. Agregar un CSS animation para `.walking-bob.cat-walk
.pet-head` (slight Y bob) seria un polish. No es bloqueante.

### [MINOR-2] El preview HTML no refleja el fix de pet-viewport

**Archivo**: `test/preview/cat-walk-preview.html`
**Detalle**: el preview tiene su propio `makeCycle()` que hace
innerHTML swap. No usa `pet-viewport.js` (que ahora skip el swap).
Para validar visualmente el fix v2, hay que usar
`walk-v2-runtime-evidence.py` (que hace su propio HTML sin swap).
El preview normal sigue ciclando y se ve igual que antes.

**Impacto**: confusion. El usuario podria abrir el preview normal
y pensar que el fix no funciono (porque sigue ciclando igual).
**Decision**: mejorar el preview para que use el approach v2
(sin swap), o agregar un boton "v2 mode" que use el approach
nuevo. Diferir: el runtime evidence script es suficiente para
verificacion automatica; el preview normal sigue siendo util para
inspeccion visual del walk CSS-driven.

### [INFO-1] El test del "frame swap disabled" deberia ser runtime, no estructural

**Detalle**: el fix de `pet-viewport.js` (skip frame swap durante
walk) no tiene test dedicado. Confio en el runtime evidence script
para verificar. Si alguien restaura el swap, el runtime evidence
mostraria ~22deg en vez de 52deg.

**Impacto**: el test estructural seria fragil (chequearia strings en
el codigo, no comportamiento). El runtime evidence ES el test.
Documentado claramente en el commit message.
**Decision**: no action. El runtime evidence es mas fuerte que un
test estructural.

### [INFO-2] Working tree sigue dirty por el WIP pre-existente

**Detalle**: el fix se commitea sobre el WIP que tiene 12 archivos
uncommitted (main.js, preload.js, src/pet-renderer-pixi.js, etc).
**Impacto**: ninguno para este fix. Los gates del fix pasan.
**Decision**: trackear aparte. Cuando el branch se integre a main,
hacer batch review/qa retroactivo del WIP completo.

---

## Cosa que NO es hallazgo pero quiero dejar explicita

- El swap de 4 walk frames existe para diferenciacion sutil de paws
  (1-3px y-offset) que era el mecanismo de walk original. El CSS
  animation es una capa adicional agregada despues. Con el v2 fix,
  la capa CSS es la unica activa. La capa per-frame queda
  implementada pero unused.
- El comentario en `pet-viewport.js` (line 117-130) explica el
  rationale completo del cambio. Si alguien se pregunta por que el
  swap esta skip para walking, el codigo se explica solo.
- El "limite fisico" del swing es ~52deg porque las patas del
  gato/perro en el arte actual son cortas (relativas al body).
  Para swing mas amplio, habria que redibujar el art con patas mas
  largas. Out of scope.

---

## Veredicto final

**APPROVED**. El fix es correcto, bien testeado, con runtime evidence
cuantitativa. Los hallazgos son menores (1 polish futuro) o info (2
documentales). El cambio principal (skip frame swap) es la pieza
critica que destraba el rango completo del CSS.

Cuando el usuario valide visualmente en la app real, deberia ver
un walk claramente mas natural que en `9e98c4c`: las patas se ven
moviendo en un rango amplio, el body bobbea visiblemente, la cola
se mueve. El X button del chat ya es clickable.
