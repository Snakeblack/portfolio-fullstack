# Delta Spec: animation-refactor-webgl-optimize

## Change ID
`animation-refactor-webgl-optimize`

## Overview

Eliminate ~500 lines of redundant animation code and fix the WebGL shader recompilation bug. The current codebase has 7 overlapping animation mechanisms producing identical end-states (`opacity: 1, y: 0, scale: 1`), causing visual conflicts and race conditions. WebGLBackground recompiles shaders on every theme toggle — only uniform values change between themes.

---

## REQ-SCROLL-001: Single animation system — GSAP ScrollTrigger only

- **Type**: functional
- **Priority**: must-have
- **Description**: All entrance animations must be driven exclusively by GSAP ScrollTrigger. There must be exactly one mechanism: `ScrollTrigger.create()` with `onEnter` callbacks. No IntersectionObserver fallback, no manual `getBoundingClientRect()` viewport checks, no `setInterval` polling, and no `forceShow*` functions.

- **Acceptance Criteria** (testable):
  1. The compiled CommonScripts script contains zero `new IntersectionObserver` instantiations.
  2. The compiled CommonScripts script contains zero `setInterval` calls related to animation.
  3. The compiled CommonScripts script contains zero calls to `getBoundingClientRect()` for animation purposes.
  4. The compiled CommonScripts script contains zero function definitions matching `/forceShow\w+/`.
  5. The compiled CommonScripts script contains zero function definitions matching `/checkVisible/`.
  6. The compiled CommonScripts script contains zero function definitions matching `/cleanupIncomplete/`.
  7. All `.scroll-animate`, `.scroll-animate-fast`, `.title-animate`, and `.stagger-children` elements become visible (`opacity: 1, transform: translateY(0), scale: 1`) when scrolled into the viewport via ScrollTrigger `onEnter`.

---

## REQ-SCROLL-002: No duplicate force-show functions

- **Type**: functional
- **Priority**: must-have
- **Description**: Remove all six force-show functions that currently fight with ScrollTrigger: `forceShowVisibleElements`, `forceShowBottomElements`, `forceShowAllRemainingElements`, `forceShowSkillsSection`, `checkVisibleElements`, and `cleanupIncompleteAnimations`. These are all redundant — ScrollTrigger's `onEnter` handles every case they were designed for.

- **Acceptance Criteria** (testable):
  1. Searching CommonScripts.astro source for each function name yields zero matches.
  2. The scroll event listener in CommonScripts does not call any `forceShow*` or `checkVisible` functions.
  3. No `setTimeout` chains exist that invoke removed functions (e.g. `setTimeout(() => forceShowSkillsSection(), 200)`).

---

## REQ-SCROLL-003: ScrollTrigger.config moved to Layout

- **Type**: non-functional
- **Priority**: must-have
- **Description**: `ScrollTrigger.config()` must be called once at the Layout level (in `<head>` or at the top of the body script), not inside a component script. This ensures the config applies before any component initializes ScrollTrigger instances.

- **Acceptance Criteria** (testable):
  1. The Layout.astro file contains a `<script>` (or `<script is:inline>`) block that calls `ScrollTrigger.config({ autoRefreshEvents, ignoreMobileResize })` before any component scripts run.
  2. CommonScripts.astro does NOT contain `ScrollTrigger.config(...)`.
  3. The `ScrollTrigger.config` call in Layout runs before `DOMContentLoaded` — it is not deferred behind any event listener.

---

## REQ-SCROLL-004: history.scrollRestoration moved to Layout head

- **Type**: non-functional
- **Priority**: should-have
- **Description**: `history.scrollRestoration = 'manual'` must be set in Layout's `<head>` via an inline script, guaranteeing it runs before any content renders. This prevents scroll-jump on page load.

- **Acceptance Criteria** (testable):
  1. Layout.astro contains `<script is:inline>if ('scrollRestoration' in history) history.scrollRestoration = 'manual';</script>` inside `<head>`.
  2. CommonScripts.astro does NOT contain `scrollRestoration`.

---

## REQ-SCROLL-005: Smooth anchor scrolling extracted to utility

