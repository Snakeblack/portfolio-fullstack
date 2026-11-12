# deps-update

## Intent and acceptance

Actualiza las dependencias a su última versión compatible

Acceptance: pnpm outdated no lista nada salvo lo que no sea compatible y quede justificado; pnpm test:run, astro check y astro build pasan sin cambios de comportamiento

## Plan

<!-- ospec:plan:start -->
- Files: `package.json`, `playwright.config.ts`, `pnpm-lock.yaml`
<!-- ospec:plan:end -->

## Decisions

<!-- ospec:decisions:start -->
- TypeScript se queda en 6.x: astro check no admite TypeScript 7 y su sustituto (ts-content-mapper) exige 7.1+ y es experimental
- El webServer de Playwright usa --ignore-lock porque Astro 7 pasa astro dev a segundo plano al detectar un agente y Playwright lo da por caído
<!-- ospec:decisions:end -->

## Evidence

<!-- ospec:evidence:start -->
- ev-1: check-run for checks-pass (2026-11-12T17:45:02.252Z)
- ev-2: check-run for checks-pass (2026-11-12T17:46:41.761Z)
- ev-3: living-doc-current for living-doc (2026-11-12T17:46:41.835Z)
<!-- ospec:evidence:end -->
