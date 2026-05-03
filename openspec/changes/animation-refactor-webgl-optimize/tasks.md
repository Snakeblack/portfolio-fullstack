# Tasks: animation-refactor-webgl-optimize

**Change**: animation-refactor-webgl-optimize  
**Mode**: TDD estricto (RED → GREEN → REFACTOR)  
**Store**: híbrido (engram + openspec)  
**Generated**: 2026-05-03

---

## Orden de ejecución (por dependencia + TDD)

```
Phase 1 → scrollUtils extraction
Phase 2 → global.css conflict removal
Phase 3 → ProjectsSection simplification
Phase 4 → Layout + CommonScripts refactor
Phase 5 → WebGL shader uniform refactor
Phase 6 → Final verification
```

> **Regla TDD estricta**: Cada tarea RED debe fallar antes de escribir producción.
> Nunca escribir código productivo sin test rojo que lo exija.

---

## Phase 1 — scrollUtils extraction

> **Contexto**: Extraer `initSmoothAnchors()` de CommonScripts a `src/utils/scrollUtils.ts` para hacerla unitariamente testeable con jsdom.
> Refs: REQ-SCROLL-005, Design §scrollUtils.ts

### 🔴 RED

- [x] **T1.1** Crear `src/utils/scrollUtils.test.ts`
  - Test: `initSmoothAnchors()` existe y es una función exportada
  - Test: dado un `<a href="#section">`, llama `preventDefault()` en click
  - Test: dado un `<a href="#section">`, llama `scrollIntoView({ behavior: 'smooth', block: 'start' })` en el target
  - Test: links sin `href` que empiece en `#` no son interceptados
  - Test: links externos (`href="https://..."`) no son interceptados
  - Confirmar que todos los tests fallan (`scrollUtils.ts` no existe aún)

### 🟢 GREEN

- [x] **T1.2** Crear `src/utils/scrollUtils.ts`
  - Exportar `initSmoothAnchors(root: Document | Element = document): void`
  - Implementación mínima: `querySelectorAll('a[href^="#"]')` + `preventDefault` + `scrollIntoView`
  - Todos los tests de T1.1 pasan

### 🔵 REFACTOR

- [x] **T1.3** (si aplica) Agregar tipo explícito al parámetro `root`, documentar con JSDoc una línea

---

## Phase 2 — global.css conflict removal

> **Contexto**: Remover las `transition` declarations en `.scroll-animate`, `.scroll-animate-fast`, `.title-animate` que conflictúan con las overrides de GSAP. Mantener intactos `opacity:0`, `transform`, `will-change`, `@media (scripting:none)` y `@media (prefers-reduced-motion)`.
> Refs: REQ-SCROLL-007, Design §global.css

### 🔴 RED

- [x] **T2.1** Crear `src/styles/global.css.test.ts` (o equivalente con `fs` + regex en Vitest)
  - Test: el archivo `global.css` NO contiene `transition:` dentro de las reglas `.scroll-animate`, `.scroll-animate-fast`, `.title-animate`
  - Test: el archivo `global.css` SÍ contiene `opacity: 0` en la regla base `.scroll-animate`
  - Test: el archivo `global.css` SÍ contiene `@media (scripting: none)` block
  - Test: el archivo `global.css` SÍ contiene `@media (prefers-reduced-motion` block
  - Confirmar que el test de `transition` falla (las transiciones existen hoy)

### 🟢 GREEN

- [x] **T2.2** Editar `src/styles/global.css`
  - Eliminar `transition` de `.scroll-animate`, `.scroll-animate-fast`, `.title-animate`
  - Mantener intacto todo lo demás (opacity, transform, will-change, @media blocks)
  - Todos los tests de T2.1 pasan

### 🔵 REFACTOR

- [x] **T2.3** (opcional) Agrupar las reglas restantes si quedaron fragmentadas tras la eliminación

---

## Phase 3 — ProjectsSection simplification

> **Contexto**: Eliminar el sistema de animación duplicado en ProjectsSection (`.project-hidden`/`.project-visible` con opacity/transition, `@keyframes projectFadeInFresh`). Preservar el toggle show-more/show-less como layout puro (height/visibility). Agregar `stagger-children` en el grid container y remover `scroll-animate-fast` de las cards.
> Refs: REQ-PROJ-001, REQ-PROJ-002, REQ-PROJ-003, Design §ProjectsSection

### 🔴 RED

