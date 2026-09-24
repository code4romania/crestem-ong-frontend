import { serverApiFetch } from "@/lib/api/server";
import { getMediaUrl } from "@/lib/api/client";
import { getCurrentUser } from "@/lib/api/session-server";
import type { MyOng } from "@/lib/api/ongs";
import type { OngMember } from "@/lib/api/reports";
import { getCurrentAdminTransfer } from "@/lib/api/admin-transfer";
import { AdminTransferBanner } from "@/components/features/organizatii/AdminTransferBanner";
import { OngProfileHeaderActions } from "@/components/features/organizatii/OngProfileHeaderActions";
import { ProfileActionsMenu } from "@/components/features/dashboard/ProfileActionsMenu";
import { ProfileActivitySections } from "@/components/features/dashboard/ProfileActivitySections";
import { ProfileChangeLogSection } from "@/components/features/dashboard/ProfileChangeLogSection";

function formatJoinDate(iso: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function OngProfilPage() {
  // The contact person on /ongs/me is the logged-in admin's own account, so the
  // account actions (change password, join date) belong in that card.
  const [{ data: ong }, user, { data: members }, pendingTransfer] = await Promise.all([
    serverApiFetch<{ data: MyOng }>("/api/ongs/me"),
    getCurrentUser(),
    serverApiFetch<{ data: OngMember[] }>("/api/ongs/members"),
    getCurrentAdminTransfer(),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1
            className="text-2xl font-heading font-extrabold"
            style={{ color: "#162040" }}
          >
            Profilul meu
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Informațiile organizației și activitatea ta pe platformă.
          </p>
        </div>
        {/* BR-32: the contact person gets the option, and the backend answers
            with the Romanian explanation of the steps available to them.
            `Șterge ONG` sits alongside it ("Business rules.txt"), which is also
            the step BR-32 asks of them before the account can go. */}
        <ProfileActionsMenu
          showAddOng={false}
          showChangeEmail={false}
          deleteOng={{ documentId: ong.documentId, name: ong.name }}
          transferOng={{
            ongName: ong.name,
            members: members.map((member) => ({
              documentId: member.documentId,
              nume: member.nume,
              email: member.email,
              accountStatus: member.accountStatus,
            })),
            pending: pendingTransfer !== null,
          }}
        />
      </div>

      {pendingTransfer && (
        <div className="mb-6">
          <AdminTransferBanner transfer={pendingTransfer} mode="ngo-admin" />
        </div>
      )}

      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-start gap-4">
            {ong.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getMediaUrl(ong.logo.url)}
                alt={`Logo ${ong.name}`}
                className="w-16 h-16 rounded-xl object-cover border border-border"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center font-heading font-extrabold text-white text-xl"
                style={{ background: "#162040" }}
              >
                {ong.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h2
                className="font-heading font-extrabold text-xl"
                style={{ color: "#162040" }}
              >
                {ong.name}
              </h2>
              <p className="text-sm text-muted-foreground">CUI: {ong.cui}</p>
            </div>
          </div>
          <OngProfileHeaderActions ong={ong} />
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Județ / Localitate
            </dt>
            <dd className="font-semibold" style={{ color: "#162040" }}>
              {ong.judet?.nume ?? "—"}
              {ong.localitate ? `, ${ong.localitate.nume}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Website
            </dt>
            <dd className="font-semibold" style={{ color: "#162040" }}>
              {ong.website ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Social media
            </dt>
            <dd className="font-semibold" style={{ color: "#162040" }}>
              {ong.socialMedia ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Domeniu principal
            </dt>
            <dd className="font-semibold" style={{ color: "#162040" }}>
              {ong.domeniuPrincipal?.name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Domeniu secundar
            </dt>
            <dd className="font-semibold" style={{ color: "#162040" }}>
              {ong.domeniuSecundar?.name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Cuvinte cheie
            </dt>
            <dd className="font-semibold" style={{ color: "#162040" }}>
              {ong.cuvinteCheie ?? "—"}
            </dd>
          </div>
        </dl>

        {ong.descriere && (
          <dl className="mt-6 pt-6 border-t border-border">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Descriere
            </dt>
            <dd className="text-sm font-semibold" style={{ color: "#162040" }}>
              {ong.descriere}
            </dd>
          </dl>
        )}
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">
          Persoană de contact
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Nume complet
            </dt>
            <dd className="font-semibold" style={{ color: "#162040" }}>
              {ong.contact.nume}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Email
            </dt>
            <dd className="font-semibold" style={{ color: "#162040" }}>
              {ong.contact.email}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Telefon
            </dt>
            <dd className="font-semibold" style={{ color: "#162040" }}>
              {ong.contact.telefon}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Membru din
            </dt>
            <dd className="font-semibold" style={{ color: "#162040" }}>
              {user ? formatJoinDate(user.createdAt) : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6">
        <ProfileActivitySections />
        <ProfileChangeLogSection />
      </div>
    </div>
  );
}
