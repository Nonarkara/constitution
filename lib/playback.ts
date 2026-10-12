/** A player can stop only audio it owns; a new player explicitly takes over. */
export function createPlaybackCoordinator(cancelBrowser: () => void) {
  let owner: { id: symbol; stop: () => void } | null = null;
  return {
    take(id: symbol, stop: () => void) {
      if (owner && owner.id !== id) {
        const previous = owner;
        owner = null;
        cancelBrowser();
        previous.stop();
      }
      owner = { id, stop };
    },
    stop(id: symbol) {
      if (owner?.id !== id) return;
      const previous = owner;
      owner = null;
      cancelBrowser();
      previous.stop();
    },
    release(id: symbol) {
      if (owner?.id === id) owner = null;
    },
    owns(id: symbol) {
      return owner?.id === id;
    },
  };
}
/** Clock text for a known length. Zero and NaN stay blank so the player never shows 0:00 / 0:00. */
export function formatDuration(seconds: number): string | null {
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  const remain = whole % 60;
  return `${minutes}:${String(remain).padStart(2, "0")}`;
}

let coordinator: ReturnType<typeof createPlaybackCoordinator> | null = null;
export function playback() {
  return (coordinator ??= createPlaybackCoordinator(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }));
}
