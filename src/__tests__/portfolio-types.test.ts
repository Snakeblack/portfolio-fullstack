import { describe, it, expect } from 'vitest';
import portfolioData from '../data/portfolio.json';

describe('Portfolio data structure', () => {
  it('social should be an object with linkedin, github, twitter (not an array)', () => {
    expect(Array.isArray(portfolioData.social)).toBe(false);
    expect(portfolioData.social).toHaveProperty('linkedin');
    expect(portfolioData.social).toHaveProperty('github');
    expect(portfolioData.social).toHaveProperty('twitter');
  });

  it('every project should have technologies, year, and screenshot', () => {
    for (const project of portfolioData.projects) {
      expect(project).toHaveProperty('technologies');
      expect(Array.isArray(project.technologies)).toBe(true);
      expect(project).toHaveProperty('year');
      expect(typeof project.year).toBe('string');
      expect(project).toHaveProperty('screenshot');
      expect(typeof project.screenshot).toBe('string');
    }
  });

  it('every project description should be {es, en} object', () => {
    for (const project of portfolioData.projects) {
      expect(typeof project.description).toBe('object');
      expect(project.description).toHaveProperty('es');
      expect(project.description).toHaveProperty('en');
      expect(typeof (project.description as any).es).toBe('string');
      expect(typeof (project.description as any).en).toBe('string');
    }
  });

  it('personalInfo.description should be {es, en} object', () => {
    expect(typeof portfolioData.personalInfo.description).toBe('object');
    expect(portfolioData.personalInfo.description).toHaveProperty('es');
    expect(portfolioData.personalInfo.description).toHaveProperty('en');
  });

  it('personalInfo should have greeting and sleepingMessage as {es, en}', () => {
    expect(portfolioData.personalInfo).toHaveProperty('greeting');
    expect(portfolioData.personalInfo.greeting).toHaveProperty('es');
    expect(portfolioData.personalInfo.greeting).toHaveProperty('en');
    expect(portfolioData.personalInfo).toHaveProperty('sleepingMessage');
    expect(portfolioData.personalInfo.sleepingMessage).toHaveProperty('es');
    expect(portfolioData.personalInfo.sleepingMessage).toHaveProperty('en');
  });

  it('should NOT have phone field in personalInfo', () => {
    expect(portfolioData.personalInfo).not.toHaveProperty('phone');
  });

  it('about should have es/en with paragraph1/paragraph2 structure', () => {
    const about = portfolioData.personalInfo.about as any;
    expect(about).toHaveProperty('es');
    expect(about).toHaveProperty('en');
    expect(about.es).toHaveProperty('paragraph1');
    expect(about.es).toHaveProperty('paragraph2');
    expect(about.en).toHaveProperty('paragraph1');
    expect(about.en).toHaveProperty('paragraph2');
  });
});
