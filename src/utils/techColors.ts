export interface TechColorEntry {
  bg: string;
  text: string;
  border?: string;
}

export const techColorMap: Record<string, TechColorEntry> = {
  HTML: { bg: "#E34F26", text: "text-white" },
  CSS: { bg: "#1572B6", text: "text-white" },
  JavaScript: { bg: "#F7DF1E", text: "text-black" },
  TypeScript: { bg: "#3178C6", text: "text-white" },
  Angular: { bg: "#DD0031", text: "text-white" },
  React: { bg: "#61DAFB", text: "text-black" },
  ".NET": { bg: "#512BD4", text: "text-white" },
  Java: { bg: "#007396", text: "text-white" },
  "Node.js": { bg: "#339933", text: "text-white" },
  MongoDB: { bg: "#47A248", text: "text-white" },
  "SQL Server": { bg: "#CC2927", text: "text-white" },
  MySQL: { bg: "#4479A1", text: "text-white" },
  Firebase: { bg: "#FFCA28", text: "text-black" },
  Tailwind: { bg: "#06B6D4", text: "text-black" },
  Tailwindcss: { bg: "#06B6D4", text: "text-black" },
  Bootstrap: { bg: "#7952B3", text: "text-white" },
  Astro: { bg: "#FF5D01", text: "text-white" },
  "Next.js": { bg: "#000000", text: "text-white" },
  "Azure DevOps": { bg: "#0078D4", text: "text-white" },
  GitHub: { bg: "#181717", text: "text-white" },
  Git: { bg: "#F05032", text: "text-white" },
  Docker: { bg: "#2496ED", text: "text-white" },
  Vercel: { bg: "#000000", text: "text-white" },
  Mdx: { bg: "#F9A825", text: "text-black" },
  "Clean Code": { bg: "#A4C639", text: "text-black" },
  "Reactive Forms": { bg: "#DD0031", text: "text-white" },
  "API Gemini": { bg: "#4285F4", text: "text-white" },
  "API GEMINI": { bg: "#4285F4", text: "text-white" },
  "Three.js": { bg: "#000000", text: "text-white" },
  Resend: { bg: "#000000", text: "text-white" },
  "Google Ads": { bg: "#4285F4", text: "text-white" },
  "Google Analytics": { bg: "#E37400", text: "text-white" },
  "Oracle SQL": { bg: "#F80000", text: "text-white" },
  "PL/SQL": { bg: "#F80000", text: "text-white" },
  "C#": { bg: "#239120", text: "text-white" },
  C: { bg: "#A8B9CC", text: "text-black" },
  Figma: { bg: "#F24E1E", text: "text-white" },
  "Angular Material": { bg: "#DD0031", text: "text-white" },
  default: {
    bg: "bg-light-card-bg dark:bg-dark-card-bg",
    text: "text-light-text dark:text-dark-text",
    border: "border border-light-border dark:border-dark-border",
  },
};

export function hexToRgba(hex: string, alpha: number = 1): string {
  let r = 0, g = 0, b = 0;
  const hexValue = hex.startsWith("#") ? hex.slice(1) : hex;
  if (hexValue.length === 3) {
    r = parseInt(hexValue[0] + hexValue[0], 16);
    g = parseInt(hexValue[1] + hexValue[1], 16);
    b = parseInt(hexValue[2] + hexValue[2], 16);
  } else if (hexValue.length === 6) {
    r = parseInt(hexValue.slice(0, 2), 16);
    g = parseInt(hexValue.slice(2, 4), 16);
    b = parseInt(hexValue.slice(4, 6), 16);
  } else {
    return `rgba(0,0,0,0)`;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
