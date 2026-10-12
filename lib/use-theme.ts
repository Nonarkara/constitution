"use client";
import { useEffect, useState } from "react";
import { THEME_KEY, type Theme, type ThemeChoice } from "./theme";

declare global {
  interface Window {
    __applyTheme?: () => void;
  }
}

/** The stored choice and the theme actually showing. */
export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>("auto");
  const [shown, setShown] = useState<Theme>("light");
  useEffect(() => {
    const read = () => {
      const d = document.documentElement.dataset;
      setChoice((d.themeChoice as ThemeChoice) ?? "auto");
      setShown((d.theme as Theme) ?? "light");
    };
    read();
    const watch = new MutationObserver(read);
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const sync = (e: StorageEvent) => e.key === THEME_KEY && window.__applyTheme?.();
    window.addEventListener("storage", sync);
    return () => {
      watch.disconnect();
      window.removeEventListener("storage", sync);
    };
  }, []);
  const choose = (c: ThemeChoice) => {
    try {
      if (c === "auto") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, c);
      window.__applyTheme?.();
    } catch {
      // Storage blocked: the theme still applies for this visit.
      if (c !== "auto") document.documentElement.dataset.theme = c;
    }
    setChoice(c);
  };
  return { choice, shown, choose };
}
