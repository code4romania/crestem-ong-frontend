import { History } from "lucide-react";

const COLUMNS = [
  "Data",
  "Modificat de",
  "Câmp",
  "Valoare veche",
  "Valoare nouă",
];

export function ProfileChangeLogSection() {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <History size={16} style={{ color: "#1c1c81" }} />
        <h3 className="font-heading font-bold" style={{ color: "#1c1c81" }}>
          Jurnal modificări
        </h3>
        <span
          className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-bold"
          style={{ background: "#f8fafc", color: "#5b6779" }}
        >
          0
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {COLUMNS.map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={COLUMNS.length}
                className="px-5 py-8 text-center text-sm text-muted-foreground"
              >
                Nu există modificări înregistrate pentru organizația ta.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
