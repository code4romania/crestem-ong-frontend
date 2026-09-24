// components/ui/ConfirmDialog.tsx
"use client";

import { ModalOverlay } from "@/components/ui/ModalOverlay";

const CONFIRM_VARIANT_CLASSES: Record<"danger" | "accent", string> = {
  danger: "bg-[#dc2626] text-white",
  accent: "bg-[#00d495] text-white",
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmă",
  cancelLabel = "Anulează",
  confirmVariant = "danger",
  loading = false,
  loadingLabel,
  error,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "danger" | "accent";
  loading?: boolean;
  loadingLabel?: string;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <ModalOverlay labelledBy="confirm-dialog-title">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <h2 id="confirm-dialog-title" className="font-heading font-extrabold text-lg mb-2 text-[#1c1c81]">
          {title}
        </h2>
        <p className={`text-sm text-muted-foreground ${error ? "mb-4" : "mb-6"}`}>{description}</p>
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg px-3 py-2 text-sm bg-[#fff5f5] border-[1.5px] border-[#fca5a5] text-[#b91c1c]"
          >
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[#475569]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed ${CONFIRM_VARIANT_CLASSES[confirmVariant]}`}
          >
            {loading && (
              <span
                className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin"
                aria-hidden="true"
              />
            )}
            {loading ? loadingLabel ?? confirmLabel : confirmLabel}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
