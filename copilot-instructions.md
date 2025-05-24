# Guía de Actualización de Tailwind CSS v3 a v4

Tailwind CSS v4.0 es una nueva versión principal del framework. Aunque se ha trabajado para minimizar los cambios disruptivos, algunas actualizaciones son necesarias. Esta guía detalla los pasos para actualizar tus proyectos de v3 a v4.

**Importante:** Tailwind CSS v4.0 está diseñado para Safari 16.4+, Chrome 111+ y Firefox 128+. Si necesitas compatibilidad con navegadores más antiguos, mantén la v3.4.

## Usando la Herramienta de Actualización

La forma más sencilla de actualizar es usando la herramienta de actualización oficial:

```bash
npx @tailwindcss/upgrade
```

Esta herramienta automatiza la mayor parte del proceso, incluyendo:
* Actualización de dependencias.
* Migración del archivo de configuración a CSS.
* Manejo de cambios en los archivos de plantilla.

**Requisitos:** Node.js 20 o superior.

**Recomendaciones:**
* Ejecuta la herramienta en una nueva rama.
* Revisa cuidadosamente las diferencias (diff) y prueba tu proyecto en el navegador.
* Revisa la lista de cambios disruptivos de v4 para asegurar que todo esté cubierto.

## Actualización Manual

### Usando PostCSS

* El plugin de PostCSS ahora está en un paquete dedicado: `@tailwindcss/postcss`.
* Las importaciones y los prefijos de proveedor (vendor prefixes) se manejan automáticamente. Puedes eliminar `postcss-import` y `autoprefixer`.

**Ejemplo de `postcss.config.mjs`:**

```javascript
export default {
  plugins: {
    // "postcss-import": {}, // Eliminar
    // tailwindcss: {}, // Eliminar
    // autoprefixer: {}, // Eliminar
    "@tailwindcss/postcss": {}, // Añadir
  },
};
```

### Usando Vite

Se recomienda migrar al nuevo plugin dedicado para Vite para un mejor rendimiento:

**Ejemplo de `vite.config.ts`:**

```typescript
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
});
```

### Usando Tailwind CLI

El CLI de Tailwind ahora está en un paquete dedicado: `@tailwindcss/cli`. Actualiza tus comandos de compilación:

```bash
# Antes
npx tailwindcss -i input.css -o output.css

# Ahora
npx @tailwindcss/cli -i input.css -o output.css
```

## Cambios Principales de v3 a v4

### Requisitos del Navegador

Tailwind CSS v4.0 depende de características CSS modernas como `@property` y `color-mix()`, y no funcionará en navegadores antiguos.

### Directivas `@tailwind` Eliminadas

Importa Tailwind usando una declaración CSS `@import` estándar:

```css
/* Antes */
/* @tailwind base; */
/* @tailwind components; */
/* @tailwind utilities; */

/* Ahora */
@import "tailwindcss";
```

### Utilidades Obsoletas Eliminadas

Se han eliminado utilidades que estaban obsoletas en v3. Algunos ejemplos:

| v3                  | v4 (Alternativa Moderna)        |
|---------------------|---------------------------------|
| `bg-opacity-*`      | Modificadores de opacidad como `bg-black/50` |
| `text-opacity-*`    | Modificadores de opacidad como `text-black/50` |
| `border-opacity-*`  | Modificadores de opacidad como `border-black/50` |
| `flex-shrink-*`     | `shrink-*`                      |
| `flex-grow-*`       | `grow-*`                        |
| `overflow-ellipsis` | `text-ellipsis`                 |
| `decoration-slice`  | `box-decoration-slice`          |
| `decoration-clone`  | `box-decoration-clone`          |

### Utilidades Renombradas

Varias utilidades han sido renombradas para mayor consistencia:

| v3                 | v4             |
|--------------------|----------------|
| `shadow-sm`        | `shadow-xs`    |
| `shadow`           | `shadow-sm`    |
| `drop-shadow-sm`   | `drop-shadow-xs`|
| `drop-shadow`      | `drop-shadow-sm`|
| `blur-sm`          | `blur-xs`      |
| `blur`             | `blur-sm`      |
| `backdrop-blur-sm` | `backdrop-blur-xs`|
| `backdrop-blur`    | `backdrop-blur-sm`|
| `rounded-sm`       | `rounded-xs`   |
| `rounded`          | `rounded-sm`   |
| `outline-none`     | `outline-hidden` |
| `ring`             | `ring-3`       |

