import type { LocalizedName, ProjectEntry } from '../types/portfolio';
import type { Locale } from './translations';

/** Las páginas de proyecto viven en /proyectos/ en español y en /en/projects/ en inglés. */
export function projectPath(slug: string, locale: Locale): string {
  return locale === 'es' ? `/proyectos/${slug}/` : `/en/projects/${slug}/`;
}

export function localizedName(name: LocalizedName, locale: Locale): string {
  return typeof name === 'string' ? name : name[locale];
}

/** Las portadas diseñadas (cover-*.webp) no son capturas y su texto alternativo lo dice. */
export function isCover(screenshot: string): boolean {
  return /\/cover-[^/]+$/.test(screenshot);
}

/** El proyecto que sigue en la cuadrícula; después del último vuelve al primero. */
export function nextProject(projects: ProjectEntry[], slug: string): ProjectEntry {
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length];
}
