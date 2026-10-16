/** Group digits so 40000 reads as 40,000. Smaller counts stay unchanged. */
export function formatCount(n: number): string {
  return Number.isFinite(n) ? Math.trunc(n).toLocaleString("en-US") : String(n);
}

export function enNoun(n: number, one: string, many: string): string {
  return `${formatCount(n)} ${n === 1 ? one : many}`;
}
