# Capability: design-system

> Color tokens (near-achromatic oklch), typography scale, animation strategy, grain overlay CSS, gradient tokens, Geist Mono font loading.

## Requirements

### REQ-DS-001: Near-achromatic color tokens at hue 260

**MUST** replace current `@theme` color tokens with near-achromatic oklch variants at hue 260, with chroma between 0.005–0.02 for base tokens and chroma 0.20 for accent tokens.

Current state (hue 240, higher chroma):
```css
--color-light-bg: oklch(0.98 0.01 240);
--color-light-text: oklch(0.25 0.02 240);
```

Target state (hue 260, near-achromatic):
```css
--color-light-bg: oklch(0.985 0.005 260);
--color-light-text: oklch(0.15 0.01 260);
--color-light-subtext: oklch(0.40 0.01 260);
--color-light-card-bg: oklch(0.965 0.005 260);
--color-light-border: oklch(0.88 0.008 260);
--color-light-accent: oklch(0.55 0.20 260);
--color-light-accent-hover: oklch(0.50 0.22 260);

--color-dark-bg: oklch(0.11 0.008 260);
--color-dark-text: oklch(0.93 0.005 260);
--color-dark-subtext: oklch(0.58 0.01 260);
--color-dark-card-bg: oklch(0.16 0.01 260);
--color-dark-border: oklch(0.22 0.01 260);
--color-dark-accent: oklch(0.65 0.20 260);
--color-dark-accent-hover: oklch(0.70 0.22 260);
```

- Decorative/functional tokens (bg, text, subtext, card-bg, border) **MUST** have chroma ≤ 0.02
- Accent tokens (accent, accent-hover) **MUST** have chroma 0.20–0.22
- All tokens **MUST** use hue 260
- L separation between text and bg **MUST** be ≥ 0.25 in both themes (light: 0.985−0.15 = 0.835 ✓; dark: 0.93−0.11 = 0.82 ✓)

### REQ-DS-002: Gradient token pair

**MUST** add gradient token pair to `@theme` for use in glass-card effects:

```css
--color-gradient-start: oklch(0.55 0.20 260);
--color-gradient-end: oklch(0.65 0.18 300);
```

These tokens exist only in the CSS custom property layer and are referenced by the `glass-card` utility (REQ-VP-004). They are **NOT** Tailwind utility classes — only `@theme` custom properties.

### REQ-DS-003: Dramatic typography scale

**MUST** define a typography scale in `global.css` with these responsive sizes:

| Element | Mobile | Desktop | Weight | Tracking | Line-height |
|---------|--------|---------|--------|----------|-------------|
| Hero h1 | 48px | 96px | 700 | -0.025em | 1.0 |
| Section h2 | 30px | 60px | 700 | tight | 1.1 |
| Section h3 | 20px | 24px | 600 | tight | 1.3 |
| Body | 16px | 18px | 400 | normal | 1.7 |
| Metadata | 12px | 12px | 500 mono | 0.05em | 1.5 |

Implementation:
- Hero h1 uses Tailwind classes: `text-[3rem] lg:text-[6rem] font-bold tracking-[-0.025em] leading-none`
- Metadata uses a dedicated `.font-mono-sm` utility or direct Tailwind: `text-xs font-medium tracking-[0.05em] font-mono leading-relaxed`
- "tight" tracking: `tracking-tight` (Tailwind default `-0.025em` for section h2/h3)
- The body line-height of 1.7 stays at the `html, body` level (already set)

### REQ-DS-004: Animation amplitude reduction

**MUST** reduce scroll animation translateY values from 15–20px to 5px across all components.

Current amplitude values in `CommonScripts.astro`:
- `scroll-animate`: initial y=20
- `scroll-animate-fast`: initial y=15
- `title-animate`: initial y=10
- `.stagger-children > *`: initial y=15

Target amplitude values:
- `scroll-animate`: initial y=5
- `scroll-animate-fast`: initial y=3
- `title-animate`: initial y=5
- `.stagger-children > *`: initial y=5

Also **MUST** update the CSS fallback in `global.css`:
- `.scroll-animate, .scroll-animate-fast, .title-animate` → `transform: translateY(5px)` (was 20px)
- `.stagger-children > *` → `transform: translateY(5px)` (was 10px)

The `scale` values (0.99) **SHOULD** remain unchanged — only translateY changes.

