import Image from "next/image";
import type { OngDashboardMentor } from "@/lib/api/dashboard";
import { avatarColorFor } from "@/lib/utils/avatar";
import { mediaUrl } from "@/lib/utils/media";
import { DeletedAccountBadge } from "@/components/ui/DeletedAccountBadge";

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

/** `Ian 2025 – Dec 2026` — the program's span, month precision. */
function programPeriod(startDate?: string | null, endDate?: string | null) {
  const monthYear = (iso?: string | null) => {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    const formatted = new Intl.DateTimeFormat("ro-RO", {
      month: "short",
      year: "numeric",
      timeZone: "Europe/Bucharest",
    })
      .format(date)
      .replace(".", "");
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const from = monthYear(startDate);
  const to = monthYear(endDate);
  if (!from || !to) return "—";
  return `${from} – ${to}`;
}

const HEADERS = ["Mentor", "Specializare", "Program", "Perioadă"];

export function OngMentorsTable({ mentors }: { mentors: OngDashboardMentor[] }) {
  return (
    <section className="bg-background rounded-xl border border-border overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-heading font-bold text-primary">
          Mentori cu care am colaborat
        </h2>
      </div>

      {mentors.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          Nu ai colaborat încă cu niciun mentor.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-subtle border-b border-border">
                {HEADERS.map((header) => (
                  <th
                    key={header}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mentors.map((mentor) => {
                const avatar = mediaUrl(mentor.avatar?.url);
                return (
                  <tr
                    key={`${mentor.documentId}-${mentor.program?.documentId ?? "fara-program"}`}
                    className={`border-b border-border last:border-b-0 ${
                      mentor.isDeleted ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {avatar ? (
                          <Image
                            src={avatar}
                            alt={`Fotografia lui ${mentor.nume}`}
                            width={32}
                            height={32}
                            unoptimized
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                            style={{
                              background: mentor.isDeleted
                                ? "#5b6779"
                                : avatarColorFor(mentor.documentId),
                            }}
                          >
                            {initials(mentor.nume)}
                          </span>
                        )}
                        <span className="font-semibold text-primary">{mentor.nume}</span>
                        {mentor.isDeleted && <DeletedAccountBadge />}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-accent-strong">
                      {mentor.mentorJobTitle ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      {mentor.program ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-accent-strong">
                          {mentor.program.name}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                      {programPeriod(mentor.program?.startDate, mentor.program?.endDate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
