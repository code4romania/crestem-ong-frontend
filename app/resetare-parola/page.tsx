import { Suspense } from "react";
import { AuthPageHeader } from "@/components/features/auth/AuthPageHeader";
import { ResetPasswordForm } from "@/components/features/auth/ResetPasswordForm";
import { redirectAuthenticatedToDashboard } from "@/lib/api/session-server";

export const metadata = {
  title: "Resetează-ți parola - Crestem ONG",
};

export default async function ResetareParolaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  // A reset link is a valid destination even for a signed-in visitor (the token
  // may belong to another account), so only bounce a bare visit.
  const { token } = await searchParams;
  if (!token) {
    await redirectAuthenticatedToDashboard();
  }

  return (
    <>
      <AuthPageHeader
        eyebrow="Resetare parolă"
        title="Setează-ți o parolă nouă"
        subtitle="Alege o parolă nouă pentru contul tău de pe platforma Creștem ONG."
      />
      <section className="py-16 bg-white">
        <div className="max-w-md mx-auto px-6">
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
