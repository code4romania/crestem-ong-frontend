"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { ModalPortal } from "@/components/ui/ModalPortal";
import type { Person } from "./schema";

/**
 * Detail overlay for the People Grid block. Call `open(index)` from a card
 * click; render the returned `overlay` node once. Same hand-rolled dialog shape
 * as the Gallery block's lightbox — Esc-to-close, backdrop click, body-scroll
 * lock and focus restore — but portalled to <body> (see `<ModalPortal>`) so a
 * transformed ancestor on the public page can't shrink the backdrop.
 */
export function usePersonDialog(people: Person[]) {
  const [active, setActive] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const open = useCallback((index: number) => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    setActive(index);
  }, []);

  const close = useCallback(() => {
    setActive(null);
    restoreFocusRef.current?.focus?.();
  }, []);

  const isOpen = active !== null;

  useEffect(() => {
    if (!isOpen) return;

    closeRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const current = active === null ? null : people[active];

  const overlay = current ? (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={close}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="person-dialog-title"
          className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Închide"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#162040] shadow-sm ring-1 ring-border transition-colors hover:bg-slate-100"
          >
            <X size={20} />
          </button>

          {current.imagine ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={getMediaUrl(current.imagine.url)}
              alt={current.imagineAlt || current.nume}
              className="block h-72 w-full object-cover"
            />
          ) : null}

          <div className="p-6 sm:p-8">
            <h3
              id="person-dialog-title"
              className="font-heading text-2xl font-extrabold text-[#162040] wrap-break-word"
            >
              {current.nume}
            </h3>

            {current.rol ? (
              <p className="mt-1 text-sm font-semibold text-[#2dbe8f] wrap-break-word">
                {current.rol}
              </p>
            ) : null}

            {current.organizatie ? (
              <p className="mt-0.5 text-sm text-[#64748b] wrap-break-word">
                {current.organizatie}
              </p>
            ) : null}

            {current.taguri.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {current.taguri.map((tag, index) => (
                  <span
                    key={index}
                    className="rounded-full px-2.5 py-1 text-xs font-medium wrap-break-word"
                    style={{ background: "rgba(45,190,143,0.12)", color: "#2dbe8f" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            {current.descriere ? (
              <p className="mt-5 text-sm leading-relaxed whitespace-pre-line text-[#475569] wrap-break-word">
                {current.descriere}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </ModalPortal>
  ) : null;

  return { open, overlay };
}
