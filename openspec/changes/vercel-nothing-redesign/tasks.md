# Tasks: Vercel/Nothing Minimal Industrial Redesign

## Summary Table

| ID | Description | Batch | Complexity | Dependencies |
|----|-------------|-------|------------|--------------|
| T-001 | Install Geist Mono dependency | Foundation | S | — |
| T-002 | Replace color tokens in @theme (hue 240→260, near-achromatic) | Foundation | M | — |
| T-003 | Add gradient tokens to @theme | Foundation | S | T-002 |
| T-004 | Add body::after grain overlay CSS | Foundation | M | T-002 |
| T-005 | Add .glass-card utility CSS | Foundation | M | T-003 |
| T-006 | Update CSS animation fallback translateY (20→5, 10→5) | Foundation | S | — |
| T-007 | Add font-geist-mono utility class | Foundation | S | T-001 |
| T-008 | Import Geist Mono in Layout.astro | Foundation | S | T-001 |
| T-009 | Rewrite WebGL fragment shader (wave→grid) | Background | L | — |
| T-010 | Update THEME_UNIFORMS and TypeScript interfaces | Background | M | T-009 |
| T-011 | Remove canvas blur-lg class | Background | S | T-009 |
| T-012 | Simplify Navigation — remove letter-bounce, monospace labels, thinner bar | Core | M | T-007, T-008 |
| T-013 | Redesign HeroSection — remove typing, dramatic sizes, status dot | Core | M | T-008, T-002 |
| T-014 | Reduce animation amplitude in CommonScripts (y values, stagger) | Core | S | T-006 |
| T-015 | Redesign ProjectsSection — glass cards, glass backgrounds, monochrome chips | Content | L | T-005, T-002 |
| T-016 | Redesign ExperienceSection — monospace metadata, simplified timeline | Content | M | T-007, T-008 |
| T-017 | Redesign SkillsSection — monochrome chips, glass cards | Content | L | T-005, T-007 |
| T-018 | Update AboutSection heading typography | Content | S | T-002 |
| T-019 | Add monospace treatment to Footer | Chrome | S | T-007 |
| T-020 | Convert SocialLinks to ghost style | Chrome | S | T-002 |
| T-021 | Simplify ThemeToggle to minimal style | Chrome | S | — |
| T-022 | Update scrollbar color tokens (verify hue 260) | Foundation | S | T-002 |
| T-023 | Add prefers-reduced-motion grain overlay disable | Foundation | S | T-004 |

**Total tasks: 23**
**Estimated effort: 6×S + 8×M + 2×L + 7×S_chrome = S×6, M×8, L×2, Chrome×7**

---

## Batch 1: Foundation (T-001 through T-008, T-022, T-023)

Foundation tasks establish the design system tokens, CSS utilities, and font setup that all subsequent batches depend on.

### T-001: Install Geist Mono dependency

**Description**: Add `@fontsource-variable/geist-mono` as a dependency.

**TDD test spec**:
- File: `src/__tests__/Layout.test.ts` (extend)
- Test: `should import geist-mono/wght.css in Layout head`
- Assert: Layout.astro source contains `@fontsource-variable/geist-mono/wght.css`

**Implementation spec**:
- Run: `pnpm add @fontsource-variable/geist-mono`
- Verify `package.json` lists the new dependency
- Dependencies: none

**Complexity**: S

---

### T-002: Replace color tokens in @theme (hue 240→260, near-achromatic)

**Description**: Update all 14 oklch color tokens in `src/styles/global.css` `@theme` block from hue 240/higher chroma to hue 260/near-achromatic.

**TDD test spec**:
- File: `src/__tests__/design-system-css.test.ts` (new)
- Tests:
  - `all base tokens use chroma ≤ 0.02`
  - `all accent tokens use chroma 0.18–0.22`
  - `all tokens use hue 260`
  - `light text-bg L separation ≥ 0.25`
  - `dark text-bg L separation ≥ 0.25`
  - `no oklch values use hue 240 in @theme block`

