# Proposal: Portfolio Redesign

## Intent

Differentiate Manuel's portfolio from generic "Full Stack Developer" pages by restructuring content flow from a recruiter's perspective. Position him as a **Frontend-First Full Stack Engineer** — not a generalist — and surface the scale and nature of his work through narrative impact rather than hard metrics.

## Scope

### In Scope
- Hero section rewrite: specialization hook + availability indicator + location
- New section order: Hero → Selected Work → Skills → Experience → Education → About → Contact CTA
- Projects split: "Selected Work" (curated top 3 with problem→solution narrative) + "More Projects" (archived)
- Skills with proficiency levels grouped by category (expert/proficient/familiar)
- Experience entries with impact highlights (narrative, not numeric)
- New Education section (42 Madrid, Tokio School)
- New Contact CTA section at bottom
- Navigation update: add Skills, Projects, reorder links
- Data model updates in `portfolio.json` + `portfolio.ts`
- i18n: both es/en routes updated in parallel
- JSON-LD structured data updates for new sections

### Out of Scope
- Visual design overhaul (keep WebGL background + glass-card aesthetic)
- Testimonials/social proof section (no content available yet)
- Micro-interactions beyond existing GSAP scroll animations
- Contact form backend (CTA links only)
- Blog or writing section
- New pages or multi-page routing

## Capabilities

### New Capabilities
- `selected-work`: Curated top-3 projects with problem→solution narrative and visual prominence, separate from archive list
- `skills-proficiency`: Technical skills displayed with proficiency levels and category grouping instead of flat tags
- `education`: Education section rendering 42 Madrid and Tokio School entries
- `contact-cta`: Dedicated contact call-to-action section with multiple channels (email, LinkedIn, GitHub)

### Modified Capabilities
- `hero`: Positioning changed from generic "Full Stack Developer" to "Frontend-First Full Stack Engineer" with availability indicator and location
- `experience`: Adding impact highlights (narrative) per role instead of flat descriptions
- `navigation`: Reordered links and added missing Skills + Projects anchors
- `projects`: Split into Selected Work (featured) and More Projects (archive) with different visual treatments

## Approach

Structural Redesign — rethink page flow from recruiter perspective. The visual foundation (WebGL, glass-cards, GSAP scroll) stays. All effort goes into **information hierarchy and content differentiation**:

1. **Hero** → Lead with specialization ("Frontend-First Full Stack Engineer"), add "Open to opportunities" dot + location
2. **Selected Work** → Top 3 projects with problem→solution narrative; remaining projects collapsible
3. **Skills** → Grouped by category with proficiency levels (expert/proficient/familiar)
4. **Experience** → Impact highlights per role using narrative of work scale and nature
5. **Education** → New section: 42 Madrid + Tokio School
6. **About** → Reframed as philosophy/story, not generic bio
7. **Contact CTA** → Dedicated section with email, LinkedIn, GitHub

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/types/portfolio.ts` | Modified | Add proficiency levels, project categories, education entries, impact highlights |
| `src/data/portfolio.json` | Modified | Restructure skills with levels, add education data, add project narratives, add experience highlights |
| `src/components/HeroSection.astro` | Modified | Specialization positioning, availability indicator, location |
| `src/components/ProjectsSection.astro` | Modified | Split into Selected Work + archive, add narrative fields |
| `src/components/SkillsSection.astro` | Modified | Proficiency visualization, category grouping |
| `src/components/ExperienceSection.astro` | Modified | Impact highlights per role |
| `src/components/Navigation.astro` | Modified | Add Skills/Projects links, reorder |
| `src/components/AboutSection.astro` | Modified | Reframe as philosophy |
| `src/components/EducationSection.astro` | New | Education section component |
| `src/components/ContactSection.astro` | New | Contact CTA section component |
| `src/pages/index.astro` | Modified | New section order + new sections |
| `src/pages/en/index.astro` | Modified | Mirror section order changes |
| `src/utils/translations.ts` | Modified | New keys for all new content |
| `src/layouts/Layout.astro` | Modified | JSON-LD updates for new sections |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Content gap — impact narratives feel generic | High | User provides scale/nature of work; we craft narrative language, not hard metrics |
| i18n drift between es/en | Med | Update both locales in same task batch |
| Over-sectioning → page feels long | Med | Keep sections concise; use collapsible "More Projects" to reduce vertical sprawl |
| Skill proficiency over/under-claims | Med | Use conservative 3-tier system; user validates levels |
| SEO heading hierarchy broken by reordering | Low | Maintain single h1, validate heading nesting after reorder |

## Rollback Plan

Git branch strategy. All changes in a feature branch `feature/portfolio-redesign`. Each section transformation is a separate commit. If any section fails, revert that commit. Full rollback = delete the branch.

Key rollback points:
- Data model changes (`portfolio.json`, `portfolio.ts`) — commit separately before component changes
- New components (Education, Contact) — independent, can be removed without affecting others
- Section reordering in `index.astro` — single commit, easy revert

## Dependencies

- User input needed: impact descriptions per role, project narratives for top 3, skill proficiency self-assessment
- No new npm packages required
- Existing GSAP + ScrollTrigger + WebGL stack is sufficient

## Success Criteria

- [ ] Hero clearly positions "Frontend-First Full Stack Engineer" with availability indicator
- [ ] Top 3 projects displayed with problem→solution narrative
- [ ] Skills grouped and shown with proficiency levels
- [ ] Every experience entry has at least one impact highlight
- [ ] Education section renders 42 Madrid + Tokio School
- [ ] Contact CTA section exists with email, LinkedIn, GitHub
- [ ] Both es/en locales are complete and synced
- [ ] Lighthouse SEO score ≥ 95 maintained
- [ ] Single h1, proper heading hierarchy preserved
- [ ] prefers-reduced-motion respected for all new animations