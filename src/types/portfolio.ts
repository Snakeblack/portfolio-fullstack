export interface TranslatedString {
  es: string;
  en: string;
}

export interface AboutBlock {
  paragraph1: string;
  paragraph2: string;
}

export interface About {
  es: AboutBlock;
  en: AboutBlock;
}

export interface PersonalInfo {
  name: string;
  title: TranslatedString;
  greeting: TranslatedString;
  description: TranslatedString;
  about: About;
  sleepingMessage: TranslatedString;
  location: string;
  email: string;
  image: string;
}

export interface SocialLinks {
  linkedin: string;
  github: string;
  twitter: string;
}

export interface ExperienceEntry {
  company: string;
  position: TranslatedString;
  website?: string;
  period: string;
  description: TranslatedString;
  highlights?: string[];
}

export interface EducationEntry {
  institution: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  courses?: string[];
}

export type SkillCategory = "frontend" | "backend" | "database" | "design" | "devops" | "other";

export interface TechnicalSkillEntry {
  name: string;
  type: "technical";
  category: SkillCategory;
  level?: string;
  icon?: string;
}

export interface SoftSkillEntry {
  name: TranslatedString;
  type: "soft";
  description?: TranslatedString;
}

export type SkillEntry = TechnicalSkillEntry | SoftSkillEntry;

export interface ProjectEntry {
  name: string;
  description: TranslatedString;
  technologies: string[];
  year: string;
  screenshot: string;
  url?: string;
  repo?: string;
}

export interface LanguageEntry {
  language: string;
  fluency: string;
}

export interface PortfolioData {
  personalInfo: PersonalInfo;
  social: SocialLinks;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
  languages: LanguageEntry[];
}
