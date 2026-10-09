# Capability: visual-presentation

> Glassmorphism cards (backdrop-blur and semi-transparent backgrounds), monochrome chips, monospace metadata, simplified navigation, dramatic hero (no typing effect), footer monospace treatment, social links ghost style, theme toggle minimal style.

## Requirements

### REQ-VP-001: Glassmorphism cards

**MUST** replace all fill-background cards (project cards, soft-skill cards) with glassmorphism cards that have:
- Transparent background (no `bg-light-card-bg` / `bg-dark-card-bg`)
- Gradient border using the `--color-gradient-start` → `--color-gradient-end` tokens
- Gradient border implementation uses `border-image` or pseudo-element approach

Ghost card structure:
```html
<article class="glass-card relative rounded-xl bg-transparent border-0">
  <!-- Glassmorphism background and blur -->
  <div class="glass-card-border absolute inset-0 rounded-xl pointer-events-none"
       style="background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));
              -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
              -webkit-mask-composite: xor; mask-composite: exclude;
              padding: 1px; border-radius: inherit;">
  </div>
  <!-- Content inside relative z-10 -->
</article>
```

Or via CSS utility:
```css
.glass-card {
  position: relative;
  background: transparent;
  border: 1px solid transparent;
  background-color: rgba(255,255,255,0.45); backdrop-filter: blur(12px);
}
```

**SHOULD** use `border-image` for simplicity, falling back to a solid border using `--color-light-border`/`--color-dark-border` if `border-image` is unsupported.

Items affected:
- Project cards in `ProjectsSection.astro`
- Soft-skill cards in `SkillsSection.astro`

### REQ-VP-002: Monochrome tech/skill chips

**MUST** remove all brand-colored tech chips. Replace the current `techColorMap` per-chip styling with monochrome chips:

Current behavior: each tech chip has a unique background/text color from `techColorMap`.

Target behavior: all chips use the same monochrome style:
```
px-2.5 py-0.5 text-[0.7rem] font-mono tracking-[0.05em]
border border-light-border dark:border-dark-border
text-light-subtext dark:text-dark-subtext
bg-transparent
hover:border-light-accent dark:hover:border-dark-accent
hover:text-light-accent dark:hover:text-dark-accent
```

- **MUST** remove dependency on `techColorMap` and `hexToRgba` from chip rendering (keep the import in `SkillsSection.astro` only if still used for non-chip purposes)
- **SHOULD** keep the `techColorMap` utility file intact (it may be used elsewhere or for future features) — only remove its usage from chip rendering
- Chip shape: rectangular with rounded corners (`rounded`), NOT pill-shaped (`rounded-full` becomes `rounded`)

Affected:
- `ProjectsSection.astro` tech chips
- `SkillsSection.astro` technical skill chips

### REQ-VP-003: Monospace metadata treatment

**MUST** apply monospace treatment to all metadata/auxiliary text:

| Element | Current | Target |
|---------|---------|--------|
| Experience period (`job.period`) | `text-xs md:text-sm text-light-subtext` | `text-xs font-mono tracking-[0.05em] text-light-subtext` |
| Project year | `text-xs text-light-subtext italic` | `text-xs font-mono tracking-[0.05em] text-light-subtext` |
| Nav item labels | `text-base font-medium` | `text-xs font-mono tracking-[0.05em] uppercase` |
| Footer text | `text-xs` | `text-xs font-mono tracking-[0.05em]` |

- Font stack **MUST** be `'Geist Mono', monospace` (REQ-DS-006 ensures Geist Mono is loaded)
- Letter-spacing **MUST** be `0.05em` for all metadata elements
- Size stays at `text-xs` (12px)
- Weight: `font-medium` (500)

### REQ-VP-004: Simplified navigation

**MUST** simplify the navigation bar:

| Change | Detail |
|--------|--------|
| Remove letter-bounce | Delete `.mmrg-link .letter-span` keyframes and stagger delay — use plain text link instead |
| Monospace nav labels | All nav items use `font-mono text-xs tracking-[0.05em] uppercase` |
| Thinner bar | Reduce `h-16 md:h-20` to `h-12 md:h-14` |
| Remove animated underline | Remove `.nav-item a::after` pseudo-element underline animation |

The name/logo link on the left stays as `font-semibold text-lg` (no monospace, no letter-bounce animation).

