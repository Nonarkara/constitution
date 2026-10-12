import graph from "../data/graph.json" with { type: "json" };
import type { Lang } from "./i18n.ts";

type Label = Record<Lang, string>;
export type GroupKind = "topic" | "term" | "question";
/**
 * Why two sections are connected. "cites"/"cited-by" come from the legal text itself;
 * topic, term and question come from this notebook's own index and are shown as such.
 */
export type Reason =
  | { kind: "cites" | "cited-by" }
  | { kind: GroupKind; id: string; label: Label };
export type Neighbour = { n: number; reasons: Reason[]; weight: number };
export type CaseRef = { id: string; sections: number[]; prompt: Label };

const g = graph as unknown as {
  xref: [number, number][];
  groups: [GroupKind, string, Label, number[]][];
  lead: string[];
  cases: [string, number[], Label][];
};
// The text naming a section always outranks any mix of index groupings (2 + 2 + 1 < 6).
const WEIGHT = { cites: 6, "cited-by": 6, term: 2, topic: 2, question: 1 } as const;

const adjacency = new Map<number, Map<number, Reason[]>>();
function link(a: number, b: number, reason: Reason) {
  if (a === b) return;
  const row = adjacency.get(a) ?? new Map<number, Reason[]>();
  adjacency.set(a, row);
  row.set(b, [...(row.get(b) ?? []), reason]);
}
for (const [from, to] of g.xref) {
  link(from, to, { kind: "cites" });
  link(to, from, { kind: "cited-by" });
}
for (const [kind, id, label, sections] of g.groups)
  for (const a of sections) for (const b of sections) link(a, b, { kind, id, label });

export const crossReferences = g.xref;
export const cases: CaseRef[] = g.cases.map(([id, sections, prompt]) => ({ id, sections, prompt }));
/** The opening of a section's Thai text, the legal source. */
export const lead = (n: number) => g.lead[n - 1] ?? "";
/** How often the text of other sections names this one. */
export const citedBy = (n: number) => g.xref.filter(([, to]) => to === n).length;

/** Every section connected to n, strongest first: the text naming it beats an index grouping. */
export function neighbours(n: number): Neighbour[] {
  return [...(adjacency.get(n) ?? new Map<number, Reason[]>())]
    .map(([to, reasons]) => ({ n: to, reasons, weight: reasons.reduce((s, r) => s + WEIGHT[r.kind], 0) }))
    .sort((a, b) => b.weight - a.weight || a.n - b.n);
}
export const connected = (a: number, b: number) => adjacency.get(a)?.has(b) ?? false;

/** Groups of her sections that connect to each other, largest first. Singles are left out. */
export function clusters(lit: Iterable<number>): number[][] {
  const set = new Set(lit),
    seen = new Set<number>(),
    out: number[][] = [];
  for (const start of [...set].sort((a, b) => a - b)) {
    if (seen.has(start)) continue;
    const group: number[] = [],
      stack = [start];
    seen.add(start);
    while (stack.length) {
      const n = stack.pop()!;
      group.push(n);
      for (const m of adjacency.get(n)?.keys() ?? [])
        if (set.has(m) && !seen.has(m)) seen.add(m), stack.push(m);
    }
    if (group.length > 1) out.push(group.sort((a, b) => a - b));
  }
  return out.sort((a, b) => b.length - a.length || a[0] - b[0]);
}

/** One line of the written thread: a real link between two of her sections. */
export type ThreadLine = { a: number; b: number; reason: Reason };
/** The links inside one cluster, text citations first, each pair said once. */
export function threadLines(cluster: number[], limit = 6): ThreadLine[] {
  const inside = new Set(cluster),
    lines: ThreadLine[] = [];
  for (const a of cluster)
    for (const [b, reasons] of adjacency.get(a) ?? [])
      if (inside.has(b) && a < b) {
        const best = [...reasons].sort((x, y) => WEIGHT[y.kind] - WEIGHT[x.kind])[0];
        lines.push({ a, b, reason: best });
      }
  return lines.sort((x, y) => WEIGHT[y.reason.kind] - WEIGHT[x.reason.kind] || x.a - y.a).slice(0, limit);
}

/** Unread sections that link to several of hers: the next dots worth reading. */
export function nextDots(lit: Iterable<number>, known: Iterable<number> = lit, limit = 5) {
  const mine = new Set(lit),
    skip = new Set(known),
    count = new Map<number, number[]>();
  for (const n of mine)
    for (const m of adjacency.get(n)?.keys() ?? [])
      if (!skip.has(m)) count.set(m, [...(count.get(m) ?? []), n]);
  return [...count]
    .map(([n, via]) => ({ n, via: via.sort((a, b) => a - b) }))
    .sort((a, b) => b.via.length - a.via.length || citedBy(b.n) - citedBy(a.n) || a.n - b.n)
    .slice(0, limit);
}

/** The constitution's own hubs: the sections other sections name most often. */
export function mostCited(limit = 6) {
  const tally = new Map<number, number>();
  for (const [, to] of g.xref) tally.set(to, (tally.get(to) ?? 0) + 1);
  return [...tally].sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, limit).map(([n, times]) => ({ n, times }));
}
