# Design: Animation Refactor & WebGL Optimize

## Technical Approach

Collapse all entrance animation paths into ONE driver — `gsap.matchMedia()` + `ScrollTrigger.create()` with `onEnter`. Remove every fallback (IntersectionObserver, polling, `forceShow*`, viewport math, CSS transitions on `.scroll-animate*`). For WebGL, lift shader/program/buffer compilation to one-shot init at module scope; demote `themeChanged` to a pure uniform update (`gl.uniform*`), keeping the rAF loop continuous. ProjectsSection stops owning entrance animation: cards are revealed by the parent `.stagger-children` ScrollTrigger; toggle classes are stripped of opacity/transform so they only control layout.

Maps to spec: REQ-SCROLL-001..007, REQ-WEBGL-001..004, REQ-PROJ-001..003.

## Architecture Decisions

| Decision | Choice | Alternative | Rationale |
|---|---|---|---|
| Animation driver | GSAP ScrollTrigger only, gated by `gsap.matchMedia()` | Keep IO as fallback | Single source of truth; ScrollTrigger already covers viewport detection on desktop+mobile and self-refreshes on resize. Fallbacks are what cause the race conditions. |
| Reduced motion | `gsap.matchMedia('(prefers-reduced-motion: reduce)')` sets final state via `gsap.set()`, no tween | CSS-only via `@media` | matchMedia gives runtime control AND auto-reverts on preference change. CSS rule remains as noscript safety net. |
| ScrollTrigger.config location | `Layout.astro` `<head>` inline script (after GSAP CDN) | Inside CommonScripts | Config must apply before any component instantiates a trigger; head-level inline guarantees ordering. |
| scrollRestoration | `Layout.astro` `<head> is:inline` | Inside CommonScripts DOMContentLoaded | Must run before first paint to avoid jump; component scripts run too late. |
| Anchor scroll | Extracted `src/utils/scrollUtils.ts` → `initSmoothAnchors()` | Inline in component | Pure DOM logic, testable without Astro runtime; reusable. |
| Shader strategy | ONE fragment shader; theme via `u_baseColor`, `u_accentColor`, `u_grainAmount`, `u_isLight` uniforms | Two shaders + branchless mix in JS | Eliminates `createShader/createProgram/createBuffer` on toggle; mirrors GPU constant-folding cost. |
| Render loop lifecycle | Start once, never cancel on theme change | Cancel + restart per theme | rAF restart costs a frame and resets `u_time` — visible flicker. Continuous loop preserves time/phase. |
| Light-mode clamp delta | Encoded as a `u_clampMax` (or branched on `u_isLight`) inside shader | Different shader | Single uniform path; the branch on `u_isLight` is uniform-flow → no GPU divergence cost. |
| ProjectsSection entrance | Parent `.stagger-children` drives stagger; cards have NO per-card animate class | Keep `.scroll-animate-fast` on each card | Removes double-trigger (parent stagger + per-card). One trigger, one source of truth. |
| Toggle classes | `.project-hidden`/`.project-visible` keep ONLY layout props (`height`, `visibility`, `overflow`, `margin`) | Animate via opacity/transform | Layout-only classes never collide with GSAP's transform/opacity space. |

## Data Flow

```
Layout.astro <head>
  ├─ <script is:inline> history.scrollRestoration = 'manual'
  └─ <script is:inline> ScrollTrigger.config({...})
            │
            ▼
CommonScripts.astro (one DOMContentLoaded)
  ├─ initSmoothAnchors()                  ← from src/utils/scrollUtils.ts
  └─ gsap.matchMedia()
        ├─ '(prefers-reduced-motion: no-preference)'
        │     └─ ScrollTrigger.create({ trigger, start:'top 88%', once:true,
        │           onEnter: () => gsap.to(targets, {opacity:1, y:0, scale:1, ...}) })
        └─ '(prefers-reduced-motion: reduce)'
              └─ gsap.set(targets, {opacity:1, y:0, scale:1})

WebGLBackground.astro (module scope, runs once)
  ├─ compile vs + fs  ─┐
  ├─ link program     ─┼─ ONCE
  ├─ create buffer    ─┘
  ├─ set uniforms from current theme
  └─ rAF loop ──── never cancelled ────►
                       ▲
themeChanged event ────┘
  └─ only gl.uniform3f(u_baseColor,...), gl.uniform1f(u_isLight,...), ...

ProjectsSection.astro
  ├─ container.classList += 'stagger-children'   ← picked up by CommonScripts
  ├─ cards: NO 'scroll-animate-fast'
  └─ toggle script (show-more/less)
        └─ flips .project-hidden ↔ .project-visible (layout only)
```

