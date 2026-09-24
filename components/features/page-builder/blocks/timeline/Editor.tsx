"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StageList } from "./StageList";
import type { BlockFieldErrors } from "../../types";
import type { TimelineData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#00d495]/30 focus:border-[#007d58] transition-colors";
const optionalHint = "font-normal normal-case text-[#5b6779]";

export function TimelineEditor({
  value,
  onChange,
  errors,
}: {
  value: TimelineData;
  onChange: (next: TimelineData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<TimelineData>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="timeline-titlu" className={labelClass}>
          Titlu <span className={optionalHint}>(opțional)</span>
        </label>
        <input
          id="timeline-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="Parcursul programului"
        />
      </div>

      <div>
        <span className={labelClass}>Orientare</span>
        <SegmentedControl
          ariaLabel="Orientare"
          value={value.orientatie}
          onChange={(orientatie) => set({ orientatie })}
          options={[
            { value: "vertical", label: "Verticală" },
            { value: "orizontal", label: "Orizontală" },
          ]}
        />
        <p className="mt-1 text-xs text-[#5b6779]">
          Orientarea orizontală revine la cea verticală pe ecrane mici.
        </p>
      </div>

      <StageList
        value={value.etape}
        onChange={(etape) => set({ etape })}
        error={errors.etape}
      />
    </div>
  );
}
