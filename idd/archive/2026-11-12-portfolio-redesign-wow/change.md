# portfolio-redesign-wow

## Intent and acceptance

Rediseño del portfolio con efecto WoW siguiendo el criterio de diseño del plugin de Retama (taste-skill, humanizer y las skills de three.js/GSAP de retama-motion): nueva dirección de arte, escena 3D con Three.js, literales ES/EN reescritos hacia Software Engineer con desarrollo con IA, Ospec-Workflow como proyecto de IA y harness, y Retama como actividad paralela a Ibercaja

Acceptance: pnpm build genera / y /en con la página rediseñada: h1 con el nombre y el rol de Software Engineer, sección de Ospec-Workflow, experiencia con Ibercaja y Retama, proyectos con Ospec-Workflow, sobre mí y contacto; escena Three.js en el hero que respeta prefers-reduced-motion y deja la página legible sin WebGL ni JavaScript; textos ES y EN sin los patrones del humanizer; la suite de vitest pasa y el inspector de taste-skill da 0 FAIL a 1440, 768 y 390

## Plan

<!-- ospec:plan:start -->
- Files: `.gitignore`, `README.md`, `idd/config.yaml`, `package.json`, `src/components/AboutSection.astro`, `src/components/CommonScripts.astro`, `src/components/ContactSection.astro`, `src/components/ExperienceSection.astro`, `src/components/Footer.astro`, `src/components/HeroSection.astro`, `src/components/HomePage.astro`, `src/components/Navigation.astro`, `src/components/OspecSection.astro`, `src/components/ProjectsSection.astro`, `src/components/SkillsSection.astro`, `src/components/SocialLinks.astro`, `src/components/ThemeToggle.astro`, `src/components/WebGLBackground.astro`, `src/data/portfolio.json`, `src/layouts/Layout.astro`, `src/pages/en/index.astro`, `src/pages/index.astro`, `src/scene/snake.ts`, `src/scene/trail.ts`, `src/styles/global.css`, `src/types/portfolio.ts`, `src/utils/madridClock.ts`, `src/utils/ospecObligations.ts`, `src/utils/translations.ts`, `tests/e2e/animation-refactor.spec.ts`
- Work units: 5
<!-- ospec:plan:end -->

## Decisions

<!-- ospec:decisions:start -->
- Dirección de arte repartida por taste-skill (sector personal-portfolio): «name-as-monument», el nombre como titular a todo el ancho; se elige porque puede cargar la idea propia del sujeto (el alias Snakeblack) mejor que las otras dos repartidas
- La escena 3D usa Three.js (dependencia nueva, servida desde el propio sitio y cargada después del primer pintado) en lugar del WebGL crudo actual, porque la petición pide el criterio de retama-3d (skills de three.js)
- Los tests que afirman detalles del diseño anterior (clases, fuente Geist, botón show_all) se actualizan al nuevo diseño; los de comportamiento que se conserva (anclas, reduced motion, datos ES/EN, build de ambas rutas) se mantienen
- La serpiente se pinta como un trazo de pincel de tinta (sumi-e): geometría 3D sin luces, mancha plana con vetas de pincel seco, ojo y lengua carmesí. El usuario lo pidió durante la construcción, con una imagen de referencia, en lugar del render brillante y del dibujo de escamas a línea que vio antes
- El movimiento distintivo de la página es la serpiente y no el fundido lento que repartió la hoja de dirección: el hero no tiene fotografías que fundir. Es un cambio de la casilla de movimiento de la hoja
- La serpiente no pasa nunca por detrás del texto: en el hero deambula por la franja libre entre la navegación y el nombre, medida en el DOM, y al bajar se aparta a la derecha de la columna (en pantallas estrechas se desvanece)
- El estado inicial oculto de las entradas lo pone solo el script (GSAP), nunca el CSS: sin JavaScript o si el script falla, el contenido se ve entero
- Se retiran las habilidades blandas, los chips de color por tecnología, el selector de tema y el botón «Ver todos»; las dos páginas comparten HomePage.astro
- El botón de contacto va en la navegación y no sobre el nombre: encima del titular el inspector de taste-skill lo mide como una etiqueta suelta
<!-- ospec:decisions:end -->

## Evidence

<!-- ospec:evidence:start -->
- ev-1: check-run for checks-pass (2026-11-12T17:06:00.856Z)
- ev-2: check-run for checks-pass (2026-11-12T17:06:22.487Z)
- ev-3: living-doc-current for living-doc (2026-11-12T17:06:22.513Z)
<!-- ospec:evidence:end -->