- **Type**: functional
- **Priority**: should-have
- **Description**: The anchor smooth-scroll behavior (currently in CommonScripts' DOMContentLoaded handler) must be extracted into a standalone utility function `initSmoothAnchors()` in a new file `src/utils/scrollUtils.ts`. CommonScripts calls it once on DOMContentLoaded.

- **Acceptance Criteria** (testable):
  1. File `src/utils/scrollUtils.ts` exists and exports `initSmoothAnchors()`.
  2. `initSmoothAnchors` adds click listeners on all `a[href^="#"]` that call `scrollIntoView({ behavior: 'smooth', block: 'start' })`.
  3. CommonScripts imports `initSmoothAnchors` from `src/utils/scrollUtils.ts` and calls it once in its DOMContentLoaded handler.
  4. Unit test: `initSmoothAnchors` correctly calls `preventDefault` on anchor clicks and scrolls to target element.

---

## REQ-SCROLL-006: prefers-reduced-motion handled via gsap.matchMedia()

- **Type**: functional
- **Priority**: must-have
- **Description**: When the user has `prefers-reduced-motion: reduce` enabled, GSAP should skip entrance animations entirely via `gsap.matchMedia()`. Elements should appear in their final state immediately (`opacity: 1, y: 0, scale: 1`). The CSS `@media (prefers-reduced-motion: reduce)` fallback in global.css remains as a safety net.

- **Acceptance Criteria** (testable):
  1. CommonScripts uses `gsap.matchMedia()` to define a `(prefers-reduced-motion: reduce)` context.
  2. Inside the reduced-motion context, elements with `.scroll-animate`, `.scroll-animate-fast`, `.title-animate` are set to their final visible state immediately (no animation tween).
  3. Inside the non-reduced-motion context, the ScrollTrigger `onEnter` animation runs normally.
  4. The CSS `@media (prefers-reduced-motion: reduce)` rule in global.css still exists as a noscript/CSS-only fallback.

---

## REQ-SCROLL-007: CSS transition conflict resolved

- **Type**: functional
- **Priority**: must-have
- **Description**: The CSS `.scroll-animate`, `.scroll-animate-fast`, `.title-animate` utility rules currently define `transition: opacity 0.6s ease-out, transform 0.6s ease-out`. These CSS transitions conflict with GSAP — both CSS and JS animate the same properties simultaneously, causing flicker and race conditions. Remove all `transition` declarations from these animation utility classes. GSAP is now the sole animation driver. Keep `opacity: 0; transform: translateY(20px); will-change: opacity, transform;` as the initial hidden state that GSAP reads.

- **Acceptance Criteria** (testable):
  1. In global.css, the `.scroll-animate, .scroll-animate-fast, .title-animate` rule block does NOT contain `transition` or `transition-duration` or `transition-delay` properties.
  2. In global.css, the `.scroll-animate-fast` rule does NOT set `transition-duration`.
  3. The initial state properties (`opacity: 0`, `transform: translateY(...)`) remain as the CSS fallback for noscript users.
  4. The `@media (scripting: none)` and `@media (prefers-reduced-motion: reduce)` fallbacks remain untouched.
  5. E2E visual test: No flicker/flash when elements scroll into view — GSAP is the sole driver.

---

## REQ-WEBGL-001: Single shader program compiled once on load

- **Type**: functional
- **Priority**: must-have
- **Description**: The WebGL background must compile shaders and create the program exactly once on initial page load. Theme changes must NOT trigger `createShader`, `createProgram`, or `createBuffer`.

- **Acceptance Criteria** (testable):
  1. WebGLBackground.astro module-level scope compiles vertex shader + fragment shader + program + buffer exactly once during initialization.
  2. On `themeChanged` event, the code path does NOT call `gl.createShader`, `gl.createProgram`, or `gl.createBuffer`.
  3. Unit test: spy on `gl.createShader` and `gl.createProgram` — they are called exactly once during init, and zero times on theme toggle.

---

## REQ-WEBGL-002: Theme differences passed as uniforms

- **Type**: functional
- **Priority**: must-have
- **Description**: The fragment shader must use uniforms for all values that differ between light and dark themes: `u_baseColor` (vec3), `u_grainAmount` (float), `u_isLight` (float/int), and any per-theme amplitude/speed constants. Both the dark and light visual effects are produced by the same shader — only uniform values change.

- **Acceptance Criteria** (testable):
  1. The fragment shader source contains `uniform vec3 u_baseColor;`, `uniform float u_grainAmount;`, and `uniform float u_isLight;` (or equivalent).
  2. Dark theme uniform values produce the same visual output as the original `fragmentShaderSourceDark`.
  3. Light theme uniform values produce the same visual output as the original `fragmentShaderSourceLight`.
  4. There is only ONE fragment shader source string — no conditional selection between two shaders based on theme.

---

## REQ-WEBGL-003: Theme toggle only updates uniform values

- **Type**: functional
- **Priority**: must-have
- **Description**: On `themeChanged` event, only `gl.uniform*()` calls are made to update `u_baseColor`, `u_grainAmount`, `u_isLight`, etc. The render loop (`requestAnimationFrame`) continues uninterrupted — no `cancelAnimationFrame`, no render loop restart, no program/buffer recreation.

- **Acceptance Criteria** (testable):
  1. The `themeChanged` event handler calls only `gl.uniform3f`, `gl.uniform1f` (or equivalent) — no `createShader`, `createProgram`, `createBuffer`, `linkProgram`, `attachShader`, or `cancelAnimationFrame`.
  2. The render loop continues running across theme changes; `animationFrameId` is never cancelled on theme toggle.
  3. Unit test: after initialization, triggering `themeChanged` event causes exactly N `gl.uniform*` calls (where N = number of theme uniforms) and zero `gl.create*` calls.

---

## REQ-WEBGL-004: Smooth theme transition — no visual glitch

- **Type**: non-functional
- **Priority**: must-have
- **Description**: When the user toggles between light and dark themes, the WebGL background must transition smoothly without any visible flicker, frame skip, or black flash. Since shader compilation is eliminated on toggle and only uniforms change, the visual effect should be seamless.

- **Acceptance Criteria** (testable):
  1. Visual E2E test: toggle theme and verify no black flash occurs (canvas pixel check at midpoint confirms non-zero color values).
  2. The `cancelAnimationFrame` in `initWebGL` that stops the previous loop is removed — the render loop is started once and runs continuously.
  3. `u_time` continues incrementing seamlessly across theme changes (no time reset to 0).

---

## REQ-PROJ-001: ProjectsSection owns its own enter animation

- **Type**: functional
- **Priority**: must-have
- **Description**: Project cards currently have both `.scroll-animate-fast` (from CommonScripts' ScrollTrigger) AND CSS `@keyframes projectFadeInFresh` / `.project-animate-in` (from ProjectsSection's own script). Remove the duplicate: project cards should only use the CommonScripts ScrollTrigger animation. Remove `.scroll-animate-fast` from the project card `<article>` elements and let the parent `.stagger-children` container handle the entrance via ScrollTrigger. The show-more/show-less toggle logic continues to use `project-hidden`/`project-visible` classes but those classes must NOT contain animation properties (opacity, transform) that conflict with GSAP.

- **Acceptance Criteria** (testable):
  1. Project card `<article>` elements do NOT have the `scroll-animate-fast` class.
  2. The project grid container retains the `stagger-children` class for ScrollTrigger stagger animation.
  3. When the page loads, project cards animate in via GSAP ScrollTrigger stagger (not via CSS `@keyframes`).
  4. The show-more/show-less toggle still correctly adds/removes `project-hidden`/`project-visible` classes.

---

## REQ-PROJ-002: Remove CSS @keyframes projectFadeInFresh

- **Type**: functional
- **Priority**: must-have
- **Description**: The `@keyframes projectFadeInFresh` and `.project-animate-in` CSS rules in ProjectsSection.astro are a duplicate animation system. They apply opacity/transform transitions that conflict with GSAP. Remove them entirely.

- **Acceptance Criteria** (testable):
  1. Searching ProjectsSection.astro source for `projectFadeInFresh` yields zero matches.
  2. Searching ProjectsSection.astro source for `.project-animate-in` yields zero matches.
  3. The `.project-hidden` class still exists (for toggle functionality) but contains ONLY `height: 0; overflow: hidden; visibility: hidden; margin: 0;` — no `opacity`, `transform`, `filter`, or `transition` properties.
  4. The `.project-visible` class still exists but contains ONLY `height: auto; visibility: visible;` — no `opacity`, `transform`, `filter`, or `transition` properties.

---

## REQ-PROJ-003: Show-more/show-less toggle still works correctly

- **Type**: functional
- **Priority**: must-have
- **Description**: After removing `projectFadeInFresh` and the conflicting CSS animation properties, the show-more/show-less toggle must still function correctly. The `project-hidden`/`project-visible` classes must be preserved for layout (show/hide), and the toggle button must update the URL params and ARIA state.

- **Acceptance Criteria** (testable):
  1. Clicking "View All" adds `?show_all=true` to the URL via `history.pushState`.
  2. Clicking "View Less" removes `show_all` from the URL.
  3. `project-hidden` items have `height: 0; overflow: hidden; visibility: hidden` (layout-only, no opacity/transform animation).
  4. `project-visible` items have `height: auto; visibility: visible` (layout-only, no opacity/transform animation).
  5. The button's `aria-pressed` attribute toggles correctly between `"true"` and `"false"`.
  6. Initial render respects the `show_all` URL parameter — hidden projects are not visible if `show_all` is absent.

---

## Traceability Matrix

| Requirement | Source (current code) | Target file(s) | Risk |
|-------------|----------------------|----------------|------|
| REQ-SCROLL-001 | CommonScripts.astro lines 7-845 (7 mechanisms) | CommonScripts.astro | Medium — removing fallbacks requires ScrollTrigger covers all viewports |
| REQ-SCROLL-002 | CommonScripts.astro functions L307-593 | CommonScripts.astro | Low — mechanical deletion |
| REQ-SCROLL-003 | CommonScripts.astro L48-52 | Layout.astro, CommonScripts.astro | Low — move statement |
| REQ-SCROLL-004 | CommonScripts.astro L18-20 | Layout.astro `<head>`, CommonScripts.astro | Low — move statement |
| REQ-SCROLL-005 | CommonScripts.astro L189-203 | src/utils/scrollUtils.ts, CommonScripts.astro | Low — extraction |
| REQ-SCROLL-006 | CommonScripts.astro (no current impl) | CommonScripts.astro | Medium — new feature, must test with browser preference |
| REQ-SCROLL-007 | global.css L64-82 | global.css | Medium — must keep initial state + noscript fallback |
| REQ-WEBGL-001 | WebGLBackground.astro L74-221 (full reinit) | WebGLBackground.astro | Medium — refactor shader init to single-pass |
| REQ-WEBGL-002 | WebGLBackground.astro L86-144 (2 shader sources) | WebGLBackground.astro | Medium — must match visual output of both themes |
| REQ-WEBGL-003 | WebGLBackground.astro L243-245 (event handler) | WebGLBackground.astro | Low — handler simplification |
| REQ-WEBGL-004 | WebGLBackground.astro L76-78 (cancelAnimationFrame) | WebGLBackground.astro | Low — remove cancellation |
| REQ-PROJ-001 | ProjectsSection.astro L69 (scroll-animate-fast) | ProjectsSection.astro | Low — remove class |
| REQ-PROJ-002 | ProjectsSection.astro L260-286 (keyframes) | ProjectsSection.astro | High — must preserve toggle functionality |
| REQ-PROJ-003 | ProjectsSection.astro L145-224 (toggle script) | ProjectsSection.astro | High — must not break show/hide |

---

## Out of Scope

- Adding new animations or visual effects
- Changing animation easing or timing values (keep existing `power1.out`, durations)
- Three.js or non-WebGL canvas refactors
- Page layout or content changes
- SEO or accessibility improvements (beyond what falls out naturally from removing redundant code)