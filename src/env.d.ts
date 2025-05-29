/// <reference types="astro/client" />
declare module '*.json' {
    const value: any;
    export default value;
}

declare global {
  interface Window {
    toggleThemeAndIcons?: () => void;
    updateThemeIcons?: (isDark: boolean) => void;
  }
}