**Implementation spec**:
- Edit `src/styles/global.css` lines 51–68
- Replace each token with the values from REQ-DS-001:
  - `--color-light-bg: oklch(0.985 0.005 260);`
  - `--color-light-text: oklch(0.15 0.01 260);`
  - `--color-light-subtext: oklch(0.40 0.01 260);`
  - `--color-light-card-bg: oklch(0.965 0.005 260);`
  - `--color-light-border: oklch(0.88 0.008 260);`
  - `--color-light-accent: oklch(0.55 0.20 260);`
  - `--color-light-accent-hover: oklch(0.50 0.22 260);`
  - `--color-dark-bg: oklch(0.11 0.008 260);`
  - `--color-dark-text: oklch(0.93 0.005 260);`
  - `--color-dark-subtext: oklch(0.58 0.01 260);`
  - `--color-dark-card-bg: oklch(0.16 0.01 260);`
  - `--color-dark-border: oklch(0.22 0.01 260);`
  - `--color-dark-accent: oklch(0.65 0.20 260);`
  - `--color-dark-accent-hover: oklch(0.70 0.22 260);`
- Dependencies: none

**Complexity**: M

---

### T-003: Add gradient tokens to @theme

**Description**: Add `--color-gradient-start` and `--color-gradient-end` tokens in the `@theme` block.

**TDD test spec**:
- File: `src/__tests__/design-system-css.test.ts` (extend)
- Tests:
  - `defines --color-gradient-start in @theme`
  - `defines --color-gradient-end in @theme`
  - `gradient-start chroma is 0.20`
  - `gradient-end chroma is 0.18`

**Implementation spec**:
- Edit `src/styles/global.css` `@theme` block, add after accent tokens:
  ```css
  --color-gradient-start: oklch(0.55 0.20 260);
  --color-gradient-end: oklch(0.65 0.18 300);
  ```
- Dependencies: T-002

**Complexity**: S

---

### T-004: Add body::after grain overlay CSS

**Description**: Add `body::after` pseudo-element with inline SVG noise pattern for grain texture.

**TDD test spec**:
- File: `src/__tests__/design-system-css.test.ts` (extend)
- Tests:
  - `body::after has position fixed, inset 0, z-index >= 1`
  - `body::after has pointer-events none`
  - `body::after has opacity between 0.02 and 0.04`
  - `body::after has mix-blend-mode overlay`
  - `body::after has background-image with data URI (SVG)`
  - `dark mode body::after has opacity (check for .dark selector or higher opacity)`

**Implementation spec**:
- Edit `src/styles/global.css`, add after the body rule:
  ```css
  body::after {
    content: '';
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 256px 256px;
  }

  .dark body::after,
  body.dark::after {
    opacity: 0.05;
  }
  ```
- Dependencies: T-002 (for color context)

**Complexity**: M

---

### T-005: Add .glass-card utility CSS

**Description**: Add `.glass-card` and `.glass-card::before` CSS rules with mask-composite fallback.

**TDD test spec**:
- File: `src/__tests__/design-system-css.test.ts` (extend)
- Tests:
  - `.glass-card class exists in global.css`
  - `.glass-card::before uses mask-composite: exclude or -webkit-mask-composite: xor`
  - `.glass-card::before references --color-gradient-start and --color-gradient-end`
  - `@supports not (mask-composite: exclude) fallback exists`

**Implementation spec**:
- Edit `src/styles/global.css`, add in the `@layer utilities` section or after:
  ```css
  .glass-card {
    position: relative;
    background: transparent;
    border: none;
  }

  .glass-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    pointer-events: none;
    z-index: 0;
  }

  @supports not (mask-composite: exclude) {
    .glass-card {
      border: 1px solid var(--color-light-border);
    }
    .dark .glass-card {
      border: 1px solid var(--color-dark-border);
    }
  }
  ```
- Dependencies: T-003

**Complexity**: M

---

### T-006: Update CSS animation fallback translateY (20→5, 10→5)

**Description**: Update the CSS fallback animation values in `global.css` to match the reduced animation amplitude.

**TDD test spec**:
- File: `src/__tests__/animation-amplitude.test.ts` (new)
- Tests:
  - `global.css .scroll-animate translateY is 5px not 20px`
  - `global.css .stagger-children > * translateY is 5px not 10px`

**Implementation spec**:
- Edit `src/styles/global.css` lines 75–86 (the `@layer utilities` block):
  - Change `.scroll-animate, .scroll-animate-fast, .title-animate` block: `transform: translateY(20px)` → `transform: translateY(5px)`
  - Change `.stagger-children > *` block: `transform: translateY(10px)` → `transform: translateY(5px)`
- Dependencies: none

**Complexity**: S

---

### T-007: Add font-geist-mono utility class

