# Design: Vercel/Nothing Minimal Industrial Redesign

## Technical Approach

Shift the portfolio from "modern soft" to **Minimal Industrial** via 3 coordinated capabilities: (1) `design-system` — near-achromatic oklch tokens + Geist Mono + grain overlay, (2) `webgl-background` — dot-matrix grid shader replacing organic waves, (3) `visual-presentation` — glass cards, glass backgrounds, monochrome chips, reduced animations. All changes are CSS/class-level — no logic restructuring.

## Architecture Decisions

### Decision: Color Token Architecture

**Choice**: Single set of 14 oklch tokens in Tailwind v4 `@theme` block at hue 260, chroma ≤0.02 for base colors, 0.20 for accent. Add 2 gradient tokens.

| Option | Tradeoff | Decision |
|--------|----------|----------|
| CSS custom properties + `@theme` | More flexible but duplicates declarations | ❌ |
| `@theme` only (Tailwind v4 native) | Single source of truth, auto-generates utilities | ✅ |
| Separate light/dark files | Cleaner separation but harder to maintain parity | ❌ |

**Rationale**: Tailwind v4 `@theme` generates `bg-light-bg`, `text-dark-accent`, etc. automatically. No `var()` in className needed. Existing pattern in `global.css` lines 51-68 already uses this — we're updating values, not structure.

### Decision: WebGL Shader Strategy

**Choice**: Rewrite fragment shader in-place. Keep vertex shader, buffer setup, render loop, and `themeChanged` event listener unchanged. Replace uniforms for wave-specific params with dot-matrix specific params.

| Option | Tradeoff | Decision |
|--------|----------|----------|
| New component + new shader | Clean separation but doubles WebGL context | ❌ |
| Rewrite fragment shader in-place | Minimal diff, same infrastructure | ✅ |
| CSS-only grid (no WebGL) | Simpler but loses depth/dimension | ❌ |

**Rationale**: Current architecture (lines 154-308) is well-structured — `THEME_UNIFORMS` record, `applyThemeUniforms()`, single render loop. We only change the fragment shader source and the uniform config objects. The `createShader`, `createProgram`, resize, and render functions stay identical.

### Decision: Gradient Border Pattern

**Choice**: Pseudo-element approach (`::before` with `background: linear-gradient` + `mask/compose` for border-only). Fallback: solid `border-color`.

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `border-image: linear-gradient(...)` | No `border-radius` support | ❌ |
| Pseudo-element + `mask` | Full radius support, wider browser compat | ✅ |
| `background-clip: padding-box` trick | Limited to solid + gradient combo | ❌ |

**Rationale**: `border-image` doesn't respect `border-radius`. Pseudo-element with `z-index: -1` behind content, `background: linear-gradient(...)`, and `mask: linear-gradient(...)` compositing gives pixel-perfect glass backgrounds with full radius. Fallback via `@supports not (mask: ...)` → solid border.

### Decision: Grain Overlay

**Choice**: CSS pseudo-element with inline SVG `<feTurbulence>` filter as `background-image`. Applied to `body::after` with `pointer-events: none`.

| Option | Tradeoff | Decision |
|--------|----------|----------|
| WebGL grain (in shader) | Already have grainAmount uniform — but coupled to canvas | Partial — keep in shader too |
| SVG filter pseudo-element | Independent of canvas, works even if WebGL fails | ✅ |
| CSS `background-image` with noise PNG | Extra network request, fixed resolution | ❌ |

**Rationale**: Dual grain (shader + CSS) gives redundancy. CSS grain stays visible even if WebGL context is lost. SVG filter is resolution-independent and has zero network cost. Performance: single `position: fixed` pseudo-element, composited on GPU.

### Decision: Geist Mono Loading

**Choice**: `@fontsource-variable/geist-mono/wght.css` (variable weight, subset). Load in `Layout.astro` alongside existing Geist Variable.

| Option | Tradeoff | Decision |
|--------|----------|----------|
| fontsource npm package | Already using this pattern for Geist Variable | ✅ |
| Local `.woff2` in `src/fonts/` | More control but manual subsetting | ❌ |
| Google Fonts CDN | External dependency, privacy concern | ❌ |

