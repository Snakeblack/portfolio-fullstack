export type Locale = 'es' | 'en';

export const translations = {
  es: {
    nav: {
      ospec: 'Ospec-Workflow',
      work: 'Experiencia',
      projects: 'Proyectos',
      about: 'Sobre mí',
      contact: 'Contacto',
      main: 'Principal',
      menu: 'Menú',
      menuOpen: 'Abrir el menú',
      menuClose: 'Cerrar el menú',
      otherLocale: 'English',
      otherLocaleLabel: 'Switch to English version',
    },
    meta: {
      title: 'Michael Retamozo · Software Engineer',
      description:
        'Portfolio de Michael Retamozo, Software Engineer en Madrid: software de empresa en Hiberus para Ibercaja, aplicaciones para empresas con Retama y Ospec-Workflow, un arnés para agentes de IA.',
    },
    hero: {
      role: 'Software Engineer',
      action: 'Escríbeme',
      mailSubject: 'Hola, Michael',
      introLink: 'Ver Ospec-Workflow',
    },
    ospec: {
      title: 'Ospec-Workflow',
      lead: 'Un arnés de desarrollo guiado por impacto para agentes de IA. La CLI ospec deduce qué debe cada cambio a partir de lo que toca, y solo lo cierra cuando ha visto la prueba de cada obligación.',
      question: '¿Qué toca tu cambio?',
      touches: {
        bug: 'Un bug',
        api: 'Una API pública',
        migration: 'Una migración',
        auth: 'Autenticación',
      },
      owes: 'Lo que ospec le exige',
      obligations: {
        'checks-pass': 'Los checks del proyecto pasan sobre el árbol actual.',
        'repro-test': 'Un test que reproduce el fallo: primero falla y después pasa.',
        'contract-spec-and-test': 'El documento del contrato y su test cambian en el mismo diff.',
        'migration-compat-and-test': 'Un test de la migración, con un plan de compatibilidad o de vuelta atrás.',
        'trust-review': 'Una revisión de seguridad acotada y de solo lectura.',
      },
      hosts: 'Funciona en',
      repo: 'Ver en GitHub',
      docs: 'Leer la documentación',
      imageAlt: 'La mascota de Ospec: un pulpo de esmoquin que dirige con una batuta.',
    },
    experience: {
      title: 'Experiencia',
      since: 'Desde',
      website: 'Web de',
    },
    projects: {
      title: 'Proyectos',
      more: 'Más en GitHub',
      screenshotAlt: 'Captura de',
    },
    about: {
      title: 'Sobre mí',
      stack: 'Stack',
      columns: {
        frontend: 'Frontend',
        backend: 'Backend y datos',
        ai: 'IA y herramientas',
      },
    },
    contact: {
      title: '¿Tienes un proyecto o un puesto que encaje? Escríbeme.',
      clock: 'Hora local',
    },
    footer: {
      sections: 'Secciones',
      site: 'Esta web',
      source: 'Código en GitHub',
      madeWith: 'Hecha con Astro, Three.js y GSAP',
      top: 'Volver arriba',
    },
  },
  en: {
    nav: {
      ospec: 'Ospec-Workflow',
      work: 'Experience',
      projects: 'Projects',
      about: 'About',
      contact: 'Contact',
      main: 'Main',
      menu: 'Menu',
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
      otherLocale: 'Español',
      otherLocaleLabel: 'Cambiar a la versión en español',
    },
    meta: {
      title: 'Michael Retamozo · Software Engineer',
      description:
        'Portfolio of Michael Retamozo, Software Engineer in Madrid: enterprise software at Hiberus for Ibercaja, apps for companies with Retama, and Ospec-Workflow, a harness for AI coding agents.',
    },
    hero: {
      role: 'Software Engineer',
      action: 'Email me',
      mailSubject: 'Hi, Michael',
      introLink: 'See Ospec-Workflow',
    },
    ospec: {
      title: 'Ospec-Workflow',
      lead: 'An impact-driven development harness for AI coding agents. The ospec CLI works out what each change owes from what it touches, and closes it only once it has seen evidence for every obligation.',
      question: 'What does your change touch?',
      touches: {
        bug: 'A bug',
        api: 'A public API',
        migration: 'A migration',
        auth: 'Authentication',
      },
      owes: 'What ospec asks of it',
      obligations: {
        'checks-pass': 'The project checks pass on the current tree.',
        'repro-test': 'A test that reproduces the bug: it fails first, then passes.',
        'contract-spec-and-test': 'The contract document and its test change in the same diff.',
        'migration-compat-and-test': 'A migration test, with a compatibility or rollback plan.',
        'trust-review': 'A bounded, read-only security review.',
      },
      hosts: 'Runs in',
      repo: 'View on GitHub',
      docs: 'Read the docs',
      imageAlt: 'The Ospec mascot: an octopus in a tuxedo conducting with a baton.',
    },
    experience: {
      title: 'Experience',
      since: 'Since',
      website: 'Website of',
    },
    projects: {
      title: 'Projects',
      more: 'More on GitHub',
      screenshotAlt: 'Screenshot of',
    },
    about: {
      title: 'About',
      stack: 'Stack',
      columns: {
        frontend: 'Frontend',
        backend: 'Backend and data',
        ai: 'AI and tooling',
      },
    },
    contact: {
      title: 'Have a project or a role that fits? Write to me.',
      clock: 'Local time',
    },
    footer: {
      sections: 'Sections',
      site: 'This site',
      source: 'Source on GitHub',
      madeWith: 'Built with Astro, Three.js and GSAP',
      top: 'Back to top',
    },
  },
} as const;

export function getTranslations(locale: Locale) {
  return translations[locale];
}
