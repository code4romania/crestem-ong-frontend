"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PARTNER_ICONS } from "./icons";
import { PARTNER_ICON_KEYS, type PartnerIconKey } from "./schema";

/**
 * The preconfigured-icon field for a partner card: a searchable grid over the
 * fixed palette, the selected one outlined in blue. Same visual language as
 * `callout/IconPicker`.
 */
export function IconPicker({
  value,
  onChange,
}: {
  value: PartnerIconKey;
  onChange: (next: PartnerIconKey) => void;
}) {
  const [query, setQuery] = useState("");

  const keys = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PARTNER_ICON_KEYS;
    return PARTNER_ICON_KEYS.filter((key) => key.includes(q));
  }, [query]);

  return (
    <div>
      <div className="relative mb-2">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Caută iconiță..."
          className="w-full rounded-xl border border-border py-2 pl-9 pr-3 text-sm focus:border-[#2dbe8f] focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30"
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
            const Icon = PARTNER_ICONS[key];
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
      )}
    </div>
  );
}
