import { AuthPageHeader } from "@/components/features/auth/AuthPageHeader";
import { AdminTransferResponse } from "@/components/features/auth/AdminTransferResponse";
import { previewAdminTransfer, type TransferPreview } from "@/lib/api/admin-transfer";
import { getCurrentUser } from "@/lib/api/session-server";

export const metadata = {
  title: "Propunere de administrare - Crestem ONG",
};

/**
 * Where the admin-transfer email links to (US-3). The token is the credential
 * for reading the proposal; an existing account still signs in to answer it.
 */
export default async function TransferAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;

  const invalid: TransferPreview = { valid: false, reason: "invalid" };
  const [preview, user] = await Promise.all([
    token ? previewAdminTransfer(token).catch(() => invalid) : Promise.resolve(invalid),
    getCurrentUser().catch(() => null),
  ]);

  return (
    <>
      <AuthPageHeader
        eyebrow="Transfer rol administrator"
        title="Propunere de administrare"
        subtitle="Vezi cine te propune și pentru ce organizație, apoi alege dacă accepți."
      />
      <section className="py-16 bg-white">
        <div className="max-w-md mx-auto px-6">
          <AdminTransferResponse
            token={token}
            preview={preview}
            currentUser={user ? { documentId: user.documentId, email: user.email } : null}
          />
        </div>
      </section>
    </>
  );
}
