import Link from "next/link";
import type { OngOverview } from "@/lib/api/ongs";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function StatCard({
  label,
  value,
  sublabel,
  link,
}: {
  label: string;
  value: React.ReactNode;
  sublabel?: string;
  link?: { href: string; text: string };
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 h-full flex flex-col">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className="mt-2 text-2xl font-heading font-extrabold"
        style={{ color: "#162040" }}
      >
        {value}
      </p>
      {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      {link && (
        <Link
          href={link.href}
          className="self-start mt-auto pt-2 text-sm font-semibold"
          style={{ color: "#2dbe8f" }}
        >
          {link.text} →
        </Link>
      )}
    </div>
  );
}

const MAX_VISIBLE_PROGRAMS = 4;

function ProgramsCard({
  programs,
}: {
  programs: { documentId: string; name: string }[];
}) {
  const overflow = programs.length > MAX_VISIBLE_PROGRAMS;
  const visible = overflow ? programs.slice(0, MAX_VISIBLE_PROGRAMS) : programs;

  return (
    <div className="bg-white rounded-xl border border-border p-5 h-full flex flex-col">
      <p className="text-sm text-muted-foreground">Program</p>
      <div className="mt-2 flex flex-wrap content-start gap-2 min-h-[64px]">
        {visible.length > 0 ? (
          visible.map((program) => (
            <span
              key={program.documentId}
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: "#f0faf6", color: "#162040" }}
            >
              {program.name}
            </span>
          ))
        ) : (
          <p
            className="text-2xl font-heading font-extrabold"
            style={{ color: "#162040" }}
          >
            —
          </p>
        )}
      </div>
      {overflow && (
        <Link
          href="/dashboard/programe"
          className="self-start mt-auto pt-2 text-sm font-semibold"
          style={{ color: "#2dbe8f" }}
        >
          Vezi toate programele →
        </Link>
      )}
    </div>
  );
}

function DisabledStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="bg-white rounded-xl border border-border p-5 opacity-40 cursor-not-allowed"
      title="Disponibil în curând"
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className="mt-2 text-2xl font-heading font-extrabold"
        style={{ color: "#162040" }}
      >
        {value}
      </p>
    </div>
  );
}

export function OrgOverviewStats({
  documentId,
  overview,
  programs,
}: {
  documentId: string;
  overview: OngOverview;
  programs: { documentId: string; name: string }[];
}) {
  const { totalEvaluations, currentEvaluation, lastFinalizedDate } = overview;

  return (
    <div>
      <h2
        className="text-2xl font-heading font-extrabold mb-4"
        style={{ color: "#162040" }}
      >
        Informații Organizație
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total sesiuni de evaluare"
          value={totalEvaluations}
          link={{
            href: `/dashboard/organizatii/${documentId}/evaluari`,
            text: "Vezi istoric evaluări",
          }}
        />
        <StatCard
          label="Evaluare curentă"
          value={
            currentEvaluation
              ? `${currentEvaluation.completedCount} / ${currentEvaluation.invitedCount}`
              : "—"
          }
          sublabel={
            currentEvaluation ? "completări" : "Nicio evaluare în desfășurare"
          }
          link={
            currentEvaluation
              ? {
                  href: `/dashboard/organizatii/${documentId}/evaluare-curenta`,
                  text: "Vezi evaluare curentă",
                }
              : undefined
          }
        />
        <DisabledStatCard label="Număr de sesiuni de mentorat" value="—" />
        {/* E-learning: module not implemented yet, hidden until it ships. */}
        {/* <DisabledStatCard label="E-Learning" value="—" /> */}
        <ProgramsCard programs={programs} />
        <StatCard
          label="Data finalizare evaluare"
          value={lastFinalizedDate ? formatDate(lastFinalizedDate) : "—"}
        />
      </div>
    </div>
  );
}
