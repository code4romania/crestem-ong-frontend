"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CALLOUT_ICONS } from "./icons";
import { CALLOUT_ICON_KEYS, type CalloutIconKey } from "./schema";

/**
 * The "Iconiță" field for a Callout: a searchable grid over the fixed icon
 * palette, the selected one outlined in blue. Same visual language as
 * `feature-cards/IconPicker`, with a filter box because the palette is larger.
 */
export function IconPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: CalloutIconKey;
  onChange: (next: CalloutIconKey) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");

  const keys = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CALLOUT_ICON_KEYS;
    return CALLOUT_ICON_KEYS.filter((key) => key.includes(q));
  }, [query]);

  return (
    <div className={disabled ? "opacity-50" : undefined} aria-disabled={disabled}>
      <div className="relative mb-2">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          placeholder="Caută iconiță..."
          className="w-full rounded-xl border border-border py-2 pl-9 pr-3 text-sm focus:border-[#2dbe8f] focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 disabled:cursor-not-allowed"
        />
      </div>

      {keys.length === 0 ? (
        <p className="px-1 py-3 text-center text-xs text-[#94a3b8]">
          Nicio iconiță găsită.
        </p>
      ) : (
        <div
          role="radiogroup"
          aria-label="Iconiță"
          className="grid grid-cols-6 gap-2"
        >
          {keys.map((key) => {
            const Icon = CALLOUT_ICONS[key];
            const selected = key === value;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={key}
                disabled={disabled}
                onClick={() => onChange(key)}
                className={`flex aspect-square items-center justify-center rounded-xl border-2 transition-colors disabled:cursor-not-allowed ${
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
      )}
    </div>
  );
}
