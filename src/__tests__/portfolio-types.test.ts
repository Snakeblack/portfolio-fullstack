import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';
import portfolioData from '../data/portfolio.json';
import { translations } from '../utils/translations';
import type { ProjectEntry } from '../types/portfolio';

// El JSON nombra cada imagen por su ruta (/assets/screenshots/x.webp) y el archivo vive en src/assets/screenshots/.
const screenshotFile = (path: string) => resolve(__dirname, '../assets/screenshots', path.slice(path.lastIndexOf('/') + 1));

function allStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => allStrings(item, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => allStrings(item, out));
  return out;
}

describe('Portfolio data structure', () => {
  it('social should be an object with linkedin, github, twitter (not an array)', () => {
    expect(Array.isArray(portfolioData.social)).toBe(false);
    expect(portfolioData.social).toHaveProperty('linkedin');
    expect(portfolioData.social).toHaveProperty('github');
    expect(portfolioData.social).toHaveProperty('twitter');
  });

  const projects = portfolioData.projects as unknown as ProjectEntry[];

  it('lists the chosen projects in order, without the ones that were dropped', () => {
    expect(projects.map((project) => project.slug)).toEqual([
      'ospec-workflow',
      'noema',
      'retama',
      'finanzas-snake',
      'opencode-pr-status',
      'stream-overlay-chat',
      'background-generator',
      'landings',
      'blog',
    ]);
    const names = JSON.stringify(projects.map((project) => project.name));
    for (const dropped of ['Barreto', 'DevTools', 'Reactive Forms', 'Device Manager']) {
      expect(names).not.toContain(dropped);
    }
  });

  it('every project has what its tile and its page need', () => {
    const kinds = ['site', 'github', 'docs', 'npm', 'download'];
    for (const project of projects) {
      expect(project.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(project.screenshot).toMatch(/^\/assets\/screenshots\/.+\.(webp|avif|png|jpg)$/);
      expect(existsSync(screenshotFile(project.screenshot))).toBe(true);
      expect(project.width).toBeGreaterThan(0);
      expect(project.height).toBeGreaterThan(0);
      expect(project.year).toMatch(/^\d{4}$/);
      expect(project.technologies.length).toBeGreaterThan(0);
      for (const link of project.links) {
        expect(kinds).toContain(link.kind);
        expect(link.url).toMatch(/^https:\/\//);
      }
    }
    expect(new Set(projects.map((project) => project.slug)).size).toBe(projects.length);
  });

  it('every project speaks both languages, with a description short enough for a search result', () => {
    for (const project of projects) {
      for (const locale of ['es', 'en'] as const) {
        expect(project.description[locale].length).toBeGreaterThan(30);
        expect(project.description[locale].length).toBeLessThanOrEqual(155);
        expect(project.summary[locale].length).toBeGreaterThan(project.description[locale].length);
        if (typeof project.name !== 'string') expect(project.name[locale]).toBeTruthy();
      }
      if (project.how) {
        expect(project.how.en.map((section) => section.paragraphs.length)).toEqual(
          project.how.es.map((section) => section.paragraphs.length),
        );
        expect(project.how.en.map((section) => Boolean(section.title))).toEqual(
          project.how.es.map((section) => Boolean(section.title)),
        );
      }
      for (const figure of project.figures ?? []) {
        expect(figure.label.es && figure.label.en).toBeTruthy();
      }
    }
  });

  it('the complex projects explain how they work; Retama covers its client area, ospec and the playbook', () => {
    for (const slug of ['ospec-workflow', 'noema', 'retama', 'finanzas-snake', 'opencode-pr-status', 'stream-overlay-chat']) {
      expect(projects.find((project) => project.slug === slug)?.how).toBeDefined();
    }
    const retama = JSON.stringify(projects.find((project) => project.slug === 'retama')?.how?.es);
    expect(retama).toMatch(/ospec snapshot/);
    expect(retama).toMatch(/playbook/);
    expect(retama).toMatch(/passkey/);
    expect(retama).toMatch(/MCP/);
  });

  it('the client landings live together on one page, each with its own site', () => {
    const landings = projects.find((project) => project.slug === 'landings');
    expect(landings?.items?.map((item) => item.name)).toEqual(['Baterías Express', 'Recambios las Margaritas']);
    for (const item of landings?.items ?? []) {
      expect(item.url).toMatch(/^https:\/\//);
      expect(existsSync(screenshotFile(item.screenshot))).toBe(true);
    }
  });

  it('Ospec-Workflow is listed once, first, and points to its repository', () => {
    const ospec = projects[0];
    expect(ospec.slug).toBe('ospec-workflow');
    expect(projects.filter((project) => /ospec/i.test(JSON.stringify(project.name)))).toHaveLength(1);
    expect(ospec.links.find((link) => link.kind === 'github')?.url).toBe(portfolioData.ospec.repo);
  });

  it('personalInfo texts exist in both languages', () => {
    const { personalInfo } = portfolioData;
    for (const key of ['title', 'description', 'sleepingMessage', 'location'] as const) {
      expect(typeof personalInfo[key].es).toBe('string');
      expect(typeof personalInfo[key].en).toBe('string');
    }
    expect(personalInfo.intro.es.length).toBe(personalInfo.intro.en.length);
    expect(personalInfo.about.es).toHaveProperty('paragraph1');
    expect(personalInfo.about.es).toHaveProperty('paragraph2');
    expect(personalInfo.about.en).toHaveProperty('paragraph1');
    expect(personalInfo.about.en).toHaveProperty('paragraph2');
  });

  it('should NOT have phone field in personalInfo', () => {
    expect(portfolioData.personalInfo).not.toHaveProperty('phone');
  });

  it('the display name is two words, as the hero and the footer split it', () => {
    expect(portfolioData.personalInfo.displayName.split(' ')).toHaveLength(2);
  });

  it('experience names the current work: Hiberus with Ibercaja as client, and Retama', () => {
    const current = portfolioData.experience.filter((job) => job.period.to === null);
    expect(current.map((job) => job.company)).toEqual(['Hiberus', 'Retama']);
    expect(current[0].position.es).toMatch(/Ibercaja/);
    expect(current[0].position.en).toMatch(/Ibercaja/);
    expect(current[1].website).toBe('https://retama.dev');
  });

  it('experience periods are ordered years and jobs go from newest to oldest', () => {
    for (const job of portfolioData.experience) {
      if (job.period.to !== null) expect(job.period.to).toBeGreaterThanOrEqual(job.period.from);
    }
    const ends = portfolioData.experience.map((job) => job.period.to ?? Infinity);
    expect([...ends].sort((a, b) => b - a)).toEqual(ends);
  });

  it('every skill belongs to a column of the stack', () => {
    for (const skill of portfolioData.skills) {
      expect(['frontend', 'backend', 'ai', 'tools']).toContain(skill.category);
    }
    expect(portfolioData.skills.some((skill) => skill.category === 'ai')).toBe(true);
  });
});

describe('Visible copy', () => {
  const strings = [...allStrings(portfolioData), ...allStrings(translations)];

  it('has no em or en dashes', () => {
    expect(strings.filter((text) => /[—–]/.test(text))).toEqual([]);
  });

  it('has no emoji', () => {
    expect(strings.filter((text) => /\p{Emoji_Presentation}/u.test(text))).toEqual([]);
  });

  it('has no invisible formatting characters', () => {
    expect(strings.filter((text) => /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF\u00AD]/.test(text))).toEqual([]);
  });

  it('both locales define the same keys', () => {
    const keys = (value: unknown, prefix = ''): string[] =>
      value && typeof value === 'object'
        ? Object.entries(value).flatMap(([key, item]) => keys(item, `${prefix}${key}.`))
        : [prefix];
    expect(keys(translations.en)).toEqual(keys(translations.es));
  });
});
