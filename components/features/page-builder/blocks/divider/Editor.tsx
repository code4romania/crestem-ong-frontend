"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { DividerData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";

export function DividerEditor({
  value,
  onChange,
}: {
  value: DividerData;
  onChange: (next: DividerData) => void;
}) {
  const set = (patch: Partial<DividerData>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <span className={labelClass}>Stil</span>
        <SegmentedControl
          ariaLabel="Stil"
          value={value.stil}
          onChange={(stil) => set({ stil })}
          options={[
            { value: "solid", label: "Continuă" },
            { value: "dashed", label: "Întreruptă" },
            { value: "dotted", label: "Punctată" },
          ]}
        />
      </div>

      <div>
        <span className={labelClass}>Lățime</span>
        <SegmentedControl
          ariaLabel="Lățime"
          value={value.latime}
          onChange={(latime) => set({ latime })}
          options={[
            { value: "complet", label: "Completă" },
            { value: "ingust", label: "Îngustă" },
          ]}
        />
      </div>

      <div>
        <span className={labelClass}>Spațiere</span>
        <SegmentedControl
          ariaLabel="Spațiere"
          value={value.spatiere}
          onChange={(spatiere) => set({ spatiere })}
          options={[
            { value: "mic", label: "Mică" },
            { value: "mediu", label: "Medie" },
            { value: "mare", label: "Mare" },
          ]}
        />
      </div>
    </div>
  );
}
