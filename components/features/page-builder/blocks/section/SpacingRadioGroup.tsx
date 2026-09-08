"use client";

import type { SectionData } from "./schema";

type Spacing = SectionData["spatiereSus"];

const OPTIONS: { value: Spacing; label: string }[] = [
  { value: "mica", label: "Mică" },
  { value: "standard", label: "Standard" },
  { value: "mare", label: "Mare" },
  { value: "foarte-mare", label: "Foarte mare" },
];

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";

/**
 * A vertical list of spacing choices — one column of the "Spațiere sus /
 * Spațiere jos" pair. Native radios (visually hidden) keep arrow-key support.
 */
export function SpacingRadioGroup({
  name,
  legend,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  value: Spacing;
  onChange: (next: Spacing) => void;
}) {
  return (
    <fieldset>
      <legend className={labelClass}>{legend}</legend>
      <div className="space-y-2">
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={
                selected
                  ? "flex cursor-pointer items-center rounded-xl border border-[#2563eb] bg-[#eff6ff] px-4 py-2.5 text-sm font-medium text-[#2563eb] transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#2563eb]/30"
                  : "flex cursor-pointer items-center rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-[#162040] transition-colors hover:border-[#cbd5e1] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#2563eb]/30"
              }
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
