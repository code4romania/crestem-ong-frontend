"use client";

import { useEffect, useState } from "react";
import { CircleCheck } from "lucide-react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Toggle } from "@/components/ui/Toggle";
import { getDirectoryPrograms, type DirectoryProgram } from "@/lib/api/people";
import { ProgramPicker } from "./ProgramPicker";
import { FALLBACK_PROGRAMS } from "./people-catalog";
import type { BlockFieldErrors } from "../../types";
import type { PeopleCollectionData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const groupLabelClass =
  "block text-xs font-semibold uppercase tracking-wide text-[#94a3b8]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";

export function PeopleCollectionEditor({
  value,
  onChange,
}: {
  value: PeopleCollectionData;
  onChange: (next: PeopleCollectionData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<PeopleCollectionData>) =>
    onChange({ ...value, ...patch });

  const [programs, setPrograms] =
    useState<DirectoryProgram[]>(FALLBACK_PROGRAMS);

  useEffect(() => {
    let active = true;
    getDirectoryPrograms()
      .then((res) => {
        if (active) setPrograms(res.data);
      })
      .catch(() => {
        // Keep the fallback list; the picker still works offline.
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="pc-supratitlu" className={labelClass}>
          Supratitlu
        </label>
        <input
          id="pc-supratitlu"
          className={inputClass}
          value={value.supratitlu}
          onChange={(e) => set({ supratitlu: e.target.value })}
          placeholder="ex. Oamenii din spatele platformei"
        />
      </div>

      <div>
        <label htmlFor="pc-titlu" className={labelClass}>
          Titlu secțiune
        </label>
        <input
          id="pc-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="ex. Echipa de resurse"
        />
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-[#eff6ff] p-3 text-sm text-[#2563eb]">
        <CircleCheck size={18} className="mt-0.5 shrink-0" />
        <p>
          Această colecție se actualizează automat atunci când persoane care
          corespund criteriilor sunt adăugate în sistem.
        </p>
      </div>

      <div className="space-y-4">
        <span className={groupLabelClass}>Filtre colecție</span>

        <div>
          <span className={labelClass}>Tip persoană</span>
          <SegmentedControl
            ariaLabel="Tip persoană"
            value={value.tipPersoana}
            onChange={(tipPersoana) => set({ tipPersoana })}
            options={[
              { value: "toate", label: "Toate" },
              { value: "persoana-resursa", label: "Persoană resursă" },
              { value: "echipa-fdsc", label: "Echipa FDSC" },
            ]}
          />
        </div>

        <ProgramPicker
          value={value.programe}
          onChange={(programe) => set({ programe })}
          programs={programs}
        />

        <div>
          <span className={labelClass}>Sortare</span>
          <SegmentedControl
            ariaLabel="Sortare"
            value={value.sortare}
            onChange={(sortare) => set({ sortare })}
            options={[
              { value: "az", label: "A → Z" },
              { value: "za", label: "Z → A" },
              { value: "recente", label: "Cele mai recente" },
            ]}
          />
        </div>

        <div>
          <span className={labelClass}>Număr persoane afișate</span>
          <SegmentedControl
            ariaLabel="Număr persoane afișate"
            value={value.numarPersoane}
            onChange={(numarPersoane) => set({ numarPersoane })}
            options={[
              { value: "4", label: "4" },
              { value: "8", label: "8" },
              { value: "12", label: "12" },
              { value: "toate", label: "Toate" },
            ]}
          />
        </div>
      </div>

      <div>
        <span className={groupLabelClass}>Layout</span>
        <div className="mt-1.5">
          <SegmentedControl
            ariaLabel="Layout"
            value={value.randuri}
            onChange={(randuri) => set({ randuri })}
            options={[
              { value: "1", label: "1 rând" },
              { value: "2", label: "2 rânduri" },
              { value: "3", label: "3 rânduri" },
              { value: "4", label: "4 rânduri" },
            ]}
          />
        </div>
      </div>

      <div className="space-y-2">
        <span className={groupLabelClass}>Afișare</span>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
          <label
            htmlFor="pc-foto"
            className="text-sm font-semibold text-[#162040]"
          >
            Afișează fotografia
          </label>
          <Toggle
            id="pc-foto"
            ariaLabel="Afișează fotografia"
            checked={value.afiseazaFotografia}
            onChange={(afiseazaFotografia) => set({ afiseazaFotografia })}
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
          <label
            htmlFor="pc-tip"
            className="text-sm font-semibold text-[#162040]"
          >
            Afișează tipul
          </label>
          <Toggle
            id="pc-tip"
            ariaLabel="Afișează tipul"
            checked={value.afiseazaTipul}
            onChange={(afiseazaTipul) => set({ afiseazaTipul })}
          />
        </div>
      </div>
    </div>
  );
}
