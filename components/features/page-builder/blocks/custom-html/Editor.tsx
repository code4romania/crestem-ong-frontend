"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { BlockFieldErrors } from "../../types";
import type { CustomHtmlData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";
const codeClass = inputClass + " font-mono text-xs leading-relaxed";
const errorClass = "mt-1 text-xs text-[#ef4444]";
const hintClass = "mt-1 text-xs text-[#94a3b8]";
const optionalHint = "ml-1.5 font-normal normal-case text-[#94a3b8]";

export function CustomHtmlEditor({
  value,
  onChange,
  errors,
}: {
  value: CustomHtmlData;
  onChange: (next: CustomHtmlData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<CustomHtmlData>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="chb-eticheta" className={labelClass}>
          Etichetă<span className={optionalHint}>(doar în editor)</span>
        </label>
        <input
          id="chb-eticheta"
          className={inputClass}
          value={value.eticheta}
          onChange={(e) => set({ eticheta: e.target.value })}
          placeholder="ex. Navigație Legixplore"
        />
      </div>

      <div>
        <span className={labelClass}>Lățime</span>
        <SegmentedControl
          ariaLabel="Lățime"
          value={value.latime}
          onChange={(latime) => set({ latime })}
          options={[
            { value: "continut", label: "Conținut" },
            { value: "ecran", label: "Ecran complet" },
          ]}
        />
      </div>

      <div>
        <label htmlFor="chb-sursa" className={labelClass}>
          Cod <span className="text-[#ef4444]">*</span>
        </label>
        <textarea
          id="chb-sursa"
          className={codeClass}
          rows={20}
          value={value.sursa}
          onChange={(e) => set({ sursa: e.target.value })}
          placeholder="Lipește aici HTML, style și script dintr-o bucată"
          aria-invalid={Boolean(errors.sursa)}
        />
        {errors.sursa ? (
          <p className={errorClass}>{errors.sursa}</p>
        ) : (
          <p className={hintClass}>
            Stilurile și scripturile sunt separate automat la randare. CSS-ul se
            aplică întregii pagini, nu doar blocului — prefixează selectorii cu
            o clasă proprie. Scripturile rulează doar pe pagina publică.
          </p>
        )}
      </div>
    </div>
  );
}
