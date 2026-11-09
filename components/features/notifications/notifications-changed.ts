/**
 * The unread count lives in the sidebar, the notifications that change it in
 * the page, and the two share no parent that re-renders on a server action.
 * A window event is the lightest bridge: the page announces that it marked
 * something read, the sidebar re-fetches the count.
 */
export const NOTIFICATIONS_CHANGED_EVENT = "notifications:changed";

export function emitNotificationsChanged() {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

/** Subscribes to count changes; call the returned function to stop. */
export function onNotificationsChanged(listener: () => void) {
  window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, listener);
  return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, listener);
}
