"use client";

import type { RelatedArticleRef } from "@/lib/api/articles-types";

/**
 * Toggles `documentId` in `value`: removes it if already present (even at the
 * cap — unchecking must always work), adds it if under `max`, otherwise
 * leaves `value` unchanged.
 */
export function toggleRelatedSelection(
  value: string[],
  documentId: string,
  max: number,
): string[] {
  if (value.includes(documentId)) return value.filter((id) => id !== documentId);
  if (value.length >= max) return value;
  return [...value, documentId];
}

export function RelatedArticlesField({
  candidates,
  value,
  onChange,
}: {
  /** The top-10 tag-matched candidates, already ranked. */
  candidates: RelatedArticleRef[];
  /** The currently checked documentIds (0 to 3). */
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const atLimit = value.length >= 3;

  const toggle = (documentId: string) => {
    onChange(toggleRelatedSelection(value, documentId, 3));
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
        Articole relaționate
      </label>
      <p className="mb-2 text-xs text-muted-foreground">
        Alege până la 3 articole dintre cele mai apropiate ca etichete. Vor apărea la
        finalul articolului, pe site.
      </p>

      {candidates.length === 0 ? (
        <p className="rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm text-muted-foreground">
          Niciun articol cu etichete comune încă.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-white">
          {candidates.map((candidate) => {
            const checked = value.includes(candidate.documentId);
            const disabled = !checked && atLimit;
            return (
              <li key={candidate.documentId} className="flex items-start gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  id={`related-${candidate.documentId}`}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(candidate.documentId)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-[#2dbe8f] focus:ring-[#2dbe8f] disabled:opacity-40"
                />
                <label
                  htmlFor={`related-${candidate.documentId}`}
                  className={`text-sm ${disabled ? "text-muted-foreground" : "text-[#162040]"}`}
                >
                  <span className="font-semibold">{candidate.titlu}</span>
                  {candidate.etichete.length > 0 ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {candidate.etichete.map((tag) => `#${tag}`).join(" ")}
                    </span>
                  ) : null}
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
