import { Quote } from "lucide-react";
import type { Testimonial } from "./schema";

/** "Ana Moldovan" -> "AM" for the attribution avatar. */
function initials(nume: string): string {
  return nume
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * One testimonial card — the shared visual for both the grid and the carousel.
 * Pure (no hooks, no `"use client"`) so the grid renders on the server and the
 * client carousel can import it unchanged.
 */
export function TestimonialCard({ item }: { item: Testimonial }) {
  const meta = [item.functie, item.organizatie].filter(Boolean).join(" · ");

  return (
    <figure className="flex h-full min-w-0 flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border">
      <Quote
        size={28}
        className="shrink-0"
        style={{ color: "#2dbe8f" }}
        aria-hidden
      />
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-[#475569] wrap-break-word">
        {item.testimonial}
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold"
          style={{ background: "rgba(45,190,143,0.12)", color: "#2dbe8f" }}
          aria-hidden
        >
          {initials(item.nume)}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-[#162040] wrap-break-word">
            {item.nume}
          </span>
          {meta ? (
            <span className="block text-xs text-[#64748b] wrap-break-word">
              {meta}
            </span>
          ) : null}
        </span>
      </figcaption>
    </figure>
  );
}
