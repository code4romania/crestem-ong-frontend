"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { ROLE_OPTIONS } from "@/lib/roles";
import { useDebouncedCallback } from "@/lib/hooks/useDebouncedCallback";

interface OngOption {
  documentId: string;
  name: string;
}

const STATUS_OPTIONS = [
  { value: "active", label: "Activ" },
  { value: "pending", label: "În așteptare" },
  { value: "deleted", label: "Șters" },
];

const SEARCH_DEBOUNCE_MS = 400;

export function UtilizatoriFilters({
  ongs,
  initialSearch,
  initialRole,
  initialOng,
  initialStatus,
}: {
  ongs: OngOption[];
  initialSearch: string;
  initialRole: string;
  initialOng: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialSearch);
  const [role, setRole] = useState(initialRole);
  const [ong, setOng] = useState(initialOng);
  const [status, setStatus] = useState(initialStatus);

  // Any filter change navigates back to page 1 — otherwise a match found by a new
  // search/filter could land on a page number that no longer exists for the new results.
  function navigate(next: { search: string; role: string; ong: string; status: string }) {
    const params = new URLSearchParams();
    if (next.search) params.set("search", next.search);
    if (next.role) params.set("role", next.role);
    if (next.ong) params.set("ong", next.ong);
    if (next.status) params.set("status", next.status);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  const { debounced: debouncedNavigate, cancel: cancelNavigate } = useDebouncedCallback(
    navigate,
    SEARCH_DEBOUNCE_MS,
  );

  function handleSearchChange(value: string) {
    setSearch(value);
    debouncedNavigate({ search: value, role, ong, status });
  }

  function handleRoleChange(value: string) {
    cancelNavigate();
    setRole(value);
    navigate({ search, role: value, ong, status });
  }

  function handleOngChange(value: string) {
    cancelNavigate();
    setOng(value);
    navigate({ search, role, ong: value, status });
  }

  function handleStatusChange(value: string) {
    cancelNavigate();
    setStatus(value);
    navigate({ search, role, ong, status: value });
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-3 mb-6">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <label htmlFor="utilizatori-search" className="sr-only">
          Caută utilizator sau CIF organizație
        </label>
        <input
          id="utilizatori-search"
          placeholder="Caută utilizator sau CIF..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-3.5 py-2.5 rounded-full border border-border text-sm"
        />
      </div>
      <div className="relative lg:w-48">
        <label htmlFor="utilizatori-role" className="sr-only">
          Filtrează după rol
        </label>
        <select
          id="utilizatori-role"
          value={role}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-full border border-border text-sm bg-white"
        >
          <option value="">Toate rolurile</option>
          {ROLE_OPTIONS.map((option) => (
            <option key={option.type} value={option.type}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
      <div className="relative lg:w-48">
        <label htmlFor="utilizatori-ong" className="sr-only">
          Filtrează după organizație
        </label>
        <select
          id="utilizatori-ong"
          value={ong}
          onChange={(e) => handleOngChange(e.target.value)}
          className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-full border border-border text-sm bg-white"
        >
          <option value="">Toate organizațiile</option>
          {ongs.map((option) => (
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
      <div className="relative lg:w-48">
        <label htmlFor="utilizatori-status" className="sr-only">
          Filtrează după status
        </label>
        <select
          id="utilizatori-status"
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-full border border-border text-sm bg-white"
        >
          <option value="">Toate statusurile</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
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
