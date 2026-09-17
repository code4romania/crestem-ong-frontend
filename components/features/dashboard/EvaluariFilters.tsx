"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { MEMBER_STATUS_LABELS } from "@/components/features/evaluari/evaluation-status";
import { MultiSelectFilter } from "@/components/ui/MultiSelectFilter";
import { useDebouncedCallback } from "@/lib/hooks/useDebouncedCallback";

const SEARCH_DEBOUNCE_MS = 400;

const STATUS_ORDER = ["neinceput", "in_lucru", "completat", "nefinalizat"];

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
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (next.search) params.set("search", next.search);
    if (next.ongs.length) params.set("ongs", next.ongs.join(","));
    if (next.programs.length) params.set("programs", next.programs.join(","));
    if (next.status) params.set("status", next.status);
    router.replace(`${pathname}?${params.toString()}`);
  }

  const { debounced: debouncedNavigate, cancel: cancelNavigate } = useDebouncedCallback(
    navigate,
    SEARCH_DEBOUNCE_MS,
  );

  function change(patch: Partial<FilterState>) {
    cancelNavigate();
    if (patch.ongs !== undefined) setOngs(patch.ongs);
    if (patch.programs !== undefined) setPrograms(patch.programs);
    if (patch.status !== undefined) setStatus(patch.status);
    navigate({ search, ongs, programs, status, ...patch });
  }

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
          className="w-full pl-10 pr-3.5 py-2.5 rounded-full border border-border text-sm"
        />
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
          {STATUS_ORDER.map((key) => (
            <option key={key} value={key}>
              {MEMBER_STATUS_LABELS[key]}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3.5 top-3 text-slate-400 pointer-events-none"
        />
      </div>
    </div>
  );
}
