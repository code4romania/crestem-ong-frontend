"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { inputClass } from "@/components/features/content-editor/ContentEditorShell";

export function TagsField({
  value,
  onChange,
  suggestions,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  /** Tags already used elsewhere in the library, offered for consistency only. */
  suggestions: string[];
}) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const matches = suggestions.filter(
    (tag) => !value.includes(tag) && tag.toLowerCase().includes(draft.trim().toLowerCase()),
  );

  const add = (tag: string) => {
    const next = tag.trim();
    if (!next || value.includes(next)) {
      setDraft("");
      setOpen(false);
      return;
    }
    onChange([...value, next]);
    setDraft("");
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor="articol-etichete" className="mb-1.5 block text-xs font-semibold text-[#475569]">
        Etichete
      </label>

      {value.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-[#475569]"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((entry) => entry !== tag))}
                aria-label={`Elimină eticheta ${tag}`}
                className="text-[#5b6779] transition-colors hover:text-red-600"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <input
        id="articol-etichete"
        role="combobox"
        aria-expanded={open && matches.length > 0}
        aria-haspopup="listbox"
        aria-controls="articol-etichete-listbox"
        autoComplete="off"
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setOpen(true);
          setHighlighted(0);
        }}
        onFocus={() => {
          setOpen(true);
          setHighlighted(0);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            if (matches.length === 0) return;
            event.preventDefault();
            setOpen(true);
            setHighlighted((current) => (current + 1) % matches.length);
            return;
          }
          if (event.key === "ArrowUp") {
            if (matches.length === 0) return;
            event.preventDefault();
            setOpen(true);
            setHighlighted((current) => (current - 1 + matches.length) % matches.length);
            return;
          }
          if (event.key === "Escape") {
            setOpen(false);
            return;
          }
          if (event.key !== "Enter" && event.key !== ",") return;
          event.preventDefault();
          if (open && matches.length > 0) {
            add(matches[highlighted]);
          } else {
            add(draft);
          }
        }}
        onBlur={() => add(draft)}
        placeholder="Adaugă o etichetă și apasă Enter"
        aria-label="Adaugă o etichetă"
        className={inputClass}
      />

      {open && matches.length > 0 ? (
        <div
          id="articol-etichete-listbox"
          role="listbox"
          aria-label="Etichete existente"
          className="absolute z-20 mt-1 w-full max-w-sm max-h-56 overflow-y-auto rounded-xl border border-border bg-white py-1 shadow-lg"
        >
          {matches.map((tag, index) => (
            <button
              key={tag}
              type="button"
              role="option"
              aria-selected={index === highlighted}
              // onMouseDown fires before the input's onBlur, so the click isn't lost when the field blurs.
              onMouseDown={(event) => {
                event.preventDefault();
                add(tag);
              }}
              onMouseEnter={() => setHighlighted(index)}
              className={`block w-full truncate px-3 py-2 text-left text-sm text-[#475569] ${
                index === highlighted ? "bg-slate-50" : ""
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
