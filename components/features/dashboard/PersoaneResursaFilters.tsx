"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { useDebouncedCallback } from "@/lib/hooks/useDebouncedCallback";

interface ProgramOption {
  documentId: string;
  name: string;
}

const SEARCH_DEBOUNCE_MS = 400;

export function PersoaneResursaFilters({
  programs,
  initialSearch,
  initialProgram,
}: {
  programs: ProgramOption[];
  initialSearch: string;
  initialProgram: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialSearch);
  const [program, setProgram] = useState(initialProgram);

  // Any filter change navigates back to page 1 — otherwise a match found by a new
  // search/filter could land on a page number that no longer exists for the new results.
  function navigate(next: { search: string; program: string }) {
    const params = new URLSearchParams();
    if (next.search) params.set("search", next.search);
    if (next.program) params.set("program", next.program);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  const { debounced: debouncedNavigate, cancel: cancelNavigate } =
    useDebouncedCallback(navigate, SEARCH_DEBOUNCE_MS);

  function handleSearchChange(value: string) {
    setSearch(value);
    debouncedNavigate({ search: value, program });
  }

  function handleProgramChange(value: string) {
    cancelNavigate();
    setProgram(value);
    navigate({ search, program: value });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <label htmlFor="persoane-resursa-search" className="sr-only">
          Caută persoană resursă
        </label>
        <input
          id="persoane-resursa-search"
          placeholder="Caută persoană resursă..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-3.5 py-2.5 rounded-full border border-border text-sm"
        />
      </div>
      <div className="relative w-full sm:w-auto">
        <label htmlFor="persoane-resursa-program" className="sr-only">
          Filtrează după program
        </label>
        <select
          id="persoane-resursa-program"
          value={program}
          onChange={(e) => handleProgramChange(e.target.value)}
          className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-full border border-border text-sm bg-white sm:w-auto"
        >
          <option value="">Toate programele</option>
          {programs.map((option) => (
            <option key={option.documentId} value={option.documentId}>
              {option.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
    </div>
  );
}
