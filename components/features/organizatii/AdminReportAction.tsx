"use client";

import { useState, useTransition } from "react";
import { Lock, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { closeOngReportAction, reopenOngReportAction } from "@/lib/api/reports-actions";

const MODES = {
  close: {
    label: "Închide evaluarea",
    icon: Lock,
    action: closeOngReportAction,
    description: (ongName: string) =>
      `Ești sigur că vrei să închizi evaluarea organizației ${ongName}? Membrii care nu au completat chestionarul nu vor mai putea face asta.`,
    loadingLabel: "Se închide...",
    success: "Evaluarea a fost închisă.",
    failure: "Nu am putut închide evaluarea. Încearcă din nou.",
    buttonClass: "bg-[#00d495] text-white shadow-[0_4px_16px_rgba(0,212,149,0.3)] hover:brightness-90",
  },
  reopen: {
    label: "Redeschide evaluarea",
    icon: RotateCcw,
    action: reopenOngReportAction,
    description: (ongName: string) =>
      `Ești sigur că vrei să redeschizi evaluarea organizației ${ongName}? Membrii care nu au completat chestionarul vor putea să o facă din nou.`,
    loadingLabel: "Se redeschide...",
    success: "Evaluarea a fost redeschisă.",
    failure: "Nu am putut redeschide evaluarea. Încearcă din nou.",
    buttonClass: "border border-border text-[#475569] hover:bg-slate-50",
  },
} as const;

/**
 * The FDSC Admin's "Închide evaluarea" / "Redeschide evaluarea" on an
 * organization's round. The page decides whether it shows; the backend decides
 * whether it goes through.
 */
export function AdminReportAction({
  mode,
  ongId,
  ongName,
  reportId,
}: {
  mode: keyof typeof MODES;
  ongId: string;
  ongName: string;
  reportId: string;
}) {
  const config = MODES[mode];
  const Icon = config.icon;
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await config.action(ongId, reportId);
        if (result?.error) {
          setError(result.error);
          return;
        }
        setOpen(false);
        toast.success(config.success);
      } catch {
        setError(config.failure);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1c81] focus-visible:ring-offset-2 ${config.buttonClass}`}
      >
        <Icon size={14} /> {config.label}
      </button>
      <ConfirmDialog
        open={open}
        title={config.label}
        description={config.description(ongName)}
        confirmLabel={config.label}
        confirmVariant="accent"
        loading={isPending}
        loadingLabel={config.loadingLabel}
        error={error}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