**Cambios específicos:**
* **Escalas de `shadow`, `radius` y `blur` actualizadas:** Las versiones "simples" (ej. `shadow`) aún funcionan por compatibilidad, pero las versiones `-sm` (ej. `shadow-sm`) se verán diferentes a menos que se actualicen a sus respectivas versiones `-xs`.
* **Utilidad `outline` renombrada:**
    * `outline` ahora establece `outline-width: 1px` por defecto.
    * `outline-<number>` ahora establece `outline-style: solid` por defecto.
    * `outline-none` (v3) se ha renombrado a `outline-hidden` (v4). Se ha añadido una nueva utilidad `outline-none` que realmente establece `outline-style: none`.
* **Ancho de `ring` por defecto cambiado:** El `ring` por defecto ha cambiado de `3px` a `1px`. Usa `ring-3` para mantener el comportamiento de v3.

### Selector `space-between`

El selector para las utilidades `space-x-*` y `space-y-*` ha cambiado para mejorar el rendimiento.
* **Antes:** `> :not([hidden]) ~ :not([hidden])` (usaba `margin-top`)
* **Ahora:** `> :not(:last-child)` (usa `margin-bottom`)
Si esto causa problemas, se recomienda migrar a Flexbox o Grid y usar `gap`.

### Uso de Variantes con Degradados

En v4, al sobrescribir parte de un degradado con una variante, los valores no sobrescritos se conservan (a diferencia de v3 donde se "reseteaba" el degradado). Puede que necesites usar `via-none` explícitamente para anular un color intermedio en un degradado de tres paradas.

### Configuración de `container`

Las opciones de configuración como `center` y `padding` para la utilidad `container` ya no existen. Para personalizar `container`, extiéndelo usando la directiva `@utility`:

```css
@utility container {
  margin-inline: auto;
  padding-inline: 2rem;
}
```

### Color de Borde por Defecto

Las utilidades `border-*` y `divide-*` ahora usan `currentColor` por defecto, en lugar de `gray-200` (v3). Especifica un color explícitamente o añade estilos base para mantener el comportamiento de v3.

### Ancho y Color de `ring` por Defecto

* El ancho de `ring` ha cambiado de `3px` a `1px`.
* El color por defecto de `ring` ha cambiado de `blue-500` a `currentColor`.
Reemplaza `ring` con `ring-3` y especifica `ring-blue-500` si dependías del color por defecto.

### Cambios en Preflight (Estilos Base)

* **Nuevo color de `placeholder` por defecto:** Ahora usa el color de texto actual con 50% de opacidad (antes `gray-400`).
* **Los botones usan el cursor por defecto:** `cursor: default` en lugar de `cursor: pointer`.
* **Márgenes de `dialog` eliminados:** Preflight ahora resetea los márgenes en elementos `<dialog>`.

### Uso de un Prefijo

Los prefijos ahora se parecen a las variantes y siempre van al principio del nombre de la clase:
`<div class="tw:flex tw:bg-red-500 tw:hover:bg-red-600">`
Configura tus variables de tema como si no estuvieras usando un prefijo. Las variables CSS generadas incluirán el prefijo.

### Añadir Utilidades Personalizadas

La directiva `@layer utilities` y `@layer components` ya no se "secuestran". Usa la nueva API `@utility`:

```css
/* Antes */
/* @layer utilities {
  .tab-4 {
    tab-size: 4;
  }
} */

/* Ahora */
@utility tab-4 {
  tab-size: 4;
}
```
Las utilidades personalizadas ahora también se ordenan según la cantidad de propiedades que definen.

### Orden de Apilamiento de Variantes

En v3, las variantes apiladas se aplicaban de derecha a izquierda. En v4, se aplican de izquierda a derecha (similar a la sintaxis CSS). Invierte el orden de las variantes apiladas sensibles al orden.

### Variables en Valores Arbitrarios

La sintaxis para usar variables CSS como valores arbitrarios ha cambiado de corchetes a paréntesis:

```html
<!-- Antes -->
<!-- <div class="bg-[--brand-color]"></div> -->

<!-- Ahora -->
<div class="bg-(--brand-color)"></div>
```

### Estilos `hover` en Móviles

La variante `hover` ahora solo se aplica cuando el dispositivo de entrada principal admite `hover`. Para mantener el comportamiento anterior (donde el toque activaba `hover`), puedes sobrescribir la variante `hover`:

```css
@custom-variant hover (&:hover);
```
Generalmente, se recomienda tratar la funcionalidad `hover` como una mejora.

