"use client";

import { useEffect, useRef } from "react";
import { DocumentList } from "./DocumentList";
import type { BlockFieldErrors } from "../../types";
import type { DocumentsData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";
const optionalHint = "ml-1.5 font-normal normal-case text-[#94a3b8]";
const errorClass = "mt-1 text-xs text-[#ef4444]";

export function DocumentsEditor({
  value,
  onChange,
  errors,
}: {
  value: DocumentsData;
  onChange: (next: DocumentsData) => void;
  errors: BlockFieldErrors;
}) {
  // A slow multi-file upload commits asynchronously from `DocumentList`;
  // without this ref its stale closure would spread an outdated `value` and
  // wipe any titlu / subtitlu typed while the upload was running.
  const latestValue = useRef(value);
  useEffect(() => {
    latestValue.current = value;
  });
  const set = (patch: Partial<DocumentsData>) =>
    onChange({ ...latestValue.current, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="documents-titlu" className={labelClass}>
          Titlu <span className="text-[#ef4444]">*</span>
        </label>
        <input
          id="documents-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="ex. Fișiere disponibile"
          aria-invalid={Boolean(errors.titlu)}
        />
        {errors.titlu && <p className={errorClass}>{errors.titlu}</p>}
      </div>

      <div>
        <label htmlFor="documents-subtitlu" className={labelClass}>
          Subtitlu<span className={optionalHint}>(opțional)</span>
        </label>
        <input
          id="documents-subtitlu"
          className={inputClass}
          value={value.subtitlu}
          onChange={(e) => set({ subtitlu: e.target.value })}
          placeholder="ex. 3 fișiere · descărcare gratuită"
        />
      </div>

      <DocumentList
        value={value.documente}
        onChange={(documente) => set({ documente })}
        error={errors.documente}
      />
    </div>
  );
}
