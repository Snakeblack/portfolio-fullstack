# perf-optimization

## Intent and acceptance

Optimizar el rendimiento de la web: menos JavaScript, menos trabajo por fotograma en la escena 3D, imágenes adaptadas al tamaño de pantalla, CSS y fuentes sin peticiones bloqueantes ni revalidaciones

Acceptance: Con el mismo contenido y las mismas entradas al hacer scroll, la home transfiere menos bytes y bloquea menos el hilo principal que la línea base medida (Lighthouse móvil: 80 puntos, TBT 860 ms, 347 KiB), las páginas de proyecto bajan su LCP de 1,6 s, y pnpm test:run pasa

## Plan

<!-- ospec:plan:start -->
- Files: `README.md`, `astro.config.mjs`, `package.json`, `src/__tests__/CommonScripts.test.ts`, `src/__tests__/Layout.test.ts`, `src/__tests__/WebGLBackground.test.ts`, `src/__tests__/astro6-build.test.ts`, `src/__tests__/global-css.test.ts`, `src/__tests__/portfolio-types.test.ts`, `src/__tests__/reveal.test.ts`, `src/components/CommonScripts.astro`, `src/components/OspecSection.astro`, `src/components/ProjectPage.astro`, `src/components/ProjectsSection.astro`, `src/layouts/Layout.astro`, `src/scene/snake.ts`, `src/styles/global.css`, `src/utils/images.ts`, `src/utils/reveal.ts`, `src/utils/translations.ts`
- Work units: 4
<!-- ospec:plan:end -->

## Decisions

<!-- ospec:decisions:start -->
- Las entradas al hacer scroll pasan de GSAP y ScrollTrigger a IntersectionObserver y transiciones CSS con las mismas distancias, duraciones y escalonado; el estado oculto solo se aplica bajo una clase que pone el propio script, así que sin script el contenido se sigue viendo. GSAP sale de las dependencias y del texto del pie.
- Three.js se queda. El bucle de la serpiente deja de recalcular senos, cosenos, perfil y UV en cada fotograma: van en tablas que solo cambian al redimensionar. La imagen que pinta es la misma.
- Las portadas pasan a src/assets y se sirven con astro:assets en AVIF y WebP a varios anchos, sin recortar; el JSON conserva el campo screenshot, que se resuelve por nombre de archivo.
- El CSS se incrusta en el HTML (inlineStylesheets: always) y las fuentes pasan por el build para salir con hash y caché inmutable.
- Los enlaces internos se precargan al pasar el cursor o tocarlos con el prefetch de Astro.
- Corrige la primera decisión: el estado oculto no va bajo una clase CSS, sino en estilos en línea que pone src/utils/reveal.ts; al entrar la pieza se quitan y la entrada es una animación de la Web Animations API que no deja nada al terminar, así que las transiciones propias de cada elemento (hover) no se pisan.
- De Tailwind solo se importa el reinicio de estilos (preflight) en la capa base: el diseño no usa clases de utilidad y el render queda idéntico.
- La portada de cada página de proyecto se pide con prioridad alta y sin carga diferida; el resto de imágenes siguen con carga diferida.
- El scroll de la escena se calcula con window.scrollY y medidas guardadas al redimensionar, sin medir el DOM en cada fotograma.
<!-- ospec:decisions:end -->

## Evidence

<!-- ospec:evidence:start -->
- ev-1: check-run for checks-pass (2026-11-12T22:05:18.460Z)
- ev-2: check-run for checks-pass (2026-11-12T22:26:02.226Z)
- ev-3: check-run for checks-pass (2026-11-12T22:28:32.217Z)
- ev-4: living-doc-current for living-doc (2026-11-12T22:28:32.345Z)
<!-- ospec:evidence:end -->
