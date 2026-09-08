"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { BackgroundPicker } from "./BackgroundPicker";
import { CtaTargetField } from "../shared/CtaTargetField";
import type { BlockFieldErrors } from "../../types";
import type { HeroIntroData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors disabled:opacity-60";
const errorClass = "mt-1 text-xs text-[#ef4444]";

export function HeroIntroEditor({
  value,
  onChange,
  errors,
}: {
  value: HeroIntroData;
  onChange: (next: HeroIntroData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<HeroIntroData>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="hi-supratitlu" className={labelClass}>
          Supratitlu
        </label>
        <input
          id="hi-supratitlu"
          className={inputClass}
          value={value.supratitlu}
          onChange={(e) => set({ supratitlu: e.target.value })}
          placeholder="Ce evaluăm"
        />
      </div>

      <div>
        <label htmlFor="hi-titlu" className={labelClass}>
          Titlu <span className="text-[#ef4444]">*</span>
        </label>
        <input
          id="hi-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="10 dimensiuni organizaționale"
          aria-invalid={Boolean(errors.titlu)}
        />
        {errors.titlu && <p className={errorClass}>{errors.titlu}</p>}
      </div>

      <div>
        <label htmlFor="hi-text" className={labelClass}>
          Text introductiv (opțional)
        </label>
        <textarea
          id="hi-text"
          rows={3}
          className={inputClass}
          value={value.textIntroductiv}
          onChange={(e) => set({ textIntroductiv: e.target.value })}
          placeholder="Modelul nostru de evaluare acoperă toate aspectele critice ale unui ONG sănătos și sustenabil."
        />
      </div>

      <div>
        <span className={labelClass}>Aliniere</span>
        <SegmentedControl
          ariaLabel="Aliniere"
          value={value.horizontalAlign}
          onChange={(horizontalAlign) => set({ horizontalAlign })}
          options={[
            { value: "stanga", label: "Stânga" },
            { value: "centru", label: "Centrat" },
            { value: "dreapta", label: "Dreapta" },
          ]}
        />
      </div>

      <div>
        <span className={labelClass}>Fundal</span>
        <BackgroundPicker
          value={value.background}
          onChange={(background) => set({ background })}
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
            placeholder="Start"
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
            placeholder="Află mai multe"
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
