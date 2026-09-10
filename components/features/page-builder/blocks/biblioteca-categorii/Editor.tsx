"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { usePageOptions } from "../shared/page-options";
import type { BlockFieldErrors } from "../../types";
import type { BibliotecaCategoriiData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors disabled:opacity-60";
const errorClass = "mt-1 text-xs text-[#ef4444]";

export function BibliotecaCategoriiEditor({
  value,
  onChange,
  errors,
}: {
  value: BibliotecaCategoriiData;
  onChange: (next: BibliotecaCategoriiData) => void;
  errors: BlockFieldErrors;
}) {
  const { categories } = usePageOptions();
  const set = (patch: Partial<BibliotecaCategoriiData>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="bc-titlu" className={labelClass}>
          Titlu
        </label>
        <input
          id="bc-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="ex. Explorează biblioteca"
          aria-invalid={Boolean(errors.titlu)}
        />
        {errors.titlu ? <p className={errorClass}>{errors.titlu}</p> : null}
      </div>

      <div>
        <span className={labelClass}>Coloane</span>
        <SegmentedControl
          ariaLabel="Coloane"
          value={value.coloane}
          onChange={(coloane) => set({ coloane })}
          options={[
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4", label: "4" },
          ]}
        />
      </div>

      {/* Nothing to pick: the block always shows every category that has
          something publicly visible in it. Saying so beats leaving an editor
          wondering where the selection controls went. */}
      <p className="rounded-xl border border-border bg-slate-50 px-4 py-3 text-xs text-[#475569]">
        Blocul afișează automat toate categoriile care au cel puțin un articol
        publicat. Descrierea și pictograma fiecărui card se editează în
        <span className="font-semibold"> Bibliotecă → Gestionează categorii</span>.
        {categories.length === 0
          ? " Momentan nu există nicio categorie."
          : ` Momentan sunt ${categories.length} categorii.`}
      </p>
    </div>
  );
}
