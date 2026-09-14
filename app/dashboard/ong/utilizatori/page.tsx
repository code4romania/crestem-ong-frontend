import { serverApiFetch } from "@/lib/api/server";
import type { OngMember } from "@/lib/api/reports";
import type { OngJoinRequest } from "@/lib/api/membership";
import { OngUtilizatoriHeaderActions } from "@/components/features/organizatii/OngUtilizatoriHeaderActions";
import { RemoveOngMemberButton } from "@/components/features/organizatii/RemoveOngMemberButton";
import { ResendInvitationButton } from "@/components/features/organizatii/ResendInvitationButton";
import { JoinRequestsSection } from "@/components/features/organizatii/JoinRequestsSection";

function statusBadge(status: OngMember["accountStatus"]) {
  if (status === "active") return { bg: "#f0fdf4", color: "#16a34a", label: "Activ" };
  return { bg: "#fffbeb", color: "#d97706", label: "În așteptare" };
}

const dateFormatter = new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "short", year: "numeric" });

function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

export default async function UtilizatoriPage() {
  const [{ data: members }, { data: joinRequests }] = await Promise.all([
    serverApiFetch<{ data: OngMember[] }>("/api/ongs/members"),
    serverApiFetch<{ data: OngJoinRequest[] }>("/api/ongs/join-requests"),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#162040" }}>
            Utilizatori
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestionează membrii afiliați la ONG-ul tău.
          </p>
        </div>
        <OngUtilizatoriHeaderActions />
      </div>

      <JoinRequestsSection initialRequests={joinRequests} />

      <h2 className="font-heading font-bold text-base mb-3 flex items-center gap-2" style={{ color: "#162040" }}>
        Membri afiliați ONG-ului
        <span
          className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-xs font-semibold"
          style={{ background: "#f1f5f9", color: "#475569" }}
        >
          {members.length}
        </span>
      </h2>

      {members.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">Niciun utilizator afiliat încă.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                {[
                  "Utilizator",
                  "Rol",
                  "Status",
                  "Afiliat din",
                  "Acțiuni",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#94a3b8" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const status = statusBadge(member.accountStatus);
                const initials = member.nume.trim().slice(0, 2).toUpperCase();
                return (
                  <tr key={member.documentId} className="border-b border-border last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                          style={{ background: "#162040" }}
                        >
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: "#162040" }}>{member.nume}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5" style={{ color: "#475569" }}>
                      {member.rol ?? <span style={{ color: "#94a3b8" }}>—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5" style={{ color: "#475569" }}>{formatDate(member.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-start gap-2">
                        {member.accountStatus === "pending" && (
                          <ResendInvitationButton id={member.id} nume={member.nume} />
                        )}
                        <RemoveOngMemberButton documentId={member.documentId} nume={member.nume} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
