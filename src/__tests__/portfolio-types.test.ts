import { describe, it, expect } from 'vitest';
import portfolioData from '../data/portfolio.json';
import { translations } from '../utils/translations';

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

  it('every project has what its tile needs: link, picture with size, year and technologies', () => {
    for (const project of portfolioData.projects) {
      expect(project.url).toMatch(/^https:\/\//);
      expect(project.screenshot).toMatch(/^\/assets\/screenshots\/.+\.(webp|avif|png|jpg)$/);
      expect(project.width).toBeGreaterThan(0);
      expect(project.height).toBeGreaterThan(0);
      expect(project.year).toMatch(/^\d{4}$/);
      expect(Array.isArray(project.technologies)).toBe(true);
      expect(project.technologies.length).toBeGreaterThan(0);
    }
  });

  it('every project description should be {es, en} object', () => {
    for (const project of portfolioData.projects) {
      expect(typeof project.description.es).toBe('string');
      expect(typeof project.description.en).toBe('string');
    }
  });

  it('Ospec-Workflow is listed once, first, and points to its repository', () => {
    const matches = portfolioData.projects.filter((project) => /ospec/i.test(project.name));
    expect(matches).toHaveLength(1);
    expect(portfolioData.projects[0]).toBe(matches[0]);
    expect(matches[0].url).toBe('https://github.com/Snakeblack/ospec-workflow');
    expect(portfolioData.ospec.repo).toBe(matches[0].url);
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
