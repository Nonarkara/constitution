import { parseProgress } from "./progress.ts";
import { parseMarks, type Marks } from "./marks.ts";
import { parseAnnotations, type UserAnnotations } from "./annotations.ts";
import { parseReflection, type Reflection } from "./amendment.ts";
import type { Progress } from "./learning.ts";
import { parseRead, type ReadLog } from "./knowledge.ts";
export type ImportedBackup = {
  progress: Progress;
  marks: Marks | null;
  annotations: UserAnnotations | null;
  reflection: Reflection | null | undefined;
  read: ReadLog | undefined; // undefined: older file, keep what this device has read
};
/** Validate the whole envelope before anything on the device is replaced. */
export function parseBackup(
  input: unknown,
  allowedIds: ReadonlySet<string>,
): ImportedBackup | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const value = input as Record<string, unknown>;
  if (![1, 2, 3, 4].includes(value.version as number)) return null;
  const progress = parseProgress(value.progress, allowedIds);
  if (!progress) return null;
  const marks = value.version !== 1 ? parseMarks(value.marks) : null;
  const annotations =
    value.version !== 1 ? parseAnnotations(value.annotations) : null;
  let reflection: Reflection | null | undefined = undefined;
  if (value.version === 3 || value.version === 4) {
    if (!marks || !annotations || !Object.hasOwn(value, "reflection"))
      return null;
    reflection =
      value.reflection === null ? null : parseReflection(value.reflection);
    if (value.reflection !== null && !reflection) return null;
  }
  let read: ReadLog | undefined = undefined;
  if (value.version === 4) {
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
  return { progress, marks, annotations, reflection, read };
}
export function createBackup(
  progress: Progress,
  marks: Marks,
  annotations: UserAnnotations,
  rawReflection: string | null,
  read: ReadLog,
) {
  const reflection =
    rawReflection === null ? null : parseReflection(JSON.parse(rawReflection));
  if (rawReflection !== null && !reflection)
    throw new Error("Unreadable reflection; preserve the saved value");
  return {
    version: 4 as const,
    progress,
    marks,
    annotations,
    reflection,
    read,
  };
}
