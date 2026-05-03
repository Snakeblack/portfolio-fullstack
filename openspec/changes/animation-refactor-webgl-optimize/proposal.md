# Proposal: Animation Refactor & WebGL Optimize

## Intent

Eliminate ~500 lines of redundant animation code and a WebGL shader recompilation bug. The current codebase has 7 overlapping mechanisms that all produce the same animation (`opacity: 1, y: 0, scale: 1`), causing visual conflicts, race conditions, and missed elements on mobile. WebGLBackground recompiles shaders and restarts the render loop on every theme toggle — only uniform values change between themes. This refactor fixes both for maximum impact-to-effort ratio.

## Scope

### In Scope
- **CommonScripts.astro**: Replace 7 mechanisms (ScrollTrigger + IntersectionObserver + checkVisibleElements + forceShowVisibleElements + forceShowBottomElements + forceShowAllRemainingElements + setInterval polling) with a single ScrollTrigger-based animation system. Remove all force-show functions, polling, scroll-velocity tracking, and redundant observers. Delete ~500 lines.
- **WebGLBackground.astro**: Replace per-theme shader recompilation with a single shader program using uniforms for theme colors. Update uniforms on `themeChanged` instead of full `initWebGL()` reinitialization. Eliminate buffer/program recreation on theme toggle.
- **ProjectsSection.astro**: Remove `.project-hidden`/`.project-visible` CSS classes and `@keyframes projectFadeInFresh`. Let CommonScripts' unified ScrollTrigger handle all entrance animations. Remove the duplicate animation system.
- **global.css**: Remove CSS transitions on `.scroll-animate` classes that conflict with GSAP overrides.

### Out of Scope
- Adding new animations or visual effects
- Changing animation easing or timing values (keep existing `power1.out`, durations)
- Three.js or non-WebGL canvas refactors
- Any page layout or content changes
- SEO or accessibility improvements
- prefers-reduced-motion implementation (separate change)

## Capabilities

### New Capabilities
- `scroll-animations`: Single ScrollTrigger-based entrance animation system replacing all 7 redundant mechanisms

### Modified Capabilities
- `webgl-background`: Uniform-based theme switching instead of shader recompilation on theme toggle

## Approach

**Minimal Fix — highest impact-to-effort ratio:**

1. **CommonScripts**: Rewrite to a single `initScrollAnimations()` using ScrollTrigger only. Set initial hidden state via `gsap.set()`, reveal via `onEnter`. Kill IntersectionObserver, all `forceShow*` functions, `checkVisibleElements`, `cleanupIncompleteAnimations`, `setInterval` polling, scroll-velocity tracking, and `forceShowSkillsSection`. Remove footer special-case (ScrollTrigger `start: "top 88%"` already handles it). Keep: scroll restoration, smooth anchor links, mobile detection (for reduced-motion future use).

2. **WebGLBackground**: Extract dark/light color differences into a `u_themeColors` uniform vec3 array (or separate `u_baseColor` + `u_accentColor` uniforms). One fragment shader selects colors via uniform. On `themeChanged`, call `gl.uniform3f()` only — no `createShader`, `createProgram`, `createBuffer`, or `cancelAnimationFrame`. Render loop continues uninterrupted.

3. **ProjectsSection**: Remove `.project-hidden`/`.project-visible` classes from template and CSS. Remove `@keyframes projectFadeInFresh`. Add `.scroll-animate` class to project cards so CommonScripts handles them. Delete the component's own animation JS.

4. **global.css**: Remove `transition` properties on `.scroll-animate` selectors. GSAP's `overwrite: "auto"` handles conflicts, but removing the CSS removes the root cause.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/CommonScripts.astro` | Removed+Modified | Delete ~500 lines, rewrite to single ScrollTrigger system (~80 lines) |
| `src/components/WebGLBackground.astro` | Modified | Uniform-based theme switch, eliminate recompilation |
| `src/components/ProjectsSection.astro` | Modified | Remove CSS animation classes, delegate to CommonScripts |
| `src/styles/global.css` | Modified | Remove `.scroll-animate` CSS transitions |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Elements not appearing after removing force-show fallbacks | Medium | ScrollTrigger `onEnter` + `refresh()` on resize covers all cases; add `once: true` to prevent re-trigger |
| WebGL uniform typo causes visual artifact on theme switch | Low | Test both themes visually after change; uniform values are exact copies of existing fragment shader constants |
| ProjectsSection cards flash/flicker during transition | Low | Remove `.project-hidden` opacity:0 and let GSAP set initial state instead |
| Mobile scroll behavior regression | Medium | ScrollTrigger's `ignoreMobileResize` config already in place; test on mobile viewport |

## Rollback Plan

Git revert of the 4 changed files. No database or config changes. Each file change is independent — can rollback individually (e.g., rollback WebGL only while keeping CommonScripts refactor).

## Dependencies

- GSAP (already installed, ScrollTrigger plugin already loaded)
- No new packages required

## Success Criteria

- [ ] CommonScripts.astro reduced to ≤120 lines (from 845)
- [ ] Zero `IntersectionObserver` instances in animation code
- [ ] Zero `setInterval` polling for animation
- [ ] Zero `forceShow*` functions remaining
- [ ] WebGLBackground: no `createShader`/`createProgram`/`createBuffer` calls on theme toggle
- [ ] WebGLBackground: render loop runs continuously, only `gl.uniform*()` calls on theme change
- [ ] ProjectsSection: no `.project-hidden`/`.project-visible` classes or `@keyframes projectFadeInFresh`
- [ ] All animated elements appear correctly on desktop and mobile viewports
- [ ] Theme toggle switches WebGL background colors without visible flicker or pause
- [ ] No CSS transitions on `.scroll-animate` classes that conflict with GSAP