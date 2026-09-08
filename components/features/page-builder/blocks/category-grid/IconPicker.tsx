"use client";

import { CATEGORY_ICONS } from "./icons";
import { CATEGORY_ICON_KEYS, type CategoryIconKey } from "./schema";

/**
 * The "Iconiță" field for a category card: a 6-column grid of the fixed icon
 * palette, the selected one outlined in blue.
 */
export function IconPicker({
  value,
  onChange,
}: {
  value: CategoryIconKey;
  onChange: (next: CategoryIconKey) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Iconiță"
      className="grid grid-cols-6 gap-2"
    >
      {CATEGORY_ICON_KEYS.map((key) => {
        const Icon = CATEGORY_ICONS[key];
        const selected = key === value;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={key}
            onClick={() => onChange(key)}
            className={`flex aspect-square items-center justify-center rounded-xl border-2 transition-colors ${
              selected
                ? "border-[#2563eb] bg-[#eef1fd] text-[#2563eb]"
                : "border-slate-200 bg-white text-[#475569] hover:border-slate-300"
            }`}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
}
