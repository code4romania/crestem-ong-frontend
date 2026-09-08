"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ARTICLE_CATALOG, CATEGORY_META, formatArticleDate } from "./catalog";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const errorClass = "mt-1 text-xs text-[#ef4444]";

/**
 * Manual article selection: a search box over a scrollable checkbox list of the
 * catalog. Emits the chosen slugs (catalog order) up to the editor.
 */
export function ArticlePicker({
  value,
  onChange,
  error,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  error?: string;
}) {
  const [query, setQuery] = useState("");
  const selected = useMemo(() => new Set(value), [value]);

  const trimmed = query.trim().toLowerCase();
  const visible = trimmed
    ? ARTICLE_CATALOG.filter((a) => a.titlu.toLowerCase().includes(trimmed))
    : ARTICLE_CATALOG;

  const toggle = (slug: string) => {
    const next = new Set(selected);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    onChange(ARTICLE_CATALOG.map((a) => a.slug).filter((s) => next.has(s)));
  };

  return (
    <div>
      <span className={labelClass}>
        Articole
        <span className="ml-2 font-normal normal-case tracking-normal text-[#94a3b8]">
          {value.length} selectate
        </span>
      </span>

      <div className="relative mb-2">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Caută articol..."
          aria-label="Caută articol"
          className="w-full rounded-xl border border-border py-2.5 pl-9 pr-4 text-sm transition-colors focus:border-[#2dbe8f] focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30"
        />
      </div>

      <div
        role="group"
        aria-label="Articole disponibile"
        className="max-h-64 divide-y divide-border overflow-y-auto rounded-xl border border-border"
      >
        {visible.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Niciun articol nu corespunde căutării.
          </p>
        ) : (
          visible.map((article) => (
            <label
              key={article.slug}
              className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={selected.has(article.slug)}
                onChange={() => toggle(article.slug)}
                className="h-4 w-4 shrink-0 rounded border-border"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-[#162040] wrap-break-word">
                  {article.titlu}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {CATEGORY_META[article.categorie].label} ·{" "}
                  {formatArticleDate(article.data)}
                </span>
              </span>
            </label>
          ))
        )}
      </div>

      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}
