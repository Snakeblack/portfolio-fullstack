# Apply Progress: animation-refactor-webgl-optimize

## TDD Cycle Evidence

| Phase | RED evidence | GREEN evidence | Refactor outcome | Status |
|---|---|---|---|---|
| 1 — scrollUtils extraction | `pnpm test --run src/__tests__/scrollUtils.test.ts` failed with 5/5 tests red before implementation | same command passed 5/5 after creating `src/utils/scrollUtils.ts` | helper kept small and returns cleanup for listener disposal | ✅ |
| 2 — global.css conflicts | `pnpm test --run src/__tests__/global-css.test.ts` failed in the transition assertions before CSS edit | same command passed 10/10 after removing conflicting transitions | preserved initial hidden state + noscript/reduced-motion fallbacks | ✅ |
| 3 — ProjectsSection simplification | `pnpm test --run src/__tests__/ProjectsSection.test.ts` failed before removing card-level animation system | same command passed 6/6 after simplifying layout classes and removing keyframes | test narrowed to article class to assert actual card ownership | ✅ |
| 4 — Layout + CommonScripts refactor | `pnpm test --run src/__tests__/Layout.test.ts src/__tests__/CommonScripts.test.ts` failed before moving bootstrapping to layout and collapsing CommonScripts | same command passed 10/10 after refactor | `CommonScripts.astro` reduced to 115 lines and uses `gsap.matchMedia()` as single driver | ✅ |
| 5 — WebGL shader uniform refactor | `pnpm test --run src/__tests__/WebGLBackground.test.ts` failed before shader unification | same command passed 7/7 after unified shader + theme uniforms | removed re-init on `themeChanged`; loop stays continuous | ✅ |
| 6 — integrated regression | `pnpm test --run` used as final safety net | 12 files / 80 tests green | pending browser/E2E layer not available in repo | ✅ partial |

## Notes

- `pnpm astro check` became available only after installing `@astrojs/check` + `typescript`.
- Build was NOT executed due to active session restriction, but type checking is a valid non-build verification gate.
