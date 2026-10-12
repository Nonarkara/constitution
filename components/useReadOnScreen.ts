"use client";
import { useEffect } from "react";
import { useStudy } from "./Provider";
/**
 * A section counts as read once its text has held the screen for four seconds:
 * most of the paragraph visible, or a long paragraph filling half the screen.
 * Scrolling past does not count. Marks every `[data-read="<section>"]` on the page.
 */
export function useReadOnScreen(key: unknown) {
  const { noteRead } = useStudy();
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const timers = new Map<number, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const n = Number((e.target as HTMLElement).dataset.read);
          const view = e.rootBounds?.height ?? window.innerHeight;
          const reading = e.isIntersecting && (e.intersectionRatio >= 0.6 || e.intersectionRect.height >= view * 0.5);
          if (reading && !timers.has(n)) timers.set(n, window.setTimeout(() => noteRead(n), 4000));
          if (!reading && timers.has(n)) {
            clearTimeout(timers.get(n));
            timers.delete(n);
          }
        }
      },
      { threshold: [0, 0.25, 0.5, 0.6, 0.8, 1] },
    );
    document.querySelectorAll<HTMLElement>("[data-read]").forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      timers.forEach((t) => clearTimeout(t));
    };
    // noteRead updates through a functional setter, so an older closure stays correct.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
