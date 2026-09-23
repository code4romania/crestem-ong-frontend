"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, Search, X } from "lucide-react";
import { MultiSelectFilter } from "@/components/ui/MultiSelectFilter";
import { useDebouncedCallback } from "@/lib/hooks/useDebouncedCallback";
import { evaluariHref, hasActiveEvaluariFilters, statusOptionsForTab } from "./evaluari-query";

const SEARCH_DEBOUNCE_MS = 400;

/** Rounds outside every program are picked from the program filter itself. */
const INDEPENDENT_OPTION = {
  documentId: "independent",
  name: "Evaluări independente",
};

interface FilterState {
  search: string;
  ongs: string[];
  programs: string[];
  status: string;
}

export function EvaluariFilters({
  tab,
  searchPlaceholder,
  initialSearch,
  initialOngs,
  initialPrograms,
  initialStatus,
}: {
  tab: string;
  searchPlaceholder: string;
  initialSearch: string;
  initialOngs: string[];
  initialPrograms: string[];
  initialStatus: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialSearch);
  const [ongs, setOngs] = useState(initialOngs);
  const [programs, setPrograms] = useState(initialPrograms);
  const [status, setStatus] = useState(initialStatus);
  // The rounds tab lists rounds, the users tab the responses inside them, so the
  // filters offer whichever of those two actually has rows.
  const scope = tab === "organizatii" ? "reports" : "evaluations";

  // Any filter change navigates back to page 1 — otherwise a match found by a new
  // search/filter could land on a page number that no longer exists for the new results.
  function navigate(next: FilterState) {
    router.replace(evaluariHref({ tab, ...next }, pathname));
  }

  const { debounced: debouncedNavigate, cancel: cancelNavigate } = useDebouncedCallback(
    navigate,
    SEARCH_DEBOUNCE_MS,
  );

  function change(patch: Partial<FilterState>) {
    cancelNavigate();
    if (patch.search !== undefined) setSearch(patch.search);
    if (patch.ongs !== undefined) setOngs(patch.ongs);
    if (patch.programs !== undefined) setPrograms(patch.programs);
    if (patch.status !== undefined) setStatus(patch.status);
    navigate({ search, ongs, programs, status, ...patch });
  }

  /** Clearing goes through `change`, so a half-typed search is cancelled too. */
  function reset() {
    change({ search: "", ongs: [], programs: [], status: "" });
  }

  const isFiltered = hasActiveEvaluariFilters({ search, ongs, programs, status });

  function handleSearchChange(value: string) {
    setSearch(value);
    debouncedNavigate({ search: value, ongs, programs, status });
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-3 mb-6">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
        <label htmlFor="evaluari-search" className="sr-only">
          Caută
        </label>
        <input
          id="evaluari-search"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          className="w-full pl-10 pr-10 py-2.5 rounded-full border border-border text-sm"
        />
        {search && (
          <button
            type="button"
            onClick={() => change({ search: "" })}
            aria-label="Golește căutarea"
            className="absolute right-3 top-2.5 rounded-full p-1 text-slate-400 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="lg:w-56">
        <MultiSelectFilter
          kind="ongs"
          scope={scope}
          label="Organizații"
          placeholder="Toate organizațiile"
          selected={ongs}
          onChange={(next) => change({ ongs: next })}
        />
      </div>

      <div className="lg:w-56">
        <MultiSelectFilter
          kind="programs"
          scope={scope}
          label="Programe"
          placeholder="Toate programele"
          selected={programs}
          onChange={(next) => change({ programs: next })}
          extraOptions={[INDEPENDENT_OPTION]}
        />
      </div>

      <div className="relative lg:w-48">
        <label htmlFor="evaluari-status" className="sr-only">
          Filtrează după status
        </label>
        <select
          id="evaluari-status"
          value={status}
          onChange={(event) => change({ status: event.target.value })}
          className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-full border border-border text-sm bg-white"
        >
          <option value="">Toate statusurile</option>
          {statusOptionsForTab(tab).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3.5 top-3 text-slate-400 pointer-events-none"
        />
      </div>

      <button
        type="button"
        onClick={reset}
        disabled={!isFiltered}
        className="shrink-0 px-4 py-2.5 rounded-full border border-border text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        Resetează filtrele
      </button>
    </div>
  );
}