## File Changes

| File | Action | Description |
|---|---|---|
| `src/layouts/Layout.astro` | Modify | Add `<head>` inline scripts: `scrollRestoration='manual'` and `ScrollTrigger.config({ autoRefreshEvents:'visibilitychange,DOMContentLoaded,load', ignoreMobileResize:true })`. |
| `src/components/CommonScripts.astro` | Rewrite | From ~845 lines to ≤120. Keep: single DOMContentLoaded that calls `initSmoothAnchors()` and `initScrollAnimations()`. Delete: all 6 `forceShow*`/`checkVisible`/`cleanupIncomplete` functions, IntersectionObserver, scroll-velocity tracker, `setInterval` polling, `getBoundingClientRect` viewport math, `ScrollTrigger.config` (moved), `scrollRestoration` (moved). New: `gsap.matchMedia()` block with reduced-motion branch; one ScrollTrigger per section using `start:'top 88%'`, `once:true`, `overwrite:'auto'`. |
| `src/utils/scrollUtils.ts` | Create | Export `initSmoothAnchors()`: queries `a[href^="#"]`, attaches click handler that `preventDefault`s and calls `target.scrollIntoView({behavior:'smooth', block:'start'})`. Pure DOM, no GSAP dep. |
| `src/components/WebGLBackground.astro` | Modify | Collapse `fragmentShaderSourceDark` and `fragmentShaderSourceLight` into ONE `fragmentShaderSource`. Add uniforms (see Interfaces). Move `createShader/Program/Buffer` to a single init path. `themeChanged` handler: lookup current theme → `gl.uniform3f`/`gl.uniform1f` only. Remove `cancelAnimationFrame` from theme path. `u_time` accumulates across toggles. |
| `src/components/ProjectsSection.astro` | Modify | Strip `scroll-animate-fast` from card `<article>`. Keep `stagger-children` on grid container. Delete `@keyframes projectFadeInFresh` and `.project-animate-in` rule. Trim `.project-hidden` to `{height:0; overflow:hidden; visibility:hidden; margin:0}` and `.project-visible` to `{height:auto; visibility:visible}`. Show-more/less script untouched (only class flips, no opacity/transform). |
| `src/styles/global.css` | Modify | Remove `transition` declarations from `.scroll-animate, .scroll-animate-fast, .title-animate`. Keep initial state (`opacity:0; transform:translateY(20px); will-change:opacity,transform`) for noscript fallback. Keep `@media (scripting:none)` and `@media (prefers-reduced-motion:reduce)` blocks intact. |

## Interfaces / Contracts

```ts
// src/utils/scrollUtils.ts
export function initSmoothAnchors(root: Document | HTMLElement = document): void;
```

```glsl
// WebGLBackground unified fragment shader uniforms
uniform float u_time;
uniform vec2  u_resolution;
uniform vec3  u_baseColor;     // theme primary background
uniform vec3  u_accentColor;   // theme accent / highlight
uniform float u_grainAmount;   // grain/noise intensity per theme
uniform float u_isLight;       // 0.0 = dark, 1.0 = light
uniform float u_clampMax;      // light-mode clamp ceiling (dark = 1.0)
```

```ts
// CommonScripts public surface (all internal — module-scoped)
function initScrollAnimations(): void;  // gsap.matchMedia + ScrollTrigger.create
```

## Testing Strategy (TDD strict — Red → Green → Refactor)

