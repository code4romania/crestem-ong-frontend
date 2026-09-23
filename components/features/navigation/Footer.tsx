import Link from "next/link";
import { SocialIcon } from "@/components/ui/SocialIcon";
import {
  FOOTER_IMAGE_PROSE,
  RICH_TEXT_PROSE_INVERSE,
} from "@/components/features/page-builder/rich-text/prose";
import { socialName, type FooterContent } from "@/lib/api/footer-types";
import type { MenuItem } from "@/lib/api/menus";

/**
 * The public footer: the left side comes from the `footer` single type, the
 * columns on the right from the footer menu — each top-level item is a column
 * heading and its children are that column's links.
 *
 * Nothing here is hardcoded. Every part is what an FDSC administrator entered,
 * and a part left empty simply does not render — including the footer itself,
 * when all of it is empty.
 */
export function Footer({ content, items }: { content: FooterContent; items: MenuItem[] }) {
  const columns = items.filter((item) => item.children.length > 0);

  const empty =
    !content.description &&
    !content.copyright &&
    content.socials.length === 0 &&
    columns.length === 0;

  // Nothing configured, nothing rendered — no empty dark band at the bottom of
  // every page.
  if (empty) return null;

  return (
    <footer className="bg-[#101c30] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
            {content.description && (
              <div
                className={`max-w-sm ${RICH_TEXT_PROSE_INVERSE} ${FOOTER_IMAGE_PROSE}`}
                // Already sanitised by `getFooter` / `updateFooterAction`; this
                // is a client component, so DOMPurify must not be reachable here.
                dangerouslySetInnerHTML={{ __html: content.description }}
              />
            )}

            {content.socials.length > 0 && (
              <ul className="mt-6 flex items-center gap-3">
                {content.socials.map((social) => (
                  <li key={`${social.platform}-${social.label ?? ""}`}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={socialName(social)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                    >
                      <SocialIcon platform={social.platform} size={18} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {columns.length > 0 && (
            // auto-fit rather than a fixed 3-column grid: unused tracks collapse,
            // so two columns don't leave an empty third slot pushing them off to
            // one side. Unlike flex-wrap, grid justify-content centres the whole
            // block at once, so a column that wraps to its own row still lines up
            // under the same track instead of floating centred on its own line.
            <div className="grid grid-cols-[repeat(auto-fit,minmax(9rem,max-content))] justify-center gap-x-12 gap-y-8">
              {columns.map((column) => (
                <div key={column.label}>
                  <p className="font-heading text-sm font-bold text-white">{column.label}</p>
                  <ul className="mt-4 space-y-3">
                    {/* A link whose page was deleted has no address left; the
                        editor shows it as broken, visitors never see it. */}
                    {column.children.map((child) =>
                      child.url ? (
                        <li key={`${child.label}-${child.url}`}>
                          <Link
                            href={child.url}
                            className="text-sm text-white/60 transition-colors hover:text-white"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ) : null,
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {content.copyright && (
          <div className="mt-12 border-t border-white/10 pt-6">
            <p className="text-sm text-white/50">{content.copyright}</p>
          </div>
        )}
      </div>
    </footer>
  );
}
