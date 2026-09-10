import { CustomHtmlScripts } from "./CustomHtmlScripts";
import type { SurseHtml } from "./split";
import type { CustomHtmlData } from "./schema";

/**
 * The block as the visitor gets it: markup server-rendered, stylesheet emitted
 * next to it, scripts run after mount. The three parts arrive already split
 * out of the stored source.
 *
 * Nothing is sanitised and nothing is scoped — the block carries the site's
 * hand-written sections across unchanged, and both a sanitiser and a shadow
 * root would break them (their own scripts reach for
 * `document.querySelectorAll`). Only FDSC staff can reach the page editor,
 * which is what makes that acceptable — see `schema.ts`.
 *
 * No vertical padding of its own: pasted sections bring their own spacing, and
 * a Spacer block covers the rest.
 */
export function CustomHtmlContent({
  parti,
  latime,
}: {
  parti: SurseHtml;
  latime: CustomHtmlData["latime"];
}) {
  const { html, css, scripturi } = parti;

  return (
    <section data-custom-html>
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
      <div
        className={latime === "ecran" ? undefined : "mx-auto max-w-5xl px-6"}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <CustomHtmlScripts scripturi={scripturi} />
    </section>
  );
}
