// components/features/programe/ProgrammeList.tsx
import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import type { Program } from "@/lib/api/programs";
import { ProgrammeRow } from "./ProgrammeRow";

const GROUPS: { key: Program["programStatus"]; label: string }[] = [
  { key: "Active", label: "Programe active" },
  { key: "Upcoming", label: "Programe viitoare" },
  { key: "Finished", label: "Programe finalizate" },
];

const EMPTY_MESSAGES: Record<Program["programStatus"], string> = {
  Active: "Niciun program activ în acest moment.",
  Upcoming: "Niciun program viitor.",
  Finished: "Niciun program finalizat încă.",
};

export function ProgrammeList({ programs }: { programs: Program[] }) {
  const grouped = new Map<Program["programStatus"], Program[]>();
  for (const group of GROUPS) grouped.set(group.key, []);
  for (const program of programs) {
    grouped.get(program.programStatus)?.push(program);
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#1c1c81" }}>
            Management programe
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestionează toate programele platformei Crestem.ONG
          </p>
        </div>
        <Link
          href="/dashboard/programe/nou"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "#7c3aed" }}
        >
          <Plus size={18} />
          Adaugă program
        </Link>
      </div>

      <div className="space-y-8">
        {GROUPS.map((group) => {
          const items = grouped.get(group.key) ?? [];
          return (
            <div key={group.key}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-heading font-bold" style={{ color: "#1c1c81" }}>
                  {group.label}
                </h2>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: "#f1f5f9", color: "#5b6779" }}
                >
                  {items.length}
                </span>
              </div>
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-slate-50/60 py-10 text-center">
                  <CalendarDays size={22} className="text-slate-300" />
                  <p className="text-sm text-muted-foreground">{EMPTY_MESSAGES[group.key]}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((program) => (
                    <ProgrammeRow key={program.documentId} program={program} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
