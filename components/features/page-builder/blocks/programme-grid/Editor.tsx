"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ProgramList } from "./ProgramList";
import type { BlockFieldErrors } from "../../types";
import type { ProgrammeGridData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors disabled:opacity-60";

export function ProgrammeGridEditor({
  value,
  onChange,
  errors,
}: {
  value: ProgrammeGridData;
  onChange: (next: ProgrammeGridData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<ProgrammeGridData>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="pg-titlu" className={labelClass}>
          Titlu secțiune
        </label>
        <input
          id="pg-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="ex. Programele noastre"
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

      <ProgramList
        value={value.programe}
        onChange={(programe) => set({ programe })}
        error={errors.programe}
      />
    </div>
  );
}
