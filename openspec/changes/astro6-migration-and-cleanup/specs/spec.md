# Delta Specs: astro6-migration-and-cleanup

## Domain: Dead File Deletion

### ADDED Requirements

#### REQ-DEL-001: Remove dead component files

The system MUST NOT contain `CommonScripts_backup.astro`, `CommonScripts_clean.astro`, `MobileFallback.astro`, or `ScrollReveal.astro` in the component directory. No component SHALL import or reference these files.

##### Scenario: Build succeeds after deletion

- GIVEN the four dead files are deleted
- AND `ScrollReveal` import and `<ScrollReveal />` usage are removed from `Layout.astro`
- WHEN `pnpm build` runs
- THEN the build completes with zero errors and zero warnings about missing modules

##### Scenario: No dangling references

- GIVEN the four files are deleted
- WHEN the source tree is searched for imports of any deleted file
- THEN zero references are found

##### Test: Dead file removal validation

- [x] `pnpm build` succeeds after removing all four files and the ScrollReveal import
- [x] `grep -r "ScrollReveal\|CommonScripts_backup\|CommonScripts_clean\|MobileFallback" src/` returns zero matches

---

## Domain: Astro 6 Migration

### ADDED Requirements

#### REQ-ASTRO-001: Update Astro dependency to v6

The project's `package.json` MUST declare `astro` version `^6.0.0`. The `astro.config.mjs` i18n configuration MUST include `redirectToDefaultLocale: true` under `routing`.

##### Scenario: Spanish route is default without prefix

- GIVEN the i18n config has `defaultLocale: 'es'`, `prefixDefaultLocale: false`, and `redirectToDefaultLocale: true`
- WHEN a user navigates to `/`
- THEN the Spanish locale content is served (no `/es` prefix)
- AND navigation to `/en/` serves English content

##### Scenario: Build succeeds on Astro 6

- GIVEN `astro` is at `^6.0.0` and `redirectToDefaultLocale: true` is set
- WHEN `pnpm build` runs
- THEN the build completes without errors
- AND both `/index.html` and `/en/index.html` are generated in the output

##### Test: Migration validation

- [x] `pnpm build` succeeds
- [x] Output contains `dist/index.html` (Spanish, locale prefix absent)
- [x] Output contains `dist/en/index.html` (English)

---

## Domain: Portfolio Types Fix

### ADDED Requirements

#### REQ-TYPES-001: Align portfolio.ts types with portfolio.json shape

`PortfolioData.social` SHALL be typed as an object with named keys (`linkedin`, `github`, `twitter`), NOT an array. `ProjectEntry.description` SHALL be `TranslatedString`, NOT `string`. `ProjectEntry` MUST include `technologies`, `year`, and `screenshot` fields. `personalInfo` SHALL include `greeting` and `sleepingMessage` as `TranslatedString`, and `description` as `TranslatedString`. The `phone` field MUST NOT exist in `portfolio.json`.

##### Scenario: TypeScript compilation with correct types

- GIVEN `portfolio.ts` types match the actual `portfolio.json` structure
- WHEN TypeScript compilation runs
- THEN zero type errors occur in components consuming `PortfolioData`

##### Scenario: No `as` casts in component code

- GIVEN the corrected types
- WHEN components like `ProjectsSection` or `SkillsSection` access `project.description.es` or `project.technologies`
- THEN no `as any` or `as TranslatedString` casts are needed

##### Scenario: Phone field removed

- GIVEN `portfolio.json` no longer has a `phone` property
- WHEN any component accesses `personalInfo`
- THEN no reference to `phone` exists in the codebase

##### Test: Type alignment validation

- [x] Vitest test: load `portfolio.json`, assert it satisfies the `PortfolioData` type
- [x] Vitest test: `social` is an object with `linkedin`, `github`, `twitter` keys (not an array)
- [x] Vitest test: every `project` has `technologies`, `year`, `screenshot`, and `description` is `{es, en}`
- [x] Vitest test: `personalInfo.description` is `{es, en}`
- [x] No `phone` key in `portfolio.json`
- [x] No `as` casts in component code for type mismatches

---

## Domain: Tech Colors Module Extraction

### ADDED Requirements

#### REQ-TECH-001: Create shared techColors utility module

A new module `src/utils/techColors.ts` MUST export `techColorMap` and `hexToRgba`. Both `ProjectsSection.astro` and `SkillsSection.astro` SHALL import these from the shared module. Zero duplicate definitions of `techColorMap` or `hexToRgba` SHALL exist in component files.

