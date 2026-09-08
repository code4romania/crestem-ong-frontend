"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { PageOption } from "@/lib/api/pages-types";

export interface MenuItemValues {
  label: string;
  pagina?: string;
}

const VARIANT = {
  root: { strip: "bg-slate-50", submit: "bg-[#2563eb]" },
  child: { strip: "bg-[#f0faf6]", submit: "bg-[#2dbe8f]" },
} as const;

/**
 * `hidden` is a footer column heading, which names a group and never redirects.
 * `optional` is a header entry that already has sub-elements: it opens a
 * dropdown, so a destination is a choice rather than a requirement.
 */
export type PageMode = "required" | "optional" | "hidden";

const fieldBase =
  "rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-[#2dbe8f] focus:outline-none";

/**
 * The inline strip used both for adding an item and for editing one in place.
 *
 * A menu entry points at a CMS page and nothing else. There is no free-text
 * address: the link is a relation, so renaming a page follows through here
 * instead of leaving a dead link behind.
 */
export function MenuItemForm({
  variant,
  title,
  pageMode,
  pages,
  initialLabel = "",
  initialPagina = "",
  submitLabel,
  pending = false,
  onSubmit,
  onCancel,
}: {
  variant: "root" | "child";
  title: string;
  pageMode: PageMode;
  pages: PageOption[];
  initialLabel?: string;
  initialPagina?: string;
  submitLabel: string;
  pending?: boolean;
  onSubmit: (values: MenuItemValues) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(initialLabel);
  const [pagina, setPagina] = useState(initialPagina);
  const [error, setError] = useState<string | null>(null);

  const styles = VARIANT[variant];
  const showPage = pageMode !== "hidden";

  const submit = () => {
    const trimmedLabel = label.trim();

    if (!trimmedLabel) {
      setError("Eticheta este obligatorie.");
      return;
    }
    if (showPage && pageMode === "required" && !pagina) {
      setError("Alege o pagină.");
      return;
    }

    setError(null);
    onSubmit(showPage && pagina ? { label: trimmedLabel, pagina } : { label: trimmedLabel });
  };

  return (
    <div className={`border-b border-border px-5 py-4 ${styles.strip}`}>
      <p className="mb-3 text-xs font-semibold text-[#475569]">{title}</p>

      <div className="flex min-w-0 flex-wrap items-start gap-2">
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && submit()}
          placeholder="Etichetă"
          aria-label="Etichetă"
          autoFocus
          className={`${fieldBase} min-w-0 flex-1`}
        />

        {showPage && (
          <select
            value={pagina}
            onChange={(event) => setPagina(event.target.value)}
            aria-label="Pagină"
            className={`${fieldBase} w-56 shrink-0`}
          >
            <option value="">
              {pageMode === "optional" ? "Fără pagină (doar dropdown)" : "Alege o pagină…"}
            </option>
            {pages.map((option) => (
              <option key={option.documentId} value={option.documentId}>
                {option.titlu}
                {option.publicat ? "" : " (schiță)"}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 ${styles.submit}`}
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          aria-label="Renunță"
          className="rounded-lg border border-border bg-white px-3 py-2 text-[#475569] transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          <X size={14} />
        </button>
      </div>

      {showPage && pages.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Nu există încă pagini. Creează una în secțiunea Pagini, apoi revino aici.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs text-[#ef4444]">
          {error}
        </p>
      )}
    </div>
  );
}
