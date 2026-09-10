import { buildPreviewDocument } from "./preview-document";
import type { SurseHtml } from "./split";
import type { CustomHtmlData } from "./schema";

/**
 * The block inside the builder's preview: its own document, in an iframe.
 *
 * Isolation is the point. Rendered inline here, the pasted stylesheet would
 * apply to the admin's page and its scripts would rewrite the admin's DOM —
 * both share the document the preview modal lives in. In an iframe the section
 * gets the page it was written for, and the scripts actually run, so accordions
 * and step navigation can be checked before saving.
 *
 * `allow-same-origin` is granted alongside `allow-scripts` — which does hand
 * the frame a way out of the sandbox — because the code is authored by FDSC
 * staff and runs unsandboxed on the public page anyway, and because without it
 * the frame gets an opaque origin where `localStorage` throws (the swipe-hint
 * script writes to it).
 *
 * A fixed height rather than one grown to fit the content: scroll-driven code
 * (the sections use `IntersectionObserver` to reveal cards) needs a viewport
 * shorter than the page to behave as it does for a visitor.
 */
export function CustomHtmlPreview({
  parti,
  latime,
}: {
  parti: SurseHtml;
  latime: CustomHtmlData["latime"];
}) {
  return (
    <div
      className={
        latime === "ecran" ? "px-6 py-6" : "mx-auto max-w-5xl px-6 py-6"
      }
    >
      <iframe
        title="Previzualizare cod HTML"
        srcDoc={buildPreviewDocument(parti)}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        className="h-[80vh] w-full rounded-xl border border-border bg-white"
      />
      <p className="mt-2 text-xs text-[#94a3b8]">
        Randat izolat, într-un iframe: stilurile și scripturile lipite nu ating
        editorul. Linkurile se deschid în filă nouă.
      </p>
    </div>
  );
}
