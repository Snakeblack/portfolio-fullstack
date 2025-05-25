# Portfolio Minimal 🚀

![Astro](https://img.shields.io/badge/Astro-5.8.0-orange?style=for-the-badge&logo=astro)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.1.7-blue?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript)

## 📋 Descripción

Portfolio web personal minimalista y elegante construido con [Astro](https://astro.build) y [Tailwind CSS](https://tailwindcss.com). Esta aplicación está diseñada para mostrar tu experiencia, proyectos y habilidades profesionales de manera atractiva y eficiente.

El sitio incluye:
- Diseño responsivo para todo tipo de dispositivos
- Modo oscuro/claro con transiciones suaves
- Soporte multiidioma (Español e Inglés)
- Carga de datos desde archivos JSON para fácil actualización
- Optimización de rendimiento y SEO
- Tipado estricto con TypeScript

## 🌟 Características

- **Rendimiento Óptimo**: Construido con Astro para una carga ultra rápida
- **Personalizable**: Fácil personalización a través del archivo JSON de datos
- **Internacional**: Soporte nativo para español e inglés
- **Tipado Seguro**: Implementado con TypeScript para minimizar errores
- **SEO Optimizado**: Incluye generación de sitemap para mejor indexación

## ⚡ Instalación y Uso

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn

### Comandos

Todos los comandos se ejecutan desde la raíz del proyecto:

| Comando           | Acción                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Instala las dependencias                     |
| `npm run dev`     | Inicia el servidor local de desarrollo en `localhost:4321` |
| `npm run build`   | Compila el sitio para producción en `./dist/`  |
| `npm run preview` | Previsualiza la compilación de producción localmente   |

## 📁 Estructura del Proyecto

```
├── public/                # Archivos estáticos
│   ├── assets/            # Imágenes y recursos
│   └── profile.webp       # Imagen de perfil
├── src/
│   ├── components/        # Componentes Astro reutilizables
│   ├── data/              
│   │   └── portfolio.json # Datos del portfolio (experiencia, proyectos, etc.)
│   ├── layouts/           # Plantillas de página
│   ├── pages/             # Páginas del sitio
│   │   └── en/            # Páginas en inglés
│   ├── styles/            # Estilos CSS
│   ├── types/             # Definiciones TypeScript
│   └── utils/             # Utilidades y funciones auxiliares
├── astro.config.mjs       # Configuración de Astro
└── tsconfig.json          # Configuración de TypeScript
```

## 🔧 Personalización

Para personalizar el portfolio, modifica el archivo `src/data/portfolio.json` con tu información personal, experiencia, proyectos y habilidades.

## 💡 Mejoras futuras

- Añadir más idiomas
- Implementar un blog
- Añadir animaciones avanzadas
- Mejorar la accesibilidad
- Implementar PWA (Progressive Web App)

