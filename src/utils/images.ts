import type { ImageMetadata } from 'astro';

// Las imágenes de los proyectos viven en src/assets/screenshots/ para que el build las sirva
// en varios anchos y formatos, con un hash en el nombre. El JSON las nombra por su ruta
// (`/assets/screenshots/portada.webp`) y aquí se resuelven por el nombre del archivo.
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/screenshots/*.{webp,avif,png,jpg}', { eager: true });

export function screenshotImage(path: string): ImageMetadata {
  const name = path.slice(path.lastIndexOf('/') + 1);
  const found = files[`../assets/screenshots/${name}`];
  if (!found) {
    throw new Error(`La imagen ${path} no está en src/assets/screenshots/`);
  }
  return found.default;
}
