"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { RECOMMENDED_ICONS, type IconScope } from "./legacy";
import { FALLBACK_ICON, toStored } from "./names";
import { parseIconValue } from "./resolve";
import { searchIcons } from "./search";
import { loadIconTags } from "./tags";
import { useIconRegistry } from "./use-icon-registry";

/** Rendering all ~1,800 matches for a one-letter query would stall the drawer. */
const MAX_RESULTS = 200;

/**
 * The icon field shared by every block and by library categories: a search box
 * over all lucide icons (names + lucide's English tags, as on lucide.dev) and a
 * grid of results. With no query it shows the icons the blocks used to offer.
 * `value` is the stored value (legacy keys are read through `scope`);
 * `onChange` always receives the stored `"lucide:<name>"` form.
 */
export function IconPicker({
  value,
  scope,
  onChange,
  label = "Iconiță",
  disabled = false,
}: {
  value: unknown;
  scope: IconScope;
  onChange: (next: string) => void;
  label?: string;
  disabled?: boolean;
}) {
  // The icon set loads on demand (see `use-icon-registry.ts`); until then the
  // selection is read by shape alone, which is all the grid needs to mark it.
  const registry = useIconRegistry();
  const current = registry
    ? registry.resolveIconName(value, scope)
    : (parseIconValue(value, scope) ?? FALLBACK_ICON);
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState<Record<string, string[]> | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    // Imports `./registry` too, so it rides in the same on-demand chunk.
    loadIconTags()
      .then((loaded) => alive && setTags(loaded))
      // Without tags there is nothing to search; recommended icons still work.
      .catch(() => alive && setTags({}));
    return () => {
      alive = false;
    };
  }, []);

  const matches = useMemo(() => {
    if (!query.trim()) {
      return RECOMMENDED_ICONS.includes(current)
        ? RECOMMENDED_ICONS
        : [current, ...RECOMMENDED_ICONS];
    }
    return tags ? searchIcons(query, tags) : [];
  }, [query, tags, current]);

  const shown = matches.slice(0, MAX_RESULTS);
  const focusIndex = Math.max(shown.indexOf(current), 0);

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const buttons = Array.from(
      gridRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [],
    );
    // Columns auto-fill the available width, so count the first row.
    const columns = Math.max(
      buttons.filter((b) => b.offsetTop === buttons[0]?.offsetTop).length,
      1,
    );
    const step = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: columns,
      ArrowUp: -columns,
    }[event.key];
    if (step === undefined) return;
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = buttons[index + step];
    if (index === -1 || !next) return;
    event.preventDefault();
    next.focus();
  };

  const searching = query.trim().length > 0;

  return (
    <div className={disabled ? "opacity-50" : undefined} aria-disabled={disabled}>
      <div className="relative mb-2">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5b6779]"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          aria-label={`Caută ${label.toLowerCase()}`}
          placeholder="Caută pictograme (în engleză)…"
          className="w-full rounded-xl border border-border py-2 pl-9 pr-3 text-sm focus:border-[#007d58] focus:outline-none focus:ring-2 focus:ring-[#00d495]/30 disabled:cursor-not-allowed"
        />
      </div>

      <p className="mb-2 px-1 text-xs text-[#5b6779]">
        {!registry
          ? "Se încarcă pictogramele..."
          : searching
          ? tags === null
            ? "Se încarcă pictogramele..."
            : matches.length > MAX_RESULTS
              ? `Peste ${MAX_RESULTS} de rezultate — rafinează căutarea.`
              : `${matches.length} ${matches.length === 1 ? "rezultat" : "rezultate"}`
          : "Recomandate"}
        <span className="float-right">
          Selectat: <span className="font-semibold text-[#1c1c81]">{current}</span>
        </span>
      </p>

      {shown.length === 0 ? (
        searching && tags !== null ? (
          <p className="px-1 py-3 text-center text-xs text-[#5b6779]">
            Nicio pictogramă găsită.
          </p>
        ) : null
      ) : (
        <div
          ref={gridRef}
          role="radiogroup"
          aria-label={label}
          onKeyDown={onGridKeyDown}
          className="grid max-h-72 grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-2 overflow-y-auto p-0.5"
        >
          {shown.map((name, index) => {
            const Icon = registry?.getIconComponent(name);
            if (!Icon) return null;
            const selected = name === current;
            return (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={name}
                title={name}
                tabIndex={index === focusIndex ? 0 : -1}
                disabled={disabled}
                onClick={() => onChange(toStored(name))}
                className={`flex h-11 items-center justify-center rounded-xl border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5656e5] disabled:cursor-not-allowed ${
                  selected
                    ? "border-[#5656e5] bg-[#eef1fd] text-[#5656e5]"
                    : "border-slate-200 bg-white text-[#475569] hover:border-slate-300"
                }`}
              >
                <Icon size={18} aria-hidden />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
