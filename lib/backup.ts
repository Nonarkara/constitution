import { parseProgress } from "./progress.ts";
import { parseMarks, type Marks } from "./marks.ts";
import { parseAnnotations, type UserAnnotations } from "./annotations.ts";
import { parseReflection, type Reflection } from "./amendment.ts";
import type { Progress } from "./learning.ts";
import { parseRead, type ReadLog } from "./knowledge.ts";
import { parsePokklong, type PokklongProgress } from "./pokklong.ts";
export type ImportedBackup = {
  progress: Progress;
  marks: Marks | null;
  annotations: UserAnnotations | null;
  reflection: Reflection | null | undefined;
  read: ReadLog | undefined; // undefined: older file, keep what this device has read
  pokklong?: PokklongProgress; // v5+
  blind?: string | null; // v5+: the unfinished blind exam, re-validated when it is opened
};
/** Validate the whole envelope before anything on the device is replaced. */
export function parseBackup(
  input: unknown,
  allowedIds: ReadonlySet<string>,
): ImportedBackup | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const value = input as Record<string, unknown>;
  if (![1, 2, 3, 4, 5].includes(value.version as number)) return null;
  const progress = parseProgress(value.progress, allowedIds);
  if (!progress) return null;
  const marks = value.version !== 1 ? parseMarks(value.marks) : null;
  const annotations =
    value.version !== 1 ? parseAnnotations(value.annotations) : null;
  let reflection: Reflection | null | undefined = undefined;
  if ((value.version as number) >= 3) {
    if (!marks || !annotations || !Object.hasOwn(value, "reflection"))
      return null;
    reflection =
      value.reflection === null ? null : parseReflection(value.reflection);
    if (value.reflection !== null && !reflection) return null;
  }
  let read: ReadLog | undefined = undefined;
  if ((value.version as number) >= 4) {
    // Local recovery may discard bad entries; an import must not silently
    // replace a person's reading history with a filtered empty object.
    if (
      !value.read ||
      typeof value.read !== "object" ||
      Array.isArray(value.read)
    )
      return null;
    for (const [key, timestamp] of Object.entries(value.read)) {
      const n = Number(key);
      if (
        !Number.isInteger(n) ||
        n < 1 ||
        n > 279 ||
        String(n) !== key ||
        typeof timestamp !== "number" ||
        !Number.isSafeInteger(timestamp) ||
        timestamp <= 0 ||
        timestamp > 8.64e15
      )
        return null;
    }
    read = parseRead(value.read) ?? undefined;
    if (!read) return null;
  }
  let pokklong: PokklongProgress | undefined = undefined;
  let blind: string | null | undefined = undefined;
  if (value.version === 5) {
    const p = value.pokklong as { answers?: unknown } | undefined;
    if (!p || typeof p !== "object" || !p.answers || typeof p.answers !== "object") return null;
    pokklong = parsePokklong(p);
    if (Object.keys(pokklong.answers).length !== Object.keys(p.answers).length) return null;
    if (value.blind !== null && (typeof value.blind !== "string" || value.blind.length > 100_000)) return null;
    blind = value.blind as string | null;
  }
  return { progress, marks, annotations, reflection, read, pokklong, blind };
}
export function createBackup(
  progress: Progress,
  marks: Marks,
  annotations: UserAnnotations,
  rawReflection: string | null,
  read: ReadLog,
  extra: { pokklong?: PokklongProgress; blind?: string | null } = {},
) {
  const reflection =
    rawReflection === null ? null : parseReflection(JSON.parse(rawReflection));
  if (rawReflection !== null && !reflection)
    throw new Error("Unreadable reflection; preserve the saved value");
  return {
    version: 5 as const,
    progress,
    marks,
    annotations,
    reflection,
    read,
    pokklong: extra.pokklong ?? { answers: {} },
    blind: extra.blind ?? null,
  };
}
