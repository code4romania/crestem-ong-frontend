"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { PartnerList } from "./PartnerList";
import type { BlockFieldErrors } from "../../types";
import type { PartnerCollectionData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";

export function PartnerCollectionEditor({
  value,
  onChange,
  errors,
}: {
  value: PartnerCollectionData;
  onChange: (next: PartnerCollectionData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<PartnerCollectionData>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="pc-titlu" className={labelClass}>
          Titlu secțiune
        </label>
        <input
          id="pc-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="ex. Susținuți de"
        />
      </div>

      <div>
        <label htmlFor="pc-subtitlu" className={labelClass}>
          Subtitlu secțiune
        </label>
        <input
          id="pc-subtitlu"
          className={inputClass}
          value={value.subtitlu}
          onChange={(e) => set({ subtitlu: e.target.value })}
          placeholder="ex. Organizațiile care fac platforma posibilă"
        />
      </div>

      <div>
        <span className={labelClass}>Layout</span>
        <SegmentedControl
          ariaLabel="Layout"
          value={value.coloane}
          onChange={(coloane) => set({ coloane })}
          options={[
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4", label: "4" },
            { value: "5", label: "5" },
            { value: "6", label: "6" },
          ]}
        />
      </div>

      <PartnerList
        value={value.parteneri}
        onChange={(parteneri) => set({ parteneri })}
        error={errors.parteneri}
      />
    </div>
  );
}
