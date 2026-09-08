"use client";

import { PROPORTIE_OPTIONS, type Proportie } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";

/**
 * The "Proporție coloane" field: a vertical list of ratio options, each showing
 * a two-bar preview sized to the ratio and its numeric label. Native radios
 * (visually hidden) keep arrow-key support; styling mirrors `SpacingRadioGroup`.
 */
export function ProportionPicker({
  value,
  onChange,
}: {
  value: Proportie;
  onChange: (next: Proportie) => void;
}) {
  return (
    <fieldset>
      <legend className={labelClass}>Proporție coloane</legend>
      <div className="space-y-2">
        {PROPORTIE_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={
                selected
                  ? "flex cursor-pointer items-center gap-3 rounded-xl border border-[#2563eb] bg-[#eff6ff] px-4 py-2.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#2563eb]/30"
                  : "flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-white px-4 py-2.5 transition-colors hover:border-[#cbd5e1] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#2563eb]/30"
              }
            >
              <input
                type="radio"
                name="columns-proportie"
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className="flex min-w-0 flex-1 items-center gap-1.5"
              >
                <span
                  className="h-2.5 rounded-full bg-[#cbd5e1]"
                  style={{ flexGrow: option.ratio[0] }}
                />
                <span
                  className="h-2.5 rounded-full bg-[#e2e8f0]"
                  style={{ flexGrow: option.ratio[1] }}
                />
              </span>
              <span
                className={`shrink-0 text-sm font-semibold ${
                  selected ? "text-[#2563eb]" : "text-[#475569]"
                }`}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
