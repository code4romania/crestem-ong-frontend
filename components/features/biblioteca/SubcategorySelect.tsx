"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { inputClass } from "@/components/features/content-editor/ContentEditorShell";
import type { LibraryCategory } from "@/lib/api/library-categories-types";

export function SubcategorySelect({
  groups,
  value,
  onChange,
}: {
  /** Categories with at least one subcategory — see ArticleForm's `groups`. */
  groups: LibraryCategory[];
  value: string;
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const flatOptions = groups.flatMap((category) =>
    category.copii.map((child) => ({ ...child, categoryNume: category.nume })),
  );
  const selected = flatOptions.find((option) => option.documentId === value);

  const openDropdown = () => {
    const index = flatOptions.findIndex((option) => option.documentId === value);
    setHighlighted(index >= 0 ? index : 0);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (flatOptions.length === 0) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlighted((current) => (current + 1) % flatOptions.length);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlighted((current) => (current - 1 + flatOptions.length) % flatOptions.length);
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const option = flatOptions[highlighted];
        if (option) {
          onChange(option.documentId);
          setOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, highlighted, flatOptions, onChange]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id="articol-subcategorie"
        onClick={() => (open ? setOpen(false) : openDropdown())}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`${inputClass} flex w-full items-center justify-between gap-2 text-left`}
      >
        <span className={`truncate ${selected ? "" : "text-muted-foreground"}`}>
          {selected ? selected.nume : "Alege o subcategorie…"}
        </span>
        <ChevronDown size={16} className="shrink-0 text-muted-foreground" />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Subcategorie"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-white py-1 shadow-lg"
        >
          {groups.map((category) => (
            <div key={category.documentId}>
              <p className="sticky top-0 bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#334155]">
                {category.nume}
              </p>
              {category.copii.map((child) => {
                const index = flatOptions.findIndex(
                  (option) => option.documentId === child.documentId,
                );
                const isHighlighted = index === highlighted;
                const isSelected = child.documentId === value;
                return (
                  <button
                    key={child.documentId}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    // onMouseDown fires before the trigger's blur/click-outside handling.
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onChange(child.documentId);
                      setOpen(false);
                    }}
                    onMouseEnter={() => setHighlighted(index)}
                    className={`block w-full truncate px-3 py-2 text-left text-sm text-[#475569] ${
                      isHighlighted ? "bg-slate-50" : ""
                    } ${isSelected ? "font-medium" : ""}`}
                  >
                    {child.nume}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
