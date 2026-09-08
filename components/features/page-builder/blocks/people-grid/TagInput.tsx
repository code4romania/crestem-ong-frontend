"use client";

import { useState } from "react";
import { X } from "lucide-react";

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";

/**
 * "Taguri" editor for a person card: type a label and press Enter (or comma) to
 * add a chip; Backspace on an empty field removes the last one. Trims input and
 * silently drops blanks and duplicates.
 */
export function TagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [text, setText] = useState("");

  const commit = () => {
    const tag = text.trim();
    setText("");
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
  };

  const removeAt = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  return (
    <div>
      {value.length > 0 ? (
        <ul className="mb-2 flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <li
              key={index}
              className="inline-flex items-center gap-1 rounded-full bg-[#eef1fd] py-1 pl-2.5 pr-1 text-sm text-[#2563eb]"
            >
              <span className="wrap-break-word">{tag}</span>
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`Elimină tagul ${tag}`}
                className="rounded-full p-0.5 text-[#2563eb] transition-colors hover:bg-[#dbe4fd]"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        className={inputClass}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !text && value.length > 0) {
            removeAt(value.length - 1);
          }
        }}
        onBlur={commit}
        placeholder="Adaugă un tag și apasă Enter"
      />
    </div>
  );
}