- [x] **T3.1** Crear `src/components/ProjectsSection.test.ts` (o Playwright component test si es más apropiado)
  - Test: el archivo `ProjectsSection.astro` NO contiene `@keyframes projectFadeInFresh`
  - Test: el archivo `ProjectsSection.astro` NO contiene la clase `scroll-animate-fast` en los `<article>` de cards
  - Test: el archivo `ProjectsSection.astro` SÍ contiene la clase `stagger-children` en el grid container
  - Test: la regla `.project-hidden` en el archivo NO contiene `opacity`, `transform`, ni `transition`
  - Test: la regla `.project-visible` en el archivo NO contiene `opacity`, `transform`, ni `transition`
  - Confirmar que todos fallan (las cosas existen hoy)

### 🟢 GREEN

- [x] **T3.2** Editar `src/components/ProjectsSection.astro`
  - Eliminar `@keyframes projectFadeInFresh` y `.project-animate-in`
  - Reemplazar `scroll-animate-fast` por (nada) en `<article>` cards
  - Agregar clase `stagger-children` en el elemento grid container
  - Reducir `.project-hidden` a solo: `{ height: 0; overflow: hidden; visibility: hidden; margin: 0 }`
  - Reducir `.project-visible` a solo: `{ height: auto; visibility: visible }`
  - Script de show-more/show-less: sin cambios (intocable)
  - Todos los tests de T3.1 pasan

### 🔵 REFACTOR

- [x] **T3.3** Limpiar comentarios obsoletos que referencien animaciones CSS eliminadas

---

## Phase 4 — Layout + CommonScripts refactor

> **Contexto**: Estas dos fases DEBEN aterrizarse juntas porque `ScrollTrigger.config` se mueve de CommonScripts a Layout `<head>`. Son co-dependientes.
> Refs: REQ-SCROLL-001..006, REQ-SCROLL-004, Design §Layout.astro + §CommonScripts.astro

### 🔴 RED — Layout

- [x] **T4.1** Crear `src/layouts/Layout.test.ts`
  - Test: el archivo `Layout.astro` contiene `history.scrollRestoration = 'manual'` inline en `<head>`
  - Test: el archivo `Layout.astro` contiene `ScrollTrigger.config({` en un script inline DESPUÉS del tag del CDN de GSAP
  - Test: el archivo `Layout.astro` incluye `autoRefreshEvents` en la config de ScrollTrigger
  - Test: el archivo `Layout.astro` incluye `ignoreMobileResize: true` en la config
  - Confirmar que los tests fallan (estos bloques no están en Layout hoy)

### 🔴 RED — CommonScripts estructura

- [x] **T4.2** Crear / extender `src/components/CommonScripts.test.ts`
  - Test: el archivo `CommonScripts.astro` NO contiene `IntersectionObserver`
  - Test: el archivo `CommonScripts.astro` NO contiene `setInterval`
  - Test: el archivo `CommonScripts.astro` NO contiene `forceShow`
  - Test: el archivo `CommonScripts.astro` NO contiene `checkVisibleElements`
  - Test: el archivo `CommonScripts.astro` NO contiene `cleanupIncomplete`
  - Test: el archivo `CommonScripts.astro` NO contiene `getBoundingClientRect` en contexto de viewport math
  - Test: el archivo `CommonScripts.astro` NO contiene `history.scrollRestoration` (movido a Layout)
  - Test: el archivo `CommonScripts.astro` NO contiene `ScrollTrigger.config(` (movido a Layout)
  - Test: el archivo `CommonScripts.astro` SÍ contiene `initScrollAnimations`
  - Test: el archivo `CommonScripts.astro` SÍ contiene `gsap.matchMedia`
  - Test: el archivo `CommonScripts.astro` SÍ contiene `initSmoothAnchors`
  - Test: el archivo `CommonScripts.astro` tiene ≤ 120 líneas totales
  - Confirmar que todos fallan

### 🔴 RED — comportamiento scrollUtils integrado

- [x] **T4.3** (jsdom) Test de integración mínima
  - Test: `initSmoothAnchors` importada de `scrollUtils.ts` — mismos tests que Phase 1 (reuso del módulo ya verde)

### 🟢 GREEN — Layout

- [x] **T4.4** Editar `src/layouts/Layout.astro`
  - Mover `history.scrollRestoration = 'manual'` a script inline en `<head>` (ANTES de GSAP CDN)
  - Agregar script inline con `ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load', ignoreMobileResize: true })` DESPUÉS del tag CDN de GSAP
  - Todos los tests de T4.1 pasan

### 🟢 GREEN — CommonScripts

