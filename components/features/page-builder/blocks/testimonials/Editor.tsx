"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Toggle } from "@/components/ui/Toggle";
import { TestimonialList } from "./TestimonialList";
import type { BlockFieldErrors } from "../../types";
import type { TestimonialsData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";

export function TestimonialsEditor({
  value,
  onChange,
  errors,
}: {
  value: TestimonialsData;
  onChange: (next: TestimonialsData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<TestimonialsData>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="ts-titlu" className={labelClass}>
          Titlu
        </label>
        <input
          id="ts-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="ex. Ce spun organizațiile"
        />
      </div>

      <div>
        <span className={labelClass}>Mod de afișare</span>
        <SegmentedControl
          ariaLabel="Mod de afișare"
          value={value.modAfisare}
          onChange={(modAfisare) => set({ modAfisare })}
          options={[
            { value: "grila", label: "Grilă" },
            { value: "carusel", label: "Carusel" },
          ]}
        />
      </div>

      {value.modAfisare === "carusel" ? (
        <div className="space-y-3 rounded-xl border border-border p-4">
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="ts-autoplay"
              className="text-sm font-medium text-[#162040]"
            >
              Auto-play
            </label>
            <Toggle
              id="ts-autoplay"
              checked={value.autoplay}
              onChange={(autoplay) => set({ autoplay })}
              ariaLabel="Auto-play"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="ts-nav"
              className="text-sm font-medium text-[#162040]"
            >
              Afișează navigarea
            </label>
            <Toggle
              id="ts-nav"
              checked={value.afiseazaNavigarea}
              onChange={(afiseazaNavigarea) => set({ afiseazaNavigarea })}
              ariaLabel="Afișează navigarea"
            />
          </div>
        </div>
      ) : null}

      <TestimonialList
        value={value.testimoniale}
        onChange={(testimoniale) => set({ testimoniale })}
        error={errors.testimoniale}
      />
    </div>
  );
}