**Rationale**: Project already uses `@fontsource-variable/geist/wght.css` (Layout.astro line 2). Same pattern for Mono. Variable font = single file for all weights. Only used for small metadata strings (12px) so payload impact is minimal.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/styles/global.css` | Modify | Replace all 14 `@theme` color tokens. Add 2 gradient tokens. Add `body::after` grain overlay. Add `.glass-card` utility. Update animation translateY from 20px→5px, 10px→3px. Add `font-geist-mono` utility. |
| `src/layouts/Layout.astro` | Modify | Add `import "@fontsource-variable/geist-mono/wght.css"`. |
| `src/components/WebGLBackground.astro` | Modify | Replace fragment shader source (grid geometry). Update `THEME_UNIFORMS` with new uniform names/values. Replace `UniformHandles` and `ThemeUniforms` interfaces. |
| `src/components/Navigation.astro` | Modify | Remove letter-bounce spans (line 26-28) → plain text. Add `font-mono` to nav labels. Remove `subtleLetterBounce` keyframe. Thinner bar (`h-14`). |
| `src/components/HeroSection.astro` | Modify | Remove typing script (lines 60-83). Remove cursor `\|` span. Static `<h1>` with `text-[48px] md:text-[96px] tracking-tight`. Add status dot (green pulsing circle). |
| `src/components/ProjectsSection.astro` | Modify | Replace `bg-light-card-bg dark:bg-dark-card-bg` with ghost style. Add `.glass-card` class. Replace tech chips with monochrome (remove `techColorMap` usage). Remove 3D hover transform. |
| `src/components/ExperienceSection.astro` | Modify | Add `font-mono` to period spans. Remove `italic` from period. Simplify timeline dot (thinner border). |
| `src/components/SkillsSection.astro` | Modify | Replace colored chips with monochrome ghost chips. Replace soft skill cards with glass cards + glass backgrounds. |
| `src/components/AboutSection.astro` | Modify | Update heading to `text-[30px] md:text-[60px]`. Adjust spacing. |
| `src/components/Footer.astro` | Modify | Add `font-mono` to copyright and "Made with" text. |
| `src/components/SocialLinks.astro` | Modify | Replace `bg-light-card-bg` with transparent + border ghost style. |
| `src/components/ThemeToggle.astro` | Modify | Remove `hover:bg-light-card-bg`. Use transparent bg with border on hover. |
| `src/components/CommonScripts.astro` | Modify | Change `y` values: 20→5, 15→3, 10→2. Reduce stagger from 0.05→0.03. |
| `package.json` | Modify | Add `@fontsource-variable/geist-mono` dependency. |
| `src/utils/techColors.ts` | Modify | Replace color map with monochrome entries (or bypass entirely in components). |

## WebGL Shader Pseudocode — Dot-matrix Grid

```glsl
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_baseColor;       // near-achromatic base
uniform vec3 u_lineColor;       // grid line color (slightly lighter/darker)
uniform float u_gridSpacing;    // grid cell size (e.g., 0.08)
uniform float u_lineWidth;      // grid line thickness (e.g., 0.003)
uniform float u_fadeRadius;     // vignette fade from center (e.g., 0.7)
uniform float u_pulseSpeed;     // subtle grid pulse (e.g., 0.3)
uniform float u_grainAmount;    // noise grain (same concept as current)
uniform float u_isLight;        // theme flag

// Hash for grain noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  st.x *= aspect;

  // Grid coordinates
  vec2 gridPos = fract(st / u_gridSpacing);
  float distToEdge = min(min(gridPos.x, 1.0 - gridPos.x),
                         min(gridPos.y, 1.0 - gridPos.y));

  // Grid lines with anti-aliasing
  float halfLine = u_lineWidth * 0.5;
  float gridLine = 1.0 - smoothstep(halfLine - 0.001, halfLine + 0.001, distToEdge);

  // Subtle pulse on grid
  gridLine *= 0.6 + 0.4 * sin(u_time * u_pulseSpeed);

  // Radial vignette (fade edges)
  vec2 center = vec2(aspect * 0.5, 0.5);
  float d = distance(st, center) / (aspect * 0.5);
  float vignette = 1.0 - smoothstep(0.3, u_fadeRadius, d);

  // Composite
  vec3 color = mix(u_baseColor, u_lineColor, gridLine * vignette * 0.35);

  // Grain
  float grain = (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * u_grainAmount;
  color += grain;

  // Clamp for light mode
  color = mix(color, clamp(color, 0.0, 1.0), u_isLight);

  gl_FragColor = vec4(color, 1.0);
}
```

**Uniform config (replaces current `THEME_UNIFORMS`)**:

```typescript
const THEME_UNIFORMS: Record<ThemeMode, ThemeUniforms> = {
  dark: {
    baseColor: [0.06, 0.06, 0.10],
    lineColor: [0.14, 0.14, 0.22],
    gridSpacing: 0.08,
    lineWidth: 0.004,
    fadeRadius: 0.75,
    pulseSpeed: 0.3,
    grainAmount: 0.05,
    isLight: 0,
  },
  light: {
    baseColor: [0.97, 0.97, 0.98],
    lineColor: [0.88, 0.88, 0.92],
    gridSpacing: 0.08,
    lineWidth: 0.003,
    fadeRadius: 0.7,
    pulseSpeed: 0.25,
    grainAmount: 0.03,
    isLight: 1,
  },
};
```

**Performance**: Same GPU cost as current wave shader — single pass, no textures, no MRT. Grid math (`fract`) is cheaper than `sin`/`cos` distance fields. `hash()` replaces current `fract(sin(dot(...)))` — identical cost.

## CSS Architecture — Key Patterns

### Gradient Border Utility

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
  padding: 1px; /* border width */
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
/* Fallback */
@supports not (mask-composite: exclude) {
  .glass-card {
    border: 1px solid var(--color-light-border);
  }
  .dark .glass-card {
    border: 1px solid var(--color-dark-border);
  }
}
```

