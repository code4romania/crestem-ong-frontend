import { Quote } from "lucide-react";
import type { Testimonial } from "./schema";
import { RichTextContent } from "../../rich-text/RichTextContent";

/**
 * One testimonial card — the shared visual for both the grid and the carousel.
 * Pure (no hooks, no `"use client"`) so the grid renders on the server and the
 * client carousel can import it unchanged. The attribution is optional and the
 * caption is dropped entirely when none of its fields are filled.
 */
export function TestimonialCard({ item }: { item: Testimonial }) {
  const meta = [item.functie, item.organizatie].filter(Boolean).join(" · ");

  return (
    <figure className="flex h-full min-w-0 flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border">
      <Quote
        size={28}
        className="shrink-0"
        style={{ color: "#007d58" }}
        aria-hidden
      />
      <RichTextContent
        as="blockquote"
        html={item.testimonial}
        className="mt-4 flex-1 text-sm leading-relaxed text-[#475569] wrap-break-word"
      />
      {item.nume || meta ? (
        <figcaption className="mt-5 min-w-0">
          {item.nume ? (
            <span className="block text-sm font-semibold text-[#1c1c81] wrap-break-word">
              {item.nume}
            </span>
          ) : null}
          {meta ? (
            <span className="block text-xs text-[#5b6779] wrap-break-word">
              {meta}
            </span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
