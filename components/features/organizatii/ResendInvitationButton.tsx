"use client";

import { toast } from "sonner";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { resendMemberInvitationAction } from "@/lib/api/ongs-actions";

/**
 * Takes the numeric `id`, not `documentId` — see `resendMemberInvitationAction`.
 *
 * Resending rotates the token server-side, so the activation link rendered in
 * this row is dead as soon as the call succeeds. Refresh the route on success
 * so the admin cannot copy the URL the resend just invalidated.
 */
export function ResendInvitationButton({ id, nume }: { id: number; nume: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    setError(null);
    setSent(false);
    startTransition(async () => {
      const result = await resendMemberInvitationAction(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSent(true);
      toast.success("Invitația a fost retrimisă.");
      router.refresh();
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label={`Retrimite invitația pentru ${nume}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-60 text-[#475569]"
      >
        {isPending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
        {isPending ? "Se trimite..." : "Retrimite invitația"}
      </button>
      <p aria-live="polite" className="mt-1 text-[11px]">
        {sent && <span style={{ color: "#16a34a" }}>Invitație retrimisă.</span>}
        {error && <span style={{ color: "#ef4444" }}>{error}</span>}
      </p>
    </div>
  );
}
