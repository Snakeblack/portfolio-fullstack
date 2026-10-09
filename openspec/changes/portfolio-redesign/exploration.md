# Exploration: portfolio-redesign

## Current State

### Architecture
- **Astro 5.8 SSG** with Tailwind CSS 4.2, GSAP 3.15 + ScrollTrigger, TypeScript
- **i18n**: es (default, no prefix) / en (/en/) — duplicates index.astro per locale
- **Single-page portfolio** at mretamozo.com with 5 content sections + nav + footer
- **WebGL animated background**: custom shader with mouse-reactive grid, dot matrix, flashlights, scanlines. Already has the Vercel/Nothing aesthetic from previous `vercel-nothing-redesign` change.
- **Data-driven**: all content in `src/data/portfolio.json`, translations in `src/utils/translations.ts`
- **SEO**: JSON-LD structured data (Person + WebSite + WebPage), OpenGraph, Twitter Card, canonical URLs, hreflang, sitemap

### Component Inventory
| Component | Lines | Role | Issues |
|-----------|------|------|--------|
| `Layout.astro` | 197 | HTML shell, SEO meta, JSON-LD, GSAP init, theme init | Good SEO foundation; theme init is inline script |
| `Navigation.astro` | 171 | Fixed nav, mobile menu, lang switch, theme toggle | Only 3 nav items (About, Experience, Projects); Skills missing from nav |
| `HeroSection.astro` | 47 | Greeting + name + description + CTA email | Generic "Full Stack Developer" positioning; no differentiator |
| `AboutSection.astro` | 149 | Two paragraphs with mobile read-more | Pure text, no metrics/achievements/evidence; generic content |
| `ExperienceSection.astro` | 53 | Timeline with dots, company/period/position/description | Flat timeline; no impact metrics, no visual hierarchy beyond dates |
| `ProjectsSection.astro` | 249 | Grid cards, show-all toggle, screenshots, tech chips | 8 projects (3 visible); no problem→solution narrative; generic descriptions |
| `SkillsSection.astro` | 79 | Flat tag list + soft skill cards | 25+ tech skills as flat tags; no proficiency, no grouping visual; soft skills in generic glass cards |
| `SocialLinks.astro` | 50 | GitHub/LinkedIn/X icons | Functional but basic |
| `Footer.astro` | 36 | Copyright + "Built with Astro and Tailwind" | Minimal, adequate |
| `CommonScripts.astro` | 181 | GSAP ScrollTrigger animations, smooth anchors | Well-structured, respects prefers-reduced-motion |
| `WebGLBackground.astro` | 421 | Custom WebGL shader with magnetic grid | Already redesigned; solid foundation |
| `ThemeToggle.astro` | 61 | Dark/light toggle | Functional |

### Content Problems (the "gancho" gap)
1. **Hero**: "Desarrollador Full Stack" could be anyone. No specialization hook, no value proposition, no evidence.
2. **About**: Two paragraphs of generic "I like coding, I learn fast". Zero metrics, zero proof.
3. **Experience**: Wall of text per role. No achievements, no impact, no quantification ("improved X by Y%", "served Z users").
4. **Projects**: 8 projects listed as equal. No curation, no "why this matters", no results. Some are landing pages (equal weight as complex apps).
5. **Skills**: 25+ flat tags indistinguishable from each other. No proficiency signal, no "what I specialize in vs. what I've touched".
6. **No Education section**: Data type exists in TypeScript but not rendered, not in JSON.
7. **No contact section**: Only a `mailto:` in the hero. No dedicated contact form or CTA section.
8. **No testimonials/social proof**: No quotes from colleagues, no GitHub stats.
9. **Section ordering issue**: Nav links to About → Experience → Projects but Skills has no nav link.

### Design Strengths (keep)
- WebGL background is unique and well-executed
- Color system uses oklch with consistent hue 260
- Glass-card effects are elegant
- Smooth scroll animations with GSAP
- Dark/light theme toggle
- Responsive mobile menu
- Accessibility: prefers-reduced-motion support, aria labels
- SEO foundation is solid

### Data Model Issues (`portfolio.json` + `portfolio.ts`)
- `ExperienceEntry` has `highlights?: string[]` defined but never populated
- `EducationEntry` type exists but zero education data in JSON
- `ProjectEntry` has no `repo` field values populated
- `TechnicalSkillEntry` has `level?: string` and `icon?: string` but never used
- Skills data mixes technical and soft skills in one flat array

---

## Affected Areas
- `src/data/portfolio.json` — Content restructuring (the single biggest impact)
- `src/types/portfolio.ts` — Type updates for richer data models
- `src/components/HeroSection.astro` — Complete rewrite for differentiation
- `src/components/AboutSection.astro` — Rewrite with metrics/evidence
- `src/components/ExperienceSection.astro` — Restructure for impact
- `src/components/ProjectsSection.astro` — Add curation, narrative, separation
- `src/components/SkillsSection.astro` — Proficiency visualization, grouping
- `src/components/Navigation.astro` — Add missing links, reorder
- `src/components/Footer.astro` — Possible enhancement
- `src/pages/index.astro` — Section ordering, new sections
- `src/pages/en/index.astro` — Mirror changes
- `src/utils/translations.ts` — New translation keys for new content
- `src/layouts/Layout.astro` — JSON-LD updates for richer structured data
- `src/styles/global.css` — New utility classes if needed

---

## Approaches

