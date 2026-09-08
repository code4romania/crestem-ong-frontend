"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { BackgroundPicker } from "./BackgroundPicker";
import { CardList } from "./CardList";
import type { BlockFieldErrors } from "../../types";
import type { FeatureCardsData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors disabled:opacity-60";
const errorClass = "mt-1 text-xs text-[#ef4444]";

export function FeatureCardsEditor({
  value,
  onChange,
  errors,
}: {
  value: FeatureCardsData;
  onChange: (next: FeatureCardsData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<FeatureCardsData>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="fc-titlu" className={labelClass}>
          Titlu secțiune
        </label>
        <input
          id="fc-titlu"
          className={inputClass}
          value={value.titluSectiune}
          onChange={(e) => set({ titluSectiune: e.target.value })}
          placeholder="ex. Ce ne ghidează"
          aria-invalid={Boolean(errors.titluSectiune)}
        />
        {errors.titluSectiune && (
          <p className={errorClass}>{errors.titluSectiune}</p>
        )}
      </div>

      <div>
        {/* Stored as `descriere` for backwards compatibility with pages saved
            before this became the display-size subtitle. */}
        <label htmlFor="fc-descriere" className={labelClass}>
          Subtitlu
        </label>
        <textarea
          id="fc-descriere"
          rows={2}
          className={inputClass}
          value={value.descriere}
          onChange={(e) => set({ descriere: e.target.value })}
          placeholder="ex. Valorile noastre"
        />
      </div>

      <div>
        <span className={labelClass}>Layout</span>
        <SegmentedControl
          ariaLabel="Layout"
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
        <span className={labelClass}>Fundal</span>
        <BackgroundPicker
          value={value.background}
          onChange={(background) => set({ background })}
        />
      </div>

      <CardList
        value={value.carduri}
        onChange={(carduri) => set({ carduri })}
        error={errors.carduri}
      />
    </div>
  );
}
