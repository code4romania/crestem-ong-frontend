"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { getDirectoryPrograms, type DirectoryProgram } from "@/lib/api/people";
import type { ProgramHeaderData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const controlClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors disabled:opacity-60";

/**
 * Picks the programme this header stands for. The chosen programme's name is
 * copied into the block rather than read at render time: the programme endpoint
 * is FDSC-staff gated, so a public visitor could never resolve it. "Reimportă"
 * re-copies it after the programme is renamed in the backend — nothing else
 * touches the snapshot, so the admin's own edits survive every save.
 *
 * No offline fallback list on purpose: a made-up programme would be written
 * into the page as if it were real. When the list can't be loaded the admin
 * fills the fields in by hand.
 */
export function ProgramSelect({
  value,
  onSelect,
  onReimport,
}: {
  value: ProgramHeaderData["program"];
  onSelect: (program: DirectoryProgram | null) => void;
  onReimport: (program: DirectoryProgram) => void;
}) {
  const [programs, setPrograms] = useState<DirectoryProgram[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    getDirectoryPrograms()
      .then((res) => {
        if (active) setPrograms(res.data);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const selected =
    programs?.find((p) => p.documentId === value.documentId) ?? null;

  return (
    <div>
      <label htmlFor="ph-program" className={labelClass}>
        Program
      </label>

      <select
        id="ph-program"
        className={controlClass}
        disabled={!programs}
        value={value.documentId}
        onChange={(e) => {
          const picked =
            programs?.find((p) => p.documentId === e.target.value) ?? null;
          onSelect(picked);
        }}
      >
        <option value="">
          {programs ? "Fără program asociat" : "Se încarcă programele..."}
        </option>
        {/* A programme picked before it was deleted (or before the list failed)
            still has to show as the current choice, not silently reset. */}
        {!selected && value.documentId ? (
          <option value={value.documentId}>{value.nume || value.documentId}</option>
        ) : null}
        {programs?.map((program) => (
          <option key={program.documentId} value={program.documentId}>
            {program.name}
          </option>
        ))}
      </select>

      {!programs && !failed ? (
        <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-[#94a3b8]">
          <Loader2 size={12} className="animate-spin" /> Se încarcă programele...
        </p>
      ) : null}

      {failed ? (
        <p className="mt-1.5 text-xs text-[#ef4444]">
          Nu am putut încărca lista de programe. Completează manual titlul și
          statisticile.
        </p>
      ) : null}

      {selected ? (
        <button
          type="button"
          onClick={() => onReimport(selected)}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563eb] hover:underline"
        >
          <RefreshCw size={13} /> Reimportă titlul din program
        </button>
      ) : null}
    </div>
  );
}
