export function chapterPuzzles<T extends { id: string; chapter: number }>(
  items: readonly T[],
  chapter: number,
): T[] {
  return items
    .filter((item) => item.chapter === chapter)
    .slice()
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
