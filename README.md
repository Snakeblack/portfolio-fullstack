# Portfolio de Michael Retamozo

Portfolio personal en [mretamozo.com](https://mretamozo.com), en español y en inglés. Es un sitio estático hecho con [Astro](https://astro.build), con una escena de [Three.js](https://threejs.org) en la cabecera y animaciones de entrada con [GSAP](https://gsap.com).

## Qué tiene

- Una sola página por idioma (`/` y `/en/`) con estas secciones: cabecera, Ospec-Workflow, experiencia, proyectos, sobre mí y contacto.
- La cabecera pinta una serpiente a tinta, por el alias Snakeblack. La geometría es 3D, pero se dibuja sin luces, como un trazo de pincel. Sigue el cursor y se aparta del texto al bajar.
- En la sección de Ospec-Workflow se puede marcar qué toca un cambio y ver las obligaciones que deriva `ospec`.
- Tema oscuro único. Las fuentes (Gambarino y General Sans) se sirven desde `public/fonts/`; no se carga nada de terceros.
- Sin JavaScript o sin WebGL la página se lee entera, y con `prefers-reduced-motion` la escena se queda en una pose y nada entra animado.

## Comandos

El proyecto usa pnpm y necesita Node.js 22 o superior.

| Comando | Qué hace |
| :-- | :-- |
| `pnpm install` | Instala las dependencias |
| `pnpm dev` | Servidor de desarrollo en `localhost:4321` |
| `pnpm build` | Compila el sitio en `./dist/` |
| `pnpm preview` | Sirve la compilación en local |
| `pnpm test:run` | Tests unitarios y de la compilación (Vitest) |
| `pnpm exec playwright test` | Tests en navegador (Playwright) |

## Estructura

```
├── public/
│   ├── assets/screenshots/   # Capturas de los proyectos
│   └── fonts/                # Gambarino y General Sans
├── src/
│   ├── components/           # Secciones de la página
│   ├── data/portfolio.json   # Textos, experiencia, proyectos y stack
│   ├── layouts/              # Plantilla, metadatos y datos estructurados
│   ├── pages/                # `/` y `/en/`
│   ├── scene/                # La serpiente: geometría del rastro y escena de Three.js
│   ├── styles/global.css     # Tokens de color y tipografía, y todo el diseño
│   ├── utils/                # Traducciones y lógica pequeña con tests
│   └── __tests__/            # Tests de Vitest
├── tests/e2e/                # Tests de Playwright
└── idd/                      # Cambios hechos con ospec-workflow
```

## Cambiar el contenido

Los textos de cada persona, empresa y proyecto están en `src/data/portfolio.json`, con sus dos idiomas. Los de la interfaz (navegación, títulos de sección, botones) están en `src/utils/translations.ts`. Un test comprueba que los dos idiomas tienen las mismas claves.

Para añadir un proyecto hace falta su captura en `public/assets/screenshots/` y el ancho y el alto de esa imagen en su entrada del JSON.