### Transición de `outline-color`

Las utilidades `transition` y `transition-colors` ahora incluyen la propiedad `outline-color`. Asegúrate de establecer el color del contorno incondicionalmente o explícitamente para ambos estados para evitar transiciones no deseadas desde el color por defecto.

### Deshabilitar Plugins del Núcleo (`corePlugins`)

La opción `corePlugins` para deshabilitar utilidades ya no es compatible.

### Uso de la Función `theme()`

Se recomienda usar variables CSS en lugar de la función `theme()` siempre que sea posible:

```css
.my-class {
  /* Antes */
  /* background-color: theme(colors.red.500); */

  /* Ahora */
  background-color: var(--color-red-500);
}
```
Para casos donde `theme()` aún es necesario (ej. media queries), usa el nombre de la variable CSS en lugar de la notación de puntos:

```css
/* Antes */
/* @media (width >= theme(screens.xl)) { ... } */

/* Ahora */
@media (width >= theme(--breakpoint-xl)) { ... }
```

### Uso de un Archivo de Configuración JavaScript

Los archivos de configuración JavaScript (`tailwind.config.js`) aún son compatibles pero ya no se detectan automáticamente. Cárgalos explícitamente usando la directiva `@config`:

```css
@config "../../tailwind.config.js";
```
Las opciones `corePlugins`, `safelist` y `separator` de la configuración basada en JavaScript no son compatibles en v4.0.

### Valores del Tema en JavaScript

La función `resolveConfig` ha sido eliminada. Usa las variables CSS generadas directamente en tu JavaScript. Puedes obtener el valor de una variable CSS con `getComputedStyle`:

```javascript
let styles = getComputedStyle(document.documentElement);
let shadow = styles.getPropertyValue("--shadow-xl");
```

### Uso de `@apply` con Vue, Svelte o Módulos CSS

Las hojas de estilo empaquetadas por separado (ej. bloques `<style>` en Vue/Svelte, archivos de módulos CSS) no tienen acceso a variables de tema, utilidades personalizadas y variantes personalizadas definidas en otros archivos. Usa `@reference` para importarlas:

```vue
<style>
  @reference "../../app.css";
  h1 {
    @apply text-2xl font-bold text-red-500;
  }
</style>
```
Alternativamente, usa directamente las variables CSS del tema.

### Uso con Sass, Less y Stylus

Tailwind CSS v4.0 no está diseñado para usarse con preprocesadores CSS como Sass, Less o Stylus. Piensa en Tailwind CSS como tu preprocesador.

