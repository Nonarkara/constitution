export type HighlightColor = "amber" | "mint" | "coral" | "sky";

export type SectionAnnotation = {
  section: number;
  highlight?: HighlightColor;
  note?: string;
  updatedAt: number;
};

export type UserAnnotations = Record<number, SectionAnnotation>;

const STORAGE_KEY = "constitution-annotations";

export function defaultAnnotations(): UserAnnotations {
  return {};
}

export function parseAnnotations(input: unknown): UserAnnotations | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const raw = input as Record<string, unknown>;
  const result: UserAnnotations = {};

  for (const [key, value] of Object.entries(raw)) {
    const secNum = Number(key);
    if (!Number.isInteger(secNum) || secNum < 1 || secNum > 279) continue;
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;

    const item = value as Record<string, unknown>;
    const highlight =
      item.highlight === "amber" ||
      item.highlight === "mint" ||
      item.highlight === "coral" ||
      item.highlight === "sky"
        ? item.highlight
        : undefined;

    const note =
      typeof item.note === "string" && item.note.trim().length > 0
        ? item.note.slice(0, 5000)
        : undefined;

    const updatedAt =
      typeof item.updatedAt === "number" && Number.isFinite(item.updatedAt)
        ? item.updatedAt
        : Date.now();

    if (highlight || note) {
      result[secNum] = {
        section: secNum,
        highlight,
        note,
        updatedAt,
      };
    }
  }

  return result;
}

export function loadStoredAnnotations(): UserAnnotations {
  if (typeof localStorage === "undefined") return defaultAnnotations();
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return defaultAnnotations();
    return parseAnnotations(JSON.parse(data)) ?? defaultAnnotations();
  } catch {
    return defaultAnnotations();
  }
}

export function saveStoredAnnotations(annotations: UserAnnotations): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
    return true;
  } catch {
    return false;
  }
}

export function updateSectionAnnotation(
  current: UserAnnotations,
  section: number,
  patch: { highlight?: HighlightColor | null; note?: string | null },
  now = Date.now(),
): UserAnnotations {
  if (!Number.isInteger(section) || section < 1 || section > 279) return current;

  const existing = current[section] ?? { section, updatedAt: now };
  const updatedHighlight =
    patch.highlight === null
      ? undefined
      : patch.highlight !== undefined
        ? patch.highlight
        : existing.highlight;

  const updatedNote =
    patch.note === null
      ? undefined
      : patch.note !== undefined
        ? patch.note.trim()
        : existing.note;

  const next = { ...current };

  if (!updatedHighlight && !updatedNote) {
    delete next[section];
  } else {
    next[section] = {
      section,
      highlight: updatedHighlight,
      note: updatedNote,
      updatedAt: now,
    };
  }

  return next;
}
