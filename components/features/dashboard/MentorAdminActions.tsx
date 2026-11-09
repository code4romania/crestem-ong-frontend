"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { userDisplayName } from "@/lib/api/auth";
import type { AdminUser } from "@/lib/api/users";
import { resendMentorInviteAction } from "@/lib/api/users-actions";
import { AdminChangeEmailModal } from "./AdminChangeEmailModal";
import { DeleteMentorButton } from "./DeleteMentorButton";
import { mentorAdminActions } from "./mentor-admin-actions";

/** Account actions the super-admin gets on a "persoană resursă" row. */
export function MentorAdminActions({ user }: { user: AdminUser }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [changingEmail, setChangingEmail] = useState(false);
  const actions = mentorAdminActions(user.accountStatus);
  const nume = userDisplayName(user);

  if (!actions.resend && !actions.changeEmail && !actions.remove) return null;

  const handleResend = () => {
    startTransition(async () => {
      const result = await resendMentorInviteAction(user.documentId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Invitația a fost retrimisă.");
      router.refresh();
    });
  };

  return (
    <>
      {actions.resend && (
        <button
          type="button"
          onClick={handleResend}
          disabled={isPending}
          title={`Retrimite invitația pentru ${nume}`}
          aria-label={`Retrimite invitația pentru ${nume}`}
          className="hover:opacity-70 transition-opacity disabled:opacity-60"
          style={{ color: "#475569" }}
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      )}
      {actions.changeEmail && (
        <button
          type="button"
          onClick={() => setChangingEmail(true)}
          title={`Schimbă emailul pentru ${nume}`}
          aria-label={`Schimbă emailul pentru ${nume}`}
          className="hover:opacity-70 transition-opacity"
          style={{ color: "#475569" }}
        >
          <Mail size={16} />
        </button>
      )}
      {actions.remove && user.accountStatus !== "deleted" && (
        <DeleteMentorButton
          documentId={user.documentId}
          nume={nume}
          accountStatus={user.accountStatus}
        />
      )}
      {changingEmail && (
        <AdminChangeEmailModal user={user} onClose={() => setChangingEmail(false)} />
      )}
    </>
  );
}
