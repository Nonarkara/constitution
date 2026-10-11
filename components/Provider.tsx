"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { defaultProgress, type Progress } from "@/lib/learning";
import { parseProgress } from "@/lib/progress";
import type { Lang } from "@/lib/i18n";
type State = {
  lang: Lang;
  setLang: (l: Lang) => void;
  progress: Progress;
  save: (p: Progress) => void;
  ready: boolean;
  storageError: boolean;
  large: boolean;
  setLarge: (b: boolean) => void;
};
const Context = createContext<State | null>(null);
export function Provider({ children }: { children: ReactNode }) {
  const [lang, setL] = useState<Lang>("th"),
    [progress, setP] = useState<Progress>(defaultProgress),
    [ready, setReady] = useState(false),
    [storageError, setStorageError] = useState(false),
    [large, setBig] = useState(false);
  useEffect(() => {
    try {
      const l = localStorage.getItem("constitution-lang");
      if (l === "th" || l === "en" || l === "zh") setL(l);
      const p = localStorage.getItem("constitution-progress");
      if (p) {
        const parsed = parseProgress(JSON.parse(p));
        if (parsed) setP(parsed);
        else setStorageError(true);
      }
      setBig(localStorage.getItem("constitution-large") === "true");
    } catch {
      setStorageError(true);
    }
    setReady(true);
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.large = String(large);
  }, [lang, large]);
  const setLang = (l: Lang) => {
    setL(l);
    try {
      localStorage.setItem("constitution-lang", l);
    } catch {
      setStorageError(true);
    }
  };
  const save = (p: Progress) => {
    setP(p);
    try {
      localStorage.setItem("constitution-progress", JSON.stringify(p));
    } catch {
      setStorageError(true);
    }
  };
  const setLarge = (b: boolean) => {
    setBig(b);
    try {
      localStorage.setItem("constitution-large", String(b));
    } catch {
      setStorageError(true);
    }
  };
  return (
    <Context.Provider
      value={{
        lang,
        setLang,
        progress,
        save,
        ready,
        storageError,
        large,
        setLarge,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStudy() {
  const c = useContext(Context);
  if (!c) throw new Error("Missing provider");
  return c;
}
