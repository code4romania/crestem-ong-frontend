"use client";

import type { SpacerData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";

/**
 * Size options, ordered small → large. `bar` is a full literal Tailwind width
 * so the scanner keeps it; it widens with the option as a visual size cue.
 */
const OPTIONS: { value: SpacerData["dimensiune"]; label: string; bar: string }[] =
  [
    { value: "mic", label: "Mic", bar: "w-8" },
    { value: "mediu", label: "Mediu", bar: "w-12" },
    { value: "mare", label: "Mare", bar: "w-16" },
    { value: "foarte-mare", label: "Foarte mare", bar: "w-20" },
  ];

export function SpacerEditor({
  value,
  onChange,
}: {
  value: SpacerData;
  onChange: (next: SpacerData) => void;
}) {
  return (
    <div className="space-y-5">
      <fieldset>
        <legend className={labelClass}>Spațiu vertical</legend>
        <div className="space-y-2">
          {OPTIONS.map((option) => {
            const selected = value.dimensiune === option.value;
            return (
              <label
                key={option.value}
                className={
                  selected
                    ? "flex cursor-pointer items-center gap-4 rounded-xl border border-[#2563eb] bg-[#eff6ff] px-4 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#2563eb]/30"
                    : "flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-white px-4 py-3 transition-colors hover:border-[#cbd5e1] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#2563eb]/30"
                }
              >
                <input
                  type="radio"
                  name="spacer-dimensiune"
                  value={option.value}
                  checked={selected}
                  onChange={() =>
                    onChange({ ...value, dimensiune: option.value })
                  }
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`h-2 shrink-0 rounded-full ${option.bar} ${
                    selected ? "bg-[#3b82f6]" : "bg-slate-200"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    selected ? "text-[#2563eb]" : "text-[#162040]"
                  }`}
                >
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
        <p className="mt-1.5 text-xs text-[#94a3b8]">
          Valorile se reduc automat pe ecrane mici.
        </p>
      </fieldset>
    </div>
  );
}
