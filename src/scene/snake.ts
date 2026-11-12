import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  Group,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import { bodyRadius, resampleTrail, steerAngle } from './trail';

/** Alto visible del mundo en z = 0, en unidades de escena. */
const VIEW_HEIGHT = 10;
const FOV = 30;
const RINGS = 260;
const RADIAL = 24;
const TRAIL_STEP = 0.06;
const MAX_TRAIL_POINTS = 460;
const POINTER_MEMORY_MS = 2600;
const TAU = Math.PI * 2;

/** Largo de cuerpo, en radios, que cubre una repetición de la textura de tinta. */
const BRUSH_TILE = 16;

// La paleta de la página: tinta clara sobre negro y un solo acento carmesí.
const GROUND = '#0a0a0a';
const INK = '#efefef';
const CRIMSON = '#b11226';

/**
 * La serpiente del alias Snakeblack, pintada como un trazo de pincel: la geometría es 3D (un tubo
 * que sigue el rastro de su cabeza), pero se pinta sin luces, como una mancha plana de tinta con
 * las vetas del pincel seco, para que se lea como un dibujo a tinta en movimiento.
 */
export function mountSnake(canvas: HTMLCanvasElement): void {
  const view = canvas.parentElement as HTMLElement;
  const stage = view.parentElement as HTMLElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  // Al menos 1,5 píxeles por punto, también en pantallas de densidad 1: el trazo no se ve dentado.
  renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 1.5), 2));
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  // Todo lo que forma la serpiente cuelga de aquí, para poder apartarla entera con el scroll.
  const rig = new Group();
  scene.add(rig);
  const band = stage.querySelector<HTMLElement>('.hero__band');
  const nav = stage.querySelector<HTMLElement>('.nav');
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.z = VIEW_HEIGHT / 2 / Math.tan((FOV * Math.PI) / 360);

  // ── Cuerpo ──
  const vertexCount = RINGS * (RADIAL + 1);
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices: number[] = [];
  for (let i = 0; i < RINGS - 1; i++) {
    for (let j = 0; j < RADIAL; j++) {
      const a = i * (RADIAL + 1) + j;
      const b = a + RADIAL + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geometry = new BufferGeometry();
  const positionAttribute = new BufferAttribute(positions, 3).setUsage(DynamicDrawUsage);
  const normalAttribute = new BufferAttribute(normals, 3).setUsage(DynamicDrawUsage);
  const uvAttribute = new BufferAttribute(uvs, 2).setUsage(DynamicDrawUsage);
  geometry.setAttribute('position', positionAttribute);
  geometry.setAttribute('normal', normalAttribute);
  geometry.setAttribute('uv', uvAttribute);
  geometry.setIndex(indices);

  const ink = brushStroke();
  ink.anisotropy = renderer.capabilities.getMaxAnisotropy();
  // Los huecos de la textura dejan ver el fondo: son las vetas que deja el pincel seco.
  const body = new Mesh(geometry, new MeshBasicMaterial({ map: ink, transparent: true, alphaTest: 0.01, toneMapped: false }));
  body.frustumCulled = false;

  // Un halo del color del fondo, algo más grueso que el cuerpo y visto por dentro: donde el
  // trazo pasa sobre sí mismo deja un filo oscuro que separa las dos pasadas.
  const halo = new Mesh(geometry, groundHull(0.045));
  halo.frustumCulled = false;
  rig.add(halo, body);

  const eyeGeometry = new SphereGeometry(1, 20, 14);
  const eyeMaterial = new MeshBasicMaterial({ color: CRIMSON, toneMapped: false });
  const eyes = [0, 1].map(() => {
    const eye = new Mesh(eyeGeometry, eyeMaterial);
    rig.add(eye);
    return eye;
  });

  const tongue = new Mesh(tongueGeometry(), new MeshBasicMaterial({ color: CRIMSON, side: DoubleSide, toneMapped: false }));
  rig.add(tongue);

  // ── Estado ──
  const trail = new Float32Array(MAX_TRAIL_POINTS * 3);
  const centres = new Float32Array(RINGS * 3);
  let trailCount = 1;
  let headX = 0;
  let headY = 1;
  let heading = 0.4;
  let clock = Math.random() * 40;
  let phase = Math.random() * TAU;
  let halfWidth = 8;
  let radius = 0.38;
  let length = 19;
  let scroll = 0;
  let narrow = false;
  // Franja libre del hero, en unidades de escena: debajo de la navegación y encima del nombre.
  let heroTop = 3.6;
  let heroBottom = -1;
  const pointer = { x: 0, y: 0, at: -Infinity };

  function resize(): void {
    const width = view.clientWidth;
    const height = view.clientHeight;
    if (width === 0 || height === 0) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    halfWidth = (VIEW_HEIGHT * camera.aspect) / 2;
    narrow = camera.aspect < 1;
    radius = narrow ? 0.27 : 0.38;
    length = narrow ? 12 : 19;

    const stageTop = stage.getBoundingClientRect().top;
    const toScene = (pixels: number) => (0.5 - pixels / height) * VIEW_HEIGHT;
    if (nav) heroTop = toScene(nav.getBoundingClientRect().bottom - stageTop);
    if (band) heroBottom = toScene(band.getBoundingClientRect().top - stageTop);
  }

  /** El punto al que va la cabeza cuando nadie mueve el cursor: recorre una curva cerrada por la vista. */
  function wander(dt: number): [number, number] {
    // La zona: en el hero, la franja libre entre la navegación y el nombre, para no pasar nunca
    // por detrás del texto; después, toda la altura (y `rig` la aparta de la columna de texto).
    const top = heroTop + (4.4 - heroTop) * scroll;
    const bottom = heroBottom + (-4.4 - heroBottom) * scroll;
    const reach = radius + 0.75; // lo que el cuerpo se sale del punto que persigue al girar
    const centreX = 0;
    const centreY = (top + bottom) / 2;
    const spanX = halfWidth * (narrow ? 0.62 : 0.8 - 0.4 * scroll);
    const spanY = Math.max((top - bottom) / 2 - reach, 0.5);

    // La fase avanza a velocidad constante sobre la curva, para que el punto no se pare en los
    // extremos y la serpiente no acabe dando vueltas alrededor de él.
    const dx = spanX * (0.72 * Math.cos(phase + 1.3) + 0.28 * 2.52 * Math.cos(phase * 2.52));
    const dy = spanY * (0.7 * 1.38 * Math.cos(phase * 1.38) - 0.3 * 2.9 * Math.sin(phase * 2.9 + 0.7));
    phase += (1.55 * dt) / Math.max(Math.hypot(dx, dy), 0.6);

    return [
      centreX + spanX * (0.72 * Math.sin(phase + 1.3) + 0.28 * Math.sin(phase * 2.52)),
      centreY + spanY * (0.7 * Math.sin(phase * 1.38) + 0.3 * Math.cos(phase * 2.9 + 0.7)),
    ];
  }

  function step(dt: number, now: number): void {
    clock += dt;
    const chasing = now - pointer.at < POINTER_MEMORY_MS;
    const [targetX, targetY] = chasing ? [pointer.x, pointer.y] : wander(dt);
    const dx = targetX - headX;
    const dy = targetY - headY;
    const distance = Math.hypot(dx, dy);
    const wiggle = Math.sin(clock * 2.2) * 0.55;
    heading = steerAngle(heading, Math.atan2(dy, dx) + wiggle, (chasing ? 2.5 : 1.7) * dt);
    const speed = (chasing ? 1.8 : 1.2) + Math.min(distance, 6) * (chasing ? 0.5 : 0.3);
    headX += Math.cos(heading) * speed * dt;
    headY += Math.sin(heading) * speed * dt;

    // El primer punto del rastro es siempre la cabeza; cuando se aleja un paso del segundo, se añade otro.
    const gap = trailCount > 1 ? Math.hypot(headX - trail[3], headY - trail[4]) : Infinity;
    if (gap >= TRAIL_STEP) {
      trail.copyWithin(3, 0, (MAX_TRAIL_POINTS - 1) * 3);
      trailCount = Math.min(trailCount + 1, MAX_TRAIL_POINTS);
    }
    trail[0] = headX;
    trail[1] = headY;
    trail[2] = 0;
  }

  function rebuild(): void {
    resampleTrail(trail, trailCount, length / (RINGS - 1), RINGS, centres);

    let tx = Math.cos(heading);
    let ty = Math.sin(heading);
    for (let i = 0; i < RINGS; i++) {
      const s = i / (RINGS - 1);
      const before = Math.max(i - 1, 0) * 3;
      const after = Math.min(i + 1, RINGS - 1) * 3;
      const dx = centres[before] - centres[after];
      const dy = centres[before + 1] - centres[after + 1];
      const span = Math.hypot(dx, dy);
      if (span > 1e-5) {
        tx = dx / span;
        ty = dy / span;
      }

      // La cabeza va por encima de la cola: los cruces del cuerpo se resuelven en profundidad.
      const cx = centres[i * 3];
      const cy = centres[i * 3 + 1];
      const cz = (1 - s) * 1.2;
      const nx = -ty; // lateral, en el plano
      const ny = tx;

      // El grosor respira un poco a lo largo, como la presión de un pincel.
      const profile = bodyRadius(s) * radius * (1 + 0.09 * Math.sin(s * 15 + 1.7));
      const headShape = 1 - Math.min(s / 0.07, 1);
      const wide = Math.max(profile * (1 + 0.42 * headShape), 1e-4);
      const tall = Math.max(profile * (0.86 - 0.2 * headShape), 1e-4);

      for (let j = 0; j <= RADIAL; j++) {
        const angle = (j / RADIAL) * TAU;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const v = (i * (RADIAL + 1) + j) * 3;
        positions[v] = cx + nx * cos * wide;
        positions[v + 1] = cy + ny * cos * wide;
        positions[v + 2] = cz + sin * tall;

        const lateral = cos / wide;
        const vertical = sin / tall;
        const scale = 1 / Math.hypot(lateral, vertical);
        normals[v] = nx * lateral * scale;
        normals[v + 1] = ny * lateral * scale;
        normals[v + 2] = vertical * scale;

        const uv = (i * (RADIAL + 1) + j) * 2;
        uvs[uv] = j / RADIAL;
        uvs[uv + 1] = (s * length) / (radius * BRUSH_TILE);
      }

      if (i === 0) {
        // La lengua sale del hocico y asoma cada pocos segundos.
        const beat = (clock % 3.1) / 0.55;
        const out = beat < 1 ? Math.sin(beat * Math.PI) : 0;
        tongue.visible = out > 0.02;
        tongue.position.set(cx, cy, cz);
        tongue.rotation.z = Math.atan2(ty, tx);
        tongue.scale.set(radius * 2.4 * out, radius * 2.4, 1);
      }

      if (i === 6) {
        const size = radius * 0.14;
        eyes.forEach((eye, side) => {
          const sign = side === 0 ? 1 : -1;
          eye.position.set(cx + nx * wide * 0.6 * sign, cy + ny * wide * 0.6 * sign, cz + tall * 0.74);
          eye.scale.setScalar(size);
        });
      }
    }

    positionAttribute.needsUpdate = true;
    normalAttribute.needsUpdate = true;
    uvAttribute.needsUpdate = true;
  }

  function measureScroll(): void {
    const top = stage.getBoundingClientRect().top;
    scroll = Math.min(Math.max(-top / Math.max(view.clientHeight, 1), 0), 1);
    // Al bajar a la introducción la serpiente se aparta a la derecha, al ritmo del scroll, y deja
    // libre la columna de texto. En pantallas estrechas no hay sitio al lado: se desvanece.
    rig.position.x = narrow ? 0 : halfWidth * 0.55 * scroll;
    view.style.opacity = narrow ? String(1 - 0.9 * scroll) : '';
  }

  // ── Arranque: la serpiente llega ya extendida, no crece desde un punto ──
  resize();
  for (let i = 0; i < 1500; i++) step(1 / 60, 0);
  measureScroll();
  rebuild();
  renderer.render(scene, camera);
  canvas.dataset.ready = '';

  new ResizeObserver(() => {
    resize();
    rebuild();
    renderer.render(scene, camera);
  }).observe(view);

  // Con movimiento reducido se queda en esa pose.
  if (reducedMotion) return;

  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType === 'touch') return;
      const rect = canvas.getBoundingClientRect();
      if (event.clientY < rect.top || event.clientY > rect.bottom) return;
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2 * halfWidth - rig.position.x;
      pointer.y = (0.5 - (event.clientY - rect.top) / rect.height) * VIEW_HEIGHT;
      pointer.at = performance.now();
    },
    { passive: true },
  );

  let visible = true;
  let frame = 0;
  let last = performance.now();

  const loop = (now: number) => {
    // La marca de tiempo del fotograma puede ser anterior a `last`: sin el mínimo en 0 la cabeza
    // retrocedería de golpe y dejaría un pico en el cuerpo.
    const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05);
    last = now;
    measureScroll();
    step(dt, now);
    rebuild();
    renderer.render(scene, camera);
    frame = requestAnimationFrame(loop);
  };

  const sync = () => {
    const shouldRun = visible && document.visibilityState === 'visible';
    if (shouldRun && frame === 0) {
      last = performance.now();
      frame = requestAnimationFrame(loop);
    } else if (!shouldRun && frame !== 0) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(view);
  document.addEventListener('visibilitychange', sync);
  sync();
}

