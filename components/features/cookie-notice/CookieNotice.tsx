"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { X } from "lucide-react";

/**
 * The notice only informs — nothing on the site waits on the answer — so
 * "Sunt de acord" and the close button both retire it for good on this device.
 */
const SEEN_KEY = "crestem-cookie-notice-seen";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Storage can throw (private mode, blocked site data); treat that as "not
// stored" so the notice still shows and can still be closed for this view.
let hiddenInMemory = false;

function getClientSnapshot(): boolean {
  if (hiddenInMemory) return true;
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

// Hidden on the server and during hydration, so the notice never flashes for a
// visitor who already closed it.
function getServerSnapshot(): boolean {
  return true;
}

function hide() {
  hiddenInMemory = true;
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // The in-memory flag still hides it until the next page load.
  }
  listeners.forEach((listener) => listener());
}

export function CookieNotice() {
  const hidden = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (hidden) return null;

  return (
    <section
      aria-labelledby="cookie-notice-title"
      className="fixed inset-x-4 bottom-4 z-40 rounded-md border border-border bg-white p-4 shadow-lg sm:left-auto sm:right-6 sm:bottom-6 sm:w-96"
    >
      <div className="flex items-start justify-between gap-4">
        {/* TODO: final copy is still to be decided — placeholder text. */}
        <h2
          id="cookie-notice-title"
          className="text-sm font-semibold text-foreground"
        >
          Acest site folosește cookie-uri
        </h2>
        <button
          type="button"
          onClick={hide}
          aria-label="Închide notificarea despre cookie-uri"
          className="-m-1 shrink-0 cursor-pointer rounded p-1 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        Pentru a-ți oferi o experiență bună de navigare, utilizăm fișiere de tip
        cookie. Dacă nu ești de acord cu utilizarea cookie-urilor, poți să îți
        retragi consimțământul prin modificarea setărilor din browser-ul tău.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <button
          type="button"
          onClick={hide}
          className="cursor-pointer rounded text-sm font-semibold text-accent-strong transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong focus-visible:ring-offset-2"
        >
          Sunt de acord
        </button>
        <Link
          href="/politica-de-confidentialitate"
          className="rounded text-sm font-semibold text-foreground transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong focus-visible:ring-offset-2"
        >
          Mai multe informații
        </Link>
      </div>
    </section>
  );
}
