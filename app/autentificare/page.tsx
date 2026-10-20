import { AuthPageHeader } from "@/components/features/auth/AuthPageHeader";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { redirectAuthenticatedToDashboard } from "@/lib/api/session-server";
import { RETURN_TO_PARAM, safeReturnTo } from "@/lib/return-to";

export const metadata = {
  title: "Autentificare - Crestem ONG",
};

export default async function AutentificarePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Set by the proxy when it turned away a request for a protected page. It is
  // checked here, on the server, so the form never has to trust the address bar
  // — and so the already-signed-in branch below can honour it too.
  const param = (await searchParams)[RETURN_TO_PARAM];
  const returnTo = safeReturnTo(Array.isArray(param) ? param[0] : param);

  await redirectAuthenticatedToDashboard(returnTo);

  return (
    <>
      <AuthPageHeader
        eyebrow="Bun venit înapoi"
        title="Autentifică-te în cont"
        subtitle="Introdu datele contului tău pentru a continua."
      />
      <section className="py-16 bg-white">
        <div className="max-w-md mx-auto px-6">
          <LoginForm returnTo={returnTo} />
        </div>
      </section>
    </>
  );
}
