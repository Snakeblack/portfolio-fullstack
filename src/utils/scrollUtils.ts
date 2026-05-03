type AnchorRoot = Pick<Document, 'querySelectorAll' | 'querySelector'>;

type CleanupFn = () => void;

function dispatchAnchorNavigation(target: Element) {
  if (typeof document === 'undefined') {
    return;
  }

  document.dispatchEvent(
    new CustomEvent('smooth-anchor:navigate', {
      detail: { targetId: target.id || null, target },
    }),
  );
}

export function initSmoothAnchors(root: AnchorRoot = document): CleanupFn {
  const cleanups: CleanupFn[] = [];
  const anchors = root.querySelectorAll('a[href^="#"]');

  anchors.forEach((anchor) => {
    const clickHandler = (event: Event) => {
      event.preventDefault();

      const href = anchor.getAttribute('href');
      if (!href) {
        return;
      }

      const target = root.querySelector(href);
      if (!target || typeof (target as Element).scrollIntoView !== 'function') {
        return;
      }

      (target as Element).scrollIntoView({ behavior: 'smooth', block: 'start' });

      dispatchAnchorNavigation(target as Element);
    };

    anchor.addEventListener('click', clickHandler);

    cleanups.push(() => {
      if ('removeEventListener' in anchor) {
        anchor.removeEventListener('click', clickHandler);
      }
    });
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}
