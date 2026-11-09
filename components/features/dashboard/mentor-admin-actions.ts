import type { AdminUser } from "@/lib/api/users";

/**
 * Which account actions the FDSC administrator is offered for a "persoană
 * resursă", by account status. A deleted (anonymized) account takes none; an
 * active one has already accepted its invitation, so there is nothing to resend.
 */
export function mentorAdminActions(status: AdminUser["accountStatus"]): {
  resend: boolean;
  changeEmail: boolean;
  remove: boolean;
} {
  return {
    resend: status === "pending",
    changeEmail: status !== "deleted",
    remove: status !== "deleted",
  };
}
