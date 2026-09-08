"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import type { BlockDefinition, BlockFieldErrors } from "./types";

export function BlockConfigDrawer({
  definition,
  draft,
  errors,
  onChange,
  onCancel,
  onSubmit,
  submitLabel = "Adaugă blocul",
}: {
  definition: BlockDefinition;
  draft: unknown;
  errors: BlockFieldErrors;
  onChange: (next: unknown) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel?: string;
}) {
  const { Editor } = definition;
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex justify-end">
        <button
          type="button"
          aria-label="Închide"
          onClick={onCancel}
          className="absolute inset-0 h-full w-full cursor-default bg-black/40"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="block-config-title"
          className={`relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-200 ${
            entered ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
            <div className="min-w-0">
              <h2
                id="block-config-title"
                className="font-heading text-lg font-extrabold text-[#162040]"
              >
                {definition.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {definition.description}
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Închide"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <Editor value={draft} onChange={onChange} errors={errors} />
          </div>

          <div className="flex items-center gap-3 border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50"
            >
              Anulează
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#2dbe8f" }}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
