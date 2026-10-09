# Capability: webgl-background

> Geometric grid shader replacing organic wave shader, grid uniforms, theme-aware rendering, grain texture in shader.

## Requirements

### REQ-WB-001: Replace wave shader with dot-matrix grid shader

**MUST** replace the current organic wave fragment shader with a dot-matrix grid shader. The new shader renders:
- A perspective-distorted rectangular grid (lines, not filled cells)
- Grid lines that subtly respond to mouse/time (gentle wave displacement, not organic)
- Built-in grain texture rendered inside the shader itself (no separate grain pass needed, though CSS grain overlay from REQ-DS-005 still applies on top)

The current shader uses:
```
baseColor + colorWave (distance-based organic waves from a moving center)
```

The new shader **MUST** use:
```
gridColor = grid sampling function with perspective + subtle displacement
baseColor + gridColor + shaderGrain
```

Key visual characteristics:
- Grid lines should be thin (1–2px perceived width)
- Grid should extend to the horizon with perspective foreshortening
- Grid cells should NOT be filled — only line strokes
- Lines should have a subtle sine displacement over time (amplitude ≤ 2% of cell size)
- The grid color should use the accent token for line visibility

### REQ-WB-002: Grid-specific uniforms

**MUST** replace the current wave-oriented uniforms with grid-oriented uniforms:

Current uniforms to **REMOVE**:
- `u_centerAmplitude` — wave center movement
- `u_centerSpeed` — wave center speed
- `u_colorModFactors` — RGB wave modulation
- `u_colorModOffsets` — RGB wave offsets
- `u_smoothstepRange` — wave falloff
- `u_colorSpeed` — RGB wave animation speed
- `u_distanceMults` — RGB distance multipliers

New uniforms to **ADD**:
- `u_gridSize` (float) — spacing between grid lines (default: 0.08–0.12 in UV space)
- `u_gridColor` (vec3) — color of grid lines (theme-dependent, derived from accent token)
- `u_gridLineWidth` (float) — perceived line width (default: 0.003–0.006)
- `u_displacementAmplitude` (float) — how much grid lines wave (default: 0.002)
- `u_displacementSpeed` (float) — wave speed for grid displacement
- `u_grainIntensity` (float) — shader-internal grain strength (replaces `u_grainAmount`)

Uniforms to **KEEP**:
- `u_resolution` (vec2) — canvas size
- `u_time` (float) — elapsed time
- `u_baseColor` (vec3) — background color (theme-dependent)
- `u_isLight` (float) — theme flag (0 = dark, 1 = light)

### REQ-WB-003: Theme-aware grid rendering

**MUST** define theme uniform presets that produce visually correct grids in both light and dark modes:

```typescript
const THEME_UNIFORMS: Record<ThemeMode, GridThemeUniforms> = {
  dark: {
    baseColor: [0.04, 0.04, 0.06],       // Near-black with slight blue
    gridSize: 0.10,
    gridColor: [0.20, 0.22, 0.35],        // Cool blue-gray lines
    gridLineWidth: 0.004,
    displacementAmplitude: 0.002,
    displacementSpeed: 0.3,
    grainIntensity: 0.04,
    isLight: 0,
  },
  light: {
    baseColor: [0.94, 0.94, 0.96],        // Near-white with blue tint
    gridSize: 0.10,
    gridColor: [0.55, 0.55, 0.65],        // Medium blue-gray lines
    gridLineWidth: 0.004,
    displacementAmplitude: 0.002,
    displacementSpeed: 0.3,
    grainIntensity: 0.02,
    isLight: 1,
  },
};
```

- Grid lines **MUST** be visible but subtle in both themes
- Dark mode grid lines **SHOULD** be slightly brighter than the background
- Light mode grid lines **SHOULD** be slightly darker than the background
- Grain intensity is lower in light mode to avoid visual noise on bright surfaces

### REQ-WB-004: Grain texture within shader

**MUST** include grain generation inside the fragment shader using a hash function:

```glsl
float grain = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * u_grainIntensity;
```

This is the same hash function used in the current shader (REQ-WEBGL-001). The grain **MUST**:
- Be applied after grid rendering, before final color output
- Mix with `color = mix(color, clamp(color + grain, 0.0, 1.0), u_isLight)` for proper clamping in light mode
- Use `u_grainIntensity` instead of `u_grainAmount` (semantic rename)

### REQ-WB-005: Shader uniforms interface update

**MUST** update the TypeScript interface `UniformHandles` and `ThemeUniforms` in `WebGLBackground.astro` to reflect the new uniform set:

