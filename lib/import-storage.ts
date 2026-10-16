import type { ImportedBackup } from "./backup";
export const RECOVERY_KEY = "constitution-import-recovery-v1";
type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export class ImportStorageError extends Error {
  recovered: boolean;
  constructor(recovered: boolean) {
    super("Import could not be stored");
    this.recovered = recovered;
  }
}
/** Preserve a recovery copy before mutations; adopt React state only after success. */
export function persistImport(storage: Store, backup: ImportedBackup) {
  const values: Record<string, string | null> = {
    "constitution-progress": JSON.stringify(backup.progress),
  };
  if (backup.marks !== null)
    values["constitution-marks"] = JSON.stringify(backup.marks);
  if (backup.annotations !== null)
    values["constitution-annotations"] = JSON.stringify(backup.annotations);
  if (backup.reflection !== undefined)
    values["constitution-amendment-reflection-v1"] =
      backup.reflection === null ? null : JSON.stringify(backup.reflection);
  if (backup.read !== undefined)
    values["constitution-read-v1"] = JSON.stringify(backup.read);
  if (backup.pokklong !== undefined)
    values["pokklong-progress"] = JSON.stringify(backup.pokklong);
  if (backup.blind !== undefined) values["constitution-blind-v1"] = backup.blind;
  const previous: Record<string, string | null> = {};
  try {
    for (const key of Object.keys(values)) previous[key] = storage.getItem(key);
    storage.setItem(RECOVERY_KEY, JSON.stringify(previous));
  } catch {
    throw new ImportStorageError(true);
  }
  const changed: string[] = [];
  try {
    for (const [key, value] of Object.entries(values)) {
      changed.push(key);
      if (value === null) storage.removeItem(key);
      else storage.setItem(key, value);
    }
  } catch {
    let recovered = true;
    for (const key of changed.reverse())
      try {
        const value = previous[key];
        if (value === null) storage.removeItem(key);
        else storage.setItem(key, value);
      } catch {
        recovered = false;
      }
    throw new ImportStorageError(recovered);
  }
}