/** Material del halo: desplaza cada vértice por su normal y pinta solo las caras de dentro. */
function groundHull(thickness: number): ShaderMaterial {
  return new ShaderMaterial({
    side: BackSide,
    uniforms: {
      thickness: { value: thickness },
      // Ya en sRGB: este material escribe el color tal cual.
      ground: { value: new Color().setStyle(GROUND).convertLinearToSRGB() },
    },
    vertexShader: /* glsl */ `
      uniform float thickness;
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * thickness, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 ground;
      void main() {
        gl_FragColor = vec4(ground, 1.0);
      }
    `,
  });
}

/** La lengua bífida, plana, con el eje x hacia delante y un largo de 1. */
function tongueGeometry(): BufferGeometry {
  const half = 0.035;
  const fork = 0.62;
  // prettier-ignore
  const vertices = new Float32Array([
    0, -half, 0,   fork, -half, 0,   fork, half, 0,
    0, -half, 0,   fork, half, 0,    0, half, 0,
    fork, -half, 0,  1, -0.2, 0,   fork, half * 0.2, 0,
    fork, half, 0,   fork, -half * 0.2, 0,   1, 0.2, 0,
  ]);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(vertices, 3));
  return geometry;
}

/**
 * La tinta: una mancha sólida a la que el pincel seco le deja vetas a lo largo y el borde
 * mordido. El ancho del lienzo da la vuelta al cuerpo (lo que mira a la cámara va de u = 0 a
 * u = 0,5) y el alto se repite a lo largo, sin costura.
 */