```typescript
interface GridThemeUniforms {
  baseColor: [number, number, number];
  gridSize: number;
  gridColor: [number, number, number];
  gridLineWidth: number;
  displacementAmplitude: number;
  displacementSpeed: number;
  grainIntensity: number;
  isLight: number;
}

interface UniformHandles {
  resolution: WebGLUniformLocation;
  time: WebGLUniformLocation;
  baseColor: WebGLUniformLocation;
  gridSize: WebGLUniformLocation;
  gridColor: WebGLUniformLocation;
  gridLineWidth: WebGLUniformLocation;
  displacementAmplitude: WebGLUniformLocation;
  displacementSpeed: WebGLUniformLocation;
  grainIntensity: WebGLUniformLocation;
  isLight: WebGLUniformLocation;
}
```

### REQ-WB-006: Keep canvas blur class and positioning

**MUST** preserve the existing `<canvas>` styling:
- `id="webgl-background"` — kept
- `class="blur-lg"` — **REMOVED** (grid shader should be sharp, not blurred)
- `aria-hidden="true" role="presentation"` — kept
- CSS `position: fixed; inset: 0; z-index: -1` — kept

The `blur-lg` class made sense for the organic wave background but produces unwanted softness on the dot-matrix grid. The grid **MUST** render crisp lines.

### REQ-WB-007: Theme transition handling preserved

**MUST** keep the existing `themeChanged` event listener pattern:
```typescript
document.addEventListener('themeChanged', () => {
  if (!webglState) return;
  applyThemeUniforms(webglState.gl, webglState.uniforms, getCurrentTheme());
});
```

The current pattern of updating uniforms via `applyThemeUniforms()` on theme change — rather than reinitializing the entire WebGL context — **MUST** be preserved. Only the uniform names and values change.

### REQ-WB-008: Remove wave-specific uniform application code

**MUST** update the `applyThemeUniforms` function to use the new grid uniforms:
```typescript
function applyThemeUniforms(gl, uniforms, theme) {
  const values = THEME_UNIFORMS[theme];
  gl.uniform3f(uniforms.baseColor, ...values.baseColor);
  gl.uniform1f(uniforms.gridSize, values.gridSize);
  gl.uniform3f(uniforms.gridColor, ...values.gridColor);
  gl.uniform1f(uniforms.gridLineWidth, values.gridLineWidth);
  gl.uniform1f(uniforms.displacementAmplitude, values.displacementAmplitude);
  gl.uniform1f(uniforms.displacementSpeed, values.displacementSpeed);
  gl.uniform1f(uniforms.grainIntensity, values.grainIntensity);
  gl.uniform1f(uniforms.isLight, values.isLight);
}
```

All `gl.uniform3f` calls for wave uniforms (`u_colorModFactors`, `u_colorModOffsets`, `u_colorSpeed`, `u_distanceMults`) and `gl.uniform2f` calls (`u_centerSpeed`, `u_smoothstepRange`) **MUST** be removed.

## Scenarios

### Scenario WB-001-A: Fragment shader renders dot-matrix grid

**Given** the WebGL canvas is initialized
**When** the fragment shader executes
**Then** the output shows a rectangular grid with perspective foreshortening
**And** grid cells are outlined (not filled)
**And** grid lines have a subtle sine displacement over time

### Scenario WB-001-B: Grid lines are thin and visible

**Given** the shader with `u_gridLineWidth` = 0.004
**When** rendered at 1920×1080
**Then** grid lines appear 1–2px wide
**And** lines are clearly visible but do not dominate the composition

### Scenario WB-002-A: Old wave uniforms are absent

**Given** `src/components/WebGLBackground.astro`
**When** the source is parsed
**Then** `u_centerAmplitude`, `u_centerSpeed`, `u_colorModFactors`, `u_colorModOffsets`, `u_smoothstepRange`, `u_colorSpeed`, `u_distanceMults` do not appear as uniform names
**And** `u_gridSize`, `u_gridColor`, `u_gridLineWidth`, `u_displacementAmplitude`, `u_displacementSpeed`, `u_grainIntensity` are present

### Scenario WB-003-A: Theme presets produce correct visual output

**Given** dark theme is active
**When** `applyThemeUniforms` is called with 'dark'
**Then** `u_baseColor` is set to near-black [0.04, 0.04, 0.06]
**And** `u_gridColor` is set to cool blue-gray [0.20, 0.22, 0.35]
**And** `u_grainIntensity` is 0.04

**Given** light theme is active
**When** `applyThemeUniforms` is called with 'light'
**Then** `u_baseColor` is set to near-white [0.94, 0.94, 0.96]
**And** `u_gridColor` is set to medium blue-gray [0.55, 0.55, 0.65]
**And** `u_grainIntensity` is 0.02

### Scenario WB-004-A: Shader grain uses existing hash function

**Given** the fragment shader source
**When** parsed for grain calculation
**Then** the shader contains `fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453)`
**And** grain is multiplied by `u_grainIntensity`
**And** color mixing with `u_isLight` clamp is preserved

### Scenario WB-005-A: TypeScript interfaces match new uniforms

