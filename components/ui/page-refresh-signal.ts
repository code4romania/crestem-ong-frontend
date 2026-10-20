/**
 * Announces that the page the visitor is already on was asked to reload itself
 * — pressing the menu entry of the current page.
 *
 * `router.refresh()` alone re-fetches the server components but reconciles them
 * into the tree that is already mounted, so client state, scroll position and
 * the enter animation all survive. Navigating to a *different* page remounts
 * everything instead, and that is the behaviour visitors expect here, so
 * `PageTransition` listens to this signal and changes its key.
 *
 * A plain listener set rather than a DOM event: it needs no `window`, which
 * keeps it testable and safe to import during server rendering.
 */
type Listener = () => void;

const listeners = new Set<Listener>();

/** Subscribes to same-page refreshes; call the returned function to stop. */
export function onPageRefresh(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitPageRefresh() {
  // Copied first so a listener that unsubscribes while running cannot disturb
  // the iteration.
  for (const listener of [...listeners]) listener();
}
