# Portfolio-Fullstack: Análisis y Decisiones de Refactorización

**Fecha:** 2026-05-03  
**Estado:** En progreso  
**Versión base:** Astro 5.16.2 → migración a Astro 6 planificada

---

## 1. Estado de Dependencias

### Dependencias Actualizadas (seguras)

| Paquete | Antes | Después | Tipo |
|---------|-------|---------|------|
| `@astrojs/sitemap` | 3.6.0 | 3.7.2 | minor |
| `@tailwindcss/vite` | 4.1.17 | 4.2.4 | minor |
| `gsap` | 3.13.0 | 3.15.0 | minor |
| `tailwindcss` | 4.1.17 | 4.2.4 | minor |

**Build post-actualización:** ✅ Compila sin errores.

### Migración Astro 6 (pendiente)

| Paquete | Actual | Disponible | Tipo |
|---------|--------|------------|------|
| `astro` | 5.16.2 | 6.2.1 | **major** |

**Impacto en este proyecto:**

- ✅ Node 22+ requerido → tenemos Node 24
- ⚠️ **i18n `redirectToDefaultLocale`**: En Astro 5 el default era `true` (redirigía `/` al locale default). En Astro 6 cambia a `false`. Nuestra config usa `prefixDefaultLocale: false` sin declarar `redirectToDefaultLocale`, así que hay que agregar `redirectToDefaultLocale: true` para mantener el comportamiento actual.
- ✅ No usamos content collections legacy, `Astro.glob()`, `ViewTransitions`, SSR, Actions, Sessions, ni Zod schemas
- ✅ No usamos `getStaticPaths()` ni plugins de Vite custom
- ✅ `<script>` y `<style>` ordering: solo `global.css` importa, y el orden actual es correcto

**Riesgo:** MEDIO-BAJO. Sitio estático simple, cambio único en config de i18n.

**Decisión:** Migrar a Astro 6 en esta sesión, agregando `redirectToDefaultLocale: true`.

---

## 2. Hallazgos Críticos

### C1 — Triple sistema de animación redundante 🔴

**Archivo:** `CommonScripts.astro` (891 líneas)  
**Problema:** GSAP ScrollTrigger, IntersectionObserver, `setInterval` polling, y tracking manual de scroll velocity todos ejecutan animaciones simultáneamente sobre los mismos elementos. Causa parpadeos, doble animación, y elementos atascados en `opacity: 0`.

**Decisión:** Mantener SOLO GSAP ScrollTrigger. Eliminar IntersectionObserver, setInterval, y las 5 funciones de fallback (`checkVisibleElements`, `forceShowVisibleElements`, `forceShowBottomElements`, `forceShowAllRemainingElements`, `cleanupIncompleteAnimations`, `forceShowSkillsSection`).

**Estado:** Pendiente — refactorizar CommonScripts es una tarea mayor que requiere una sesión dedicada.

### C2 — Archivos backup/clean en producción 🔴

**Archivos:** `CommonScripts_backup.astro` (958 líneas), `CommonScripts_clean.astro` (891 líneas), `MobileFallback.astro` (49 líneas, nunca importado)

**Decisión:** Eliminar los tres archivos.

### C3 — ScrollReveal.astro conflictivo 🔴

**Archivo:** `ScrollReveal.astro` (29 líneas)  
**Problema:** Su IntersectionObserver agrega `.is-visible`, pero CommonScripts usa GSAP directamente. Los dos sistemas compiten.

**Decisión:** Eliminar `ScrollReveal.astro` y su import en `Layout.astro`.

### C4 — Tipos desincronizados con datos 🟠

**Archivo:** `portfolio.ts` vs `portfolio.json`  
**Problema:** `PortfolioData.social` tipado como `SocialProfile[]` pero JSON es `{linkedin, github, twitter}`. `ProjectEntry.description` tipado como `string` pero es `{es, en}`. Faltan campos `technologies`, `year`, `screenshot`.

**Decisión:** Reescribir `portfolio.ts` para coincidir con la estructura real del JSON.

### C5 — Race condition en inicialización de tema 🟠

**Archivos:** `Layout.astro`, `ThemeToggle.astro`, `CommonScripts.astro`  
**Problema:** Tres scripts distintos inicializan el tema: (1) inline en Layout, (2) inline en ThemeToggle, (3) DOMContentLoaded en CommonScripts.

**Decisión:** Mantener SOLO el inline script de Layout (el más temprano, evita FOUC). Eliminar la inicialización de CommonScripts y ThemeToggle, dejando ThemeToggle solo como toggle.

### C6 — Detección móvil por user-agent 🟠

**Archivo:** `CommonScripts.astro` línea 24  
**Problema:** `isMobile = /Android|webOS|.../i.test(navigator.userAgent)` es frágil y no se recalcula en resize.

**Decisión:** Reemplazar con `window.matchMedia('(max-width: 768px)')` que es declarativo y reactiva. Pendiente de refactor de CommonScripts.

---

## 3. Hallazgos de Severidad Alta

| ID | Problema | Decisión |
|----|----------|----------|
| H1 | `window.pageYOffset` deprecado (4 usos) | Reemplazar con `window.scrollY` |
| H2 | `* { transition }` global afecta animaciones GSAP | Eliminar wildcard, aplicar `transition-colors` solo donde se necesita |
| H3 | Font-family `'Inter'` pero se carga Geist | Cambiar a `font-family: 'Geist Variable', sans-serif` usando la variable de Tailwind |
| H4 | WebGL recompila shaders en cada cambio de tema | Mantener programa, actualizar solo un uniform `u_theme` |
| H5 | WebGL no pausa en tab oculto | Agregar `visibilitychange` listener |
| H6 | "Abrir el menú" hardcodeado en español | Usar traducciones |
| H7 | `techColorMap` y `hexToRgba` duplicados | Extraer a `src/utils/techColors.ts` |
| H8 | `setInterval` polling sin cleanup | Eliminar (parte del refactor C1) |
| H9 | `.is-visible` CSS conflictua con GSAP | Eliminar reglas `.is-visible` de global.css |

