"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { userDisplayName } from "@/lib/api/auth";
import type { AdminUser } from "@/lib/api/users";
import type { Dimension } from "@/lib/api/dimensions";
import { ROLE_BADGES } from "@/lib/roles";
import { formatDate } from "@/lib/utils/date";
import { MemberActivationLink } from "@/components/features/organizatii/MemberActivationLink";
import { EditFdscUserModal } from "./EditFdscUserModal";

const STATUS_BADGES: Record<AdminUser["accountStatus"], { label: string; bg: string; color: string }> = {
  active: { label: "Activ", bg: "#f0fdf4", color: "#16a34a" },
  pending: { label: "În așteptare", bg: "#fffbeb", color: "#d97706" },
  deleted: { label: "Șters", bg: "#fef2f2", color: "#dc2626" },
};

// Mentors are not editable from user administration — they maintain their own
// profile from the mentor dashboard. FDSC staff accounts stay editable here.
const EDITABLE_ROLES = ["super-admin", "editor-fdsc"];

export function UtilizatoriTable({ users, dimensions }: { users: AdminUser[]; dimensions: Dimension[] }) {
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">Niciun utilizator găsit.</p>
      </div>
    );
  }

  const showActivationLink = users.some((user) => Boolean(user.activationLink));

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden overflow-x-auto">
      <table className="w-full min-w-[960px] text-sm">
        <thead>
          <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            {[
              "Utilizator",
              "Email",
              "Rol",
              "Organizație",
              "Status",
              ...(showActivationLink ? ["Link activare"] : []),
              "Ultima autentificare",
              "Acțiuni",
            ].map((h) => (
              <th
                key={h}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${
                  h === "Acțiuni" ? "text-center" : "text-left"
                }`}
                style={{ color: "#94a3b8" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const displayName = userDisplayName(user);
            const initials = displayName.slice(0, 2).toUpperCase();
            const role = user.role ? (ROLE_BADGES[user.role.type] ?? null) : null;
            const statusBadge = STATUS_BADGES[user.accountStatus] ?? null;
            const orgNames = user.ong.map((ong) => ong.name).join(", ");
            const canEdit = Boolean(user.role && EDITABLE_ROLES.includes(user.role.type));
            return (
              <tr
                key={user.documentId}
                className="border-b border-border last:border-0 hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getMediaUrl(user.avatar.url)}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                        style={{ background: "#162040" }}
                      >
                        {initials}
                      </div>
                    )}
                    <p className="font-semibold whitespace-normal wrap-break-word min-w-0" style={{ color: "#162040" }}>
                      {displayName}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3.5" style={{ color: "#475569" }}>
                  {user.email}
                </td>
                <td className="px-4 py-3.5">
                  {role ? (
                    <span
                      className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-center"
                      style={{ background: role.bg, color: role.color }}
                    >
                      {role.label}
                    </span>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>—</span>
                  )}
                </td>
                <td className="px-4 py-3.5" style={{ color: "#475569" }}>
                  {orgNames || <span style={{ color: "#94a3b8" }}>—</span>}
                </td>
                <td className="px-4 py-3.5">
                  {statusBadge ? (
                    <span
                      className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-center"
                      style={{ background: statusBadge.bg, color: statusBadge.color }}
                    >
                      {statusBadge.label}
                    </span>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>—</span>
                  )}
                </td>
                {showActivationLink && (
                  <td className="px-4 py-3.5">
                    {user.activationLink ? (
                      <MemberActivationLink href={user.activationLink} nume={displayName} />
                    ) : (
                      <span style={{ color: "#94a3b8" }}>—</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3.5" style={{ color: "#475569" }}>
                  {formatDate(user.lastLoginAt)}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center gap-3">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => setEditingUser(user)}
                        title="Editează utilizatorul"
                        className="hover:opacity-70 transition-opacity"
                        style={{ color: "#475569" }}
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {editingUser && (
        <EditFdscUserModal
          user={editingUser}
          dimensions={dimensions}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}
