import type { Lang } from "./i18n";

export type Theme = "light" | "mild" | "dark" | "contrast";
export type ThemeChoice = Theme | "auto";
export const THEME_KEY = "constitution-theme";
export const THEMES: Theme[] = ["light", "mild", "dark", "contrast"];
// Paper and ink per theme, for the swatch buttons and the browser bar. globals.css is the source.
export const SWATCH: Record<Theme, { paper: string; ink: string }> = {
  light: { paper: "#ffffff", ink: "#24251f" },
  mild: { paper: "#f3ecdc", ink: "#332e22" },
  dark: { paper: "#15140f", ink: "#e6e1d3" },
  contrast: { paper: "#ffffff", ink: "#000000" },
};
export const THEME_NAME: Record<ThemeChoice, Record<Lang, string>> = {
  auto: { th: "ตามอุปกรณ์", en: "Match device", zh: "跟随设备" },
  light: { th: "สว่าง", en: "Light", zh: "浅色" },
  mild: { th: "ถนอมสายตา", en: "Mild", zh: "柔和" },
  dark: { th: "กลางคืน", en: "Dark", zh: "深色" },
  contrast: { th: "ตัดกันชัด", en: "High contrast", zh: "高对比" },
};

// Runs inline in <head> before first paint, so a dark-room reader never sees a white flash.
// Keep it in step with resolve() below.
export const themeScript = `(function(){var d=document.documentElement,k=${JSON.stringify(THEME_KEY)},s=${JSON.stringify(
  Object.fromEntries(THEMES.map((t) => [t, SWATCH[t].paper])),
)};function m(q){return window.matchMedia&&matchMedia(q).matches}function a(){var c="auto";try{c=localStorage.getItem(k)||"auto"}catch(e){}var t=c!=="auto"&&s[c]?c:m("(prefers-contrast: more)")?"contrast":m("(prefers-color-scheme: dark)")?"dark":"light";d.dataset.theme=t;d.dataset.themeChoice=s[c]?c:"auto";var n=document.querySelector('meta[name="theme-color"]');if(n)n.setAttribute("content",s[t])}a();window.__applyTheme=a;document.addEventListener("DOMContentLoaded",a);if(window.matchMedia){matchMedia("(prefers-color-scheme: dark)").addEventListener("change",a);matchMedia("(prefers-contrast: more)").addEventListener("change",a)}})();`;