| Layer | Requirement(s) | What to Test | Approach |
|---|---|---|---|
| Unit | REQ-SCROLL-005 | `initSmoothAnchors` calls `preventDefault` and `scrollIntoView({behavior:'smooth'})` on `a[href="#x"]` click | Vitest + jsdom; mock `scrollIntoView`; assert call args |
| Unit | REQ-SCROLL-001/002 | CommonScripts source contains zero `IntersectionObserver`, `setInterval`, `getBoundingClientRect`, `forceShow*`, `checkVisible`, `cleanupIncomplete` | Vitest reads file as string; regex assertions |
| Unit | REQ-SCROLL-003/004 | `Layout.astro` contains the two head inline scripts; CommonScripts does NOT | String assertions on file contents |
| Unit | REQ-SCROLL-006 | `gsap.matchMedia` is called with `(prefers-reduced-motion: reduce)` and reduced branch uses `gsap.set` not `gsap.to` | Mock `gsap`, drive matchMedia callback, assert |
| Unit | REQ-SCROLL-007 | `global.css` `.scroll-animate*` rule has no `transition*` properties; initial state preserved | Parse CSS string, assert |
| Unit | REQ-WEBGL-001/003 | Spy on `gl.createShader`/`createProgram`/`createBuffer`/`linkProgram`/`cancelAnimationFrame` — exactly once during init, ZERO on `themeChanged`. Spy on `gl.uniform3f`/`uniform1f` — N calls per theme toggle. | Vitest + manual gl mock; dispatch synthetic `themeChanged` |
| Unit | REQ-WEBGL-002 | One `fragmentShaderSource` constant exported; contains required uniform declarations | String assertions |
| Unit | REQ-WEBGL-004 | `u_time` is read from a monotonically increasing source; not reset on theme handler | Trigger toggle, assert `u_time` value > previous |
| Unit | REQ-PROJ-001/002 | ProjectsSection source: zero `scroll-animate-fast` on `<article>`, zero `projectFadeInFresh`, zero `.project-animate-in`; `.project-hidden`/`.project-visible` contain only allowed props | Regex + CSS-rule parse |
| Unit | REQ-PROJ-003 | Toggle handler updates `history.pushState`, flips `aria-pressed`, swaps classes; URL `?show_all=true` is respected on init | jsdom + dispatched click |
| E2E (Playwright) | REQ-SCROLL-001, REQ-WEBGL-004, REQ-PROJ-001 | Scroll through page → all `.scroll-animate*` reach `opacity:1` final state. Toggle theme → no black flash, canvas pixel non-zero at midpoint. ProjectsSection cards stagger in via GSAP, no `@keyframes` flash. | Playwright with `prefers-reduced-motion` matrix (no-pref + reduce) |

TDD order per requirement: write failing assertion → implement minimum to pass → refactor. Group by file to minimize ping-pong: scrollUtils first (smallest, isolated), then global.css cleanup, then ProjectsSection, then CommonScripts rewrite, then Layout head scripts, finally WebGLBackground.

## Migration / Rollout

No data migration. Single PR, 6 file changes. Git revert per file is safe — each change is independent except CommonScripts ↔ Layout (ScrollTrigger.config move must land together). Suggested commit order: (1) `src/utils/scrollUtils.ts` + tests, (2) `global.css`, (3) `ProjectsSection.astro`, (4) `Layout.astro` + `CommonScripts.astro` together, (5) `WebGLBackground.astro`. Run E2E after step 4 and step 5.

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Removing IO/polling fallbacks misses elements above the fold or with lazy layout | Medium | `ScrollTrigger.refresh()` on `load`, `resize`, font-load, and image-load events; `start:'top 88%'` triggers early; `once:true` prevents re-trigger churn |
| `gsap.matchMedia` reduced branch sets state but ScrollTrigger from non-reduced branch still runs | Low | Each branch is scoped — the non-reduced trigger only registers inside its own context, auto-killed on context revert |
| Unified shader visual mismatch vs. original light/dark | Medium | Snapshot baseline pixels of current shaders per theme; assert color delta < threshold after refactor; keep original constants byte-equal in uniform values |
| `u_isLight` branch causes GPU divergence on low-end mobile | Low | Branch is on uniform → constant-flow, no warp divergence; if measurable, mix() instead of `if` |
| Theme toggle race: uniforms set before `useProgram` active | Low | Always call `gl.useProgram(program)` once at init; theme handler re-asserts `useProgram` defensively before `uniform*` |
| Removing `.project-animate-in` breaks visual entrance for projects | Low | Parent `.stagger-children` ScrollTrigger animates children with `stagger:0.08`; verified by E2E |
| `ScrollTrigger.config` in head runs before GSAP CDN finishes | Medium | Place inline `<script>` AFTER GSAP `<script src=...>` in `<head>`; or wrap in `if (window.ScrollTrigger)` with a one-shot `load` listener fallback |
| Astro hydration order changes between dev and prod | Low | Use `is:inline` for head scripts and module-level for component scripts; verified by build output inspection in tests |

## Open Questions

- [ ] Confirm CDN order in current `Layout.astro` to place `ScrollTrigger.config` correctly (post-GSAP). To be verified during sdd-tasks/sdd-apply.
- [ ] Decide if `u_clampMax` is its own uniform or derived from `u_isLight` inside the shader — visual snapshot test will pick the cheaper option.
