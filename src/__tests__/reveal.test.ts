import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initReveal } from '../utils/reveal';

// Dobles mínimos del DOM: lo justo que usa initReveal.
class FakeNode {
  style: Record<string, string> = {};
  animations: { frames: Keyframe[]; options: KeyframeAnimationOptions }[] = [];
  spans: FakeNode[] = [];
  images: FakeNode[] = [];
  inside: FakeNode[] = [];

  animate(frames: Keyframe[], options: KeyframeAnimationOptions) {
    this.animations.push({ frames, options });
  }

  querySelectorAll(selector: string) {
    return selector === 'img' ? this.images : this.spans;
  }

  contains(node: FakeNode) {
    return node === this || this.inside.includes(node);
  }
}

class FakeObserver {
  static all: FakeObserver[] = [];
  observed: FakeNode[] = [];

  constructor(
    public callback: (entries: unknown[]) => void,
    public options: IntersectionObserverInit,
  ) {
    FakeObserver.all.push(this);
  }

  observe(node: FakeNode) {
    this.observed.push(node);
  }

  unobserve(node: FakeNode) {
    this.observed = this.observed.filter((other) => other !== node);
  }

  enter(...nodes: FakeNode[]) {
    this.callback(nodes.map((target) => ({ target, isIntersecting: true, boundingClientRect: { bottom: 400 } })));
  }

  leave(node: FakeNode, bottom: number) {
    this.callback([{ target: node, isIntersecting: false, boundingClientRect: { bottom } }]);
  }
}

function page() {
  const rises = [new FakeNode(), new FakeNode(), new FakeNode()];
  const line = new FakeNode();
  line.spans = [new FakeNode()];
  const shutter = new FakeNode();
  shutter.images = [new FakeNode()];
  const bySelector: Record<string, FakeNode[]> = {
    '[data-reveal=""]': rises,
    '[data-reveal="line"]': [line],
    '[data-reveal="shutter"]': [shutter],
  };
  const root = { querySelectorAll: (selector: string) => bySelector[selector] ?? [] } as unknown as ParentNode;
  return { root, rises, line, shutter };
}

const observerOf = (node: FakeNode) => FakeObserver.all.find((observer) => observer.observed.includes(node)) as FakeObserver;

describe('initReveal', () => {
  beforeEach(() => {
    FakeObserver.all = [];
    vi.stubGlobal('IntersectionObserver', FakeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('hides each kind of piece from the script, in its own way', () => {
    const { root, rises, line, shutter } = page();
    initReveal(root);

    expect(rises[0].style).toEqual({ opacity: '0', transform: 'translateY(24px)' });
    // La máscara del titular no se toca: lo que baja es la palabra de dentro.
    expect(line.style).toEqual({});
    expect(line.spans[0].style).toEqual({ transform: 'translateY(112%)' });
    expect(shutter.style).toEqual({ clipPath: 'inset(0% 0% 100% 0%)' });
    expect(shutter.images[0].style).toEqual({ transform: 'scale(1.1)' });
  });

  it('watches each kind with its own margin', () => {
    const { root, rises, line, shutter } = page();
    initReveal(root);

    expect(observerOf(rises[0]).options.rootMargin).toBe('0px 0px -12% 0px');
    expect(observerOf(line).options.rootMargin).toBe('0px 0px -6% 0px');
    expect(observerOf(shutter).options.rootMargin).toBe('0px 0px -10% 0px');
  });

  it('pieces that enter together come in one after another, and are not watched again', () => {
    const { root, rises } = page();
    initReveal(root);
    const observer = observerOf(rises[0]);

    observer.enter(rises[0], rises[1], rises[2]);

    expect(rises.map((piece) => piece.animations[0].options.delay)).toEqual([0, 70, 140]);
    for (const piece of rises) {
      expect(piece.style).toEqual({ opacity: '', transform: '' });
      expect(piece.animations[0].options).toMatchObject({ duration: 800, fill: 'backwards' });
      expect(piece.animations[0].frames).toEqual([
        { opacity: '0', transform: 'translateY(24px)' },
        { opacity: '1', transform: 'none' },
      ]);
    }
    expect(observer.observed).toEqual([]);

    // Un segundo aviso de la misma pieza no la vuelve a animar.
    observer.enter(rises[0]);
    expect(rises[0].animations).toHaveLength(1);
  });

  it('a shutter opens the frame and settles the image inside', () => {
    const { root, shutter } = page();
    initReveal(root);

    observerOf(shutter).enter(shutter);

    expect(shutter.animations[0].options).toMatchObject({ duration: 1100, delay: 0 });
    expect(shutter.images[0].animations[0].options).toMatchObject({ duration: 1500, delay: 0 });
    expect(shutter.images[0].style).toEqual({ transform: '' });
  });

  it('what is already above the view is shown without animation; what is below stays hidden', () => {
    const { root, rises } = page();
    initReveal(root);
    const observer = observerOf(rises[0]);

    observer.leave(rises[0], -20);
    observer.leave(rises[1], 1800);

    expect(rises[0].style).toEqual({ opacity: '', transform: '' });
    expect(rises[0].animations).toEqual([]);
    expect(rises[1].style).toEqual({ opacity: '0', transform: 'translateY(24px)' });
    expect(observer.observed).toEqual([rises[1], rises[2]]);
  });

  it('showWithin brings in at once, with a short entrance, only what the target holds and is still hidden', () => {
    const { root, rises, line } = page();
    const reveal = initReveal(root);
    const section = new FakeNode();
    section.inside = [rises[0], rises[1], line];
    observerOf(rises[0]).enter(rises[0]);

    reveal.showWithin(section as unknown as ParentNode);

    expect(rises[0].animations).toHaveLength(1);
    expect(rises[1].animations[0].options).toMatchObject({ duration: 350, delay: 0, easing: 'ease-out' });
    expect(line.spans[0].animations[0].options).toMatchObject({ duration: 350, delay: 0 });
    expect(rises[2].style).toEqual({ opacity: '0', transform: 'translateY(24px)' });
  });

  it('destroy leaves everything visible and stops watching', () => {
    const { root, rises, line, shutter } = page();
    const reveal = initReveal(root);

    reveal.destroy();

    for (const node of [...rises, line.spans[0], shutter, shutter.images[0]]) {
      expect(Object.values(node.style).every((value) => value === '')).toBe(true);
      expect(node.animations).toEqual([]);
    }
    expect(FakeObserver.all.flatMap((observer) => observer.observed)).toEqual([]);
  });

  it('with reduced motion nothing is hidden and nothing is watched', () => {
    const { root, rises, line, shutter } = page();
    const reveal = initReveal(root, true);
    reveal.showWithin(root);
    reveal.destroy();

    expect(FakeObserver.all).toEqual([]);
    for (const node of [...rises, line.spans[0], shutter, shutter.images[0]]) {
      expect(node.style).toEqual({});
      expect(node.animations).toEqual([]);
    }
  });
});