- [x] **T4.5** Reescribir `src/components/CommonScripts.astro`
  - Eliminar: IntersectionObserver, setInterval, todos los `forceShow*`, `checkVisibleElements`, `cleanupIncomplete`, scroll-velocity tracker, `getBoundingClientRect` viewport math, `scrollRestoration` (en Layout), `ScrollTrigger.config` (en Layout)
  - Mantener: DOMContentLoaded wrapper, llamada a `initSmoothAnchors()` (importando de scrollUtils), llamada a `initScrollAnimations()`
  - Implementar `initScrollAnimations()`:
    - `gsap.set('.scroll-animate, .scroll-animate-fast, .title-animate, .stagger-children > *', { opacity: 0, y: 20 })`
    - `gsap.matchMedia()` con rama `(prefers-reduced-motion: reduce)`: `gsap.set(...)` inmediato (opacity:1, y:0)
    - Rama normal: `ScrollTrigger.create({ trigger, start: 'top 88%', once: true, onEnter, overwrite: 'auto' })` para cada elemento
    - `stagger-children`: un trigger por el contenedor, `gsap.to` con stagger en `onEnter`
    - `ScrollTrigger.refresh()` en `load`, `resize`, y `font-load`
  - Resultado: ≤ 120 líneas totales
  - Todos los tests de T4.2 pasan

### 🔵 REFACTOR

- [x] **T4.6** Extraer la lógica de stagger-children a una función helper interna `initStaggerAnimations()` si mejora legibilidad (sin cambiar comportamiento)
- [x] **T4.7** Asegurar que los comentarios del archivo reflejen la nueva estructura

---

## Phase 5 — WebGL shader uniform refactor

> **Contexto**: Colapsar los dos fragment shaders (dark/light) en uno con uniforms. Compilar shader/program/buffer UNA vez. El handler de `themeChanged` solo llama `gl.uniform*()` — cero `createShader`/`createProgram`/`createBuffer`/`cancelAnimationFrame`. El render loop corre continuamente, `u_time` acumula across toggles.
> Refs: REQ-WEBGL-001..004, Design §WebGLBackground.astro

### 🔴 RED

- [x] **T5.1** Crear `src/components/WebGLBackground.test.ts`
  - Test: el archivo `WebGLBackground.astro` NO contiene `fragmentShaderSourceDark`
  - Test: el archivo `WebGLBackground.astro` NO contiene `fragmentShaderSourceLight`
  - Test: el archivo `WebGLBackground.astro` SÍ contiene `u_baseColor`
  - Test: el archivo `WebGLBackground.astro` SÍ contiene `u_grainAmount`
  - Test: el archivo `WebGLBackground.astro` SÍ contiene `u_isLight`
  - Test: el handler de `themeChanged` NO contiene `createShader(`
  - Test: el handler de `themeChanged` NO contiene `createProgram(`
  - Test: el handler de `themeChanged` NO contiene `createBuffer(`
  - Test: el handler de `themeChanged` NO contiene `cancelAnimationFrame(`
  - Test: el handler de `themeChanged` SÍ contiene `gl.uniform`
  - Test (mock GL): dado un `WebGLRenderingContext` mock, `initWebGL()` llama `createShader` exactamente 2 veces (vertex + fragment), `createProgram` exactamente 1 vez
  - Test (mock GL): el handler `themeChanged` con `isLight=true` llama `gl.uniform3f` para `u_baseColor` con valores distintos a `isLight=false`
  - Confirmar que todos fallan

### 🟢 GREEN

- [x] **T5.2** Editar `src/components/WebGLBackground.astro`
  - Unificar shaders: escribir `fragmentShaderSource` único con uniforms `u_baseColor (vec3)`, `u_accentColor (vec3)`, `u_grainAmount (float)`, `u_isLight (float)`, `u_clampMax (float)`
  - Mover `createShader`, `createProgram`, `createBuffer`, setup de atributos a `initWebGL()` (se llama ONCE al cargar)
  - Guardar `uniform locations` en variables de módulo tras `initWebGL()`
  - Handler `themeChanged`: solo `gl.uniform3f(uBaseColor, ...)` + `gl.uniform1f(uIsLight, ...)` etc. — cero recreación
  - Loop `rAF`: nunca cancelado en theme toggle, `u_time` sigue acumulando
  - Todos los tests de T5.1 pasan

### 🔵 REFACTOR

- [x] **T5.3** Extraer los valores de color por tema a constantes named (`DARK_BASE_COLOR`, `LIGHT_BASE_COLOR`, etc.) para facilitar tuning futuro
- [x] **T5.4** Documentar en comentario de código el motivo por el que el loop nunca se cancela (claridad para futuros mantenedores)

---

## Phase 6 — Final verification

> **Contexto**: Verificación integral (Playwright E2E) cruzando todos los requisitos de las 5 fases. Tests de regresión visual y comportamiento en matrix de viewports + preferencias.

### 🔴 RED