**Description**: Add a Tailwind utility class for Geist Mono font-family in `global.css`.

**TDD test spec**:
- File: `src/__tests__/design-system-css.test.ts` (extend)
- Tests:
  - `global.css defines font-family containing 'Geist Mono'`

**Implementation spec**:
- Edit `src/styles/global.css`, add in `@layer utilities` or as a standalone utility:
  ```css
  .font-geist-mono {
    font-family: 'Geist Mono', 'Geist Variable', monospace;
  }
  ```
- Note: Tailwind v4 `font-mono` already includes `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`. We need Geist Mono to appear first, so either use custom class or override the theme. Since Layout.astro will import the font, adding `font-mono` with Geist Mono as first in stack via `@theme` `--font-mono` is also valid. Use `@theme { --font-mono: 'Geist Mono', 'Geist Variable', monospace; }` approach to make `font-mono` class use Geist Mono.
- Dependencies: T-001

**Complexity**: S

---

### T-008: Import Geist Mono in Layout.astro

**Description**: Add the `@fontsource-variable/geist-mono/wght.css` import in Layout.astro.

**TDD test spec**:
- File: `src/__tests__/Layout.test.ts` (extend)
- Tests:
  - `imports geist-mono/wght.css`
  - `Geist Mono import is a separate import from Geist Variable`

**Implementation spec**:
- Edit `src/layouts/Layout.astro`, add import alongside existing Geist:
  ```
  import "@fontsource-variable/geist/wght.css";
  import "@fontsource-variable/geist-mono/wght.css";
  ```
- Dependencies: T-001

**Complexity**: S

---

### T-022: Update scrollbar color tokens (verify hue 260)

**Description**: Verify and update scrollbar color fallback values that reference the old hue-240 tokens.

**TDD test spec**:
- File: `src/__tests__/design-system-css.test.ts` (extend)
- Tests:
  - `no oklch values use hue 240 in scrollbar rules`

**Implementation spec**:
- Since scrollbar colors use `var(--color-*)` references (lines 6, 9-10, 43-48), they inherit the new tokens automatically from T-002. Just verify no raw hue-240 oklch values exist in scrollbar rules.
- Read through scrollbar rules in `global.css` and verify all use `var(--color-*)` or new hue-260 values.
- Dependencies: T-002

**Complexity**: S

---

### T-023: Add prefers-reduced-motion grain overlay disable

**Description**: Add CSS rule to disable grain overlay when user prefers reduced motion.

**TDD test spec**:
- File: `src/__tests__/design-system-css.test.ts` (extend)
- Tests:
  - `prefers-reduced-motion sets body::after opacity to 0`

**Implementation spec**:
- Edit `src/styles/global.css`, add inside the existing `@media (prefers-reduced-motion: reduce)` block:
  ```css
  body::after {
    opacity: 0;
  }
  ```
- Dependencies: T-004

**Complexity**: S

---

### Batch 1 Verification Steps

1. `pnpm test:run` — all existing tests pass + new design-system tests pass
2. Visual: token values verify (hue 260, chroma ≤ 0.02 for base, 0.20 for accent)
3. Visual: grain overlay visible but subtle in both themes
4. Visual: glass-card renders correctly in both themes
5. Visual: `font-mono` class renders text in Geist Mono

---

## Batch 2: Background (T-009 through T-011)

### T-009: Rewrite WebGL fragment shader (wave→grid)

**Description**: Replace the entire fragment shader source string in `WebGLBackground.astro` with the dot-matrix grid shader.

**TDD test spec**:
- File: `src/__tests__/WebGLBackground.test.ts` (extend existing, add new describe blocks)
- Tests:
  - `fragment shader source contains fract() (grid sampling)`
  - `fragment shader source does NOT contain distance-based wave logic`
  - `fragment shader uses u_gridSize uniform`
  - `fragment shader uses u_gridColor uniform`
  - `fragment shader uses u_gridLineWidth uniform`
  - `fragment shader uses u_displacementAmplitude`
  - `fragment shader uses u_displacementSpeed`
  - `fragment shader uses u_grainIntensity (not u_grainAmount)`
  - `fragment shader uses u_fadeRadius`
  - `fragment shader uses u_pulseSpeed`
  - `fragment shader preserves hash function fract(sin(dot(...)))`