##### Scenario: Single source of truth for tech colors

- GIVEN `src/utils/techColors.ts` exports `techColorMap` and `hexToRgba`
- WHEN `ProjectsSection.astro` and `SkillsSection.astro` import from it
- THEN both components render tech badges with identical colors
- AND searching `src/` for duplicate `techColorMap` object literals returns zero matches

##### Scenario: hexToRgba produces correct RGBA strings

- GIVEN `hexToRgba` receives `"#E34F26"` and alpha `0.7`
- WHEN it computes the result
- THEN it returns `"rgba(227, 79, 38, 0.7)"`

##### Scenario: hexToRgba handles 3-char hex

- GIVEN `hexToRgba` receives `"#F00"` and alpha `1`
- WHEN it computes the result
- THEN it returns `"rgba(255, 0, 0, 1)"`

##### Test: Module extraction validation

- [x] Vitest: `techColorMap` contains key `default` with fallback values
- [x] Vitest: `hexToRgba("#3178C6", 0.5)` → `"rgba(49, 120, 198, 0.5)"`
- [x] Vitest: `hexToRgba("#F00", 1)` → `"rgba(255, 0, 0, 1)"`
- [x] Vitest: `hexToRgba("invalid", 1)` → `"rgba(0,0,0,0)"`
- [x] Grep: `techColorMap` object literal appears only in `techColors.ts`
- [x] Grep: `hexToRgba` function definition appears only in `techColors.ts`

---

## Domain: CSS Fixes

### ADDED Requirements

#### REQ-CSS-001: Remove global wildcard transition rule

`global.css` MUST NOT contain a `* { transition-property: ... }` or `*, *::before, *::after { transition-* }` rule. Component-level transitions (e.g., `transition-colors` via Tailwind) are unaffected.

##### Scenario: No global transition applies to all elements

- GIVEN the wildcard transition rule is removed
- WHEN a GSAP animation sets element opacity/transform
- THEN GSAP has full control — no global CSS transition interferes

##### Test: CSS validation

- [x] Grep `global.css` for `transition-property` outside of utility classes → zero matches on `*` selector
- [x] GSAP animations run without unexpected CSS transition interference

#### REQ-CSS-002: Fix font-family to Geist Variable

`global.css` body font-family MUST reference `'Geist Variable'` as the primary font, NOT `'Inter'`. The `@fontsource-variable/geist` import in `Layout.astro` is already present and correct.

##### Scenario: Rendered font is Geist

- GIVEN `font-family: 'Geist Variable', sans-serif` is set
- WHEN the page loads
- THEN headings and body text render using the Geist Variable font face

##### Test: Font reference validation

- [x] `global.css` body rule contains `font-family: 'Geist Variable'`
- [x] No occurrence of `font-family.*'Inter'` in `global.css`

#### REQ-CSS-003: Remove .is-visible and .stagger-children.is-visible CSS rules

`global.css` MUST NOT contain CSS rules for `.is-visible`, `.scroll-animate.is-visible`, `.scroll-animate-fast.is-visible`, `.title-animate.is-visible`, or `.stagger-children.is-visible`. GSAP manages all animation state inline — `.is-visible` class toggling by IntersectionObserver is removed (ScrollReveal deleted).

##### Scenario: Animation state managed only by GSAP

- GIVEN `.is-visible` rules are removed from CSS
- AND ScrollReveal is deleted
- WHEN GSAP ScrollTrigger animates elements
- THEN opacity/transform are set via inline styles — no CSS class conflicts

##### Test: CSS class removal validation

- [x] Grep `global.css` for `.is-visible` → zero matches
- [x] Grep `global.css` for `.stagger-children.is-visible` → zero matches
- [x] Grep `global.css` for `.stagger-children > *` opacity/transform rules → these ARE kept (util classes)

#### REQ-CSS-004: Add scripting:none fallback for animated elements

`global.css` MUST include an `@media (scripting: none)` rule that sets `opacity: 1` and `transform: none` on `.scroll-animate`, `.scroll-animate-fast`, and `.title-animate`, ensuring content is visible when JavaScript is disabled.

##### Scenario: Content visible without JavaScript

- GIVEN the `@media (scripting: none)` rule exists
- WHEN a browser renders the page with JavaScript disabled
- THEN all `.scroll-animate`, `.scroll-animate-fast`, and `.title-animate` elements are fully visible (opacity: 1, no transform)

##### Test: Noscript fallback validation

- [x] `global.css` contains `@media (scripting: none)` with opacity/transform reset for animated classes

