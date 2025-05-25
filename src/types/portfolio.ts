
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
  position: string;
  website?: string;
  startDate: string;
  endDate?: string;
  summary: string;
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

export interface SkillEntry {
  name: string;
  level?: string;
  keywords?: string[];
}

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