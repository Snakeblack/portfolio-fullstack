# Proposal: Astro 6 Migration & Multi-Phase Cleanup

## Intent

Migrate from Astro 5 to 6 and execute cleanup phases 1-5 identified in the code review (docs/ANALYSIS-AND-DECISIONS.md). The codebase has dead files, type/data mismatches, duplicated utilities, CSS conflicts with GSAP, a theme-init race condition, and accessibility issues — all low-risk fixes that remove technical debt and unblock future work on CommonScripts refactor (phase 6, deferred).

## Scope

### In Scope
- Delete 4 dead files: `CommonScripts_backup.astro`, `CommonScripts_clean.astro`, `MobileFallback.astro`, `ScrollReveal.astro`
- Astro 5→6 migration: bump dependency, add `redirectToDefaultLocale: true` to i18n config
- Rewrite `portfolio.ts` types to match `portfolio.json` reality
- Remove fake `phone` field from `portfolio.json`
- Extract `techColorMap`/`hexToRgba` to `src/utils/techColors.ts`
- Fix CSS: remove global `* { transition }`, fix font `'Inter'` → `'Geist Variable'`, remove `.is-visible` / `.stagger-children` rules
- Fix theme-init race: remove duplicate init from `ThemeToggle.astro` and `CommonScripts.astro`, keep only Layout inline
- A11y: add `aria-hidden="true"` + `role="presentation"` to WebGL canvas
- A11y: localize hardcoded "Abrir el menú" in `Navigation.astro`
- A11y: add `<noscript>` fallback for invisible content
- Replace 4× `pageYOffset` → `scrollY` in `CommonScripts.astro`
- Remove `ScrollReveal` import from `Layout.astro`

### Out of Scope (deferred to separate change)
- CommonScripts full refactor (eliminate redundant animation systems)
- WebGL optimization (uniform vs recompilation, visibilitychange)
- ProjectsSection animation simplification
- Content Collections migration
- UA-sniffing → matchMedia replacement (blocked on CommonScripts refactor)
- `define:vars` minimization
- `will-change` JS removal
- Magic number extraction in CommonScripts

## Capabilities

### New Capabilities
- `tech-colors`: Shared color utility module for technology badges (techColorMap + hexToRgba)

### Modified Capabilities
- None — all changes are fixes/refactors of existing untyped or broken behavior. No spec-level behavior changes.

## Approach

Sequenced by risk (lowest first):

1. **Delete dead files** — zero side effects, pure removal
2. **Astro 6 migration** — one config line + dependency bump, verify build
3. **Type fixes** — rewrite `portfolio.ts` to match JSON truth, remove fake `phone`
4. **Module extraction** — create `techColors.ts`, update 2 consumers
5. **CSS fixes** — remove conflicting transitions, fix font, remove `.is-visible` rules
6. **A11y fixes** — aria attributes, localize strings, noscript fallback
7. **Theme init consolidation** — single source of truth in Layout

Each phase is independently deployable and testable.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/CommonScripts_backup.astro` | Removed | Dead backup file |
| `src/components/CommonScripts_clean.astro` | Removed | Dead clean copy |
| `src/components/MobileFallback.astro` | Removed | Unused (never imported) |
| `src/components/ScrollReveal.astro` | Removed | Conflicts with GSAP |
| `src/layouts/Layout.astro` | Modified | Remove ScrollReveal import |
| `src/types/portfolio.ts` | Modified | Rewrite types to match JSON |
| `src/data/portfolio.json` | Modified | Remove fake phone |
| `src/utils/techColors.ts` | New | Shared color utilities |
| `src/components/ProjectsSection.astro` | Modified | Import from techColors |
| `src/components/SkillsSection.astro` | Modified | Import from techColors |
| `src/styles/global.css` | Modified | Remove wildcard transition, fix font, remove `.is-visible` |
| `src/components/WebGLBackground.astro` | Modified | Add aria-hidden, role |
| `src/components/Navigation.astro` | Modified | Localize "Abrir el menú" |
| `src/components/ThemeToggle.astro` | Modified | Remove duplicate theme init |
| `astro.config.mjs` | Modified | Add redirectToDefaultLocale |
| `package.json` | Modified | Astro ^6.0.0 |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Astro 6 breaking change beyond i18n | Low | Project uses no deprecated APIs (verified in analysis); full build test after bump |
| Removing `.is-visible` CSS breaks non-GSAP animations | Low | ScrollReveal (the IO source) is also deleted; GSAP manages all animations |
| Theme init removal causes FOUC | Low | Layout inline script runs before first paint; ThemeToggle keeps toggle logic only |
| `portfolio.ts` rewrite misses edge cases | Low | Types derived directly from JSON data; Vitest tests catch regressions |

## Rollback Plan

Each phase is a separate commit. Revert the specific commit to undo any phase. For Astro 6, revert `package.json` + `pnpm-lock.yaml` + `astro.config.mjs`. All changes are non-destructive except file deletions — those can be restored from git history.

## Dependencies

- Node 24+ (already present) for Astro 6
- Vitest for test validation (already configured)

## Success Criteria

- [ ] `pnpm build` succeeds with Astro 6
- [ ] All 4 dead files removed, no dangling imports
- [ ] `portfolio.ts` types are congruent with `portfolio.json` data
- [ ] `techColors.ts` imported by both ProjectsSection and SkillsSection, zero duplication
- [ ] No `* { transition }` in global.css; font-family references Geist
- [ ] WebGL canvas has `aria-hidden="true"` and `role="presentation"`
- [ ] "Abrir el menú" replaced with translation call
- [ ] Single theme initialization point (Layout inline only)
- [ ] Zero `pageYOffset` references in codebase
- [ ] All tests pass (`pnpm test`)