**Implementation spec**:
- Edit `src/components/WebGLBackground.astro`
- Replace the `fragmentShaderSource` string with the dot-matrix grid shader from the design document
- The shader uses uniforms: `u_resolution`, `u_time`, `u_baseColor`, `u_gridSize`, `u_gridColor`, `u_gridLineWidth`, `u_fadeRadius`, `u_pulseSpeed`, `u_grainIntensity`, `u_isLight`
- Keep the same GLSL structure: `precision mediump float;` header, `main()` entry point
- Dependencies: none (self-contained shader rewrite)

**Complexity**: L

---

### T-010: Update THEME_UNIFORMS and TypeScript interfaces

**Description**: Replace wave-specific uniforms with dot-matrix specific uniforms in the TypeScript portion of `WebGLBackground.astro`.

**TDD test spec**:
- File: `src/__tests__/WebGLBackground.test.ts` (extend existing, add new describe blocks)
- Tests:
  - `does NOT define u_centerAmplitude`
  - `does NOT define u_centerSpeed`
  - `does NOT define u_colorModFactors`
  - `does NOT define u_colorModOffsets`
  - `does NOT define u_smoothstepRange`
  - `does NOT define u_colorSpeed`
  - `does NOT define u_distanceMults`
  - `defines u_gridSize`
  - `defines u_gridColor as vec3`
  - `defines u_gridLineWidth`
  - `defines u_displacementAmplitude`
  - `defines u_displacementSpeed`
  - `defines u_grainIntensity`
  - `dark theme: baseColor is near-black [0.04, 0.04, 0.06] or [0.06, 0.06, 0.10]`
  - `dark theme: gridColor is cool blue-gray`
  - `dark theme: grainIntensity is 0.04 or 0.05`
  - `light theme: baseColor is near-white [0.94, 0.94, 0.96] or [0.97, 0.97, 0.98]`
  - `light theme: gridColor is medium blue-gray`
  - `light theme: grainIntensity is 0.02 or 0.03`
  - `GridThemeUniforms interface has gridSize, gridColor, gridLineWidth, displacementAmplitude, displacementSpeed, grainIntensity`
  - `UniformHandles interface has matching WebGLUniformLocation entries`
  - `GridThemeUniforms does NOT have centerAmplitude, colorModFactors, smoothstepRange, distanceMults, colorSpeed`

**Implementation spec**:
- Edit `src/components/WebGLBackground.astro`
- Replace `ThemeUniforms` interface with `GridThemeUniforms`:
  ```typescript
  interface GridThemeUniforms {
    baseColor: [number, number, number];
    gridSize: number;
    gridColor: [number, number, number];
    gridLineWidth: number;
    fadeRadius: number;
    pulseSpeed: number;
    grainIntensity: number;
    isLight: number;
  }
  ```
- Replace `UniformHandles` interface with new fields matching GLSL uniforms
- Replace `THEME_UNIFORMS` record with dot-matrix specific values (from specs)
- Update `applyThemeUniforms()` to use new uniform names
- Update uniform location retrieval in initialization
- Dependencies: T-009

**Complexity**: M

---

### T-011: Remove canvas blur-lg class

**Description**: Remove `blur-lg` class from the `<canvas>` element in `WebGLBackground.astro`.

**TDD test spec**:
- File: `src/__tests__/WebGLBackground.test.ts` (extend)
- Tests:
  - `canvas element does NOT have blur-lg class`
  - `canvas still has id webgl-background`
  - `canvas still has aria-hidden="true"`
  - `canvas still has role="presentation"`

**Implementation spec**:
- Edit `src/components/WebGLBackground.astro`
- Find `<canvas id="webgl-background" class="blur-lg" ...>` and remove `blur-lg` from the class
- Result: `<canvas id="webgl-background" aria-hidden="true" role="presentation" ...>`
- Dependencies: T-009

**Complexity**: S

---

### Batch 2 Verification Steps

1. `pnpm test:run` — all tests pass including WebGL test extensions
2. Visual: WebGL canvas shows dot-matrix grid, not organic waves
3. Visual: Grid renders correctly in both light and dark themes
4. Visual: Grid is crisp/sharp (no blur since `blur-lg` removed)
5. Visual: Theme transition smoothly updates grid colors without context reinit

---

## Batch 3: Core Components (T-012 through T-014)

### T-012: Simplify Navigation — remove letter-bounce, monospace labels, thinner bar

**Description**: Remove letter-bounce animation, add monospace labels, reduce navbar height, remove animated underline.