### REQ-DS-005: Grain overlay CSS

**MUST** add a grain overlay pseudo-element on `body::after` with the following properties:

```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,..."); /* inline SVG noise pattern */
  background-repeat: repeat;
  background-size: 200px 200px;
  mix-blend-mode: overlay;
}
```

- Opacity **MUST** be 0.02–0.04 (subtle but visible)
- **MUST** use `pointer-events: none` to preserve click-through
- **MUST** use `mix-blend-mode: overlay` for natural blending
- **MUST** work in both light and dark themes (grain visible in both)
- **MUST NOT** block scroll, selection, or interaction
- The grain pattern **SHOULD** be an inline SVG data URI to avoid network requests
- `prefers-reduced-motion: reduce` **MUST** disable the grain overlay (opacity: 0)

### REQ-DS-006: Geist Mono font loading

**MUST** load Geist Mono variable font for metadata elements alongside the existing Geist Variable.

In `Layout.astro`:
- Add `import "@fontsource-variable/geist-mono/wght.css"` alongside the existing Geist import
- The font-family stack for metadata becomes: `'Geist Mono', 'Geist Variable', monospace`
- For body/headings: `'Geist Variable', sans-serif` (unchanged)

**SHOULD** use variable font subset to minimize payload. Only `wght.css` is needed (no italic axis).

### REQ-DS-007: Scrollbar color tokens

**MUST** update scrollbar color references in `global.css` from the old hue-240 tokens to the new hue-260 tokens. Since scrollbar colors use `var(--color-*)` references, this happens automatically with REQ-DS-001, but the raw fallback values must also be verified.

## Scenarios

### Scenario DS-001-A: Color tokens are near-achromatic oklch at hue 260

**Given** `src/styles/global.css` contains a `@theme` block
**When** the color tokens are parsed
**Then** every `--color-light-*` and `--color-dark-*` token (except accent) uses oklch with chroma ≤ 0.02
**And** every accent token uses oklch with chroma 0.20 ± 0.02
**And** all tokens use hue 260

### Scenario DS-001-B: Contrast ratios meet WCAG AA

**Given** the new near-achromatic color tokens at hue 260
**When** L(light-text) = 0.15 and L(light-bg) = 0.985
**Then** the perceived contrast ratio exceeds 4.5:1
**And** when L(dark-text) = 0.93 and L(dark-bg) = 0.11, the contrast ratio also exceeds 4.5:1

### Scenario DS-002-A: Gradient tokens exist in @theme

**Given** `src/styles/global.css`
**When** parsing the `@theme` block
**Then** `--color-gradient-start` and `--color-gradient-end` are defined
**And** their oklch chroma values are 0.20 and 0.18 respectively (accent-chroma range)

### Scenario DS-003-A: Hero h1 responsive sizes

**Given** `src/components/HeroSection.astro`
**When** the hero heading element is rendered
**Then** it uses `text-[3rem]` on mobile and `lg:text-[6rem]` on desktop
**And** it uses `font-bold tracking-[-0.025em] leading-none`

### Scenario DS-003-B: Metadata monospace treatment

**Given** any component rendering metadata (experience period, project year, footer text)
**When** the metadata element is inspected
**Then** it uses font-family starting with `'Geist Mono'`
**And** it uses `text-xs tracking-[0.05em]`

### Scenario DS-004-A: Animation amplitude reduced to ≤5px

**Given** `src/components/CommonScripts.astro`
**When** scroll animation initial states are set
**Then** all `translateY` values are ≤ 5px
**And** no element has an initial `y` value greater than 5

### Scenario DS-004-B: CSS fallback translateY matches reduced amplitude

**Given** `src/styles/global.css`
**When** the `.scroll-animate` and `.title-animate` utility rules are parsed
**Then** they declare `transform: translateY(5px)` (not 20px)
**And** `.stagger-children > *` declares `transform: translateY(5px)` (not 10px)

### Scenario DS-005-A: Grain overlay renders on body::after

**Given** `src/styles/global.css`
**When** parsing the `body::after` rule
**Then** it has `position: fixed`, `inset: 0`, `z-index: 1`, `pointer-events: none`
**And** it has `opacity` between 0.02 and 0.04
**And** it has `mix-blend-mode: overlay`
**And** it has a `background-image` data URI

