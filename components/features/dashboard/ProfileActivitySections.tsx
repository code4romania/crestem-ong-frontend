import { BookOpen } from "lucide-react";
// import { GraduationCap } from "lucide-react"; // E-learning: not implemented yet, section commented out below

export function ProfileActivitySections() {
  return (
    <>
      <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <BookOpen size={16} style={{ color: "#162040" }} />
          <h3 className="font-heading font-bold" style={{ color: "#162040" }}>
            Articole citite din Bibliotecă
          </h3>
          <span
            className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "#eff6ff", color: "#2563eb" }}
          >
            0
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["Titlu resursă", "Tip", "Accesat la"].map((h) => (
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
              <td colSpan={3} className="px-5 py-8 text-center text-sm text-muted-foreground">
                Nu ai citit niciun articol din bibliotecă încă.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* E-learning: module not implemented yet, hidden until it ships.
      <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <GraduationCap size={16} style={{ color: "#162040" }} />
          <h3 className="font-heading font-bold" style={{ color: "#162040" }}>
            Cursuri parcurse
          </h3>
          <span
            className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "#f0faf6", color: "#2dbe8f" }}
          >
            0
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["Titlu curs", "Durată", "Status", "Finalizat la"].map((h) => (
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
              <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">
                Nu ai parcurs niciun curs încă.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      */}
    </>
  );
}
