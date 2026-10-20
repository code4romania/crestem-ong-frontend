import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LucideIcon } from "@/components/ui/icons/LucideIcon";
import { resolveIconName } from "@/components/ui/icons/registry";
import { hasRichText } from "@/components/features/page-builder/rich-text/has-rich-text";
import { RICH_TEXT_PROSE } from "@/components/features/page-builder/rich-text/prose";
import { categoryTint } from "./category-tint";

/**
 * Only the fields the card actually paints, rather than a whole `PublicCategory`.
 * That lets the `biblioteca-categorii` page-builder block render the identical
 * card from its own injected shape — which carries no `copii` — instead of the
 * two drifting apart. `PublicCategory` satisfies this structurally.
 */
export interface CategoryCardData {
  nume: string;
  slug: string;
  descriere: string;
  /** Stored icon value (`lucide:<name>` or a legacy key); unknown → `folder`. */
  icon: string;
  numarArticole: number;
}

const resourceLabel = (count: number) => `${count} ${count === 1 ? "resursă" : "resurse"}`;

export function CategoryCard({ category }: { category: CategoryCardData }) {
  // Resolved once for the tint; `LucideIcon` resolves the same way. Unknown
  // values (saved by a newer build, or hand-edited) fall back to `folder`.
  const iconName = resolveIconName(category.icon, "library", "folder");
  const tint = categoryTint(iconName);

  return (
    <Link
      href={`/biblioteca/${category.slug}`}
      /* `h-full` makes the card fill its grid row rather than shrink to its own
         content, which is what gives the footer below something to push against. */
      className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-white p-6 transition-shadow hover:shadow-md"
    >
      <span
        className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ background: tint.bg, color: tint.fg }}
      >
        <LucideIcon value={category.icon} scope="library" fallback="folder" size={20} />
      </span>

      <h2 className="font-heading text-lg font-bold text-[#1c1c81] wrap-break-word">
        {category.nume}
      </h2>
      {category.descriere && hasRichText(category.descriere) ? (
        <div
          className={`mt-2 wrap-break-word line-clamp-5 ${RICH_TEXT_PROSE}`}
          dangerouslySetInnerHTML={{ __html: category.descriere }}
        />
      ) : null}

      {/* `mt-auto` absorbs the leftover height, so the count and the link sit on
          the card's bottom edge whatever the description's length — every card in
          a row lines them up. The spacing above comes from padding rather than a
          margin, which `mt-auto` would otherwise override. */}
      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-[#475569]">
          {resourceLabel(category.numarArticole)}
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#007d58]">
          Vezi resurse <ChevronRight size={15} />
        </span>
      </div>
    </Link>
  );
}
