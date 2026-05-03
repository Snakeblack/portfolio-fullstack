export type Locale = 'es' | 'en';

export const translations = {
  es: {    
    // Navegación
    nav: {
      about: 'Sobre mí',
      work: 'Experiencia',
      projects: 'Proyectos',
      blog: 'Blog',
      contact: 'Contacto',
      me: 'Mí',
      menuOpen: 'Abrir el menú',
      menuClose: 'Cerrar el menú'
    },
    // Secciones
    sections: {
      about: 'Sobre mí',
      experience: 'Experiencia',
      projects: 'Proyectos Destacados',
      skills: 'Habilidades',
      contact: 'Contacto'
    },
    // Acciones
    actions: {
      contact: 'Ponerse en contacto',
      viewProject: 'Ver proyecto',
      viewRepo: 'Ver repositorio',
      viewAll: 'Ver todos',
      viewLess: 'Mostrar menos',
      selectedProjects: 'Proyectos Seleccionados',
      getInTouch: 'Ponerse en contacto',
      readMore: 'Leer más', // Added
      readLess: 'Leer menos'  // Added
    },
    labels: {
      newProject: 'Nuevo'
    },
    project: {
      screenshotAlt: "Captura de pantalla del proyecto"
    },
    // UI
    ui: {
      currentPosition: 'actual',
      present: 'actual',
      builtWith: 'Construido con',
      and: 'y',
      allRightsReserved: 'Todos los derechos reservados.',
      madeWith: 'Hecho con',
      selectedProjects: 'Proyectos Seleccionados',
      contactMessage: 'Siéntete libre de contactarme.',
      when: 'Cuando no estoy pegado a una pantalla, probablemente me encuentres corriendo o escalando en algún lugar de 🇪🇸—pero si tienes una idea o proyecto en mente, ya sea un sitio web personalizado, aplicación web, o simplemente una charla amigable, ¡no dudes en contactarme!',
      languageSwitch: 'EN',
      darkMode: 'Modo oscuro',
      lightMode: 'Modo claro'
    },
    skillCategories: {
      frontend: 'Frontend',
      backend: 'Backend',
      database: 'Bases de Datos',
      devops: 'DevOps',
      design: 'Diseño',
      other: 'Otros'
    },
    headings: {
      technicalSkills: 'Habilidades Técnicas',
      softSkills: 'Habilidades Blandas'
    }
  },  en: {
    // Navegación
    nav: {
      about: 'About',
      work: 'Experience',
      projects: 'Projects',
      blog: 'Blog',
      contact: 'Contact',
      me: 'Me',
      menuOpen: 'Open menu',
      menuClose: 'Close menu'
    },
    // Secciones
    sections: {
      about: 'About',
      experience: 'Experience',
      projects: 'Featured Projects',
      skills: 'Skills',
      contact: 'Contact'
    },
    // Acciones
    actions: {
      contact: 'Get in touch',
      viewProject: 'View project',
      viewRepo: 'View repository',
      viewAll: 'View all',
      viewLess: 'Show less',
      selectedProjects: 'Selected Projects',
      getInTouch: 'Get in touch',
      readMore: 'Read more', // Added
      readLess: 'Read less'  // Added
    },
    labels: { // Added new labels section
      newProject: 'New'
    },
    project: {
      screenshotAlt: "Project screenshot"
    },
    // UI
    ui: {
      currentPosition: 'current',
      present: 'current',
      builtWith: 'Built with',
      and: 'and',
      allRightsReserved: 'All rights reserved.',
      madeWith: 'Made with',
      selectedProjects: 'Selected Projects',
      contactMessage: 'Feel free to contact me.',
      when: 'When I\'m not glued to a screen, you\'ll likely find me running or bouldering somewhere in 🇪🇸—but if you\'ve got an idea or project in mind, whether it\'s a custom website, web app, or just a friendly chat, feel free to reach out!',
      languageSwitch: 'ES',
      darkMode: 'Dark mode',
      lightMode: 'Light mode'
    },
    skillCategories: {
      frontend: 'Frontend',
      backend: 'Backend',
      database: 'Databases',
      devops: 'DevOps',
      design: 'Design',
      other: 'Others'
    },
    headings: {
      technicalSkills: 'Technical Skills',
      softSkills: 'Soft Skills'
    }
  }
} as const;

export function getTranslations(locale: Locale) {
  return translations[locale];
}
