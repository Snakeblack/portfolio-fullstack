# snake-scroll-motion

## Intent and acceptance

Al bajar del hero a la introducción la serpiente ya no se traslada en bloque pegada al scroll: se mueve la zona por la que deambula y la serpiente nada hasta ella, con el cuerpo siguiendo su rastro

Acceptance: En escritorio, al hacer scroll hasta la introducción ninguna parte de la escena se desliza de lado: la cabeza gira y nada hacia la derecha, el cuerpo la sigue por su rastro y deja libre la columna de texto en unos dos segundos; en móvil sigue desvaneciéndose y con movimiento reducido sigue quieta

## Plan

<!-- ospec:plan:start -->
- Files: `src/__tests__/WebGLBackground.test.ts`, `src/__tests__/trail.test.ts`, `src/scene/snake.ts`, `src/scene/trail.ts`
<!-- ospec:plan:end -->

## Decisions

<!-- ospec:decisions:start -->
- El grupo que desplazaba la serpiente entera con el scroll desaparece. Con el scroll se mueve el centro de la zona por la que deambula (src/scene/trail.ts, wanderZone) y la cabeza nada hasta allí.
- Mientras parte del cuerpo queda a la izquierda de su zona, la simulación avanza más deprisa (hasta 5 veces) y vuelve a su ritmo según el cuerpo entra: a la velocidad de paseo el cuerpo, que mide 19 unidades, tardaría unos 10 segundos en salir de detrás del texto. No se acelera mientras persigue al cursor.
<!-- ospec:decisions:end -->

## Evidence

<!-- ospec:evidence:start -->
- ev-1: repro-run-pair for repro-test (2026-11-12T22:38:34.923Z)
- ev-2: check-run for checks-pass (2026-11-12T22:41:00.837Z)
- ev-3: living-doc-current for living-doc (2026-11-12T22:41:00.923Z)
<!-- ospec:evidence:end -->