The locale switcher and theme toggle remain in the right side of the nav.

### REQ-VP-005: Dramatic hero without typing effect

**MUST** replace the current typing animation hero with a static dramatic heading:

Current:
```html
<h1>{greeting} <span id="typing-name" class="text-light-accent">...</span><span class="animate-pulse">|</span></h1>
```

Target:
```html
<h1 class="text-[3rem] lg:text-[6rem] font-bold tracking-[-0.025em] leading-none text-light-text dark:text-dark-text">
  {greeting}<br>
  <span class="text-light-accent dark:text-dark-accent">{name}</span>
</h1>
```

Changes:
- **REMOVE** the `typing-name` span with character-by-character animation
- **REMOVE** the blinking cursor `|`
- **ADD** a `<br>` between greeting and name for the dramatic two-line treatment
- **ADD** the responsive font sizes from REQ-DS-003 (48px mobile / 96px desktop)
- **ADD** a status dot component: `<span class="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></span>` before sleeping message text (existing, just styled)
- **KEEP** the "Get in Touch" CTA button (redesign per REQ-VP-006)
- **REMOVE** the `<script>` block that implements the typing effect in `HeroSection.astro`

### REQ-VP-006: Ghost-style CTA button

**MUST** restyle the hero CTA button from a filled button to a minimal border style matching the design system:

Current:
```
px-5 py-2.5 border border-light-accent/40 rounded-lg hover:bg-light-accent/10 shadow-sm hover:shadow-md
```

Target:
```
px-6 py-2.5 rounded-md font-mono tracking-[0.05em] text-xs uppercase
border border-light-accent/50 dark:border-dark-accent/50
text-light-accent dark:text-dark-accent
hover:bg-light-accent/5 dark:hover:bg-dark-accent/5
transition-all duration-300
```

- Remove shadow (no `shadow-sm`, no `hover:shadow-md`)
- Reduce background opacity on hover to near-zero (5%)
- Add monospace, uppercase, tracking
- Keep focus-visible ring

### REQ-VP-007: Footer monospace treatment

**MUST** convert all footer text to monospace:

Current:
```html
<p class="text-xs text-light-subtext">...</p>
<span class="text-xs text-light-subtext">...</span>
```

Target:
```html
<p class="text-xs font-mono tracking-[0.05em] text-light-subtext dark:text-dark-subtext">...</p>
<span class="text-xs font-mono tracking-[0.05em] text-light-subtext dark:text-dark-subtext">...</span>
```

Both "Made with Astro and Tailwind CSS" and the copyright line use monospace.

### REQ-VP-008: Social links ghost style

**MUST** convert social link icons from fill-background to minimal border style:

Current:
```
p-2 rounded-lg bg-light-card-bg dark:bg-dark-card-bg text-light-subtext dark:text-dark-subtext
hover:text-light-accent dark:hover:text-dark-accent hover:bg-light-border dark:hover:bg-dark-border
hover:scale-110
```

Target:
```
p-2 rounded-md border border-light-border dark:border-dark-border text-light-subtext dark:text-dark-subtext
hover:text-light-accent dark:hover:text-dark-accent
hover:border-light-accent/50 dark:hover:border-dark-accent/50
transition-all duration-200
```

Changes:
- Remove `bg-light-card-bg`/`bg-dark-card-bg` fill backgrounds
- Add `border border-light-border`/`border-dark-border`
- Remove `hover:scale-110` (reduced animation per REQ-DS-004)
- Add border-accent on hover
- Change `rounded-lg` to `rounded-md`

### REQ-VP-009: Theme toggle minimal style

**MUST** simplify the theme toggle button:

Current:
```
p-2 rounded-lg text-light-subtext dark:text-dark-subtext
hover:text-light-accent dark:hover:text-dark-accent
hover:bg-light-card-bg dark:hover:bg-dark-card-bg
hover:scale-110 transition-all duration-300
```

Target:
```
p-2 rounded-md text-light-subtext dark:text-dark-subtext
hover:text-light-accent dark:hover:text-dark-accent
transition-colors duration-200
```

Changes:
- Remove fill background on hover (`bg-light-card-bg`/`bg-dark-card-bg`)
- Remove `hover:scale-110`
- Change `rounded-lg` to `rounded-md`
- Change `transition-all` to `transition-colors` (smoother, less jank)
- Change `duration-300` to `duration-200`

