import type { ScriptSursa } from "./split";

/**
 * Events that pasted page code hangs its setup on, and that have already fired
 * by the time a block mounts. A handler registered for one of these is invoked
 * at once instead of being left waiting for an event that will never come
 * again.
 */
const ALREADY_FIRED = new Set(["DOMContentLoaded", "load", "readystatechange"]);

type AddListener = (
  type: string,
  handler: EventListenerOrEventListenerObject | null,
  options?: boolean | AddEventListenerOptions,
) => void;

interface Patchable {
  addEventListener: AddListener;
}

interface Recorded {
  target: EventTarget;
  type: string;
  handler: EventListenerOrEventListenerObject;
  options?: boolean | AddEventListenerOptions;
}

function invoke(handler: EventListenerOrEventListenerObject, event: Event) {
  try {
    if (typeof handler === "function") handler.call(document, event);
    else handler.handleEvent(event);
  } catch (error) {
    console.error("[custom-html] Handler-ul paginii a aruncat o eroare", error);
  }
}

/**
 * Runs the scripts of a `custom-html` block and returns the cleanup for them.
 *
 * Markup written through `dangerouslySetInnerHTML` never runs its own
 * `<script>` tags, so they are re-created as real elements here. Two things
 * follow from that, and both are what this function exists for:
 *
 * - The document is long past `DOMContentLoaded`, so handlers waiting on it are
 *   invoked immediately (see `ALREADY_FIRED`).
 * - The app navigates client-side, so listeners the pasted code put on
 *   `document` / `window` would survive the block's own unmount. They are
 *   recorded and removed.
 *
 * Only registrations made while one of our own scripts is the running script
 * are touched — `document.currentScript` identifies it — so a listener added by
 * the app, or by any library, is delegated through untouched. Registrations the
 * pasted code makes later, from a timer or an event handler, fall outside that
 * window and are left to the page's own lifetime.
 */
export function runScripts(host: HTMLElement, scripturi: ScriptSursa[]): () => void {
  const ours = new Set<HTMLScriptElement>();
  const recorded: Recorded[] = [];
  const restores: Array<() => void> = [];

  const patch = (target: EventTarget) => {
    const patchable = target as unknown as Patchable;
    const original = patchable.addEventListener;
    const hadOwn = Object.prototype.hasOwnProperty.call(target, "addEventListener");

    patchable.addEventListener = function (type, handler, options) {
      const current = document.currentScript;
      const isOurs = Boolean(
        handler && current && ours.has(current as HTMLScriptElement),
      );
      if (!isOurs || !handler) {
        original.call(target, type, handler, options);
        return;
      }
      if (ALREADY_FIRED.has(type)) {
        invoke(handler, new Event(type));
        return;
      }
      recorded.push({ target, type, handler, options });
      original.call(target, type, handler, options);
    };

    restores.push(() => {
      if (hadOwn) patchable.addEventListener = original;
      else delete (target as unknown as Record<string, unknown>).addEventListener;
    });
  };

  patch(document);
  patch(window);

  for (const entry of scripturi) {
    const element = document.createElement("script");
    if ("src" in entry) {
      element.src = entry.src;
      // Keeps external scripts running in the order they were pasted.
      element.async = false;
    } else {
      element.text = entry.cod;
    }
    ours.add(element);
    // Appending is what executes an inline script — synchronously, right here.
    host.append(element);
  }

  return () => {
    for (const { target, type, handler, options } of recorded) {
      target.removeEventListener(type, handler, options);
    }
    recorded.length = 0;
    for (const element of ours) element.remove();
    ours.clear();
    for (const restore of restores) restore();
    restores.length = 0;
  };
}
