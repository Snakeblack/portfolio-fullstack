import { describe, expect, it, vi } from 'vitest';

import { initSmoothAnchors } from '../utils/scrollUtils';

type AnchorStub = {
  getAttribute: (name: string) => string | null;
  addEventListener: (type: string, handler: (event: Event) => void) => void;
  removeEventListener: (type: string, handler: (event: Event) => void) => void;
  triggerClick: (event?: Event) => void;
};

function createAnchor(href: string): AnchorStub {
  let clickHandler: ((event: Event) => void) | undefined;

  return {
    getAttribute: (name: string) => (name === 'href' ? href : null),
    addEventListener: (type: string, handler: (event: Event) => void) => {
      if (type === 'click') {
        clickHandler = handler;
      }
    },
    removeEventListener: (type: string, handler: (event: Event) => void) => {
      if (type === 'click' && clickHandler === handler) {
        clickHandler = undefined;
      }
    },
    triggerClick: (event = { preventDefault: vi.fn() } as unknown as Event) => {
      clickHandler?.(event);
    },
  };
}

describe('scrollUtils', () => {
  it('exports initSmoothAnchors', () => {
    expect(initSmoothAnchors).toBeTypeOf('function');
  });

  it('registers click handlers for hash anchors', () => {
    const anchors = [createAnchor('#about'), createAnchor('#projects')];
    const root = {
      querySelectorAll: vi.fn(() => anchors),
      querySelector: vi.fn(),
    };

    initSmoothAnchors(root as never);

    expect(root.querySelectorAll).toHaveBeenCalledWith('a[href^="#"]');
  });

  it('calls scrollIntoView on the matching target with smooth behavior', () => {
    const anchor = createAnchor('#about');
    const scrollIntoView = vi.fn();
    const event = { preventDefault: vi.fn() } as unknown as Event;

    const originalDocument = globalThis.document;
    try {
      Object.defineProperty(globalThis, 'document', {
        value: {
          dispatchEvent: vi.fn(),
        },
        configurable: true,
      });

      const root = {
        querySelectorAll: vi.fn(() => [anchor]),
        querySelector: vi.fn((selector: string) => {
          if (selector === '#about') {
            return {
              id: 'about',
              scrollIntoView,
            };
          }

          return null;
        }),
      };

      initSmoothAnchors(root as never);
      anchor.triggerClick(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(root.querySelector).toHaveBeenCalledWith('#about');
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    } finally {
      Object.defineProperty(globalThis, 'document', {
        value: originalDocument,
        configurable: true,
      });
    }
  });

  it('dispatches smooth-anchor:navigate after scrolling', () => {
    const anchor = createAnchor('#about');
    const dispatchEvent = vi.fn();
    const event = { preventDefault: vi.fn() } as unknown as Event;
    const target = {
      id: 'about',
      scrollIntoView: vi.fn(),
    };

    const originalDocument = globalThis.document;
    try {
      Object.defineProperty(globalThis, 'document', {
        value: { dispatchEvent },
        configurable: true,
      });

      const root = {
        querySelectorAll: vi.fn(() => [anchor]),
        querySelector: vi.fn(() => target),
      };

      initSmoothAnchors(root as never);
      anchor.triggerClick(event);

      expect(dispatchEvent).toHaveBeenCalledTimes(1);
      const dispatched = dispatchEvent.mock.calls[0][0] as CustomEvent;
      expect(dispatched.type).toBe('smooth-anchor:navigate');
      expect(dispatched.detail).toMatchObject({ targetId: 'about', target });
    } finally {
      Object.defineProperty(globalThis, 'document', {
        value: originalDocument,
        configurable: true,
      });
    }
  });

  it('does nothing when the target does not exist', () => {
    const anchor = createAnchor('#missing');
    const event = { preventDefault: vi.fn() } as unknown as Event;
    const root = {
      querySelectorAll: vi.fn(() => [anchor]),
      querySelector: vi.fn(() => null),
    };

    initSmoothAnchors(root as never);

    expect(() => anchor.triggerClick(event)).not.toThrow();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('returns a cleanup function', () => {
    const anchor = createAnchor('#about');
    const root = {
      querySelectorAll: vi.fn(() => [anchor]),
      querySelector: vi.fn(),
    };

    const cleanup = initSmoothAnchors(root as never);

    expect(cleanup).toBeTypeOf('function');

    cleanup();
    expect(() => anchor.triggerClick({ preventDefault: vi.fn() } as unknown as Event)).not.toThrow();
  });

  it('ignores anchors without hash hrefs because selector scope is hash-only', () => {
    const root = {
      querySelectorAll: vi.fn(() => []),
      querySelector: vi.fn(),
    };

    initSmoothAnchors(root as never);

    expect(root.querySelectorAll).toHaveBeenCalledWith('a[href^="#"]');
    expect(root.querySelector).not.toHaveBeenCalled();
  });
});