### REQ-VP-010: Section heading typography

**MUST** update section headings to match the new typography scale:

| Element | Current | Target |
|---------|---------|--------|
| Section h2 | `text-3xl md:text-4xl font-bold` | `text-[1.875rem] md:text-[3.75rem] font-bold tracking-tight leading-[1.1]` |
| Section h3 | `text-2xl md:text-3xl font-semibold` (skills) / `text-lg md:text-xl font-semibold` (experience) | `text-xl md:text-2xl font-semibold tracking-tight leading-[1.3]` |

The h2 sizes correspond to 30px mobile / 60px desktop as per the typography scale in REQ-DS-003.

### REQ-VP-011: Experience section simplified timeline

**MUST** convert the expandable timeline to a simplified layout:

- Remove the interactive expand/collapse (`.trigger-area`, `.details-container`, `is-active` toggle)
- Always show job details (no `max-height: 0` / `opacity: 0` hidden state)
- Period text uses monospace: `font-mono tracking-[0.05em] text-xs`
- Position text uses accent color: `text-light-accent dark:text-dark-accent`
- Remove `.focus-group` interactive CSS and the inline `<script>` that handles expand/collapse
- Remove `.experience-item.is-active .timeline-dot` accent styling (dot stays as `bg-light-border dark:bg-dark-border`)
- Keep the timeline bar on the left but make it thinner: `w-px` instead of `w-0.5`

### REQ-VP-012: Mobile menu simplification

**MUST** update the mobile menu to match the minimal aesthetic:
- Nav items in mobile menu use the same monospace uppercase style as desktop
- Remove `.letter-span` stagger animation from mobile menu items
- Mobile menu overlay uses `bg-light-bg/95 dark:bg-dark-bg/95` (already close, keep)
- Menu items use larger text on mobile for touch targets: `text-xl font-mono tracking-[0.05em] uppercase`

## Scenarios

### Scenario VP-001-A: Project cards render as glass cards

**Given** `src/components/ProjectsSection.astro`
**When** a project card is rendered
**Then** it has class `glass-card` (or equivalent)
**And** it does NOT have `bg-light-card-bg` or `bg-dark-card-bg`
**And** it has a glass background from `--color-gradient-start` to `--color-gradient-end`

### Scenario VP-001-B: Soft-skill cards render as glass cards

**Given** `src/components/SkillsSection.astro`
**When** a soft-skill card is rendered
**Then** it has `bg-transparent` or no fill background class
**And** it has a glass background matching `--color-gradient-start` → `--color-gradient-end`

### Scenario VP-002-A: Tech chips are monochrome

**Given** `src/components/ProjectsSection.astro`
**When** tech chips are rendered
**Then** each chip uses shared monochrome classes (`border border-light-border dark:border-dark-border text-light-subtext dark:text-dark-subtext bg-transparent`)
**And** no chip references `techColorMap` or `hexToRgba` for styling
**And** chips use `rounded` (not `rounded-full`)

### Scenario VP-002-B: Skill chips are monochrome

**Given** `src/components/SkillsSection.astro`
**When** technical skill items are rendered
**Then** each uses shared monochrome border classes
**And** no per-item color from `techColorMap`

### Scenario VP-003-A: Experience period uses monospace

**Given** `src/components/ExperienceSection.astro`
**When** the job period is rendered
**Then** the `<span>` has `font-mono tracking-[0.05em]` classes

### Scenario VP-003-B: Project year uses monospace

**Given** `src/components/ProjectsSection.astro`
**When** the project year is rendered
**Then** it has `font-mono tracking-[0.05em]` and no `italic`

### Scenario VP-003-C: Nav labels use monospace uppercase

**Given** `src/components/Navigation.astro`
**When** nav link items are rendered
**Then** each has `font-mono text-xs tracking-[0.05em] uppercase` classes

### Scenario VP-004-A: Letter-bounce animation removed from navigation

**Given** `src/components/Navigation.astro`
**When** the source is parsed
**Then** `.mmrg-link .letter-span` keyframes are absent
**And** the name link does NOT use `letter-span` per-character spans

### Scenario VP-004-B: Nav bar height reduced

