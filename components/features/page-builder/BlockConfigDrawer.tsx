"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ModalPortal } from "@/components/ui/ModalPortal";
import type { BlockDefinition, BlockEditorHandle, BlockFieldErrors } from "./types";

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
  onSubmit: (value: unknown) => void;
  submitLabel?: string;
}) {
  const { Editor } = definition;
  const [entered, setEntered] = useState(false);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  // Captured once: the drawer remounts fresh every time a block draft opens.
  const [initialDraft] = useState(draft);
  const editorHandleRef = useRef<BlockEditorHandle | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const requestCancel = useCallback(() => {
    const isDirty =
      (editorHandleRef.current?.hasUnsavedNestedDraft() ?? false) ||
      JSON.stringify(draft) !== JSON.stringify(initialDraft);
    if (isDirty) setConfirmingDiscard(true);
    else onCancel();
  }, [draft, initialDraft, onCancel]);

  const handleSave = () => {
    const value = editorHandleRef.current?.flush() ?? draft;
    onSubmit(value);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestCancel]);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex justify-end">
        <button
          type="button"
          aria-label="Închide"
          onClick={requestCancel}
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
                className="font-heading text-lg font-extrabold text-[#1c1c81]"
              >
                {definition.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {definition.description}
              </p>
            </div>
            <button
              type="button"
              onClick={requestCancel}
              aria-label="Închide"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <Editor
              value={draft}
              onChange={onChange}
              errors={errors}
              bindHandle={(handle) => {
                editorHandleRef.current = handle;
              }}
            />
          </div>

          <div className="flex items-center gap-3 border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={requestCancel}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50"
            >
              Anulează
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:brightness-90"
              style={{ background: "#00d495" }}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingDiscard}
        title="Renunți la modificări?"
        description="Modificările nesalvate vor fi pierdute."
        confirmLabel="Renunță la modificări"
        cancelLabel="Rămâi"
        onConfirm={() => {
          setConfirmingDiscard(false);
          onCancel();
        }}
        onCancel={() => setConfirmingDiscard(false)}
      />
    </ModalPortal>
  );
}
