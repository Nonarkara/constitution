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
import {
  defaultAnnotations,
  loadStoredAnnotations,
  saveStoredAnnotations,
  type UserAnnotations,
} from "@/lib/annotations";
import type { ExamTarget } from "@/lib/adaptive";
import { MARKS_KEY, emptyMarks, parseMarks, type Marks } from "@/lib/marks";
import { workerMessage, type OfflineStatus } from "@/lib/offline";
import type { Lang } from "@/lib/i18n";
type State = {
  lang: Lang;
  setLang: (l: Lang) => void;
  progress: Progress;
  save: (p: Progress) => void;
  annotations: UserAnnotations;
  saveAnnotations: (a: UserAnnotations) => void;
  marks: Marks;
  saveMarks: (m: Marks) => void;
  examTarget: ExamTarget;
  setExamTarget: (t: ExamTarget) => void;
  ready: boolean;
  storageError: boolean;
  offline: OfflineStatus;
  online: boolean;
  large: boolean;
  setLarge: (b: boolean) => void;
};
const Context = createContext<State | null>(null);
export function Provider({ children }: { children: ReactNode }) {
  const [lang, setL] = useState<Lang>("th"),
    [progress, setP] = useState<Progress>(defaultProgress),
    [annotations, setA] = useState<UserAnnotations>(defaultAnnotations),
    [marks, setM] = useState<Marks>(emptyMarks),
    [examTarget, setTarget] = useState<ExamTarget>("all"),
    [ready, setReady] = useState(false),
    [storageError, setStorageError] = useState(false),
    [large, setBig] = useState(false);
  const [offline, setOffline] = useState<OfflineStatus>("unavailable");
  const [online, setOnline] = useState(true);
  useEffect(() => {
    try {
      const l = localStorage.getItem("constitution-lang");
      if (l === "th" || l === "en" || l === "zh") setL(l);
      const p = localStorage.getItem("constitution-progress");
      if (p) {
        // Load is lenient about question ids so a revised bank never wipes progress;
        // only import (Settings) is strict. Unreadable data is kept, never overwritten.
        let parsed: Progress | null = null;
        try {
          parsed = parseProgress(JSON.parse(p));
        } catch {}
        if (parsed) setP(parsed);
        else {
          localStorage.setItem(`constitution-progress-backup-${Date.now()}`, p);
          setStorageError(true);
        }
      }
      setBig(localStorage.getItem("constitution-large") === "true");
      setA(loadStoredAnnotations());
      const storedMarks = localStorage.getItem(MARKS_KEY);
      if (storedMarks) {
        let parsedMarks: Marks | null = null;
        try {
          parsedMarks = parseMarks(JSON.parse(storedMarks));
        } catch {}
        if (parsedMarks) setM(parsedMarks);
        else localStorage.setItem(`${MARKS_KEY}-backup-${Date.now()}`, storedMarks);
      }
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
    const syncOnline = () => setOnline(navigator.onLine);
    syncOnline();
    window.addEventListener("online", syncOnline);
    window.addEventListener("offline", syncOnline);
    // Development assets change in place and must never enter the offline cache.
    if (process.env.NODE_ENV === "production") {
      if (!("serviceWorker" in navigator)) {
        setOffline("unsupported");
        return () => {
          window.removeEventListener("online", syncOnline);
          window.removeEventListener("offline", syncOnline);
        };
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
      return () => {
        window.removeEventListener("online", syncOnline);
        window.removeEventListener("offline", syncOnline);
        navigator.serviceWorker.removeEventListener("controllerchange", check);
      };
    }
    return () => {
      window.removeEventListener("online", syncOnline);
      window.removeEventListener("offline", syncOnline);
    };
  }, []);
  // Another tab saved: adopt its state instead of overwriting it on our next save.
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === "constitution-progress" && e.newValue) {
        try {
          const parsed = parseProgress(JSON.parse(e.newValue));
          if (parsed) setP(parsed);
        } catch {}
      }
      if (e.key === "constitution-annotations") setA(loadStoredAnnotations());
      if (e.key === MARKS_KEY && e.newValue) {
        try {
          const parsedMarks = parseMarks(JSON.parse(e.newValue));
          if (parsedMarks) setM(parsedMarks);
        } catch {}
      }
      if (e.key === "constitution-lang" && (e.newValue === "th" || e.newValue === "en" || e.newValue === "zh"))
        setL(e.newValue);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
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
  const saveMarks = (m: Marks) => {
    setM(m);
    try {
      localStorage.setItem(MARKS_KEY, JSON.stringify(m));
    } catch {
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
        marks,
        saveMarks,
        examTarget,
        setExamTarget: setExamGoal,
        ready,
        storageError,
        offline,
        online,
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
