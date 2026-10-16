// Everything this notebook keeps about a learner lives in localStorage under two prefixes.
// Preferences (theme, language, text size) describe the device, not the learner.
type Store = Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length">;

export const DEVICE_PREFERENCES = ["constitution-theme", "constitution-lang", "constitution-large"];
const LEARNER = /^(constitution-|pokklong-)/;

export function learnerKeys(store: Store): string[] {
  const keys: string[] = [];
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (key && LEARNER.test(key) && !DEVICE_PREFERENCES.includes(key)) keys.push(key);
  }
  return keys;
}

/** "Start again on this device": every note, answer, reflection and backup copy goes. */
export function eraseLearnerData(store: Store): number {
  const keys = learnerKeys(store);
  for (const key of keys) store.removeItem(key);
  return keys.length;
}

/**
 * Keep an unreadable value before anything could replace it. The same value is never copied
 * twice (a reload used to add a full copy every time), and only the newest `limit` copies stay.
 */
export function keepBackup(store: Store, key: string, raw: string, now = Date.now(), limit = 3): void {
  const prefix = `${key}-backup-`;
  const copies = learnerKeys(store)
    .filter((k) => k.startsWith(prefix) && /^\d+$/.test(k.slice(prefix.length)))
    .sort((a, b) => Number(a.slice(prefix.length)) - Number(b.slice(prefix.length)));
  if (copies.some((k) => store.getItem(k) === raw)) return;
  store.setItem(prefix + now, raw);
  copies.push(prefix + now);
  for (const old of copies.slice(0, Math.max(0, copies.length - limit))) store.removeItem(old);
}
