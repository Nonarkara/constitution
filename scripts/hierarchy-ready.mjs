/** Wait for the rendered title to remain present through client hydration.
 * Do not require exactly one title: duplicate titles must reach the validator.
 * This function is also embedded verbatim in the browser probe.
 */
export function waitForHierarchy(readDocument, ready, fail, current = () => true, clock = { now: () => Date.now(), later: (fn) => { setTimeout(fn, 60); } }) {
  const started = clock.now();
  let previous = null, stableSince = started;
  function poll() {
    if (!current()) return;
    const d = readDocument();
    const main = d?.querySelector('main#content') || d?.querySelector('main');
    const title = main?.querySelector('h1');
    const rect = title?.getBoundingClientRect();
    const visible = d?.readyState === 'complete' && main?.getAttribute?.('data-study-ready') !== 'false' &&
      (!d.fonts || d.fonts.status === 'loaded') && rect?.width > 0 && rect?.height > 0;
    const signature = visible ? [title, rect.x, rect.y, rect.width, rect.height, main.getBoundingClientRect().height] : null;
    const same = signature && previous && signature.every((value, i) => value === previous[i]);
    if (!same) stableSince = clock.now();
    previous = signature;
    if (same && clock.now() - stableSince >= 220) return ready(d);
    if (clock.now() - started >= 12000) return fail('readiness-timeout: no stable rendered title');
    clock.later(poll);
  }
  poll();
}
