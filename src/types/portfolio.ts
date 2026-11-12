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

/** Un nombre propio que no se traduce, o uno por idioma. */
export type LocalizedName = string | TranslatedString;

export type ProjectLinkKind = 'site' | 'github' | 'docs' | 'npm' | 'download';

export interface ProjectLink {
  kind: ProjectLinkKind;
  url: string;
}

export interface ProjectFigure {
  value: string;
  label: TranslatedString;
}

/** Un bloque de «Cómo funciona»; sin título, la página usa el genérico. */
export interface ProjectSection {
  title?: string;
  paragraphs: string[];
}

/** Una web dentro de un proyecto que agrupa varias (las landings). */
export interface ProjectItem {
  name: string;
  description: TranslatedString;
  url: string;
  screenshot: string;
  width: number;
  height: number;
}

export interface ProjectEntry {
  /** Ruta de la página: /proyectos/<slug>/ y /en/projects/<slug>/. */
  slug: string;
  name: LocalizedName;
  /** Frase de la tarjeta y meta description: 155 caracteres como mucho. */
  description: TranslatedString;
  /** Entrada de la página del proyecto. */
  summary: TranslatedString;
  how?: { es: ProjectSection[]; en: ProjectSection[] };
  figures?: ProjectFigure[];
  items?: ProjectItem[];
  technologies: string[];
  year: string;
  screenshot: string;
  width: number;
  height: number;
  links: ProjectLink[];
}

export interface PortfolioData {
  personalInfo: PersonalInfo;
  social: SocialLinks;
  ospec: OspecInfo;
  experience: ExperienceEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
}
