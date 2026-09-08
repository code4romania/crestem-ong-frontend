"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { BlockFieldErrors } from "../../types";
import type { QuoteData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";
const errorClass = "mt-1 text-xs text-[#ef4444]";

export function QuoteEditor({
  value,
  onChange,
  errors,
}: {
  value: QuoteData;
  onChange: (next: QuoteData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<QuoteData>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="quote-citat" className={labelClass}>
          Citat <span className="text-[#ef4444]">*</span>
        </label>
        <textarea
          id="quote-citat"
          rows={4}
          className={`${inputClass} min-h-[104px] resize-y`}
          value={value.citat}
          onChange={(e) => set({ citat: e.target.value })}
          placeholder="ex. Acceleratorul ne-a ajutat să trecem de la o organizație care funcționa din inerție la una care știe exact unde merge."
        />
        {errors.citat && <p className={errorClass}>{errors.citat}</p>}
      </div>

      <fieldset className="space-y-3">
        <legend className={labelClass}>Atribuire (opțional)</legend>

        <div>
          <label htmlFor="quote-autor" className={labelClass}>
            Autor
          </label>
          <input
            id="quote-autor"
            className={inputClass}
            value={value.autor}
            onChange={(e) => set({ autor: e.target.value })}
            placeholder="ex. Maria Ionescu"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="quote-functie" className={labelClass}>
              Funcție
            </label>
            <input
              id="quote-functie"
              className={inputClass}
              value={value.functie}
              onChange={(e) => set({ functie: e.target.value })}
              placeholder="ex. Director"
            />
          </div>
          <div>
            <label htmlFor="quote-organizatie" className={labelClass}>
              Organizație
            </label>
            <input
              id="quote-organizatie"
              className={inputClass}
              value={value.organizatie}
              onChange={(e) => set({ organizatie: e.target.value })}
              placeholder="ex. Izvorul Speranței"
            />
          </div>
        </div>

        <div>
          <label htmlFor="quote-sursa" className={labelClass}>
            Sursă
          </label>
          <input
            id="quote-sursa"
            className={inputClass}
            value={value.sursa}
            onChange={(e) => set({ sursa: e.target.value })}
            placeholder="link sau nume publicație"
          />
        </div>
      </fieldset>

      <div>
        <span className={labelClass}>Stil</span>
        <SegmentedControl
          ariaLabel="Stil"
          value={value.stil}
          onChange={(stil) => set({ stil })}
          options={[
            { value: "simplu", label: "Simplu" },
            { value: "evidentiat", label: "Evidențiat" },
          ]}
        />
      </div>

      <div>
        <span className={labelClass}>Aliniere bloc</span>
        <SegmentedControl
          ariaLabel="Aliniere bloc"
          value={value.aliniere}
          onChange={(aliniere) => set({ aliniere })}
          options={[
            { value: "stanga", label: "Stânga" },
            { value: "centru", label: "Centrat" },
            { value: "dreapta", label: "Dreapta" },
          ]}
        />
      </div>
    </div>
  );
}
