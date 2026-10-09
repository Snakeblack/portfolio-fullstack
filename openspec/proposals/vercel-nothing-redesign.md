# Proposal: Vercel/Nothing Minimal Industrial Redesign

## Intent

The portfolio at mretamozo.com uses a "modern soft" aesthetic that blends into the generic SaaS template crowd. Redesigning toward a **Minimal Industrial** system (Vercel/Nothing-inspired) creates a distinctive, high-contrast visual identity that signals engineering precision and design intentionality — matching the portfolio's purpose of showcasing front-end craft.

## Scope

### In Scope
- Shift color system to near-achromatic oklch (~0.005–0.02 chroma) at hue 260 with one strategic accent
- Introduce dramatic typography scale (hero 96px desktop, metadata monospace 12px)
- Rewrite WebGL shader from organic waves to geometric grid with grain
- Convert fill-based cards to ghost/border-only cards with gradient borders
- Simplify navigation (remove letter-bounce, monospace labels, thinner bar)
- Replace hero typing effect with static text + dramatic fade-in + status dot
- Monochrome tech/skill chips (no brand colors)
- Add Geist Mono for metadata/timestamps/labels
- Grain texture CSS overlay
- Reduce animation amplitude across all components (translateY 5px vs 20px)

### Out of Scope
- New pages or sections (blog, case studies, etc.)
- i18n restructuring or new languages
- CMS or content model changes
- SEO meta/structured data modifications
- Accessibility remediation beyond current baseline
- Performance optimization unrelated to visual changes

## Capabilities

### New Capabilities
- `design-system`: color tokens (near-achromatic oklch), typography scale, animation strategy, grain overlay, gradient tokens, Geist Mono loading
- `webgl-background`: geometric grid shader (replaces wave shader), grid uniforms, theme-aware grid rendering
- `visual-presentation`: ghost cards, gradient borders, monochrome chips, monospace metadata, simplified nav, dramatic hero

### Modified Capabilities
- None — no existing `openspec/specs/` to modify; this is the first spec cycle for visual design.

## Approach

**Minimal Industrial** (Exploration Approach 3): near-achromatic base (~0.02 chroma) with geometric WebGL grid, gradient-border ghost cards, dramatic typography, accent-only on CTAs. Phased migration: tokens first → shader rewrite → component restyling → animation tuning.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/styles/global.css` | Modified | All design tokens, animations, grain overlay |
| `src/layouts/Layout.astro` | Modified | Geist Mono font loading, theme meta |
| `src/components/WebGLBackground.astro` | Modified | Fragment shader rewrite (wave → grid) |
| `src/components/Navigation.astro` | Modified | Minimal style, remove letter-bounce |
| `src/components/HeroSection.astro` | Modified | Remove typing, dramatic sizes, status dot |
| `src/components/ProjectsSection.astro` | Modified | Ghost cards, monochrome chips |
| `src/components/ExperienceSection.astro` | Modified | Simplified timeline, monospace metadata |
| `src/components/AboutSection.astro` | Modified | Spacing, heading sizes |
| `src/components/SkillsSection.astro` | Modified | Monochrome chips, ghost cards |
| `src/components/Footer.astro` | Modified | Monospace treatment |
| `src/components/ThemeToggle.astro` | Modified | Minimal icon style |
| `src/components/SocialLinks.astro` | Modified | Ghost icon treatment |
| `src/components/CommonScripts.astro` | Modified | Reduced animation amplitude |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Loss of visual personality — too generic | Med | One accent color + geometric shader + grain = distinctive fingerprint |
| Contrast issues in near-achromatic light mode | Low | Maintain L separation ≥0.25 between text/bg (current: 0.73 gap) |
| Gradient-border cross-browser issues | Med | Use pseudo-element approach; fallback to solid border |
| Geist Mono adds font payload | Low | Variable subset, only for small metadata strings |
| Monospace Spanish metadata wider than English | Low | Responsive sizing, allow wrapping, test both languages |
| Token change cascades across all components at once | Med | Accept temporary inconsistency or batch in one pass |

## Rollback Plan

All visual changes are in `global.css` tokens and component class names — no logic restructuring. Rollback = revert the deployment commit. The WebGL shader is self-contained and can be swapped back to wave independently. Keep the current wave shader in a `wave-shader-backup` branch.

## Dependencies

- Astro 5.8 SSG build pipeline (no changes needed)
- Tailwind CSS 4.2 `@theme` directive support (already in use)
- GSAP 3.15 with ScrollTrigger (already integrated)
- Geist Mono variable font file to add to `src/fonts/`

## Success Criteria

- [ ] All color tokens shifted to near-achromatic (chroma ≤0.02) with one accent
- [ ] Hero heading renders at 48px mobile / 96px desktop with tight tracking
- [ ] WebGL background shows geometric grid (not wave) in both themes
- [ ] All cards use ghost/border-only style (no fill backgrounds)
- [ ] Tech and skill chips are monochrome (no brand colors)
- [ ] Navigation uses monospace labels, no letter-bounce animation
- [ ] Geist Mono loads and renders for metadata elements
- [ ] Grain texture overlay visible in both themes
- [ ] All scroll animations ≤5px translateY
- [ ] Accessibility maintained: 4.5:1 contrast, focus-visible, aria labels
- [ ] All 84 existing tests pass