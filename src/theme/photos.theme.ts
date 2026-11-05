import { defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral";

/**
 * Thème de l'app : la base neutre d'Astryx (celle de SpeakCAD) sur des gris chauds et un accent
 * terre cuite. Compilé en CSS/JS par `npm run theme:build` ; ne pas éditer les fichiers générés.
 */
export const photosTheme = defineTheme({
  name: "photos",
  extends: neutralTheme,
  color: { accent: ["#B4532A", "#E3895E"], neutralStyle: "warm", contrast: "standard" },
  // Les neutres dérivés de l'accent tirent sur le pêche : des gris pierre, à peine chauds, à la place.
  tokens: {
    "--focus-outline-color": "var(--color-accent)",
    "--color-background-body": ["#F5F4F1", "#121110"],
    "--color-background-card": ["#FFFFFF", "#1C1A18"],
    "--color-background-surface": ["#FFFFFF", "#1C1A18"],
    "--color-background-popover": ["#FFFFFF", "#26231F"],
    "--color-background-muted": ["#1C19170D", "#F5F2EE0F"],
    "--color-background-inverted": ["#1C1917", "#F5F4F1"],
    "--color-border": ["#1C19171A", "#F5F2EE1A"],
    "--color-border-emphasized": ["#A8A29E", "#57534E"],
    "--color-text-primary": ["#1C1917", "#F5F2EE"],
    "--color-text-secondary": ["#57534E", "#A8A29E"],
    "--color-text-disabled": ["#A8A29E", "#57534E"],
    "--color-icon-primary": ["#1C1917", "#F5F2EE"],
    "--color-icon-secondary": ["#57534E", "#A8A29E"],
    "--color-icon-disabled": ["#A8A29E", "#57534E"],
  },
});
