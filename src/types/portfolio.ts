export interface TranslatedString {
  es: string;
  en: string;
}

export interface AboutBlock {
  paragraph1: string;
  paragraph2: string;
}

export interface Fact {
  label: TranslatedString;
  value: TranslatedString;
}

export interface PersonalInfo {
  name: string;
  displayName: string;
  title: TranslatedString;
  description: TranslatedString;
  intro: { es: string[]; en: string[] };
  about: { es: AboutBlock; en: AboutBlock };
  facts: Fact[];
  sleepingMessage: TranslatedString;
  location: TranslatedString;
  email: string;
  image: string;
}

export interface SocialLinks {
  linkedin: string;
  github: string;
  twitter: string;
}

export interface OspecInfo {
  repo: string;
  docs: string;
  image: string;
  hosts: string[];
}

export interface ExperienceEntry {
  company: string;
  website?: string;
  position: TranslatedString;
  /** `to: null` es un puesto actual. */
  period: { from: number; to: number | null };
  description: TranslatedString;
}

export type SkillCategory = 'frontend' | 'backend' | 'ai' | 'tools';

export interface SkillEntry {
  name: string;
  category: SkillCategory;
}

export interface ProjectEntry {
  name: string;
  description: TranslatedString;
  technologies: string[];
  year: string;
  screenshot: string;
  width: number;
  height: number;
  url: string;
}

export interface PortfolioData {
  personalInfo: PersonalInfo;
  social: SocialLinks;
  ospec: OspecInfo;
  experience: ExperienceEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
}