### Approach 1: **Content-First Elevation** — Substance over form
Restructure content and data model to create differentiation, then adjust components minimally to surface the new content.

- **Pros**: Biggest ROI — content is what makes a portfolio stand out, not just layout; relatively low effort for high impact; doesn't break existing visual foundation
- **Cons**: Visual identity change is subtle — won't feel like a "redesign" to the user; some layout changes still needed to surface new content types
- **Effort**: Low-Medium

Key changes:
  - Add `level` to technical skills (expert/proficient/familiar)
  - Add `highlights` to experience entries with impact metrics
  - Add education section data
  - Restructure projects into "featured" vs "archive" 
  - Rewrite hero copy for differentiation
  - Add a CTA/contact section at the bottom
  - Populates `ProjectEntry.repo`
  - Group skills into "core" and "familiar"

### Approach 2: **Structural Redesign** — Reorganize sections, flow, and hierarchy
Rethink the page flow from a recruiter's perspective: what does someone evaluating Manuel need to see first, second, third?

- **Pros**: Creates a professional narrative arc; solves the "any developer's portfolio" problem at the structural level; better information hierarchy
- **Cons**: Medium effort; touches most components; needs careful i18n sync; could disrupt the current visual harmony
- **Effort**: Medium

Key changes:
  - **New section order**: Hero → Key Projects (curated top 3) → Skills (with proficiency) → Experience (with impact) → Education → About/Philosophy → Contact CTA
  - **Hero redesign**: Lead with specialization ("Angular & .NET Architect" or "Frontend-First Full Stack") instead of generic title; add location + availability status
  - **Projects split**: "Selected Work" (top 3 with problem→solution narrative) + "More Projects" (archived)
  - **Skills with proficiency**: Visual skill bars or categorized levels (expert/proficient/familiar)
  - **Experience with impact**: Add highlights/bullet points with metrics per role
  - **New Education section**: 42 Madrid + other education
  - **New Contact section**: Dedicated CTA at the bottom with multiple channels
  - **Nav updates**: Add Skills, Projects links; reorder

### Approach 3: **Premium Redesign** — Full rethinking of presentation + content
Combine Approach 2's structural reorganization with a visual design upgrade that makes the portfolio feel truly premium and distinctive.

- **Pros**: Maximum "gancho"; creates a portfolio that stands out immediately; gives complete control over narrative and impression; could include micro-interactions
- **Cons**: Highest effort; more components rewritten; risk of over-engineering; needs significant content work too
- **Effort**: High

Key changes (everything in Approach 2, plus):
  - **Hero with authority signals**: Short tagline ("Building scalable frontends") + years of experience badge + current role + availability dot
  - **Project detail cards**: Each featured project gets a mini case study (problem, approach, result)
  - **Animated skill visualization**: Maybe a skill radar chart or interactive proficiency display
  - **Experience timeline redesign**: More visual, with role badges and impact callouts
  - **Micro-interactions**: Hover effects on cards, scroll-linked progress indicators
  - **Testimonials section**: Optional, social proof if available

---

## Recommendation

**Approach 2 (Structural Redesign)** — it's the sweet spot between effort and impact. Here's why:

1. **Approach 1 is too subtle**: The user asked for "gancho" — just changing data won't feel like enough. The structure and flow need to change.
2. **Approach 3 over-engineers**: This is a portfolio, not a product app. Premium micro-interactions and case studies add effort without proportional value at this stage.
3. **Approach 2 solves the core problem**: The portfolio's weakness isn't the visual design (which is already distinctive thanks to the WebGL background). The weakness is **information hierarchy** — the content doesn't tell Manuel's story in a way that differentiates him. Restructuring sections, adding impact metrics, curating projects, and creating a professional narrative arc will give it the "gancho" without over-complicating things.

The existing WebGL background and glass-card aesthetic are strong — keep them. Focus the effort on:
1. **Content restructuring** (portfolio.json + types)
2. **Hero differentiation** (specialization hook, not generic title)
3. **Project curation** (featured vs archive)
4. **Experience impact** (highlights with metrics)
5. **Skills proficiency** (visual grouping by level)
6. **New Education + Contact sections**
7. **Section reordering** for professional narrative

---

## Risks
- **Content gap**: The biggest risk is that the data restructuring requires Manuel to write compelling content (impact metrics, project narratives). If the content stays generic, no amount of structural change will create gancho.
- **i18n sync**: Both es/en pages must be updated in parallel. Experience descriptions, project narratives, and new section copy all need bilingual content.
- **Over-sectioning**: Adding Education + Contact could make the page feel long. Need to balance density with scroll fatigue.
- **Skill proficiency claims**: Adding "expert/proficient" labels to skills is a double-edged sword — overclaiming reduces credibility, underclaiming undersells.
- **Breaking existing SEO**: Rearranging sections and adding new ones changes heading hierarchy. Must maintain single `<h1>`, proper heading nesting, and keep JSON-LD aligned.

---

## Ready for Proposal
**Yes** — The exploration identified clear problems and a recommended approach. The next step is to propose the change with scoped intent and approach. The orchestrator should ask the user:
1. Can you provide impact metrics for each role? (e.g., "Reduced load time by 40%", "Served 500K+ users")
2. Which 3 projects best represent your specialization, and what's the problem→solution narrative for each?
3. What's your current availability status for the hero? (Open to work, contracting, etc.)
4. Do you have education history to include? (42 Madrid confirmed, others?)