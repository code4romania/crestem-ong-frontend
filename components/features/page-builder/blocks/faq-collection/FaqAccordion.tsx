"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "./schema";

/**
 * The rendered accordion. Panels toggle independently — any number can be open
 * at once. When `primaDeschisa` is set, the first panel starts open.
 */
export function FaqAccordion({
  items,
  primaDeschisa,
}: {
  items: FaqItem[];
  primaDeschisa: boolean;
}) {
  const baseId = useId();
  const [open, setOpen] = useState<Set<number>>(() =>
    primaDeschisa && items.length > 0 ? new Set([0]) : new Set(),
  );

  const toggle = (index: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {items.map((item, index) => {
        const isOpen = open.has(index);
        const headerId = `${baseId}-h-${index}`;
        const panelId = `${baseId}-p-${index}`;

        return (
          <div
            key={index}
            className="rounded-2xl border border-border bg-white shadow-sm"
          >
            <h3>
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="text-base font-semibold text-[#162040] wrap-break-word">
                  {item.intrebare}
                </span>
                <ChevronDown
                  size={20}
                  aria-hidden
                  className={`shrink-0 text-[#475569] transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </h3>
            {isOpen ? (
              <div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                className="px-6 pb-5 text-sm leading-relaxed text-[#475569] wrap-break-word"
              >
                {item.raspuns}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
