import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// Configuración de Astro
export default defineConfig({
  site: "https://mretamozo.com",
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: {
      prefixDefaultLocale: false
    }
  },
  integrations: [
    sitemap({
      // Las páginas de proyecto no comparten ruta entre idiomas (/proyectos/ y /en/projects/),
      // así que sus alternativas se enlazan a mano.
      serialize(item) {
        const match = item.url.match(/^(https?:\/\/[^/]+)\/(?:proyectos|en\/projects)\/([^/]+)\/$/);
        if (match) {
          const [, origin, slug] = match;
          item.links = [
            { lang: 'es', url: `${origin}/proyectos/${slug}/` },
            { lang: 'en', url: `${origin}/en/projects/${slug}/` },
          ];
        }
        return item;
      },
      i18n: {
        defaultLocale: 'es',
        locales: {
          'es': 'es',
          'en': 'en'
        }
      }
    })
  ]
});
