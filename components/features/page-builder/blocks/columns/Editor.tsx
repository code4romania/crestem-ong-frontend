"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ProportionPicker } from "./ProportionPicker";
import { applyColumnCount, type ColumnsData } from "./schema";
import type { BlockFieldErrors } from "../../types";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";

function InfoCard({ title, children }: { title: string; children: string }) {
  return (
    <div className="rounded-xl border border-border px-4 py-3">
      <p className="text-sm font-semibold text-[#162040]">{title}</p>
      <p className="mt-0.5 text-xs text-[#94a3b8]">{children}</p>
    </div>
  );
}

export function ColumnsEditor({
  value,
  onChange,
}: {
  value: ColumnsData;
  onChange: (next: ColumnsData) => void;
  errors: BlockFieldErrors;
}) {
  return (
    <div className="space-y-5">
      <div>
        <span className={labelClass}>Număr coloane</span>
        <SegmentedControl
          ariaLabel="Număr coloane"
          value={value.numarColoane}
          onChange={(numarColoane) =>
            onChange(applyColumnCount(value, numarColoane))
          }
          options={[
            { value: "2", label: "2 coloane" },
            { value: "3", label: "3 coloane" },
          ]}
        />
      </div>

      {value.numarColoane === "2" ? (
        <ProportionPicker
          value={value.proportie}
          onChange={(proportie) => onChange({ ...value, proportie })}
        />
      ) : (
        <InfoCard title="Trei coloane egale (1 / 1 / 1)">
          Cele trei coloane au lățimi egale, fără proporție configurabilă.
        </InfoCard>
      )}

      <InfoCard title="Comportament mobil">
        Pe ecrane mici coloanele se suprapun vertical automat.
      </InfoCard>
    </div>
  );
}
