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
let coordinator: ReturnType<typeof createPlaybackCoordinator> | null = null;
export function playback() {
  return (coordinator ??= createPlaybackCoordinator(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }));
}