**Given** `src/components/Navigation.astro`
**When** the nav bar container is rendered
**Then** it uses `h-12 md:h-14` (not `h-16 md:h-20`)

### Scenario VP-004-C: Animated underline removed from nav

**Given** `src/components/Navigation.astro`
**When** the source is parsed
**Then** `.nav-item a::after` pseudo-element styles are absent
**And** no `hover::after` width animation for nav links

### Scenario VP-005-A: Hero has no typing effect

**Given** `src/components/HeroSection.astro`
**When** the hero heading is rendered
**Then** it contains static text with a `<br>` between greeting and name
**And** there is NO `typing-name` span
**And** there is NO blinking cursor `|`
**And** there is NO `<script>` block for typing animation

### Scenario VP-005-B: Hero heading uses dramatic typography

**Given** `src/components/HeroSection.astro`
**When** the hero `<h1>` element is inspected
**Then** it has classes `text-[3rem] lg:text-[6rem] font-bold tracking-[-0.025em] leading-none`
**And** the name span has `text-light-accent dark:text-dark-accent`

### Scenario VP-006-A: CTA button is ghost style

**Given** `src/components/HeroSection.astro`
**When** the "Get in Touch" link is rendered
**Then** it has `font-mono tracking-[0.05em] text-xs uppercase`
**And** it has `border border-light-accent/50`
**And** it does NOT have `shadow-sm` or `hover:shadow-md`

### Scenario VP-007-A: Footer uses monospace

**Given** `src/components/Footer.astro`
**When** footer text elements are rendered
**Then** they have `font-mono tracking-[0.05em]` classes

### Scenario VP-008-A: Social links are minimal style borders

**Given** `src/components/SocialLinks.astro`
**When** social link anchors are rendered
**Then** they have `border border-light-border dark:border-dark-border`
**And** they do NOT have `bg-light-card-bg` or `bg-dark-card-bg`
**And** they do NOT have `hover:scale-110`

### Scenario VP-009-A: Theme toggle is minimal

**Given** `src/components/ThemeToggle.astro`
**When** the button is rendered
**Then** it does NOT have `hover:bg-light-card-bg` or `hover:bg-dark-card-bg`
**And** it does NOT have `hover:scale-110`
**And** it has `transition-colors` (not `transition-all`)

### Scenario VP-010-A: Section headings use new typography scale

**Given** any section component with `<h2>` headings
**When** the heading is rendered
**Then** it uses `text-[1.875rem] md:text-[3.75rem]` (30px / 60px) or equivalent
**And** it has `tracking-tight` and `leading-[1.1]`

### Scenario VP-011-A: Experience section is always-expanded

**Given** `src/components/ExperienceSection.astro`
**When** the component is rendered
**Then** job details are always visible (no `max-height: 0` / `opacity: 0`)
**And** there is NO expand/collapse `<script>` block
**And** there is NO `.trigger-area` interactive JS

### Scenario VP-012-A: Mobile menu uses monospace uppercase

**Given** `src/components/Navigation.astro`
**When** mobile nav items are rendered
**Then** they have `font-mono tracking-[0.05em] uppercase` classes
**And** they use `text-xl` for touch target sizing

## Acceptance Criteria

1. **AC-VP-001**: All card components use minimal border style with glass backgrounds
2. **AC-VP-002**: All tech/skill chips use monochrome style (no brand colors from techColorMap)
3. **AC-VP-003**: All metadata elements use monospace treatment with tracking-[0.05em]
4. **AC-VP-004**: Navigation is simplified: no letter-bounce, no animated underline, reduced height
5. **AC-VP-005**: Hero renders static text with dramatic sizes, no typing effect
6. **AC-VP-006**: CTA button uses ghost style with monospace uppercase
7. **AC-VP-007**: Footer text uses monospace treatment
8. **AC-VP-008**: Social links use ghost border style, no fill background
9. **AC-VP-009**: Theme toggle uses minimal style, no scale/transform on hover
10. **AC-VP-010**: Section h2 headings follow 30px/60px typography scale
11. **AC-VP-011**: Experience section is always-expanded, no interactive expand/collapse
12. **AC-VP-012**: Mobile menu uses monospace uppercase style
13. **AC-VP-013**: Focus-visible and aria labels are preserved on all interactive elements
14. **AC-VP-014**: All 84 existing tests pass after changes (adapted as needed)

