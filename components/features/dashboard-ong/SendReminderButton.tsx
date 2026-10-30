"use client";

import { toast } from "sonner";
import { useTransition } from "react";
import { Loader2, Mail } from "lucide-react";
import { sendEvaluationReminderAction } from "@/lib/api/reports-actions";

export function SendReminderButton({
  reportId,
  evaluationId,
  nume,
}: {
  reportId: string;
  evaluationId: string;
  nume: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await sendEvaluationReminderAction(reportId, evaluationId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Reminderul a fost trimis către ${nume}.`);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={`Trimite reminder către ${nume}`}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-60 text-[#475569]"
    >
      {isPending ? <Loader2 size={11} className="animate-spin" /> : <Mail size={11} />}
      {isPending ? "Se trimite..." : "Trimite reminder"}
    </button>
  );
}
