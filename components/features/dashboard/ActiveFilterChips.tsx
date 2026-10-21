"use client";

import { useState } from "react";
import { X } from "lucide-react";

/** Chips shown per group before the rest fold behind "+N". */
const COLLAPSED_LIMIT = 5;

export interface ActiveFilterGroup {
  key: string;
  label: string;
  items: { id: string; name: string }[];
  onRemove: (id: string) => void;
}

/**
 * The selected organizations and programs, one full-width line per group under
 * the filter bar. A long selection folds after a few chips so the bar above
 * keeps its height; names that do not fit are cut and shown whole on hover.
 */
export function ActiveFilterChips({ groups }: { groups: ActiveFilterGroup[] }) {
  const visibleGroups = groups.filter((group) => group.items.length > 0);
  if (visibleGroups.length === 0) return null;

  return (
    <div className="mt-3 flex flex-col gap-2">
      {visibleGroups.map((group) => (
        <ChipGroup key={group.key} group={group} />
      ))}
    </div>
  );
}

function ChipGroup({ group }: { group: ActiveFilterGroup }) {
  const [expanded, setExpanded] = useState(false);
  const hidden = group.items.length - COLLAPSED_LIMIT;
  const shown = expanded || hidden <= 0 ? group.items : group.items.slice(0, COLLAPSED_LIMIT);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs font-medium text-muted-foreground">{group.label}:</span>
      {shown.map((item) => (
        <span
          key={item.id}
          title={item.name}
          className="inline-flex max-w-64 items-center gap-1 px-2.5 py-1 rounded-full text-xs"
          style={{ background: "#f1f5f9", color: "#475569" }}
        >
          <span className="truncate">{item.name}</span>
          <button
            type="button"
            onClick={() => group.onRemove(item.id)}
            aria-label={`Elimină ${item.name}`}
            className="shrink-0 rounded-full hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <X size={11} />
          </button>
        </span>
      ))}
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          aria-label={expanded ? undefined : `Arată toate cele ${group.items.length}`}
          className="px-2.5 py-1 rounded-full text-xs font-medium hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          style={{ color: "#1c1c81" }}
        >
          {expanded ? "Arată mai puțin" : `+${hidden}`}
        </button>
      )}
    </div>
  );
}