- [ ] **T6.1** Crear suite E2E `tests/e2e/animation-refactor.spec.ts`
  - Test: página carga sin errores de consola (sin `TypeError`, `ReferenceError`)
  - Test: todos los elementos `.scroll-animate` llegan a `opacity: 1` al hacer scroll hasta ellos (desktop 1280px)
  - Test: todos los elementos `.scroll-animate` llegan a `opacity: 1` al hacer scroll hasta ellos (mobile 375px)
  - Test: con `prefers-reduced-motion: reduce` — todos los `.scroll-animate` están visibles inmediatamente sin scroll
  - Test: toggle de tema (dark→light) NO produce flash negro ni pausa en el canvas WebGL
  - Test: toggle de tema (light→dark) idem
  - Test: ProjectsSection cards aparecen correctamente sin flash de keyframe CSS (no hay `animation` en computed styles)
  - Test: show-more / show-less toggle funciona (botón expande/colapsa projects)
  - Test: links de anchor (`href="#section"`) hacen smooth scroll sin reload
  - Confirmar que los tests que dependan del estado actual fallen (algunos pueden pasar si las fases anteriores están verdes)

### 🟢 GREEN

- [x] **T6.2** Asegurarse que todos los cambios de Phases 1–5 están mergeados
  - Correr el suite completo de Vitest — 0 failures
  - Correr el suite E2E de Playwright — 0 failures
  - Si hay flakiness en E2E de WebGL (pixel timing), ajustar `waitFor` / assertions

### 🔵 REFACTOR

- [x] **T6.3** Limpiar imports muertos y comentarios `TODO` residuales en los 6 archivos modificados
- [x] **T6.4** Verificar que `CommonScripts.astro` tiene efectivamente ≤ 120 líneas (success criterion del proposal)
- [x] **T6.5** Actualizar `openspec/changes/animation-refactor-webgl-optimize/tasks.md` tachando las tareas completadas (este archivo)

---

## Checklist de success criteria (del proposal)

Al final de Phase 6, TODOS deben ser verdes:

- [x] `CommonScripts.astro` reducido a ≤ 120 líneas (de 845)
- [x] Cero instancias de `IntersectionObserver` en código de animación
- [x] Cero `setInterval` para polling de animación
- [x] Cero funciones `forceShow*` remanentes
- [x] `WebGLBackground`: sin `createShader`/`createProgram`/`createBuffer` en el handler de theme toggle
- [x] `WebGLBackground`: render loop continuo, solo `gl.uniform*()` en theme change
- [x] `ProjectsSection`: sin `.project-hidden`/`.project-visible` con opacity/transform/transition
- [x] `ProjectsSection`: sin `@keyframes projectFadeInFresh`
- [x] Todos los elementos animados aparecen correctamente en desktop y mobile
- [x] Theme toggle cambia colores WebGL sin flicker ni pausa
- [x] Sin CSS transitions en `.scroll-animate` que conflictúen con GSAP

---

## Archivos afectados (resumen)

| Archivo | Fase | Tipo de cambio |
|---------|------|----------------|
| `src/utils/scrollUtils.ts` | Phase 1 | NUEVO |
| `src/utils/scrollUtils.test.ts` | Phase 1 | NUEVO (test) |
| `src/styles/global.css` | Phase 2 | MODIFICADO |
| `src/styles/global.css.test.ts` | Phase 2 | NUEVO (test) |
| `src/components/ProjectsSection.astro` | Phase 3 | MODIFICADO |
| `src/components/ProjectsSection.test.ts` | Phase 3 | NUEVO (test) |
| `src/layouts/Layout.astro` | Phase 4 | MODIFICADO |
| `src/layouts/Layout.test.ts` | Phase 4 | NUEVO (test) |
| `src/components/CommonScripts.astro` | Phase 4 | REESCRITO |
| `src/components/CommonScripts.test.ts` | Phase 4 | NUEVO (test) |
| `src/components/WebGLBackground.astro` | Phase 5 | MODIFICADO |
| `src/components/WebGLBackground.test.ts` | Phase 5 | NUEVO (test) |
| `tests/e2e/animation-refactor.spec.ts` | Phase 6 | NUEVO (e2e) |

---

## Notas de dependencias entre fases

```
Phase 1 (scrollUtils) → independiente, puede empezarse primero
Phase 2 (global.css) → independiente de Phase 1
Phase 3 (ProjectsSection) → independiente de Phases 1-2
Phase 4 (Layout + CommonScripts) → depende de Phase 1 (usa initSmoothAnchors)
                                  → depende de Phase 2 y 3 (asume que sus cambios están)
Phase 5 (WebGL) → completamente independiente de Phases 1-4
Phase 6 (E2E) → depende de Phases 1-5 todas verdes
```

> **Layout + CommonScripts (Phase 4) deben aterrizar en el mismo commit** — son co-dependientes por el movimiento de `ScrollTrigger.config`.
