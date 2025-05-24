# Portfolio Minimal con Astro y Tailwind CSS

Este es un proyecto de portfolio minimalista creado con Astro y estilizado con Tailwind CSS. La información del portfolio se carga desde un archivo JSON.

## Comandos

Todos los comandos se ejecutan desde la raíz del proyecto, desde una terminal:

| Comando           | Acción                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Instala las dependencias                     |
| `npm run dev`     | Inicia el servidor local de desarrollo en `localhost:4321` |
| `npm run build`   | Compila el sitio para producción en `./dist/`  |
| `npm run preview` | Previsualiza la compilación de producción localmente   |

## Estructura del Proyecto

- `public/`: Contiene los assets estáticos.
- `src/data/portfolio.json`: Archivo JSON con los datos del portfolio.
- `src/layouts/Layout.astro`: Layout principal de las páginas.
- `src/pages/index.astro`: Página principal del portfolio.
- `src/styles/global.css`: Estilos globales y directivas de Tailwind.
- `src/types/portfolio.ts`: Definiciones de TypeScript para los datos del portfolio.
- `astro.config.mjs`: Configuración de Astro.
- `tailwind.config.mjs`: Configuración de Tailwind CSS.
- `postcss.config.cjs`: Configuración de PostCSS.

## Inspiración

- Diseño inspirado en [khazifire.com](https://khazifire.com/?ref=prettyfolio)
- Secciones de contenido basadas en [cv.mretamozo.com](https://cv.mretamozo.com)
