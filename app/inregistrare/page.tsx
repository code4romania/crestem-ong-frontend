import Link from "next/link";
import { AuthPageHeader } from "@/components/features/auth/AuthPageHeader";
import { AccountTypeCards } from "@/components/features/auth/AccountTypeCards";
import { redirectAuthenticatedToDashboard } from "@/lib/api/session-server";

export const metadata = {
  title: "Înregistrare - Crestem ONG",
};

export default async function InregistrarePage() {
  await redirectAuthenticatedToDashboard();

  return (
    <>
      <AuthPageHeader
        eyebrow="Bun venit pe Crestem.ONG"
        title="Cum dorești să te înregistrezi?"
        subtitle="Alege tipul de cont potrivit pentru tine. Poți schimba oricând."
      />
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <AccountTypeCards />
          <p className="text-center mt-10 text-sm" style={{ color: "#5b6779" }}>
            Ai deja un cont?{" "}
            <Link href="/autentificare" className="font-semibold hover:underline" style={{ color: "#1c1c81" }}>
              Autentifică-te
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
