# Design: Astro 6 Migration & Multi-Phase Cleanup

## Technical Approach

Sequenced atomic commits from lowest to highest risk: dead file deletion → Astro 6 migration → type fixes → module extraction → CSS fixes → a11y fixes → theme init consolidation → scroll API fix. Each domain is independently revertable. Strict TDD: Vitest tests written RED → GREEN → REFACTOR for every changeable unit.

## Architecture Decisions

### Decision: File deletion order

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Delete all 4 at once | Fast but hard to bisect | ✅ One commit — all 4 are dead, no interdependency |
| Delete one-by-one | Safe but noisy history | Rejected — no value isolating dead files |

**Rationale**: `CommonScripts_backup`, `CommonScripts_clean`, `MobileFallback`, `ScrollReveal` have zero consumers except `ScrollReveal` imported in `Layout.astro` line 6 + used line 167. Remove import+usage first, then delete files.

### Decision: Astro 6 i18n config

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Add `redirectToDefaultLocale: true` | Preserves current `/` → Spanish behavior | ✅ Chosen |
| Leave default (false in Astro 6) | `/` would need explicit redirect | Rejected — breaks existing URLs |

**Rationale**: Astro 6 changed default from `true` to `false`. Our config uses `prefixDefaultLocale: false` so Spanish serves at `/`. Adding `redirectToDefaultLocale: true` under `routing` maintains identical behavior.

### Decision: portfolio.ts type structure

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Types mirror JSON exactly | No casts needed in components | ✅ Chosen |
| Keep current + use `as` casts | Minimal change, technical debt | Rejected — violates REQ-TYPES-001 |

**Rationale**: JSON has `social` as `{linkedin, github, twitter}` object (not array), `description` as `{es, en}` (not string), plus `technologies`, `year`, `screenshot` fields. Types must match. `personalInfo` needs `greeting`, `sleepingMessage`, `description` as `TranslatedString`. Remove `phone` from JSON. `About` interface becomes `{es: {paragraph1, paragraph2}, en: {paragraph1, paragraph2}}`.

### Decision: techColors module shape

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Single `techColorMap` + `hexToRgba` export | Simple, one import | ✅ Chosen |
| Separate files for map + utils | Over-engineered for 2 exports | Rejected |

**Rationale**: Merge both component maps (ProjectsSection has extra keys like `Vercel`, `Mdx`, `Three.js`; SkillsSection has `Oracle SQL`, `PL/SQL`, `C#`, `C`, `Figma`, `Angular Material`). Union all keys. `default` key uses Tailwind classes (not hex). Export `type TechColorEntry = { bg: string; text: string; border?: string }`.

### Decision: CSS fix strategy

| Action | Target | Rationale |
|--------|--------|-----------|
| Remove | `*, *::before, *::after { transition-* }` (lines 3-9) | Conflicts with GSAP inline styles |
| Change | `font-family: 'Inter'` → `'Geist Variable'` (line 127) | Font already loaded via `@fontsource-variable/geist` |
| Remove | `.is-visible` and `.stagger-children.is-visible` rules (lines 82-87, 99-102) | ScrollReveal deleted; GSAP manages state |
| Keep | `.stagger-children > *` opacity/transform (lines 93-97) | Utility classes still used |
| Add | `@media (scripting: none)` reset for `.scroll-animate*` | Noscript accessibility |

### Decision: Theme init consolidation

| Component | Current behavior | After |
|-----------|-----------------|-------|
| `Layout.astro` (lines 171-179) | Inline `<script is:inline>` sets theme before paint | ✅ KEEP — single source of truth |
| `ThemeToggle.astro` (lines 32-34) | Reads localStorage, toggles `.dark`, calls `updateIcons` | Remove lines 32-34 init; keep toggle handler + `updateIcons` |
| `CommonScripts.astro` (lines 217-232) | `DOMContentLoaded` reads localStorage, calls `applyTheme` | Remove entire theme block; remove `applyTheme` function (lines 44-50) |

**Rationale**: Layout's inline script runs before first paint (no FOUC). ThemeToggle's inline init at line 32-34 is redundant but harmless — however removing it simplifies the flow. CommonScripts init at DOMContentLoaded is definitely redundant and runs late.

### Decision: Test strategy for TDD

| Test layer | What to test | Approach |
|-----------|-------------|----------|
| Unit | `portfolio.json` satisfies `PortfolioData` type | `expectTypeOf` + runtime assertion |
| Unit | `techColorMap` keys, `hexToRgba` correctness | Direct function calls, edge cases (3-char hex, invalid) |
| Unit | `translations.ts` has `nav.menuOpen`/`nav.menuClose` | Property existence check |
| Unit | No `pageYOffset` in source | Grep-based test |
| Integration | Dead file absence | File existence check |
| Integration | CSS rules absence/presence | String matching on `global.css` content |
| E2E | Build succeeds | `pnpm build` exit code |

