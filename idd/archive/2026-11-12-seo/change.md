# seo

## Intent and acceptance

Mejora el SEO y la vista previa al compartir del portfolio

Acceptance: Ambos idiomas exponen una imagen de compartir 1200x630 en PNG con og:image:type, og:image:alt y twitter:image:alt, twitter:card summary_large_image, og:locale:alternate, apple-touch-icon y meta description dentro del límite acordado; hreflang coherente entre head y sitemap; tests de build lo comprueban y pnpm test:run, astro check y build pasan

## Plan

<!-- ospec:plan:start -->
- Files: `astro.config.mjs`, `public/apple-touch-icon.png`, `public/og-image.png`, `src/__tests__/astro6-build.test.ts`, `src/components/HeroSection.astro`, `src/layouts/Layout.astro`, `src/pages/404.astro`, `src/utils/translations.ts`
<!-- ospec:plan:end -->

## Decisions

<!-- ospec:decisions:start -->
- hreflang en es/en en head y sitemap, alineando el sitemap con lo que ya prueba astro6-build.test.ts
- La 404 es una sola página bilingüe (es y en) porque los hostings estáticos sirven un único 404.html; noindex, sin canonical, hreflang ni JSON-LD
- og-image.png (1200x630) se renderiza con Chromium y las fuentes del sitio: solo nombre, rol y dominio sobre #0a0a0a; el JSON-LD de Person sigue usando la foto profile.webp
- apple-touch-icon.png sale del favicon.svg rasterizado a 180x180 sobre fondo #0a0a0a
<!-- ospec:decisions:end -->

## Evidence

<!-- ospec:evidence:start -->
- ev-1: check-run for checks-pass (2026-11-12T18:22:38.295Z)
- ev-2: check-run for checks-pass (2026-11-12T18:22:50.470Z)
- ev-3: living-doc-current for living-doc (2026-11-12T18:22:50.543Z)
<!-- ospec:evidence:end -->
