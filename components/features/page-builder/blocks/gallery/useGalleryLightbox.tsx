"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import type { GalleryImage } from "./schema";

/**
 * Shared zoom overlay for the Gallery block, used by both the grid/masonry
 * (`GalleryLightbox`) and the carousel (`GalleryCarousel`) presentations. Call
 * `open(index)` from a tile click; render the returned `overlay` node once. The
 * overlay is a hand-rolled dialog (no dependency) with prev/next, Esc-to-close,
 * arrow-key navigation, a body-scroll lock and focus restore.
 */
export function useGalleryLightbox(images: GalleryImage[]) {
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

  const step = useCallback(
    (dir: -1 | 1) =>
      setActive((current) => {
        if (current === null) return current;
        return (current + dir + images.length) % images.length;
      }),
    [images.length],
  );

  const isOpen = active !== null;

  // Move focus into the dialog and lock body scroll while it is open. Keyed on
  // `isOpen`, not `active`, so paging between images does not yank focus back to
  // the close button on every navigation.
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
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close, step]);

  const current = active === null ? null : images[active];

  const overlay = current ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={current.alt || "Imagine mărită"}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-4 sm:p-8"
      onClick={close}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={close}
        aria-label="Închide"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X size={20} />
      </button>

      {images.length > 1 ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            step(-1);
          }}
          aria-label="Imaginea anterioară"
          className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ChevronLeft size={22} />
        </button>
      ) : null}

      <figure
        className="flex max-h-full max-w-5xl flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getMediaUrl(current.url)}
          alt={current.alt}
          className="max-h-[80vh] w-auto rounded-lg object-contain"
        />
        {current.caption ? (
          <figcaption className="mt-3 max-w-2xl text-center text-sm text-white/80 wrap-break-word">
            {current.caption}
          </figcaption>
        ) : null}
        {images.length > 1 ? (
          <p className="mt-2 text-xs text-white/50">
            {active! + 1} / {images.length}
          </p>
        ) : null}
      </figure>

      {images.length > 1 ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            step(1);
          }}
          aria-label="Imaginea următoare"
          className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ChevronRight size={22} />
        </button>
      ) : null}
    </div>
  ) : null;

  return { open, overlay };
}
