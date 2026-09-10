"use client";

import { CATEGORY_ICONS } from "@/components/features/page-builder/blocks/category-grid/icons";
import { LIBRARY_ICON_KEYS, type LibraryIconKey } from "@/lib/api/library-categories-types";

/**
 * The twelve-icon palette as a radio group. The keys match the page builder's
 * `category-grid` block, so a category and a hand-built card can show the same
 * mark, and `CATEGORY_ICONS` is imported rather than duplicated.
 */
export function CategoryIconPicker({
  value,
  onChange,
}: {
  value: LibraryIconKey;
  onChange: (next: LibraryIconKey) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Pictogramă" className="flex flex-wrap gap-2">
      {LIBRARY_ICON_KEYS.map((key) => {
        const Icon = CATEGORY_ICONS[key];
        const active = key === value;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={key}
            onClick={() => onChange(key)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
              active
                ? "border-[#2dbe8f] bg-[#2dbe8f]/10 text-[#2dbe8f]"
                : "border-border text-[#94a3b8] hover:bg-slate-50"
            }`}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
