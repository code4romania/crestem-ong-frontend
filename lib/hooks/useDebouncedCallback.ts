import { useCallback, useEffect, useRef } from "react";

/**
 * Debounces calls to `callback` by `delayMs`. Returns a stable `debounced`
 * function to call on every keystroke, plus `cancel` for callers that need to
 * drop a pending call — e.g. a sibling filter changing immediately and
 * flushing/discarding an in-flight search debounce — and `isPending`, a
 * synchronous (non-reactive) check of whether a call is currently scheduled,
 * for callers that need to read it during render (e.g. reconciling an
 * external prop against in-flight local state).
 */
export function useDebouncedCallback<A extends unknown[]>(
  callback: (...args: A) => void,
  delayMs: number,
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Refs are only ever read/written outside of render (here, after commit) —
  // never during render itself, which React (and its compiler) disallow.
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const debounced = useCallback(
    (...args: A) => {
      cancel();
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        callbackRef.current(...args);
      }, delayMs);
    },
    [cancel, delayMs],
  );

  const isPending = useCallback(() => timeoutRef.current !== null, []);

  return { debounced, cancel, isPending };
}