Esta es una guía resumida. Para obtener todos los detalles, consulta la [documentación oficial de actualización de Tailwind CSS](https://tailwindcss.com/docs/upgrade-guide).

## Añadir Estilos Personalizados (Resumen de https://tailwindcss.com/docs/adding-custom-styles)

### Personalizar tu Tema

Usa la directiva `@theme` en tu CSS para modificar la paleta de colores, escalas de espaciado, tipografía, breakpoints, etc.

```css
@theme {
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 120rem;
  --color-avocado-100: oklch(0.99 0 0);
  /* ... más personalizaciones ... */
}
```
Consulta la [documentación de variables de tema](https://tailwindcss.com/docs/theme) para más detalles.

### Usar Valores Arbitrarios

Para casos donde necesitas un valor específico que no está en tu tema, usa la notación de corchetes.

```html
<div class="top-[117px] lg:top-[344px]"></div>
<div class="bg-[#bada55] text-[22px] before:content-['Festivus']"></div>
```
Si usas variables CSS, puedes usar una sintaxis abreviada:
```html
<div class="fill-(--my-brand-color)"></div> <!-- Equivalente a fill-[var(--my-brand-color)] -->
```

#### Propiedades Arbitrarias
Para propiedades CSS que Tailwind no incluye, usa corchetes:
```html
<div class="[mask-type:luminance] hover:[mask-type:alpha]"></div>
<div class="[--scroll-offset:56px] lg:[--scroll-offset:44px]"></div>
```

#### Variantes Arbitrarias
Modifica selectores sobre la marcha:
```html
<li class="lg:[&:nth-child(-n+3)]:hover:underline">{item}</li>
```
Más información en [variantes arbitrarias](https://tailwindcss.com/docs/hover-focus-and-other-states#using-arbitrary-variants).

#### Manejo de Espacios en Blanco
Usa guiones bajos (`_`) en lugar de espacios en valores arbitrarios; Tailwind los convertirá.
```html
<div class="grid grid-cols-[1fr_500px_2fr]"></div> <!-- grid-cols-[1fr 500px 2fr] -->
```
Si el guion bajo es necesario y un espacio no es válido (ej. URLs), se preservará.
```html
<div class="bg-[url('/what_a_rush.png')]"></div>
```
Para forzar un guion bajo, escápalo con `\`:
```html
<div class="before:content-['hello\\_world']"></div>
```
En JSX, usa `String.raw()`:
```jsx
<div className={String.raw`before:content-['hello\\_world']`}></div>
```

#### Resolver Ambigüedades
Tailwind generalmente infiere la propiedad CSS (ej. `text-[22px]` es `font-size`, `text-[#bada55]` es `color`).
Si es ambiguo (ej. con variables CSS), puedes "sugerir" el tipo:
```html
<div class="text-(length:--my-var)"></div> <!-- font-size -->
<div class="text-(color:--my-var)"></div> <!-- color -->
```

### Usar CSS Personalizado

Puedes escribir CSS plano cuando lo necesites.

```css
@import "tailwindcss";

.my-custom-style {
  /* ... */
}
```

#### Añadir Estilos Base
Añade clases a `<html>` o `<body>` para defaults globales:
```html
<html lang="en" class="bg-gray-100 font-serif text-gray-900">
```
O usa la directiva `@layer base` para estilos por defecto de elementos HTML específicos:
```css
@layer base {
  h1 {
    font-size: var(--text-2xl);
  }
  h2 {
    font-size: var(--text-xl);
  }
}
```

#### Añadir Clases de Componentes
Usa `@layer components` para clases más complejas (ej. `card`, `btn`) que aún quieras poder sobrescribir con utilidades.
```css
@layer components {
  .card {
    background-color: var(--color-white);
    border-radius: var(--rounded-lg);
    padding: var(--spacing-6);
    box-shadow: var(--shadow-xl);
  }
}
```
```html
<div class="card rounded-none"></div> <!-- Tarjeta con esquinas cuadradas -->
```
Considera las recomendaciones sobre [manejo de duplicación](https://tailwindcss.com/docs/styling-with-utility-classes#managing-duplication).
También es útil para estilos de componentes de terceros:
```css
@layer components {
  .select2-dropdown {
    /* ... */
  }
}
```

#### Usar Variantes en CSS Personalizado
Usa la directiva `@variant` para aplicar una variante de Tailwind dentro de CSS personalizado:
```css
/* app.css */
.my-element {
  background: white;
  @variant dark {
    background: black;
  }
}

/* CSS Compilado */
.my-element {
  background: white;
}
@media (prefers-color-scheme: dark) {
  .my-element {
    background: black;
  }
}
```
Para múltiples variantes, anídalas.

### Añadir Utilidades Personalizadas

#### Utilidades Simples
Usa la directiva `@utility` para añadir tus propias utilidades.
```css
@utility content-auto {
  content-visibility: auto;
}
```
```html
<div class="content-auto hover:content-auto"></div>
```
Se insertan automáticamente en la capa `utilities`.

#### Utilidades Complejas
Usa anidamiento para utilidades más complejas:
```css
@utility scrollbar-hidden {
  &::-webkit-scrollbar {
    display: none;
  }
}
```

#### Utilidades Funcionales
Registra utilidades que aceptan un argumento usando la función especial `--value()`.

*   **Coincidencia con Valores del Tema:** `tab-size: --value(--tab-size-*);` (coincidirá con `tab-2`, `tab-github` si están definidos en `@theme`).
*   **Valores Simples (Bare values):** `tab-size: --value(integer);` (coincidirá con `tab-1`, `tab-76`).
*   **Valores Literales:** `tab-size: --value('inherit', 'initial', 'unset');`
*   **Valores Arbitrarios:** `tab-size: --value([integer]);` (coincidirá con `tab-[1]`, `tab-[76]`).
*   **Soporte Combinado:** Puedes usar múltiples declaraciones `--value()` o pasar múltiples argumentos a una sola función `--value(--tab-size-*, integer, [integer]);`.
*   **Valores Negativos:** Registra utilidades separadas para positivo y negativo.
*   **Modificadores:** Usa la función `--modifier()`: `line-height: --modifier(--leading-*, [length], [*]);`.
*   **Fracciones:** Usa el tipo de dato `ratio`: `aspect-ratio: --value(--aspect-ratio-*, ratio, [ratio]);`.
