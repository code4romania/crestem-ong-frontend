"use client";

import { CONTACT_ICONS } from "./icons";
import { CONTACT_ICON_KEYS, type ContactIconKey } from "./schema";

export function IconPicker({
  value,
  onChange,
}: {
  value: ContactIconKey;
  onChange: (next: ContactIconKey) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Iconiță" className="grid grid-cols-6 gap-2">
      {CONTACT_ICON_KEYS.map((key) => {
        const Icon = CONTACT_ICONS[key];
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
                ? "border-[#5656e5] bg-[#eef1fd] text-[#5656e5]"
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
