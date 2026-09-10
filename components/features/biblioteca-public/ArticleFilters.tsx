"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import type { PublicSubcategory } from "@/lib/api/biblioteca-public-types";

const controlClass =
  "rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:border-[#2dbe8f] focus:outline-none";

export function ArticleFilters({
  categorieSlug,
  subcategorii,
  tipuri,
  active,
}: {
  categorieSlug: string;
  subcategorii: PublicSubcategory[];
  tipuri: string[];
  active: { q: string; tip: string; subcategorie: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(active.q);

  /**
   * Every filter change is a navigation, so each view is linkable.
   *
   * The patch merges into the query string as it stands right now, not into the
   * `active` props: clicking a select blurs the search input, which fires its
   * own `go({ q })` and navigation, and the select's change handler then runs
   * before that navigation has landed. Merged into props, the second call would
   * carry the stale `q` and silently discard the term the input still shows.
   *
   * `page` is deliberately not carried over — a filter change starts at page 1,
   * since page 3 of the old filter rarely exists under the new one.
   */
  const go = (patch: Partial<typeof active>) => {
    const next = {
      q: searchParams.get("q") ?? "",
      tip: searchParams.get("tip") ?? "",
      subcategorie: searchParams.get("subcategorie") ?? "",
      ...patch,
    };
    const query = new URLSearchParams();
    if (next.q.trim()) query.set("q", next.q.trim());
    if (next.tip) query.set("tip", next.tip);
    if (next.subcategorie) query.set("subcategorie", next.subcategorie);
    const suffix = query.toString() ? `?${query}` : "";
    router.push(`/biblioteca/${categorieSlug}${suffix}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-64 flex-1">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
        />
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && go({ q: term })}
          onBlur={() => term !== active.q && go({ q: term })}
          placeholder="Caută în această categorie..."
          aria-label="Caută în această categorie"
          className={`${controlClass} w-full py-2.5 pl-10 pr-4`}
        />
      </div>

      <div className="relative">
        <select
          value={active.tip}
          onChange={(event) => go({ tip: event.target.value })}
          aria-label="Filtrează după tip"
          className={`${controlClass} appearance-none pr-10`}
        >
          <option value="">Tip: Toate</option>
          {tipuri.map((tip) => (
            <option key={tip} value={tip}>
              {tip}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
        />
      </div>

      <div className="relative">
        <select
          value={active.subcategorie}
          onChange={(event) => go({ subcategorie: event.target.value })}
          aria-label="Filtrează după subcategorie"
          className={`${controlClass} appearance-none pr-10`}
        >
          <option value="">Subcategorie: Toate</option>
          {subcategorii.map((sub) => (
            <option key={sub.documentId} value={sub.slug}>
              {sub.nume}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
        />
      </div>
    </div>
  );
}