### Scenario DS-005-B: Grain overlay respects prefers-reduced-motion

**Given** `src/styles/global.css`
**When** within a `@media (prefers-reduced-motion: reduce)` block
**Then** `body::after` has `opacity: 0`

### Scenario DS-006-A: Geist Mono loaded in Layout

**Given** `src/layouts/Layout.astro`
**When** the layout head imports are parsed
**Then** an import for `@fontsource-variable/geist-mono/wght.css` exists
**And** it is placed alongside the existing Geist import

## Acceptance Criteria

1. **AC-DS-001**: All 14 color tokens in `@theme` use hue 260, base tokens chroma ≤ 0.02, accent tokens chroma 0.20 ± 0.02
2. **AC-DS-002**: `--color-gradient-start` and `--color-gradient-end` are defined in `@theme`
3. **AC-DS-003**: Hero `<h1>` renders at 48px mobile / 96px desktop with tracking -0.025em
4. **AC-DS-004**: All GSAP scroll animation initial translateY values ≤ 5px
5. **AC-DS-005**: CSS fallback translateY values match (5px, not 20px/10px)
6. **AC-DS-006**: `body::after` grain overlay exists with proper properties
7. **AC-DS-007**: Grain overlay disabled when `prefers-reduced-motion: reduce`
8. **AC-DS-008**: Geist Mono `wght.css` imported in Layout
9. **AC-DS-009**: WCAG contrast ratio ≥ 4.5:1 for text/bg pairs in both themes
10. **AC-DS-010**: All 84 existing tests continue to pass

## Test Specifications

### Test file: `src/__tests__/design-system-css.test.ts`

```typescript
// REQ-DS-001: Near-achromatic color tokens
describe('design-system color tokens (REQ-DS-001)', () => {
  it('all base tokens use chroma ≤ 0.02')
  it('all accent tokens use chroma 0.18–0.22')
  it('all tokens use hue 260')
  it('light text-bg L separation ≥ 0.25')
  it('dark text-bg L separation ≥ 0.25')
})

// REQ-DS-002: Gradient tokens
describe('gradient tokens (REQ-DS-002)', () => {
  it('defines --color-gradient-start in @theme')
  it('defines --color-gradient-end in @theme')
  it('gradient-start chroma is 0.20')
  it('gradient-end chroma is 0.18')
})

// REQ-DS-005: Grain overlay
describe('grain overlay (REQ-DS-005)', () => {
  it('body::after has position fixed, inset 0, z-index 1')
  it('body::after has pointer-events none')
  it('body::after has opacity between 0.02 and 0.04')
  it('body::after has mix-blend-mode overlay')
  it('body::after has background-image data URI')
  it('prefers-reduced-motion sets body::after opacity to 0')
})

// REQ-DS-007: No residual hue-240 tokens
describe('no hue-240 residuals (REQ-DS-007)', () => {
  it('no oklch values use hue 240 in @theme block')
})
```

### Test file: `src/__tests__/animation-amplitude.test.ts`

```typescript
// REQ-DS-004: Animation amplitude
describe('animation amplitude (REQ-DS-004)', () => {
  it('CommonScripts scroll-animate initial y ≤ 5')
  it('CommonScripts scroll-animate-fast initial y ≤ 5')
  it('CommonScripts title-animate initial y ≤ 5')
  it('CommonScripts stagger-children initial y ≤ 5')
  it('global.css .scroll-animate translateY is 5px not 20px')
  it('global.css .stagger-children > * translateY is 5px not 10px')
})
```

### Test file: `src/__tests__/Layout.test.ts` (extend existing)

```typescript
// REQ-DS-006: Geist Mono font
describe('Geist Mono font loading (REQ-DS-006)', () => {
  it('imports geist-mono wght.css')
  it('Geist Mono import is a separate import from Geist Variable')
})
```

### Test file: `src/__tests__/HeroSection.test.ts` (new)

```typescript
// REQ-DS-003: Typography scale
describe('hero typography scale (REQ-DS-003)', () => {
  it('hero h1 has text-[3rem] class (mobile)')
  it('hero h1 has lg:text-[6rem] class (desktop)')
  it('hero h1 has tracking-[-0.025em] or equivalent')
  it('hero h1 has font-bold class')
  it('hero h1 has leading-none or leading-[1.0]')
})
```