---

## Domain: Accessibility Fixes

### ADDED Requirements

#### REQ-A11Y-001: Decorative canvas hidden from screen readers

The `<canvas id="webgl-background">` element MUST have `aria-hidden="true"` and `role="presentation"`. Screen readers SHALL NOT announce the WebGL canvas.

##### Scenario: Canvas not in accessibility tree

- GIVEN `aria-hidden="true"` and `role="presentation"` are set on the canvas
- WHEN a screen reader processes the page
- THEN the canvas element is excluded from the accessibility tree

##### Test: Canvas accessibility attributes

- [x] `<canvas>` has `aria-hidden="true"`
- [x] `<canvas>` has `role="presentation"`

#### REQ-A11Y-002: Localize menu button label

The `<span class="sr-only">Abrir el menú</span>` in `Navigation.astro` MUST use the translation system. A `nav.menuOpen` key SHALL be added to `translations.ts` for both `es` and `en` locales. The button's `aria-expanded` state changes the label — when expanded, it reads "Cerrar el menú" / "Close menu".

##### Scenario: Menu label switches language

- GIVEN `nav.menuOpen` and `nav.menuClose` keys exist in `translations.ts`
- WHEN `currentLocale` is `'en'`
- THEN the menu button sr-only text reads "Open menu" (collapsed) and "Close menu" (expanded)

##### Scenario: Menu label in Spanish

- GIVEN `currentLocale` is `'es'`
- THEN the menu button reads "Abrir el menú" (collapsed) and "Cerrar el menú" (expanded)

##### Test: Menu label localization

- [x] `translations.ts` has `nav.menuOpen` and `nav.menuClose` keys for both locales
- [x] `Navigation.astro` uses `t.nav.menuOpen` / `t.nav.menuClose` instead of hardcoded string
- [x] Button label updates when `aria-expanded` toggles

---

## Domain: Theme Init Consolidation

### ADDED Requirements

#### REQ-THEME-001: Single theme initialization source

Theme initialization SHALL occur in exactly ONE place: the inline `<script is:inline>` block in `Layout.astro` (lines 172-179). `ThemeToggle.astro` MUST NOT re-initialize the theme from localStorage or matchMedia — it SHALL only expose `updateIcons` and handle toggle logic. `CommonScripts.astro` MUST NOT contain `applyTheme` or theme initialization code — the `DOMContentLoaded` theme block (lines 215-232) and `applyTheme` function (lines 44-50) SHALL be removed.

##### Scenario: No FOUC on page load

- GIVEN Layout's inline script runs before first paint
- WHEN the page renders
- THEN the correct theme (dark or light) is applied immediately — no flash of unstyled content

##### Scenario: Toggle still works

- GIVEN `applyTheme` and init code are removed from CommonScripts and ThemeToggle
- WHEN the user clicks the theme toggle button
- THEN the theme switches and persists via localStorage

##### Scenario: No duplicate initialization

- GIVEN only Layout's inline script initializes the theme
- WHEN searching for `localStorage.getItem('color-theme')` in client-side scripts
- THEN it appears only in `Layout.astro`'s inline script and `ThemeToggle.astro`'s toggle handler (NOT in initialization code)

##### Test: Theme init consolidation validation

- [x] `ThemeToggle.astro` does NOT call `localStorage.getItem('color-theme')` outside of toggle handler
- [x] `ThemeToggle.astro` does NOT call `classList.toggle('dark', ...)` for initialization
- [x] `CommonScripts.astro` does NOT contain `applyTheme` function
- [x] `CommonScripts.astro` does NOT contain theme initialization in `DOMContentLoaded`
- [x] Layout inline script remains unchanged and functional
- [x] Vitest or manual: theme persists on reload, toggle works in both directions

---

## Domain: pageYOffset Deprecation

### ADDED Requirements

#### REQ-SCROLL-001: Replace pageYOffset with scrollY

All occurrences of `window.pageYOffset` in `CommonScripts.astro` MUST be replaced with `window.scrollY`. Zero occurrences of `pageYOffset` SHALL remain in the codebase.

##### Scenario: scrollY used consistently

- GIVEN all `window.pageYOffset` references are replaced
- WHEN `CommonScripts.astro` executes scroll handlers
- THEN `window.scrollY` is used to read the current scroll position

##### Test: pageYOffset removal validation

- [x] Grep `src/` for `pageYOffset` → zero matches
- [x] Scroll handlers in CommonScripts use `window.scrollY`