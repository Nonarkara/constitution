import type { Lang } from "./i18n";
export const ASK_ORIGIN =
  process.env.NEXT_PUBLIC_ASK_ORIGIN ?? "https://nonwriter.nonarkara.org";
export const askLanguage = (lang: Lang) => (lang === "zh" ? "zh-Hans" : lang);

// The question rides in the fragment, which browsers never send to a server.
export function deepLink(question: string, sections: number[] = []) {
  const p = new URLSearchParams({ q: question.slice(0, 1500) });
  if (sections.length) p.set("s", sections.slice(0, 5).join(","));
  return `${ASK_ORIGIN}/#laws?${p}`;
}

// About 4.5 minutes of polling, longer than the server's own job timeout.
export const POLL_LIMIT = 60;
export const pollDelay = (attempt: number) =>
  [1500, 2000, 3000, 5000][Math.min(attempt, 3)];

export type AskOutcome =
  | "accepted"
  | "rate"
  | "refused"
  | "unavailable"
  | "invalid"
  | "server";
export function classify(status: number, body: { refused?: boolean }): AskOutcome {
  if (status === 202) return "accepted";
  if (status === 429) return "rate";
  if (status === 422 && body?.refused) return "refused";
  if (status === 503) return "unavailable";
  if (status === 400) return "invalid";
  return "server";
}

// Constitution rows are re-rendered from this app's own corpus, never the server's copy.
export function localConstitution(statutes: { cite?: string; section?: string }[] = []) {
  return statutes
    .filter((s) => s.cite?.startsWith("รธน."))
    .map((s) => Number(s.section))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 279);
}