## Data Flow

```
portfolio.json ──→ portfolio.ts types (validated by test)
                         │
                         ▼
              ProjectsSection.astro ──┐
              SkillsSection.astro  ───┤──→ techColors.ts (shared import)
                                      │
Layout.astro ──→ theme init (inline)  │
ThemeToggle ──→ toggle only (no init) │
CommonScripts ──→ GSAP + scroll (no theme)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/components/CommonScripts_backup.astro` | Delete | Dead backup file |
| `src/components/CommonScripts_clean.astro` | Delete | Dead clean file |
| `src/components/MobileFallback.astro` | Delete | Never imported |
| `src/components/ScrollReveal.astro` | Delete | Conflicts with GSAP |
| `src/layouts/Layout.astro` | Modify | Remove ScrollReveal import (line 6) and usage (line 167) |
| `package.json` | Modify | `astro` → `^6.0.0` |
| `astro.config.mjs` | Modify | Add `redirectToDefaultLocale: true` in `routing` |
| `src/types/portfolio.ts` | Modify | Rewrite all interfaces to match JSON shape |
| `src/data/portfolio.json` | Modify | Remove `phone` field |
| `src/utils/techColors.ts` | Create | Shared `techColorMap` + `hexToRgba` |
| `src/components/ProjectsSection.astro` | Modify | Import from `techColors.ts`, remove local definitions |
| `src/components/SkillsSection.astro` | Modify | Import from `techColors.ts`, remove local definitions |
| `src/styles/global.css` | Modify | Remove wildcard transition, fix font, remove `.is-visible`, add `scripting:none` |
| `src/components/WebGLBackground.astro` | Modify | Add `aria-hidden="true"` and `role="presentation"` to canvas |
| `src/components/Navigation.astro` | Modify | Replace hardcoded "Abrir el menú" with `t.nav.menuOpen`/`menuClose` |
| `src/utils/translations.ts` | Modify | Add `nav.menuOpen` and `nav.menuClose` keys |
| `src/components/ThemeToggle.astro` | Modify | Remove init code (lines 32-34), keep toggle handler |
| `src/components/CommonScripts.astro` | Modify | Remove `applyTheme` + theme init block; `pageYOffset` → `scrollY` |

## Interfaces / Contracts

```typescript
// src/types/portfolio.ts — new shape
export interface TranslatedString { es: string; en: string; }
export interface AboutBlock { paragraph1: string; paragraph2: string; }
export interface About { es: AboutBlock; en: AboutBlock; }
export interface PersonalInfo {
  name: string; title: TranslatedString; greeting: TranslatedString;
  description: TranslatedString; about: About;
  sleepingMessage: TranslatedString; location: string;
  email: string; image: string;
}
export interface SocialLinks { linkedin: string; github: string; twitter: string; }
export interface ProjectEntry {
  name: string; description: TranslatedString;
  technologies: string[]; year: string; screenshot: string;
  url?: string; repo?: string;
}
export interface PortfolioData {
  personalInfo: PersonalInfo; social: SocialLinks;
  experience: ExperienceEntry[]; education: EducationEntry[];
  skills: SkillEntry[]; projects: ProjectEntry[];
  languages: LanguageEntry[];
}

// src/utils/techColors.ts
export type TechColorEntry = { bg: string; text: string; border?: string };
export const techColorMap: Record<string, TechColorEntry>;
export function hexToRgba(hex: string, alpha?: number): string;
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `PortfolioData` type fits `portfolio.json` | `import data; expectTypeOf(data).toMatchTypeOf<PortfolioData>()` |
| Unit | `hexToRgba` — 6-char, 3-char, invalid input | Parameterized Vitest cases |
| Unit | `techColorMap` has `default` key + expected techs | Key existence assertions |
| Unit | Translation keys `nav.menuOpen`/`menuClose` exist | Property check for both locales |
| Unit | No `pageYOffset` in `src/` | Grep via `fs.readFileSync` + regex |
| Integration | Dead files don't exist | `fs.existsSync` returns false |
| Integration | CSS: no `*` transition, no `.is-visible`, has `scripting:none` | Read `global.css`, assert string patterns |
| Integration | Canvas has `aria-hidden` + `role` | Read `WebGLBackground.astro`, assert attributes |
| E2E | `pnpm build` succeeds | `execSync('pnpm build')` exit code 0 |

## Migration / Rollout

No data migration. Each phase = separate git commit. Rollback = revert individual commit. Astro 6 rollback = revert `package.json` + `astro.config.mjs` + `pnpm-lock.yaml`.

## Open Questions

- [ ] None — all decisions resolved from analysis doc.
