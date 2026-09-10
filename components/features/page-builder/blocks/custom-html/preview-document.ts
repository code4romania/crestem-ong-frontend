import type { SurseHtml } from "./split";

/**
 * `</script>` inside the code would close the surrounding element and spill the
 * rest of the script into the page as text.
 */
function escapeClosingTag(cod: string): string {
  return cod.replace(/<\/script/gi, "<\\/script");
}

function scriptTag(script: SurseHtml["scripturi"][number]): string {
  if ("src" in script) return `<script src="${script.src}"></script>`;
  return `<script>${escapeClosingTag(script.cod)}</script>`;
}

/**
 * Builds the whole document the preview iframe runs: the block's stylesheet in
 * the head, its markup in the body, its scripts after the markup — the order
 * the code was written for.
 *
 * `<base target="_blank">` keeps the preview from navigating itself away when
 * an admin clicks a link inside the pasted section.
 */
export function buildPreviewDocument(parti: SurseHtml): string {
  const scripturi = parti.scripturi.map(scriptTag).join("\n");

  return [
    "<!doctype html>",
    '<html lang="ro">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<base target="_blank">',
    "<style>html,body{margin:0}</style>",
    parti.css ? `<style>${parti.css}</style>` : "",
    "</head>",
    "<body>",
    parti.html,
    scripturi,
    "</body>",
    "</html>",
  ]
    .filter(Boolean)
    .join("\n");
}
