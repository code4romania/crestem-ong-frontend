import { GraduationCap } from "lucide-react";

type CourseStatus = "Finalizat" | "În progres";

interface CourseRow {
  title: string;
  duration: string;
  status: CourseStatus;
  finishedAt: string | null;
  totalStudents: number;
}

const STATUS_STYLES: Record<CourseStatus, { background: string; color: string }> = {
  Finalizat: { background: "#e5f9e5", color: "#15803d" },
  "În progres": { background: "#fff7ed", color: "#c2410c" },
};

export function OrgCoursesCard() {
  const rows: CourseRow[] = [];

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="flex items-center gap-2 text-base font-heading font-extrabold" style={{ color: "#1c1c81" }}>
          <GraduationCap size={18} />
          Cursuri parcurse
        </h2>
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: "#e5f9e5", color: "#007d58" }}
        >
          {rows.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {rows.length > 0 && (
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#5b6779" }}>
                <th className="text-left pb-3 pr-4 font-semibold">Titlu curs</th>
                <th className="text-left pb-3 pr-4 font-semibold">Durată</th>
                <th className="text-left pb-3 pr-4 font-semibold">Status</th>
                <th className="text-left pb-3 pr-4 font-semibold">Finalizat la</th>
                <th className="text-left pb-3 font-semibold">Total cursanți</th>
              </tr>
            </thead>
          )}
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="py-6 text-center text-sm text-muted-foreground">
                  Niciun curs parcurs încă.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={index} className="border-t border-border">
                  <td className="py-3 pr-4" style={{ color: "#334155" }}>
                    {row.title}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{row.duration}</td>
                  <td className="py-3 pr-4">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={STATUS_STYLES[row.status]}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{row.finishedAt ?? "—"}</td>
                  <td className="py-3 font-semibold" style={{ color: "#007d58" }}>
                    {row.totalStudents} (Vezi listă)
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
