"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";

export interface FilterOption {
  documentId: string;
  name: string;
}

interface OptionsResponse {
  data: FilterOption[];
  meta: {
    selected: FilterOption[];
    /** Whether any round in scope sits outside every program. */
    hasIndependent: boolean;
    pagination: { page: number; pageCount: number };
  };
}

const SEARCH_DEBOUNCE_MS = 350;

/**
 * A filter that picks several organizations or programs. The list is long
 * enough that it loads a page at a time as the panel scrolls, and the labels of
 * the current selection travel with the first response so a chip keeps its name
 * even when a search no longer matches it.
 *
 * `extraOptions` are entries that exist only in the filter — "Independente" has
 * no row of its own to fetch.
 */
export function MultiSelectFilter({
  kind,
  scope,
  label,
  placeholder,
  selected,
  onChange,
  extraOptions = [],
}: {
  kind: "ongs" | "programs";
  /** Which tab is asking: it decides which rounds the options are drawn from. */
  scope: "evaluations" | "reports";
  label: string;
  placeholder: string;
  selected: string[];
  onChange: (next: string[]) => void;
  extraOptions?: FilterOption[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<FilterOption[]>([]);
  const [names, setNames] = useState<Record<string, string>>(() =>
    Object.fromEntries(extraOptions.map((option) => [option.documentId, option.name])),
  );
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(false);
  // Hidden until the first response says such a round exists.
  const [extrasAllowed, setExtrasAllowed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(
    async (targetPage: number, term: string) => {
      setLoading(true);
      try {
        const query = new URLSearchParams({ scope });
        if (term) query.set("search", term);
        if (targetPage > 1) query.set("page", String(targetPage));
        if (targetPage === 1 && selected.length > 0) {
          query.set("selected", selected.join(","));
        }
        const res = await fetch(`/api/filter-options/${kind}?${query.toString()}`);
        if (!res.ok) return;
        const body = (await res.json()) as OptionsResponse;
        setOptions((current) =>
          targetPage === 1 ? body.data : [...current, ...body.data],
        );
        setPageCount(body.meta.pagination.pageCount);
        setPage(body.meta.pagination.page);
        setExtrasAllowed(Boolean(body.meta.hasIndependent));
        setNames((current) => {
          const next = { ...current };
          for (const option of [...body.data, ...(body.meta.selected ?? [])]) {
            next[option.documentId] = option.name;
          }
          return next;
        });
      } finally {
        setLoading(false);
      }
    },
    [kind, scope, selected],
  );

  // Open loads the first page; typing reloads it debounced.
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => load(1, search), search ? SEARCH_DEBOUNCE_MS : 0);
    return () => clearTimeout(timer);
    // `load` changes with the selection, which must not refetch the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, search]);

  // The next page arrives when the bottom of the list scrolls into view.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!open || !sentinel || loading || page >= pageCount) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) load(page + 1, search);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loading, page, pageCount, search]);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function toggle(documentId: string) {
    onChange(
      selected.includes(documentId)
        ? selected.filter((id) => id !== documentId)
        : [...selected, documentId],
    );
  }

  const visible = [
    ...(extrasAllowed ? extraOptions : []).filter(
      (option) => !search || option.name.toLowerCase().includes(search.toLowerCase()),
    ),
    ...options,
  ];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-2 w-full pl-4 pr-3 py-2.5 rounded-full border border-border text-sm bg-white"
      >
        <span className={selected.length ? "font-medium" : "text-muted-foreground"}>
          {selected.length === 0
            ? placeholder
            : `${label}: ${selected.length} selectate`}
        </span>
        <ChevronDown size={14} className="ml-auto text-slate-400" />
      </button>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((documentId) => (
            <span
              key={documentId}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
              style={{ background: "#f1f5f9", color: "#475569" }}
            >
              {names[documentId] ?? documentId}
              <button
                type="button"
                onClick={() => toggle(documentId)}
                aria-label={`Elimină ${names[documentId] ?? documentId}`}
                className="hover:text-slate-900"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute z-20 mt-2 w-72 max-w-[90vw] rounded-xl border border-border bg-white shadow-lg"
        >
          <div className="relative p-2 border-b border-border">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Caută ${label.toLowerCase()}...`}
              aria-label={`Caută ${label.toLowerCase()}`}
              className="w-full pl-8 pr-2 py-1.5 text-sm rounded-lg border border-border"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {visible.map((option) => {
              const isSelected = selected.includes(option.documentId);
              return (
                <button
                  key={option.documentId}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggle(option.documentId)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
                    style={
                      isSelected
                        ? { background: "#1c1c81", borderColor: "#1c1c81", color: "white" }
                        : { borderColor: "#5b6779" }
                    }
                  >
                    {isSelected && <Check size={11} />}
                  </span>
                  <span className="truncate">{option.name}</span>
                </button>
              );
            })}
            {visible.length === 0 && !loading && (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                Niciun rezultat.
              </p>
            )}
            <div ref={sentinelRef} />
            {loading && (
              <p className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                <Loader2 size={12} className="animate-spin" /> Se încarcă...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
