import Link from "next/link";
import { UserCog } from "lucide-react";
import type { IncomingAdminTransfer } from "@/lib/api/admin-transfer";
import { formatTransferDate, transferProposerLabel } from "@/lib/admin-transfer-format";

/**
 * The admin-transfer proposal waiting for this member (D11). The email is the
 * document's only channel; this repeats it on the profile and leads to the
 * same page, where accepting and declining happen.
 */
export function IncomingAdminTransferCard({ transfer }: { transfer: IncomingAdminTransfer }) {
  return (
    <div
      role="status"
      className="rounded-xl border px-5 py-4 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      style={{ background: "#fffbeb", borderColor: "#fde68a" }}
    >
      <div className="flex items-start gap-3">
        <UserCog size={18} className="mt-0.5 shrink-0" style={{ color: "#d97706" }} aria-hidden />
        <div className="text-sm">
          <p className="font-semibold" style={{ color: "#162040" }}>
            Propunere de administrare
          </p>
          <p className="text-muted-foreground">
            {transferProposerLabel(transfer)} te propune administrator al organizației{" "}
            {transfer.ongName}. Propunerea expiră pe {formatTransferDate(transfer.expiresAt)}.
          </p>
        </div>
      </div>
      <Link
        href={transfer.path}
        className="shrink-0 inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2dbe8f]"
        style={{ background: "#2dbe8f" }}
      >
        Vezi propunerea
      </Link>
    </div>
  );
}