---

## 4. Hallazgos de Severidad Media

| ID | Problema | Decisión |
|----|----------|----------|
| M1 | `define:vars` serializa datos completos al HTML | Minimizar datos pasados, usar `data-*` attributes |
| M2 | `resize` listener sin cleanup | Aceptar (Astro SSG = no unmount), agregar comentario |
| M3 | `history.pushState` sin `popstate` | Decisión pendiente: evaluar si simplificar a toggle de clase sin cambio de URL |
| M4 | Animación de proyectos con rotateX/Y + blur | Simplificar a opacity + translateY |
| M5 | `max-height: 20rem` hardcoded en experience | Evaluar `grid-template-rows` animation |
| M6 | Props redundantes en Footer | Simplificar, calcular dentro del componente |
| M7 | Teléfono fake en portfolio.json | Eliminar campo `phone` |
| M8 | `<img>` sin width/height → CLS | Agregar dimensiones o `aspect-ratio` |
| M9 | `_animationFrameId` como propiedad custom en DOM | Mover a variable module-scoped |
| M10 | WebGL sin fallback CSS | Agregar gradiente de fallback en `<noscript>` y para when WebGL fails |
| M11 | `will-change` seteado vía JS en todos los elementos | Eliminar, dejar que GSAP lo maneje |
| M12 | Magic numbers en scroll thresholds | Extraer a constantes nombradas |
| M13 | Traducciones hardcodeadas en componentes | Mover al sistema de traducciones |

---

## 5. Hallazgos de Accesibilidad

| ID | Severidad | Problema | Decisión |
|----|-----------|----------|----------|
| A1 | ALTA | "Abrir el menú" en español fijo | Usar `t.nav.menuOpen` |
| A2 | ALTA | Efecto de typing no anunciado por screen reader | Agregar `aria-live="polite"` o `aria-label` completo |
| A3 | ALTA | Contenido invisible si JS falla (opacity:0) | Agregar `@media (scripting: none)` fallback |
| A4 | MEDIA | Experience items sin navegación por teclado con flechas | Evaluar implementar |
| A5 | MEDIA | "View all" es `<a>` con `role="button"` | Cambiar semanticamente |
| A6 | MEDIA | Canvas sin aria-hidden | Agregar `aria-hidden="true"` y `role="presentation"` |

---

## 6. Plan de Ejecución (Orden de Prioridad)

### Fase 1 — Limpieza inmediata (bajo riesgo)
- [x] Actualizar deps seguras (sitemap, tailwind, gsap)
- [ ] Eliminar `CommonScripts_backup.astro`, `CommonScripts_clean.astro`, `MobileFallback.astro`
- [ ] Eliminar `ScrollReveal.astro` y su import en Layout
- [ ] Eliminar reglas `.is-visible` y `.stagger-children` conflictivas de `global.css`

### Fase 2 — Migración Astro 6
- [ ] Actualizar `astro` a ^6.0.0
- [ ] Agregar `redirectToDefaultLocale: true` en config i18n
- [ ] Verificar build

### Fase 3 — Correcciones de tipos y datos
- [ ] Reescribir `portfolio.ts` para coincidir con `portfolio.json`
- [ ] Eliminar campo `phone` fake de `portfolio.json`

### Fase 4 — Extracción de módulos compartidos
- [ ] Crear `src/utils/techColors.ts` con `techColorMap` y `hexToRgba`
- [ ] Actualizar `ProjectsSection.astro` y `SkillsSection.astro` para importar

### Fase 5 — Correcciones CSS
- [ ] Eliminar `* { transition }` global
- [ ] Cambiar `font-family: 'Inter'` a `'Geist Variable'`
- [ ] Eliminar reglas de `.is-visible` y `.stagger-children.is-visible`

### Fase 6 — Refactor de CommonScripts (sesión dedicada)
- [ ] Eliminar sistemas redundantes (IntersectionObserver, setInterval, funciones de fallback)
- [ ] Consolidar tema: solo Layout inline script
- [ ] Reemplazar UA sniffing con `matchMedia`
- [ ] Reemplazar `pageYOffset` con `scrollY`
- [ ] Extraer constantes magic numbers

### Fase 7 — Mejoras de accesibilidad y WebGL
- [ ] Agregar `aria-hidden="true"` al canvas WebGL
- [ ] Agregar fallback CSS para WebGL fallido
- [ ] Agregar `@media (scripting: none)` para contenido invisible
- [ ] Localizar "Abrir el menú"

---

## 7. Decisiones Diferidas

| Decisión | Contexto | Razón de diferir |
|----------|----------|------------------|
| Refactor completo de CommonScripts | Requiere diseño cuidadoso del nuevo módulo de animación | Complejidad alta, merece sesión dedicada |
| Optimización WebGL (uniform vs recompilar) | Requiere reescribir shaders | Impacto visual, requiere testing |
| Simplificación de animaciones de ProjectsSection | Cambio visual significativo | Requiere aprobación de diseño |
| Implementación de arrow keys en ExperienceSection | Feature nueva | No es bug, es mejora de UX |
| Migración a Content Collections | Astro feature recomendada | No es prioritaria para sitio estático simple |

---

## 8. Notas de GSAP 3.15

GSAP 3.15 (de 3.13) no introduce breaking changes para el uso que hace este proyecto (ScrollTrigger básico, gsap.to/from/set). No se requiere refactor.