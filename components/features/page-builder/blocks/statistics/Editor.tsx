"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Toggle } from "@/components/ui/Toggle";
import { StatList } from "./StatList";
import { CtaTargetField } from "../shared/CtaTargetField";
import type { BlockFieldErrors } from "../../types";
import type { StatisticsData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";
const errorClass = "mt-1 text-xs text-[#ef4444]";
const optionalHint = "font-normal normal-case text-[#94a3b8]";

export function StatisticsEditor({
  value,
  onChange,
  errors,
}: {
  value: StatisticsData;
  onChange: (next: StatisticsData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<StatisticsData>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="stat-titlu" className={labelClass}>
          Titlu <span className={optionalHint}>(opțional)</span>
        </label>
        <input
          id="stat-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="Social Change Accelerator"
        />
      </div>

      <div>
        <label htmlFor="stat-subtitlu" className={labelClass}>
          Subtitlu <span className={optionalHint}>(opțional)</span>
        </label>
        <input
          id="stat-subtitlu"
          className={inputClass}
          value={value.subtitlu}
          onChange={(e) => set({ subtitlu: e.target.value })}
          placeholder="Program de accelerare"
        />
      </div>

      <div>
        <label htmlFor="stat-descriere" className={labelClass}>
          Descriere <span className={optionalHint}>(opțional)</span>
        </label>
        <textarea
          id="stat-descriere"
          rows={3}
          className={inputClass}
          value={value.descriere}
          onChange={(e) => set({ descriere: e.target.value })}
          placeholder="Un program intensiv de 12 săptămâni care ajută organizațiile să-și valideze modelul de impact."
        />
      </div>

      <StatList
        value={value.statistici}
        onChange={(statistici) => set({ statistici })}
        error={errors.statistici}
      />

      <div>
        <span className={labelClass}>Număr coloane</span>
        <SegmentedControl
          ariaLabel="Număr coloane"
          value={value.coloane}
          onChange={(coloane) => set({ coloane })}
          options={[
            { value: "1", label: "1 col." },
            { value: "2", label: "2 col." },
            { value: "3", label: "3 col." },
            { value: "4", label: "4 col." },
          ]}
        />
      </div>

      <div>
        <span className={labelClass}>Aliniere statistici</span>
        <SegmentedControl
          ariaLabel="Aliniere statistici"
          value={value.aliniere}
          onChange={(aliniere) => set({ aliniere })}
          options={[
            { value: "stanga", label: "Stânga" },
            { value: "centru", label: "Centrat" },
            { value: "dreapta", label: "Dreapta" },
          ]}
        />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
        <span className="text-sm font-semibold text-[#162040]">
          Separator între statistici
        </span>
        <Toggle
          ariaLabel="Separator între statistici"
          checked={value.separator}
          onChange={(separator) => set({ separator })}
        />
      </div>

      <fieldset>
        <legend className={labelClass}>Primul buton</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className={inputClass}
            value={value.primaryCta.label}
            onChange={(e) =>
              set({ primaryCta: { ...value.primaryCta, label: e.target.value } })
            }
            placeholder="Aplică acum"
            aria-label="Text primul buton"
          />
          <CtaTargetField
            value={value.primaryCta}
            onChange={(primaryCta) => set({ primaryCta })}
            ariaLabel="Link primul buton"
          />
        </div>
        {errors.primaryCta && <p className={errorClass}>{errors.primaryCta}</p>}
      </fieldset>

      <fieldset>
        <legend className={labelClass}>
          Al doilea buton <span className={optionalHint}>(opțional)</span>
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className={inputClass}
            value={value.secondaryCta.label}
            onChange={(e) =>
              set({
                secondaryCta: { ...value.secondaryCta, label: e.target.value },
              })
            }
            placeholder="Află mai mult"
            aria-label="Text al doilea buton"
          />
          <CtaTargetField
            value={value.secondaryCta}
            onChange={(secondaryCta) => set({ secondaryCta })}
            ariaLabel="Link al doilea buton"
          />
        </div>
        {errors.secondaryCta && (
          <p className={errorClass}>{errors.secondaryCta}</p>
        )}
      </fieldset>
    </div>
  );
}
