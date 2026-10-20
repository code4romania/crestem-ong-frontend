import Link from "next/link";
import { MailCheck, MailX } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server";
import { getApiErrorMessage } from "@/lib/api/client";
import { redirectAuthenticatedToDashboard } from "@/lib/api/session-server";
import { ConfirmEmailChange } from "@/components/features/auth/ConfirmEmailChange";

export default async function SchimbareEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; confirmat?: string }>;
}) {
  const { token, confirmat } = await searchParams;

  let pendingEmail: string | null = null;
  let error: string | null = null;

  // The confirm action lands here after spending the token, so this branch must
  // stay free of any token lookup — there is nothing left to verify.
  if (confirmat) {
    return (
      <main className="min-h-dvh flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-border p-8 w-full max-w-md">
          <h1 className="font-heading font-extrabold text-xl mb-2" style={{ color: "#1c1c81" }}>
            Confirmă adresa de email
          </h1>
          <div className="flex items-start gap-3 mt-4">
            <MailCheck size={20} className="shrink-0 mt-0.5" style={{ color: "#007d58" }} />
            <p className="text-sm" style={{ color: "#1c1c81" }}>
              Adresa contului este acum{" "}
              <span className="font-semibold">{confirmat}</span>. Autentifică-te
              din nou folosind noua adresă.
            </p>
          </div>
          <Link
            href="/autentificare"
            className="mt-6 inline-flex w-full items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:brightness-90 transition-opacity"
            style={{ background: "#00d495" }}
          >
            Mergi la autentificare
          </Link>
        </div>
      </main>
    );
  }

  if (!token) {
    // The confirmation link is normally opened while signed in, so the token
    // branch must stay reachable — only a bare visit gets bounced.
    await redirectAuthenticatedToDashboard();
    error = "Link de confirmare invalid sau expirat";
  } else {
    try {
      const res = await serverApiFetch<{ data: { email: string } }>(
        `/api/auth/change-email/preview?token=${encodeURIComponent(token)}`,
      );
      pendingEmail = res.data.email;
    } catch (err) {
      error = getApiErrorMessage(err, "Link de confirmare invalid sau expirat");
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-border p-8 w-full max-w-md">
        <h1 className="font-heading font-extrabold text-xl mb-2" style={{ color: "#1c1c81" }}>
          Confirmă adresa de email
        </h1>

        {error || !token || !pendingEmail ? (
          <>
            <div className="flex items-start gap-3 mt-4">
              <MailX size={20} className="shrink-0 mt-0.5" style={{ color: "#b91c1c" }} />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Link
              href="/autentificare"
              className="mt-6 inline-flex w-full items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors text-[#475569]"
            >
              Mergi la autentificare
            </Link>
          </>
        ) : (
          <ConfirmEmailChange token={token} email={pendingEmail} />
        )}
      </div>
    </main>
  );
}
