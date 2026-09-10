"use client";

import { useState } from "react";
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

  const add = () => {
    const tag = draft.trim();
    if (!tag || value.includes(tag)) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  };

  return (
    <div>
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
                className="text-[#94a3b8] transition-colors hover:text-red-600"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <input
        id="articol-etichete"
        list="etichete-existente"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== ",") return;
          event.preventDefault();
          add();
        }}
        onBlur={add}
        placeholder="Adaugă o etichetă și apasă Enter"
        aria-label="Adaugă o etichetă"
        className={inputClass}
      />
      <datalist id="etichete-existente">
        {suggestions.map((tag) => (
          <option key={tag} value={tag} />
        ))}
      </datalist>
    </div>
  );
}