**TDD test spec**:
- File: `src/__tests__/Navigation.test.ts` (new)
- Tests:
  - `no .letter-span class or letter-span spans on name link`
  - `no subtleLetterBounce keyframes in CSS`
  - `no .mmrg-link .letter-span keyframes in CSS`
  - `no .nav-item a::after pseudo-element styles`
  - `nav bar height uses h-12 or h-14 (not h-16 or h-20)`
  - `nav link items have font-mono class`
  - `nav link items have tracking-[0.05em] class`
  - `nav link items have uppercase class`
  - `mobile menu items have font-mono class`
  - `mobile menu items have tracking-[0.05em] class`

**Implementation spec**:
- Edit `src/components/Navigation.astro`:
  1. Remove letter-bounce spans (lines 26-28): `{name.split('').map((char, index) => (<span class="letter-span" ...>{char}</span>))}` → plain text `{name}`
  2. Remove `mmrg-link` class from name link
  3. Change nav bar height: `h-16 md:h-20` → `h-12 md:h-14`
  4. Add monospace treatment to nav items: add `font-mono text-xs tracking-[0.05em] uppercase` to desktop nav links
  5. Mobile menu items: `font-mono tracking-[0.05em] uppercase`
  6. Remove entire `<style>` block for:
     - `.mmrg-link .letter-span { display: inline-block; ... }`
     - `.mmrg-link:hover .letter-span { animation-name: subtleLetterBounce; ... }`
     - `@keyframes subtleLetterBounce { ... }`
     - `.nav-item a::after { content: ''; ... }` (both desktop and hover rules)
  7. Remove `hover:bg-light-card-bg dark:hover:bg-dark-card-bg` from mobile menu toggle button
- Dependencies: T-007, T-008

**Complexity**: M

---

### T-013: Redesign HeroSection — remove typing, dramatic sizes, status dot

**Description**: Remove typing animation, replace with static dramatic heading, update CTA to ghost style.

**TDD test spec**:
- File: `src/__tests__/HeroSection.test.ts` (new)
- Tests:
  - `no id="typing-name" span`
  - `no blinking cursor | span (animate-pulse span)`
  - `no script block with typing animation logic (DOMContentLoaded typing code)`
  - `hero h1 has text-[3rem] class`
  - `hero h1 has lg:text-[6rem] class`
  - `hero h1 has tracking-[-0.025em] or equivalent tight tracking`
  - `hero h1 has font-bold class`
  - `hero h1 has leading-none class`
  - `name span has text-light-accent and dark:text-dark-accent`
  - `hero h1 contains a <br> element`
  - `CTA link has font-mono class`
  - `CTA link has tracking-[0.05em] class`
  - `CTA link has uppercase class`
  - `CTA link does NOT have shadow-sm or hover:shadow-md`
  - `CTA link has border border-light-accent/50 class`

**Implementation spec**:
- Edit `src/components/HeroSection.astro`:
  1. Replace h1 content (line 16-17):
     ```html
     <h1 class="text-[3rem] lg:text-[6rem] font-bold tracking-[-0.025em] leading-none text-light-text dark:text-dark-text mb-6 title-animate">
       {greeting}<br>
       <span class="text-light-accent dark:text-dark-accent">{name}</span>
     </h1>
     ```
  2. Remove `id="typing-name"` span and the blinking cursor `|` span
  3. Remove the entire `<script>` block (lines 47-84)
  4. Update CTA link classes:
     ```
     class="inline-flex items-center gap-2 font-mono tracking-[0.05em] text-xs uppercase text-light-accent dark:text-dark-accent px-6 py-2.5 rounded-md border border-light-accent/50 dark:border-dark-accent/50 hover:bg-light-accent/5 dark:hover:bg-dark-accent/5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent text-pretty"
     ```
  5. Keep the sleeping message status dot styling (already present)
- Dependencies: T-008, T-002

**Complexity**: M

---

### T-014: Reduce animation amplitude in CommonScripts (y values, stagger)

**Description**: Update GSAP scroll animation initial values in `CommonScripts.astro` to use reduced translateY amplitudes and stagger.

**TDD test spec**:
- File: `src/__tests__/CommonScripts.test.ts` (extend existing describe, add new describe)
- Tests:
  - `scroll-animate initial y value is ≤ 5`
  - `scroll-animate-fast initial y value is ≤ 5`
  - `title-animate initial y value is ≤ 5`
  - `stagger-children initial y value is ≤ 5`
  - `stagger delay is ≤ 0.03 (reduced from 0.05)`

