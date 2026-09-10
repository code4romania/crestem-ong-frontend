import { Code2 } from "lucide-react";
import type { SurseHtml } from "./split";
import type { CustomHtmlData } from "./schema";

function kb(text: string): string {
  return Math.max(1, Math.round(text.length / 1024)) + " kB";
}

/**
 * What the block looks like inside the builder. Deliberately not a preview:
 * the pasted stylesheet is global, and the site's sections carry fixed-position
 * navigation, so rendering them here would lay them over the admin UI — in the
 * canvas and in the preview modal alike, since both share this document.
 *
 * The section is seen for real on the page itself, once saved.
 */
export function CustomHtmlPlaceholder({
  data,
  parti,
}: {
  data: CustomHtmlData;
  parti: SurseHtml;
}) {
  const detalii = [
    parti.html.trim() ? "HTML " + kb(parti.html) : null,
    parti.css.trim() ? "CSS " + kb(parti.css) : null,
    parti.scripturi.length > 0 ? parti.scripturi.length + " scripturi" : null,
    data.latime === "ecran" ? "ecran complet" : null,
  ].filter(Boolean);

  return (
    <div className="flex items-start gap-3 px-6 py-8">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f8fafc] text-[#64748b]">
        <Code2 size={18} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-[#162040]">
          {data.eticheta.trim() || "Cod HTML"}
        </p>
        <p className="mt-1 text-sm text-[#64748b]">
          {detalii.length > 0 ? detalii.join(" · ") : "Bloc gol"}
        </p>
        <p className="mt-2 text-xs text-[#94a3b8]">
          Se randează doar pe pagina publică — stilurile și scripturile lipite
          ar acoperi editorul.
        </p>
      </div>
    </div>
  );
}
