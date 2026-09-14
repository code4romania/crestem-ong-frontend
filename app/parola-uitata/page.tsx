import { AuthPageHeader } from "@/components/features/auth/AuthPageHeader";
import { ForgotPasswordForm } from "@/components/features/auth/ForgotPasswordForm";
import { redirectAuthenticatedToDashboard } from "@/lib/api/session-server";

export const metadata = {
  title: "Ai uitat parola - Crestem ONG",
};

export default async function ParolaUitataPage() {
  await redirectAuthenticatedToDashboard();

  return (
    <>
      <AuthPageHeader
        eyebrow="Recuperare cont"
        title="Ai uitat parola?"
        subtitle="Introdu adresa de email a contului tău și îți trimitem un link pentru a-ți seta o parolă nouă."
        backHref="/autentificare"
        backLabel="Înapoi la autentificare"
      />
      <section className="py-16 bg-white">
        <div className="max-w-md mx-auto px-6">
          <ForgotPasswordForm />
        </div>
      </section>
    </>
  );
}
