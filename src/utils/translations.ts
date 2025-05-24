export type Locale = 'es' | 'en';

export const translations = {
  es: {    // Navigation
    nav: {
      about: 'Sobre mí',
      work: 'Experiencia',
      projects: 'Proyectos',
      blog: 'Blog',
      contact: 'Contacto',
      me: 'Mí'
    },
    // Sections
    sections: {
      about: 'Sobre mí',
      experience: 'Experiencia',
      projects: 'Proyectos Destacados',
      skills: 'Habilidades',
      contact: 'Contacto'
    },
    // Actions
    actions: {
      contact: 'Ponerse en contacto',
      viewProject: 'Ver proyecto',
      viewRepo: 'Ver repositorio',
      viewAll: 'Ver todos',
      selectedProjects: 'Proyectos Seleccionados',
      getInTouch: 'Ponerse en contacto'
    },    // Misc
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
    }
  },  en: {
    // Navigation
    nav: {
      about: 'About',
      work: 'Experience',
      projects: 'Projects',
      blog: 'Blog',
      contact: 'Contact',
      me: 'Me'
    },
    // Sections
    sections: {
      about: 'About',
      experience: 'Experience',
      projects: 'Featured Projects',
      skills: 'Skills',
      contact: 'Contact'
    },
    // Actions
    actions: {
      contact: 'Get in touch',
      viewProject: 'View project',
      viewRepo: 'View repository',
      viewAll: 'View all',
      selectedProjects: 'Selected Projects',
      getInTouch: 'Get in touch'
    },
    // Misc
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
    }
  }
} as const;

export function getTranslations(locale: Locale) {
  return translations[locale];
}
