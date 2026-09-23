"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { fetchOngPage, type Ong, type OngListMeta } from "@/lib/api/ongs";
import { OngCard } from "./OngCard";
import { OngCardSkeleton } from "./OngCardSkeleton";

interface ProgramOption {
  documentId: string;
  name: string;
}

const SEARCH_DEBOUNCE_MS = 300;
/** How many placeholder cards stand in for a page being fetched. */
const SKELETON_COUNT = 4;

/**
 * Appends a page, dropping any organization already on screen. Pages are cut by
 * offset, so an organization added or renamed between two requests can shift a
 * row across the boundary and arrive twice — which React answers with a
 * duplicate-key error.
 */
function mergeById(current: Ong[], incoming: Ong[]): Ong[] {
  const seen = new Set(current.map((ong) => ong.documentId));
  return [...current, ...incoming.filter((ong) => !seen.has(ong.documentId))];
}

export function OrganizatiiGrid({
  initialOngs,
  initialMeta,
  programs,
}: {
  initialOngs: Ong[];
  initialMeta: OngListMeta;
  programs: ProgramOption[];
}) {
  const router = useRouter();
  const [ongs, setOngs] = useState(initialOngs);
  const [pagination, setPagination] = useState(initialMeta.pagination);
  // Kept from the first response and never narrowed afterwards: the counties a
  // later page happens to contain are not the counties worth offering.
  const [judete, setJudete] = useState(initialMeta.judete ?? []);
  const [search, setSearch] = useState("");
  const [judetFilter, setJudetFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [loadingPage, setLoadingPage] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Filters can change faster than the responses come back; only the newest
  // request is allowed to write its result.
  const requestIdRef = useRef(0);

  const load = useCallback(
    async (
      page: number,
      filters: { search: string; judet: string; program: string },
    ) => {
      const requestId = ++requestIdRef.current;
      setLoadingPage(page);
      setError(null);
      try {
        const body = await fetchOngPage({ page, ...filters });
        if (requestId !== requestIdRef.current) return;
        setOngs((current) =>
          page === 1 ? body.data : mergeById(current, body.data),
        );
        setPagination(body.meta.pagination);
        if (body.meta.judete) setJudete(body.meta.judete);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setError("Nu am putut încărca organizațiile. Încearcă din nou.");
      } finally {
        if (requestId === requestIdRef.current) setLoadingPage(null);
      }
    },
    [],
  );

  // The first page is already server-rendered, so the filters only refetch once
  // the visitor actually changes one of them.
  const filtersTouched = useRef(false);
  useEffect(() => {
    if (!filtersTouched.current) {
      filtersTouched.current = true;
      return;
    }
    const timer = setTimeout(
      () => load(1, { search, judet: judetFilter, program: programFilter }),
      search ? SEARCH_DEBOUNCE_MS : 0,
    );
    return () => clearTimeout(timer);
  }, [search, judetFilter, programFilter, load]);

  // The next page arrives when the bottom of the grid scrolls into view.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const { page, pageCount } = pagination;
    if (!sentinel || loadingPage !== null || error || page >= pageCount) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        load(page + 1, { search, judet: judetFilter, program: programFilter });
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    pagination,
    loadingPage,
    error,
    search,
    judetFilter,
    programFilter,
    load,
  ]);

  // The list lives in local state, so a server refresh alone would not reach
  // it: reload page one under the current filters, and refresh the route for
  // everything else the server renders.
  const handleDeleted = () => {
    router.refresh();
    load(1, { search, judet: judetFilter, program: programFilter });
  };

  const reloading = loadingPage === 1;
  const appending = loadingPage !== null && loadingPage > 1;
  const hasMore = pagination.page < pagination.pageCount;

  return (
    <div>
      <h1
        className="text-2xl font-heading font-extrabold"
        style={{ color: "#162040" }}
      >
        Organizații NGO
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Gestionează organizațiile înregistrate —{" "}
        <span className="font-semibold">{pagination.total} conturi</span> în
        total
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            placeholder="Caută organizații..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-full border border-border text-sm"
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-full border border-border text-sm bg-white sm:w-auto"
          >
            <option value="">Toate programele</option>
            {programs.map((program) => (
              <option key={program.documentId} value={program.documentId}>
                {program.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <select
            value={judetFilter}
            onChange={(e) => setJudetFilter(e.target.value)}
            className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-full border border-border text-sm bg-white sm:w-auto"
          >
            <option value="">Toate județele</option>
            {judete.map((judet) => (
              <option key={judet.documentId} value={judet.documentId}>
                {judet.nume}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>
      </div>

      {reloading ? (
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          role="status"
          aria-busy="true"
          aria-live="polite"
        >
          <span className="sr-only">Se încarcă…</span>
          {Array.from({ length: SKELETON_COUNT * 2 }).map((_, index) => (
            <OngCardSkeleton key={index} />
          ))}
        </div>
      ) : ongs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nicio organizație găsită.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ongs.map((ong) => (
            <OngCard key={ong.documentId} ong={ong} onDeleted={handleDeleted} />
          ))}
          {appending &&
            Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <OngCardSkeleton key={`skeleton-${index}`} />
            ))}
        </div>
      )}

      {error && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-sm" style={{ color: "#ef4444" }}>
            {error}
          </p>
          <button
            type="button"
            onClick={() =>
              load(error && ongs.length > 0 ? pagination.page + 1 : 1, {
                search,
                judet: judetFilter,
                program: programFilter,
              })
            }
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted"
          >
            Încearcă din nou
          </button>
        </div>
      )}

      {/* Watched by the observer above; the pages stop arriving once the last
          one has. */}
      {hasMore && !error && (
        <div ref={sentinelRef} className="h-px" aria-hidden />
      )}
    </div>
  );
}