**Given** `src/components/WebGLBackground.astro`
**When** the TypeScript interfaces are parsed
**Then** `GridThemeUniforms` interface contains `gridSize`, `gridColor`, `gridLineWidth`, `displacementAmplitude`, `displacementSpeed`, `grainIntensity`
**And** `UniformHandles` interface contains matching WebGLUniformLocation entries
**And** wave-specific fields are absent

### Scenario WB-006-A: Canvas blur-lg class removed

**Given** `src/components/WebGLBackground.astro`
**When** the canvas element is parsed
**Then** its class attribute does NOT contain `blur-lg`
**And** it has `id="webgl-background"`, `aria-hidden="true"`, `role="presentation"`

### Scenario WB-007-A: Theme change updates uniforms without reinit

**Given** a running WebGL context
**When** `themeChanged` event fires
**Then** `applyThemeUniforms` is called with the current theme
**And** `initializeWebGL` is NOT called again
**And** no `cancelAnimationFrame` occurs

## Acceptance Criteria

1. **AC-WB-001**: Fragment shader renders a dot-matrix grid (not organic waves)
2. **AC-WB-002**: All wave uniforms removed, all grid uniforms present
3. **AC-WB-003**: Theme uniform presets defined for both light and dark
4. **AC-WB-004**: Shader grain preserved using existing hash function with `u_grainIntensity`
5. **AC-WB-005**: TypeScript interfaces `GridThemeUniforms` and `UniformHandles` match new uniform set
6. **AC-WB-006**: Canvas `blur-lg` class removed
7. **AC-WB-007**: Theme transition still uses `applyThemeUniforms` without WebGL reinit
8. **AC-WB-008**: Grid visible in both themes with appropriate contrast
9. **AC-WB-009**: No performance regression (shader remains single-pass, no multi-pass)

## Test Specifications

### Test file: `src/__tests__/WebGLBackground.test.ts` (extend existing)

```typescript
// REQ-WB-001: Grid shader replaces wave
describe('dot-matrix grid shader (REQ-WB-001)', () => {
  it('fragment shader source contains grid sampling logic (not wave center/distance)')
  it('fragment shader uses u_gridSize uniform')
  it('fragment shader uses u_gridColor uniform')
  it('fragment shader uses u_gridLineWidth uniform')
  it('fragment shader uses u_displacementAmplitude uniform')
  it('fragment shader uses u_displacementSpeed uniform')
})

// REQ-WB-002: Wave uniforms removed, grid uniforms added
describe('uniform migration (REQ-WB-002)', () => {
  it('does NOT define u_centerAmplitude')
  it('does NOT define u_centerSpeed')
  it('does NOT define u_colorModFactors')
  it('does NOT define u_colorModOffsets')
  it('does NOT define u_smoothstepRange')
  it('does NOT define u_colorSpeed')
  it('does NOT define u_distanceMults')
  it('defines u_gridSize')
  it('defines u_gridColor as vec3')
  it('defines u_gridLineWidth')
  it('defines u_displacementAmplitude')
  it('defines u_displacementSpeed')
  it('defines u_grainIntensity (replaces u_grainAmount)')
})

// REQ-WB-003: Theme uniform presets
describe('theme presets (REQ-WB-003)', () => {
  it('dark theme: baseColor is near-black with blue tint')
  it('dark theme: gridColor is cool blue-gray')
  it('dark theme: grainIntensity is 0.04')
  it('light theme: baseColor is near-white with blue tint')
  it('light theme: gridColor is medium blue-gray')
  it('light theme: grainIntensity is 0.02')
  it('both themes: gridSize and gridLineWidth are equal')
})

// REQ-WB-004: Shader grain preserved
describe('shader grain (REQ-WB-004)', () => {
  it('uses the same hash function fract(sin(dot(...)))')
  it('multiplies grain by u_grainIntensity')
  it('uses u_isLight for color clamping in light mode')
})

// REQ-WB-005: TypeScript interfaces
describe('TypeScript interfaces (REQ-WB-005)', () => {
  it('GridThemeUniforms interface has gridSize, gridColor, gridLineWidth, displacementAmplitude, displacementSpeed, grainIntensity')
  it('UniformHandles interface has gridSize, gridColor, gridLineWidth, displacementAmplitude, displacementSpeed, grainIntensity as WebGLUniformLocation')
  it('GridThemeUniforms does NOT have centerAmplitude, colorModFactors, smoothstepRange, distanceMults, colorSpeed')
})

// REQ-WB-006: Canvas blur-lg removed
describe('canvas element (REQ-WB-006)', () => {
  it('canvas element does NOT have blur-lg class')
  it('canvas still has id webgl-background, aria-hidden, role=presentation')
})

// REQ-WB-007: Theme transition pattern
describe('theme change handling (REQ-WB-007)', () => {
  it('listens for themeChanged event')
  it('calls applyThemeUniforms on theme change (not initializeWebGL)')
  it('does NOT contain cancelAnimationFrame in theme change path')
})
```