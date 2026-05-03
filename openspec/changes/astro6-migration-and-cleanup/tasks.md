# Tasks: Astro 6 Migration & Multi-Phase Cleanup

## Phase 1: Dead File Cleanup (DEL-001)

- [x] 1.1 RED: Write test `src/__tests__/dead-files.test.ts` — assert 4 files don't exist, grep src/ for dangling imports
- [x] 1.2 GREEN: Delete `CommonScripts_backup.astro`, `CommonScripts_clean.astro`, `MobileFallback.astro`, `ScrollReveal.astro`
- [x] 1.3 GREEN: Remove `ScrollReveal` import + `<ScrollReveal />` from `Layout.astro`

## Phase 2: Astro 6 Migration (ASTRO-001)

- [x] 2.1 RED: Write test `src/__tests__/astro6-build.test.ts` — assert `pnpm build` exits 0, check `dist/index.html` + `dist/en/index.html` exist
- [x] 2.2 GREEN: Update `package.json` astro to `^6.0.0`, add `redirectToDefaultLocale: true` in `astro.config.mjs` routing
- [x] 2.3 GREEN: Run `pnpm install`

## Phase 3: Type Fixes (TYPES-001)

- [x] 3.1 RED: Write test `src/__tests__/portfolio-types.test.ts` — assert portfolio.json satisfies PortfolioData, social is object not array, every project has technologies/year/screenshot, description is {es,en}, no phone key
- [x] 3.2 GREEN: Rewrite `src/types/portfolio.ts` — TranslatedString, About, PersonalInfo (with greeting, sleepingMessage, description as TranslatedString), SocialLinks, ProjectEntry (with technologies, year, screenshot), PortfolioData
- [x] 3.3 GREEN: Remove `phone` from `src/data/portfolio.json`

## Phase 4: Module Extraction (TECH-001)

- [x] 4.1 RED: Write test `src/__tests__/techColors.test.ts` — hexToRgba cases (#E34F26→rgba, #F00→rgba, invalid→rgba(0,0,0,0)), techColorMap has `default` key
- [x] 4.2 GREEN: Create `src/utils/techColors.ts` — export ` TechColorEntry`, `techColorMap`, `hexToRgba`
- [x] 4.3 GREEN: Update `ProjectsSection.astro` + `SkillsSection.astro` — import from techColors, remove local definitions

## Phase 5: CSS Fixes (CSS-001 to 004)

- [x] 5.1 RED: Write test `src/__tests__/global-css.test.ts` — assert no `*` transition-property, no `.is-visible`, has `Geist Variable`, has `scripting: none`
- [x] 5.2 GREEN: Edit `src/styles/global.css` — remove wildcard transition, change font to Geist Variable, remove `.is-visible` rules, add `@media (scripting: none)` reset

## Phase 6: A11y Fixes (A11Y-001, 002)

- [x] 6.1 RED: Write test `src/__tests__/a11y.test.ts` — assert canvas has aria-hidden + role=presentation, translations have nav.menuOpen/nav.menuClose for es+en
- [x] 6.2 GREEN: Add `aria-hidden="true"` + `role="presentation"` to canvas in `WebGLBackground.astro`
- [x] 6.3 GREEN: Add `nav.menuOpen`/`nav.menuClose` keys to `src/utils/translations.ts`, update `Navigation.astro` to use `t.nav.menuOpen`/`t.nav.menuClose`

## Phase 7: Theme + Scroll Fix (THEME-001, SCROLL-001)

- [x] 7.1 RED: Write test `src/__tests__/theme-scroll.test.ts` — grep ThemeToggle for no init localStorage.getItem outside toggle handler, grep CommonScripts for no applyTheme, grep src/ for zero pageYOffset
- [x] 7.2 GREEN: Remove init code (lines 32-34) from `ThemeToggle.astro`, keep toggle handler
- [x] 7.3 GREEN: Remove `applyTheme` function + theme DOMContentLoaded block from `CommonScripts.astro`
- [x] 7.4 GREEN: Replace all `window.pageYOffset` → `window.scrollY` in `CommonScripts.astro`

## Phase 8: Final Verification

- [x] 8.1 Run `pnpm test` — all tests green
- [x] 8.2 Run `pnpm build` — build succeeds with zero errors