function brushStroke(): CanvasTexture {
  const width = 1024;
  const height = 4096;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  context.fillStyle = INK;
  context.fillRect(0, 0, width, height);

  // Siempre la misma tinta: un generador con semilla en lugar de Math.random.
  let seed = 20261112;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  context.globalCompositeOperation = 'destination-out';
  context.lineCap = 'round';
  context.strokeStyle = '#000';

  // Una veta: una línea casi recta a lo largo del cuerpo, que se dibuja también desplazada
  // un lienzo arriba y abajo para que la repetición case.
  const streak = (u: number, start: number, long: number, thick: number) => {
    const drift = (random() - 0.5) * 28;
    for (const wrap of [-height, 0, height]) {
      context.beginPath();
      context.moveTo(u * width, start + wrap);
      context.bezierCurveTo(u * width + drift, start + wrap + long * 0.3, u * width - drift, start + wrap + long * 0.7, u * width + drift * 0.5, start + wrap + long);
      context.lineWidth = thick;
      context.stroke();
    }
  };

  // El carril del pincel seco, a un lado del lomo: muchas vetas largas y finas.
  for (let i = 0; i < 150; i++) {
    const lane = 0.33 + (random() - 0.5) * 0.11 + (random() < 0.3 ? -0.16 * random() : 0);
    streak(lane, random() * height, 180 + random() * 1040, 3 + random() * random() * 18);
  }

  // Los bordes del trazo, mordidos: vetas cortas y anchas justo donde el cuerpo se ve de canto.
  for (let i = 0; i < 110; i++) {
    const edge = random() < 0.5 ? 0.012 + random() * 0.05 : 0.488 - random() * 0.05;
    streak(edge, random() * height, 60 + random() * 380, 6 + random() * 22);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.minFilter = LinearMipmapLinearFilter;
  return texture;
}