**Implementation spec**:
- Edit `src/components/CommonScripts.astro`
- Find all GSAP `y` property values and update:
  - `scroll-animate`: `y: 20` → `y: 5`
  - `scroll-animate-fast`: `y: 15` → `y: 3`
  - `title-animate`: `y: 10` → `y: 5` (or `y: 2` depending on context)
  - `.stagger-children > *`: `y: 15` → `y: 5`
- Update stagger delay: `stagger: 0.05` → `stagger: 0.03`
- Keep `scale` values (0.99) unchanged as per REQ-DS-004
- Keep all other GSAP parameters (duration, ease, ScrollTrigger config) unchanged
- Dependencies: T-006

**Complexity**: S

---

### Batch 3 Verification Steps

1. `pnpm test:run` — all tests pass
2. Visual: navigation is thinner, uses monospace labels, no letter-bounce
3. Visual: hero shows static text with dramatic sizing, no typing effect
4. Visual: scroll animations are subtle (5px vs 20px)
5. Accessibility: focus-visible rings still work on nav links and CTA

---

## Batch 4: Content Sections (T-015 through T-018)

### T-015: Redesign ProjectsSection — glass cards, glass backgrounds, monochrome chips

**Description**: Replace filled cards with ghost/border-only cards using glass backgrounds, replace colored tech chips with monochrome.

**TDD test spec**:
- File: `src/__tests__/ProjectsSection.test.ts` (extend existing)
- Tests:
  - `project cards do NOT have bg-light-card-bg class`
  - `project cards do NOT have bg-dark-card-bg class`
  - `project cards have glass-card class`
  - `project cards have transparent or bg-transparent background`
  - `tech chips do NOT use techColorMap for inline styles (no style attribute with background-color from techColorMap)`
  - `tech chips have border classes (border border-light-border dark:border-dark-border)`
  - `tech chips use rounded (not rounded-full)`
  - `tech chips have font-mono class`
  - `tech chips have tracking-[0.05em] class`
  - `project cards do NOT have 3D hover transform (no rotateX, no translateY(-12px) in hover)`

**Implementation spec**:
- Edit `src/components/ProjectsSection.astro`:
  1. Replace card `<article>` classes: remove `bg-light-card-bg dark:bg-dark-card-bg`, add `glass-card` class, add `bg-transparent`
  2. Remove 3D hover transform styles (remove `rotateX`, `translateY(-12px)` from hover CSS/script)
  3. Replace subtle hover: `hover:translate-y-[-2px]` or similar subtle shift
  4. Replace tech chip rendering: remove `techColorMap` usage for `style` attributes, use monochrome classes instead:
     ```
     class="px-2.5 py-0.5 text-[0.7rem] font-mono tracking-[0.05em] rounded border border-light-border dark:border-dark-border text-light-subtext dark:text-dark-subtext bg-transparent hover:border-light-accent dark:hover:border-dark-accent hover:text-light-accent dark:hover:text-dark-accent"
     ```
  5. Change chip `rounded-full` → `rounded`
  6. Keep the `techColorMap` import but don't use it for chip rendering (as per design decision)
- Dependencies: T-005, T-002

**Complexity**: L

---

### T-016: Redesign ExperienceSection — monospace metadata, simplified timeline

**Description**: Add monospace treatment to period spans, remove expand/collapse interaction, simplify timeline.

**TDD test spec**:
- File: `src/__tests__/ExperienceSection.test.ts` (new)
- Tests:
  - `period span has font-mono class`
  - `period span has tracking-[0.05em] class`
  - `period span does NOT have italic class`
  - `no .trigger-area class with interactive click handler`
  - `no details-container with max-height: 0`
  - `no expand/collapse script block`
  - `timeline bar uses w-px or thin bar (not thick)`

**Implementation spec**:
- Edit `src/components/ExperienceSection.astro`:
  1. Replace period span classes: add `font-mono tracking-[0.05em]`, remove `italic`
  2. Remove the expand/collapse `<script>` block entirely
  3. Remove `.trigger-area` click handlers and interactive JS
  4. Remove `max-height: 0` / `opacity: 0` hidden states — always show details
  5. Remove `.focus-group` interactive CSS
  6. Simplify timeline dot: thinner border, remove active accent styling
  7. Make timeline bar thinner: `w-px` instead of `w-0.5`
