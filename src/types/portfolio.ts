export interface PortfolioData {
  name: string;
  title: string;
  email: string;
  location: string;
  about: About;
  social: SocialProfile[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
  languages: LanguageEntry[];
}

export interface SocialProfile {
  network: string;
  username: string;
  url: string;
}

export interface ExperienceEntry {
  company: string;
  position: TranslatedString; // Changed from string to TranslatedString
  website?: string;
  period: string; // Added period, removed startDate and endDate
  description: TranslatedString; // Changed from summary: string to description: TranslatedString
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

export interface TranslatedString {
  es: string;
  en: string;
}

export interface SoftSkillEntry {
  name: TranslatedString;
  type: "soft";
  description?: TranslatedString;
}

export type SkillEntry = TechnicalSkillEntry | SoftSkillEntry;

export interface ProjectEntry {
  name: string;
  description: string;
  keywords?: string[];
  url?: string;
  repo?: string;
}

export interface LanguageEntry {
  language: string;
  fluency: string;
}

export interface About {
  paragraph1: string;
  paragraph2: string;
}