## Test Specifications

### Test file: `src/__tests__/ProjectsSection.test.ts` (extend existing)

```typescript
// REQ-VP-001: Glass cards
describe('project glass cards (REQ-VP-001)', () => {
  it('project cards have glass-card class or bg-transparent')
  it('project cards do NOT have bg-light-card-bg')
  it('project cards reference glass-card or --color-gradient-start')
})

// REQ-VP-002: Monochrome chips
describe('monochrome tech chips (REQ-VP-002)', () => {
  it('tech chips do NOT use techColorMap for inline styles')
  it('tech chips have border classes (not fill backgrounds)')
  it('tech chips use rounded (not rounded-full)')
})
```

### Test file: `src/__tests__/SkillsSection.test.ts` (new)

```typescript
// REQ-VP-001: Glass cards for soft skills
describe('soft skill glass cards (REQ-VP-001)', () => {
  it('soft-skill cards do NOT have bg-light-card-bg or bg-dark-card-bg')
  it('soft-skill cards have transparent or glass-card styling')
})

// REQ-VP-002: Monochrome skill chips
describe('monochrome skill chips (REQ-VP-002)', () => {
  it('technical skill items use monochrome border classes')
  it('technical skill items do NOT use per-item techColorMap styles')
})
```

### Test file: `src/__tests__/Navigation.test.ts` (new)

```typescript
// REQ-VP-003: Monospace nav labels
describe('monospace nav labels (REQ-VP-003)', () => {
  it('nav link items have font-mono class')
  it('nav link items have tracking-[0.05em] class')
  it('nav link items have uppercase class')
})

// REQ-VP-004: Simplified navigation
describe('simplified navigation (REQ-VP-004)', () => {
  it('no letter-span animation on name link')
  it('no .mmrg-link .letter-span keyframes in CSS')
  it('no .nav-item a::after pseudo-element styles')
  it('nav bar height is h-12 md:h-14 (not h-16 md:h-20)')
})
```

### Test file: `src/__tests__/HeroSection.test.ts` (new)

```typescript
// REQ-VP-005: No typing effect
describe('dramatic hero (REQ-VP-005)', () => {
  it('no id="typing-name" span')
  it('no blinking cursor | span')
  it('no script block with typing animation logic')
  it('hero h1 has text-[3rem] lg:text-[6rem] classes')
  it('hero h1 has tracking-[-0.025em]')
  it('name span uses text-light-accent dark:text-dark-accent')
})

// REQ-VP-006: Minimal CTA button
describe('minimal CTA button (REQ-VP-006)', () => {
  it('CTA link has font-mono and tracking-[0.05em]')
  it('CTA link has uppercase class')
  it('CTA link does NOT have shadow-sm or hover:shadow-md')
})
```

### Test file: `src/__tests__/Footer.test.ts` (new)

```typescript
// REQ-VP-007: Monospace footer
describe('monospace footer (REQ-VP-007)', () => {
  it('footer text elements have font-mono class')
  it('footer text elements have tracking-[0.05em] class')
})
```

### Test file: `src/__tests__/SocialLinks.test.ts` (new)

```typescript
// REQ-VP-008: Minimal social links
describe('ghost social links (REQ-VP-008)', () => {
  it('social links do NOT have bg-light-card-bg or bg-dark-card-bg')
  it('social links have border border-light-border')
  it('social links do NOT have hover:scale-110')
})
```

### Test file: `src/__tests__/ThemeToggle.test.ts` (new)

```typescript
// REQ-VP-009: Minimal theme toggle
describe('minimal theme toggle (REQ-VP-009)', () => {
  it('toggle button does NOT have hover:bg-light-card-bg')
  it('toggle button does NOT have hover:scale-110')
  it('toggle button has transition-colors (not transition-all)')
})
```

### Test file: `src/__tests__/ExperienceSection.test.ts` (new)

```typescript
// REQ-VP-003: Monospace period
describe('monospace period (REQ-VP-003)', () => {
  it('period span has font-mono class')
  it('period span has tracking-[0.05em] class')
})

// REQ-VP-011: Always-expanded experience
describe('always-expanded experience (REQ-VP-011)', () => {
  it('no .trigger-area class with interactive click handler')
  it('no details-container with max-height: 0')
  it('no expand/collapse script block')
})
```