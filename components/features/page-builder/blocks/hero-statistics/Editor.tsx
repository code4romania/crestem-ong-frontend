"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Toggle } from "@/components/ui/Toggle";
import { StatList } from "./StatList";
import { CtaTargetField } from "../shared/CtaTargetField";
import type { BlockFieldErrors } from "../../types";
import type { HeroStatisticsData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors disabled:opacity-60";
const errorClass = "mt-1 text-xs text-[#ef4444]";

export function HeroStatisticsEditor({
  value,
  onChange,
  errors,
}: {
  value: HeroStatisticsData;
  onChange: (next: HeroStatisticsData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<HeroStatisticsData>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="hs-supratitlu" className={labelClass}>
          Supratitlu
        </label>
        <input
          id="hs-supratitlu"
          className={inputClass}
          value={value.supratitlu}
          onChange={(e) => set({ supratitlu: e.target.value })}
          placeholder="Program de evaluare"
        />
      </div>

      <div>
        <label htmlFor="hs-titlu" className={labelClass}>
          Titlu <span className="text-[#ef4444]">*</span>
        </label>
        <input
          id="hs-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="Evaluare ONG — cunoaște-ți cu adevărat organizația"
          aria-invalid={Boolean(errors.titlu)}
        />
        {errors.titlu && <p className={errorClass}>{errors.titlu}</p>}
      </div>

      <div>
        <label htmlFor="hs-subtitlu" className={labelClass}>
          Subtitlu (opțional)
        </label>
        <textarea
          id="hs-subtitlu"
          rows={3}
          className={inputClass}
          value={value.subtitlu}
          onChange={(e) => set({ subtitlu: e.target.value })}
          placeholder="Un diagnostic organizațional complet pe 10 dimensiuni-cheie, urmat de un plan de acțiune personalizat."
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
            placeholder="Înregistrează-te acum"
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
        <legend className={labelClass}>Al doilea buton (opțional)</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className={inputClass}
            value={value.secondaryCta.label}
            onChange={(e) =>
              set({
                secondaryCta: { ...value.secondaryCta, label: e.target.value },
              })
            }
            placeholder="Cum funcționează?"
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
    </div>
  );
}
