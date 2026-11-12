# project-pages

## Intent and acceptance

Renueva los proyectos y da a cada uno su propia página de detalle

Acceptance: La cuadrícula muestra Ospec-Workflow, Noema, Área de clientes de Retama, Finanzas Snake, el plugin de OpenCode, el overlay de chat de Twitch en Rust, WebGL Backgrounds, Blog y un grupo Landings para clientes; cada tarjeta lleva a su página en es y en con descripción concisa, y los proyectos complejos explican cómo funcionan; desaparecen Barreto, DevTools, Reactive Forms y Device Manager; tests, astro check, build y e2e pasan

## Plan

<!-- ospec:plan:start -->
- Files: `astro.config.mjs`, `src/__tests__/astro6-build.test.ts`, `src/components/Footer.astro`, `src/components/Navigation.astro`, `src/components/ProjectPage.astro`, `src/components/ProjectsSection.astro`, `src/data/portfolio.json`, `src/layouts/Layout.astro`, `src/pages/404.astro`, `src/pages/en/projects/[slug].astro`, `src/pages/proyectos/[slug].astro`, `src/styles/global.css`, `src/types/portfolio.ts`, `src/utils/projects.ts`, `src/utils/translations.ts`
- Work units: 3
<!-- ospec:plan:end -->

## Decisions

<!-- ospec:decisions:start -->
- Cada tarjeta toma la altura de su aspect-ratio en vez de una altura fija con object-fit cover, para que ninguna portada se recorte; la variedad del muro sale de las proporciones de las portadas
- En el teléfono la cuadrícula pasa a una tarjeta por fila a todo el ancho, porque los repartos 62/38 recortaban las imágenes
- Portadas diseñadas para los nueve proyectos, renderizadas con Chromium y las fuentes del sitio; las capturas que quedan sin uso se borran
- El sitemap enlaza a mano /proyectos/<slug>/ con /en/projects/<slug>/ con serialize, porque el i18n del plugin solo empareja rutas con el mismo camino
- Los textos de los proyectos no afirman lo que el código no respalda: ni E2EE en Noema, ni zero-knowledge en Finanzas, ni open source en los repos con Commons Clause
<!-- ospec:decisions:end -->

## Evidence

<!-- ospec:evidence:start -->
- ev-1: check-run for checks-pass (2026-11-12T19:02:57.988Z)
- ev-2: living-doc-current for living-doc (2026-11-12T19:03:13.823Z)
<!-- ospec:evidence:end -->