- Dependencies: T-007, T-008

**Complexity**: M

---

### T-017: Redesign SkillsSection — monochrome chips, glass cards

**Description**: Replace colored skill chips with monochrome ghost chips, replace soft-skill cards with glass cards with glass backgrounds.

**TDD test spec**:
- File: `src/__tests__/SkillsSection.test.ts` (new)
- Tests:
  - `soft-skill cards do NOT have bg-light-card-bg or bg-dark-card-bg`
  - `soft-skill cards have glass-card class`
  - `soft-skill cards have bg-transparent`
  - `technical skill items use monochrome border classes`
  - `technical skill items do NOT use per-item techColorMap styles`
  - `skill chips use rounded (not rounded-full)`

**Implementation spec**:
- Edit `src/components/SkillsSection.astro`:
  1. Replace soft-skill card classes: remove `bg-light-card-bg dark:bg-dark-card-bg`, add `glass-card bg-transparent`
  2. Replace colored tech chips with monochrome:
     ```
     class="px-2.5 py-0.5 text-[0.7rem] font-mono tracking-[0.05em] rounded border border-light-border dark:border-dark-border text-light-subtext dark:text-dark-subtext bg-transparent hover:border-light-accent dark:hover:border-dark-accent hover:text-light-accent dark:hover:text-dark-accent"
     ```
  3. Remove `techColorMap` and `hexToRgba` imports if only used for chip styling (keep if used elsewhere)
  4. Change `rounded-full` → `rounded` for chips
- Dependencies: T-005, T-007

**Complexity**: L

---

### T-018: Update AboutSection heading typography

**Description**: Update section heading to new dramatic typography scale (30px/60px).

**TDD test spec**:
- File: `src/__tests__/AboutSection.test.ts` (new) OR extend an existing typography test
- Tests:
  - `section h2 has text-[1.875rem] or equivalent 30px`
  - `section h2 has md:text-[3.75rem] or equivalent 60px`
  - `section h2 has tracking-tight class`
  - `section h2 has leading-[1.1] or equivalent`

**Implementation spec**:
- Edit `src/components/AboutSection.astro`:
  1. Replace h2 classes: `text-3xl md:text-4xl font-bold` → `text-[1.875rem] md:text-[3.75rem] font-bold tracking-tight leading-[1.1]`
- Dependencies: T-002

**Complexity**: S

---

### Batch 4 Verification Steps

1. `pnpm test:run` — all tests pass
2. Visual: project cards show ghost/transparent style with glass backgrounds
3. Visual: tech chips are monochrome with borders, not colored backgrounds
4. Visual: experience section always expanded, monospace periods
5. Visual: skills chips monochrome, soft-skill cards ghost style
6. Visual: about section heading is larger with tight tracking
7. Accessibility: all interactive elements still have focus-visible

---

## Batch 5: Chrome (T-019 through T-021)

### T-019: Add monospace treatment to Footer

**Description**: Add `font-mono tracking-[0.05em]` to footer text elements.

**TDD test spec**:
- File: `src/__tests__/Footer.test.ts` (new)
- Tests:
  - `footer text elements have font-mono class`
  - `footer text elements have tracking-[0.05em] class`

**Implementation spec**:
- Edit `src/components/Footer.astro`:
  1. Add `font-mono tracking-[0.05em]` to all `<p>` and `<span>` elements that contain copyright, "Made with" text
  2. Keep `text-xs text-light-subtext dark:text-dark-subtext` classes, add `font-mono tracking-[0.05em]`
- Dependencies: T-007

**Complexity**: S

---

### T-020: Convert SocialLinks to ghost style

**Description**: Remove fill backgrounds and scale hover from social link icons, add border-only ghost style.

**TDD test spec**:
- File: `src/__tests__/SocialLinks.test.ts` (new)
- Tests:
  - `social links do NOT have bg-light-card-bg class`
  - `social links do NOT have bg-dark-card-bg class`
  - `social links have border border-light-border dark:border-dark-border`
  - `social links do NOT have hover:scale-110`
  - `social links have rounded-md (not rounded-lg)`

