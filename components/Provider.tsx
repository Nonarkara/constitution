"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { defaultProgress, type Progress } from "@/lib/learning";
import questions from "@/data/questions.json";
import { parseProgress } from "@/lib/progress";
import {
  defaultAnnotations,
  loadStoredAnnotations,
  saveStoredAnnotations,
  type UserAnnotations,
} from "@/lib/annotations";
import type { ExamTarget } from "@/lib/adaptive";
import { workerMessage, type OfflineStatus } from "@/lib/offline";
import type { Lang } from "@/lib/i18n";
type State = {
  lang: Lang;
  setLang: (l: Lang) => void;
  progress: Progress;
  save: (p: Progress) => void;
  annotations: UserAnnotations;
  saveAnnotations: (a: UserAnnotations) => void;
  examTarget: ExamTarget;
  setExamTarget: (t: ExamTarget) => void;
  ready: boolean;
  storageError: boolean;
  offline: OfflineStatus;
  large: boolean;
  setLarge: (b: boolean) => void;
};
const Context = createContext<State | null>(null);
export function Provider({ children }: { children: ReactNode }) {
  const [lang, setL] = useState<Lang>("th"),
    [progress, setP] = useState<Progress>(defaultProgress),
    [annotations, setA] = useState<UserAnnotations>(defaultAnnotations),
    [examTarget, setTarget] = useState<ExamTarget>("all"),
    [ready, setReady] = useState(false),
    [storageError, setStorageError] = useState(false),
    [large, setBig] = useState(false);
  const [offline, setOffline] = useState<OfflineStatus>("unavailable");
  useEffect(() => {
    try {
      const l = localStorage.getItem("constitution-lang");
      if (l === "th" || l === "en" || l === "zh") setL(l);
      const p = localStorage.getItem("constitution-progress");
      if (p) {
        const parsed = parseProgress(
          JSON.parse(p),
          new Set(questions.map((q) => q.id)),
        );
        if (parsed) setP(parsed);
        else setStorageError(true);
      }
      setBig(localStorage.getItem("constitution-large") === "true");
      setA(loadStoredAnnotations());
      const savedTarget = localStorage.getItem("constitution-exam-target") as ExamTarget | null;
      if (
        savedTarget === "all" ||
        savedTarget === "ocsc" ||
        savedTarget === "governor" ||
        savedTarget === "legal" ||
        savedTarget === "civic"
      ) {
        setTarget(savedTarget);
      }
    } catch {
      setStorageError(true);
    }
    setReady(true);
    // Development assets change in place and must never enter the offline cache.
    if (process.env.NODE_ENV === "production") {
      if (!("serviceWorker" in navigator)) {
        setOffline("unsupported");
        return;
      }
      setOffline("loading");
      const check = async () => {
        try {
          const registration = await navigator.serviceWorker.ready;
          const worker = registration.active;
          if (!worker) {
            setOffline("unavailable");
            return;
          }
          const status = await workerMessage<{ ready: boolean }>(worker, {
            type: "OFFLINE_STATUS",
          });
          setOffline(status.ready ? "ready" : "unavailable");
        } catch {
          setOffline("unavailable");
        }
      };
      navigator.serviceWorker.addEventListener("controllerchange", check);
      navigator.serviceWorker
        .register("/sw.js")
        .then(check)
        .catch(() => setOffline("unavailable"));
      return () =>
        navigator.serviceWorker.removeEventListener("controllerchange", check);
    }
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
  const saveAnnotations = (a: UserAnnotations) => {
    setA(a);
    if (!saveStoredAnnotations(a)) {
      setStorageError(true);
    }
  };
  const setExamGoal = (t: ExamTarget) => {
    setTarget(t);
    try {
      localStorage.setItem("constitution-exam-target", t);
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
        annotations,
        saveAnnotations,
        examTarget,
        setExamTarget: setExamGoal,
        ready,
        storageError,
        offline,
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
