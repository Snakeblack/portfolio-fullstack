/**
 * Entradas al hacer scroll, sin librería: un IntersectionObserver por tipo de pieza y la
 * Web Animations API. El estado oculto lo pone este script en línea, nunca el CSS: si no
 * llega a ejecutarse, el contenido se ve.
 */

type Hidden = Record<string, string>;

interface Part {
  /** Los nodos que se mueven: la propia pieza o algo de dentro. */
  of: (piece: HTMLElement) => HTMLElement[];
  /** Estado de partida; el de llegada es el que ya tiene el nodo en el CSS. */
  from: Hidden;
  to: Hidden;
  duration: number;
  easing: string;
}

interface Kind {
  selector: string;
  /** Margen del observador: cuánto tiene que haber subido la pieza para entrar. */
  margin: string;
  /** Retraso entre piezas que entran a la vez, en milisegundos. */
  stagger: number;
  parts: Part[];
}

const itself = (piece: HTMLElement) => [piece];

// Cada tipo de pieza entra a su manera: el texto sube, los titulares de cartel salen de una
// máscara y las imágenes se abren como un obturador.
export const REVEAL_KINDS: Kind[] = [
  {
    selector: '[data-reveal=""]',
    margin: '0px 0px -12% 0px',
    stagger: 70,
    parts: [
      {
        of: itself,
        from: { opacity: '0', transform: 'translateY(24px)' },
        to: { opacity: '1', transform: 'none' },
        duration: 800,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    ],
  },
  {
    // El disparador es la máscara, que no se mueve; lo que sube son las palabras de dentro.
    selector: '[data-reveal="line"]',
    margin: '0px 0px -6% 0px',
    stagger: 90,
    parts: [
      {
        of: (piece) => Array.from(piece.querySelectorAll<HTMLElement>(':scope > span')),
        from: { transform: 'translateY(112%)' },
        to: { transform: 'none' },
        duration: 1000,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    ],
  },
  {
    selector: '[data-reveal="shutter"]',
    margin: '0px 0px -10% 0px',
    stagger: 80,
    parts: [
      {
        of: itself,
        from: { clipPath: 'inset(0% 0% 100% 0%)' },
        to: { clipPath: 'inset(0% 0% 0% 0%)' },
        duration: 1100,
        easing: 'cubic-bezier(0.76, 0, 0.24, 1)',
      },
      {
        of: (piece) => Array.from(piece.querySelectorAll<HTMLElement>('img')),
        from: { transform: 'scale(1.1)' },
        to: { transform: 'none' },
        duration: 1500,
        easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
      },
    ],
  },
];

/** Entrada corta para lo que hay en una sección a la que se salta por un ancla. */
const JUMP = { duration: 350, easing: 'ease-out' };

export interface Reveal {
  /** Muestra ya, sin esperar al scroll, lo que quede oculto dentro de `target`. */
  showWithin(target: ParentNode): void;
  /** Deja todo a la vista y deja de observar. */
  destroy(): void;
}

export function initReveal(root: ParentNode = document, reducedMotion = false): Reveal {
  // Con movimiento reducido el estado final ya es el que hay en el HTML: nada que ocultar.
  if (reducedMotion) {
    return { showWithin() {}, destroy() {} };
  }

  const pending = new Map<HTMLElement, { kind: Kind; observer: IntersectionObserver }>();

  /** `delay` en milisegundos; con `null` la pieza queda en su estado final sin animarse. */
  const show = (piece: HTMLElement, delay: number | null, timing?: { duration: number; easing: string }) => {
    const entry = pending.get(piece);
    if (!entry) return;
    pending.delete(piece);
    entry.observer.unobserve(piece);

    for (const part of entry.kind.parts) {
      for (const node of part.of(piece)) {
        for (const property of Object.keys(part.from)) (node.style as unknown as Hidden)[property] = '';
        if (delay === null) continue;
        node.animate([part.from, part.to], {
          duration: timing?.duration ?? part.duration,
          easing: timing?.easing ?? part.easing,
          delay,
          fill: 'backwards',
        });
      }
    }
  };

  for (const kind of REVEAL_KINDS) {
    const observer = new IntersectionObserver(
      (entries) => {
        let index = 0;
        for (const entry of entries) {
          const piece = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            show(piece, index++ * kind.stagger);
          } else if (entry.boundingClientRect.bottom < 0) {
            // Lo que ya quedó por encima de la vista no se anima: se deja visto.
            show(piece, null);
          }
        }
      },
      { rootMargin: kind.margin },
    );

    root.querySelectorAll<HTMLElement>(kind.selector).forEach((piece) => {
      for (const part of kind.parts) {
        for (const node of part.of(piece)) Object.assign(node.style, part.from);
      }
      pending.set(piece, { kind, observer });
      observer.observe(piece);
    });
  }

  return {
    showWithin(target) {
      for (const piece of Array.from(pending.keys())) {
        if (target.contains(piece)) show(piece, 0, JUMP);
      }
    },
    destroy() {
      for (const piece of Array.from(pending.keys())) show(piece, null);
    },
  };
}
