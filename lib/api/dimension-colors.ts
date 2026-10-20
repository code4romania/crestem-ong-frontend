export function dimensionColor(score: number | null) {
  if (score == null) return "#5b6779";
  if (score >= 60) return "#007d58";
  if (score >= 35) return "#b45309";
  return "#dc2626";
}

export function dimensionPillStyle(score: number | null) {
  if (score == null) return { background: "#f8fafc", color: "#5b6779", border: "1px solid #e2e8f0" };
  if (score >= 60) return { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" };
  if (score >= 35) return { background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" };
  return { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" };
}

export function dimensionLabel(score: number | null) {
  if (score == null) return "—";
  if (score >= 60) return "Ridicat";
  if (score >= 35) return "Mediu";
  return "Scăzut";
}