### Grain Overlay

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
.dark body::after {
  opacity: 0.05;
}
```

## Component Change Matrix

| Component | Before | After |
|-----------|--------|-------|
| **Navigation** | Letter-bounce animation, `text-xl md:text-2xl` name, `h-16 md:h-20` bar | Plain text name with `font-mono`, `text-base md:text-lg`, `h-14` bar, monospace labels |
| **HeroSection** | Typing effect + cursor, `text-4xl md:text-5xl lg:text-6xl`, `translateY(20px)` animation | Static h1 `text-[48px] md:text-[96px] tracking-tight font-bold`, status dot, `translateY(5px)` |
| **ProjectsSection** | `bg-light-card-bg` filled cards, colored tech chips, 3D hover (`translateY(-12px) rotateX(5deg)`) | Glass cards with `.glass-card`, monochrome chips, subtle hover (`translateY(-2px)`) |
| **ExperienceSection** | Regular period text, colored dots on active | `font-mono` periods, thinner timeline bar, accent-only active dot |
| **SkillsSection** | Colored skill chips via `techColorMap`, filled soft-skill cards | Monochrome ghost chips, ghost soft-skill cards with glass backgrounds |
| **AboutSection** | `text-3xl md:text-4xl` heading | `text-[30px] md:text-[60px]` heading, tighter spacing |
| **Footer** | Regular text | `font-mono` for copyright and links |
| **SocialLinks** | `bg-light-card-bg` filled icons | Transparent bg, border-only ghost icons |
| **ThemeToggle** | `hover:bg-light-card-bg` | Transparent, border-on-hover ghost style |
| **CommonScripts** | `y: 20/15/10`, stagger `0.05` | `y: 5/3/2`, stagger `0.03` |

## Test Plan

| # | Test | Verifies | File |
|---|------|----------|------|
| 1 | `@theme` tokens have chroma ≤0.02 for base colors | Design token correctness | `global-css.test.ts` (extend) |
| 2 | Gradient tokens exist in `@theme` block | Token completeness | `global-css.test.ts` (extend) |
| 3 | `body::after` grain overlay exists with `pointer-events: none` | Grain implementation | `global-css.test.ts` (extend) |
| 4 | `.glass-card` utility uses `mask-composite: exclude` | Gradient border pattern | `global-css.test.ts` (extend) |
| 5 | Fragment shader uses `fract` (grid), not `distance` + `smoothstep` (wave) | Shader rewrite | `WebGLBackground.test.ts` (extend) |
| 6 | `THEME_UNIFORMS` has `gridSpacing`, `lineWidth` (not wave params) | Uniform interface | `WebGLBackground.test.ts` (extend) |
| 7 | Hero h1 uses `96px` desktop size | Typography scale | New: `typography.test.ts` |
| 8 | Nav has no `.letter-span` children | Letter-bounce removal | New: `Navigation.test.ts` |
| 9 | Project cards have no `bg-light-card-bg` class | Ghost card migration | `ProjectsSection.test.ts` (extend) |
| 10 | Tech chips have no inline `background-color` style | Monochrome chips | `ProjectsSection.test.ts` (extend) |
| 11 | GSAP `y` values ≤5 in `CommonScripts.astro` | Reduced animation amplitude | `CommonScripts.test.ts` (extend) |
| 12 | `font-mono` class present in ExperienceSection periods | Monospace metadata | New: `ExperienceSection.test.ts` |

**Order**: Tests 1-4 (tokens/CSS) → 5-6 (shader) → 7-8 (typography/nav) → 9-12 (components). Each group can be TDD'd independently.

## Migration Order

1. **`package.json`** — Add `@fontsource-variable/geist-mono`
2. **`global.css`** — All token changes, grain overlay, glass-card utility, animation amplitude
3. **`Layout.astro`** — Geist Mono import
4. **`WebGLBackground.astro`** — Fragment shader + uniforms rewrite
5. **`Navigation.astro`** — Remove letter-bounce, monospace labels, thinner bar
6. **`HeroSection.astro`** — Remove typing, dramatic sizes, status dot
7. **`ProjectsSection.astro`** — Glass cards, glass backgrounds, monochrome chips
8. **`ExperienceSection.astro`** — Monospace metadata
9. **`SkillsSection.astro`** — Monochrome chips, glass cards
10. **`AboutSection.astro`** — Heading sizes
11. **`Footer.astro`** — Monospace treatment
12. **`SocialLinks.astro`** — Ghost icons
13. **`ThemeToggle.astro`** — Minimal style
14. **`CommonScripts.astro`** — Reduced amplitude (last, since it affects all scroll animations)

## Open Questions

- [ ] Should `techColorMap` in `techColors.ts` be deleted entirely or kept as fallback? Decision: keep but stop importing in components — monochrome chips use Tailwind classes directly.
- [ ] Grain SVG filter `baseFrequency` — test on mobile for performance. May need lower value on `prefers-reduced-motion`.
