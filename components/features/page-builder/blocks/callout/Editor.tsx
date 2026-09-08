"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Toggle } from "@/components/ui/Toggle";
import { RichTextField } from "../../rich-text/RichTextField";
import { IconPicker } from "./IconPicker";
import { CtaTargetField } from "../shared/CtaTargetField";
import type { BlockFieldErrors } from "../../types";
import type { CalloutData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";
const errorClass = "mt-1 text-xs text-[#ef4444]";

export function CalloutEditor({
  value,
  onChange,
  errors,
}: {
  value: CalloutData;
  onChange: (next: CalloutData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<CalloutData>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <label
          htmlFor="callout-afiseaza-icon"
          className="text-sm font-medium text-[#162040]"
        >
          Afișează iconița
        </label>
        <Toggle
          id="callout-afiseaza-icon"
          checked={value.afiseazaIcon}
          onChange={(afiseazaIcon) => set({ afiseazaIcon })}
          ariaLabel="Afișează iconița"
        />
      </div>

      <div>
        <span className={labelClass}>Iconiță</span>
        <IconPicker
          value={value.icon}
          onChange={(icon) => set({ icon })}
          disabled={!value.afiseazaIcon}
        />
      </div>

      <div>
        <label htmlFor="callout-titlu" className={labelClass}>
          Titlu (opțional)
        </label>
        <input
          id="callout-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="ex. Alătură-te comunității Crestem"
        />
      </div>

      <div>
        <span className={labelClass}>
          Text <span className="text-[#ef4444]">*</span>
        </span>
        <RichTextField
          value={value.text}
          onChange={(text) => set({ text })}
          invalid={Boolean(errors.text)}
        />
        {errors.text && <p className={errorClass}>{errors.text}</p>}
      </div>

      <fieldset>
        <legend className={labelClass}>Primul buton (opțional)</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className={inputClass}
            value={value.primaryCta.label}
            onChange={(e) =>
              set({ primaryCta: { ...value.primaryCta, label: e.target.value } })
            }
            placeholder="Creează cont gratuit"
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
            placeholder="Contactează-ne"
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