**Implementation spec**:
- Edit `src/components/SocialLinks.astro`:
  1. Replace: `p-2 rounded-lg bg-light-card-bg dark:bg-dark-card-bg text-light-subtext dark:text-dark-subtext hover:text-light-accent dark:hover:text-dark-accent hover:bg-light-border dark:hover:bg-dark-border hover:scale-110`
  2. With: `p-2 rounded-md border border-light-border dark:border-dark-border text-light-subtext dark:text-dark-subtext hover:text-light-accent dark:hover:text-dark-accent hover:border-light-accent/50 dark:hover:border-dark-accent/50 transition-all duration-200`
- Dependencies: T-002

**Complexity**: S

---

### T-021: Simplify ThemeToggle to minimal style

**Description**: Remove fill background hover and scale transform, simplify to transparent ghost style.

**TDD test spec**:
- File: `src/__tests__/ThemeToggle.test.ts` (new)
- Tests:
  - `toggle button does NOT have hover:bg-light-card-bg`
  - `toggle button does NOT have hover:bg-dark-card-bg`
  - `toggle button does NOT have hover:scale-110`
  - `toggle button has transition-colors (not transition-all)`
  - `toggle button has rounded-md (not rounded-lg)`

**Implementation spec**:
- Edit `src/components/ThemeToggle.astro`:
  1. Replace: `p-2 rounded-lg text-light-subtext dark:text-dark-subtext hover:text-light-accent dark:hover:text-dark-accent hover:bg-light-card-bg dark:hover:bg-dark-card-bg hover:scale-110 transition-all duration-300`
  2. With: `p-2 rounded-md text-light-subtext dark:text-dark-subtext hover:text-light-accent dark:hover:text-dark-accent transition-colors duration-200`
- Dependencies: none

**Complexity**: S

---

### Batch 5 Verification Steps

1. `pnpm test:run` — all tests pass (84+ existing + all new tests)
2. Visual: footer text in monospace
3. Visual: social links have border-only ghost style, no fill background
4. Visual: theme toggle is minimal, no background on hover
5. Accessibility: focus-visible rings preserved on all interactive elements
6. Regression: all existing tests still pass

---

## Cross-Cutting Concerns

### Accessibility Checklist (per batch)
- [ ] Batch 1: Color contrast ratios ≥ 4.5:1 for text/bg pairs (verified via tokens)
- [ ] Batch 2: WebGL canvas has `aria-hidden="true"` and `role="presentation"` (preserved)
- [ ] Batch 3: Focus-visible on CTA, nav links; skip links preserved
- [ ] Batch 4: Card focus states preserved, expand/collapse removal doesn't hide content
- [ ] Batch 5: Focus-visible on social links and theme toggle

### Test Files Summary

| Test File | Action | Batch |
|-----------|--------|-------|
| `src/__tests__/design-system-css.test.ts` | New | 1 |
| `src/__tests__/animation-amplitude.test.ts` | New | 1 |
| `src/__tests__/Layout.test.ts` | Extend | 1 |
| `src/__tests__/WebGLBackground.test.ts` | Extend | 2 |
| `src/__tests__/Navigation.test.ts` | New | 3 |
| `src/__tests__/HeroSection.test.ts` | New | 3 |
| `src/__tests__/CommonScripts.test.ts` | Extend | 3 |
| `src/__tests__/ProjectsSection.test.ts` | Extend | 4 |
| `src/__tests__/ExperienceSection.test.ts` | New | 4 |
| `src/__tests__/SkillsSection.test.ts` | New | 4 |
| `src/__tests__/AboutSection.test.ts` | New | 4 |
| `src/__tests__/Footer.test.ts` | New | 5 |
| `src/__tests__/SocialLinks.test.ts` | New | 5 |
| `src/__tests__/ThemeToggle.test.ts` | New | 5 |

**New test files: 9**
**Extended test files: 5**
**Total test files touched: 14**

---

## Total Effort Estimate

| Batch | Tasks | Complexity |
|-------|-------|------------|
| Foundation | T-001, T-002, T-003, T-004, T-005, T-006, T-007, T-008, T-022, T-023 | 6×S + 3×M |
| Background | T-009, T-010, T-011 | 1×S + 1×M + 1×L |
| Core | T-012, T-013, T-014 | 1×S + 2×M |
| Content | T-015, T-016, T-017, T-018 | 1×S + 1×M + 2×L |
| Chrome | T-019, T-020, T-021 | 3×S |

**S** ≈ 15 min/task, **M** ≈ 30 min/task, **L** ≈ 45 min/task

**Estimated total: ~5.5 hours**