"use client";

import { Toggle } from "@/components/ui/Toggle";
import { FaqList } from "./FaqList";
import type { BlockFieldErrors } from "../../types";
import type { FaqCollectionData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";

export function FaqCollectionEditor({
  value,
  onChange,
  errors,
}: {
  value: FaqCollectionData;
  onChange: (next: FaqCollectionData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<FaqCollectionData>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="faq-titlu" className={labelClass}>
          Titlu secțiune
        </label>
        <input
          id="faq-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="ex. Întrebări frecvente"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <label
          htmlFor="faq-prima-deschisa"
          className="text-sm font-medium text-[#162040]"
        >
          Prima întrebare deschisă implicit
        </label>
        <Toggle
          id="faq-prima-deschisa"
          checked={value.primaDeschisa}
          onChange={(primaDeschisa) => set({ primaDeschisa })}
          ariaLabel="Prima întrebare deschisă implicit"
        />
      </div>

      <FaqList
        value={value.intrebari}
        onChange={(intrebari) => set({ intrebari })}
        error={errors.intrebari}
      />
    </div>
  );
}
