"use client";

import type { DirectoryProgram } from "@/lib/api/people";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";

/**
 * The "Program" filter for People Collection: a multi-select checkbox list of
 * programmes. Nothing checked === all programmes; otherwise a person must
 * belong to at least one checked programme to appear. Emits documentIds in the
 * order the list provides them.
 */
export function ProgramPicker({
  value,
  onChange,
  programs,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  programs: DirectoryProgram[];
}) {
  const selected = new Set(value);
  const order = programs.map((p) => p.documentId);

  const toggle = (documentId: string) => {
    const next = new Set(selected);
    if (next.has(documentId)) next.delete(documentId);
    else next.add(documentId);
    onChange(order.filter((id) => next.has(id)));
  };

  return (
    <div>
      <span className={labelClass}>
        Program{" "}
        <span className="font-normal normal-case tracking-normal text-[#94a3b8]">
          (opțional){value.length > 0 ? ` · ${value.length} selectate` : ""}
        </span>
      </span>

      {programs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-sm text-[#94a3b8]">
          Niciun program disponibil.
        </p>
      ) : (
        <div
          role="group"
          aria-label="Programe"
          className="max-h-56 divide-y divide-border overflow-y-auto rounded-xl border border-border"
        >
          {programs.map((program) => (
            <label
              key={program.documentId}
              className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={selected.has(program.documentId)}
                onChange={() => toggle(program.documentId)}
                className="h-4 w-4 shrink-0 rounded border-border"
              />
              <span className="min-w-0 text-sm font-medium text-[#162040] wrap-break-word">
                {program.name}
              </span>
            </label>
          ))}
        </div>
      )}

      <p className="mt-1.5 text-xs text-[#94a3b8]">
        Dacă selectezi unul sau mai multe programe, apar doar persoanele asociate
        lor.
      </p>
    </div>
  );
}
