"use client";

import { StepList } from "./StepList";
import type { BlockFieldErrors } from "../../types";
import type { NumberedProcessData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#00d495]/30 focus:border-[#007d58] transition-colors";
const optionalHint = "font-normal normal-case text-[#5b6779]";

export function NumberedProcessEditor({
  value,
  onChange,
  errors,
}: {
  value: NumberedProcessData;
  onChange: (next: NumberedProcessData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<NumberedProcessData>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="process-titlu" className={labelClass}>
          Titlu <span className={optionalHint}>(opțional)</span>
        </label>
        <input
          id="process-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="Calendar și etape"
        />
      </div>

      <StepList
        value={value.pasi}
        onChange={(pasi) => set({ pasi })}
        error={errors.pasi}
      />
    </div>
  );
}
