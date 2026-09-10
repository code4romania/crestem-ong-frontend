import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { CATEGORY_ICONS } from "@/components/features/page-builder/blocks/category-grid/icons";

/**
 * Indexed by a plain string on purpose: a category can carry an icon key this
 * build does not know — saved by a newer one, or edited by hand — and the card
 * should fall back rather than fail to compile against a closed union it cannot
 * guarantee at runtime.
 */
const ICONS: Record<string, LucideIcon> = CATEGORY_ICONS;

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
  /** A key from the twelve-icon palette; anything unknown falls back to `folder`. */
  icon: string;
  numarArticole: number;
}

/** One accent per icon, so a category's mark and its tint are one decision. */
const ICON_TINT: Record<string, { bg: string; fg: string }> = {
  folder: { bg: "#eff6ff", fg: "#2563eb" },
  settings: { bg: "#eff6ff", fg: "#2563eb" },
  scale: { bg: "#fef2f2", fg: "#dc2626" },
  message: { bg: "#ecfdf5", fg: "#059669" },
  trending: { bg: "#fffbeb", fg: "#d97706" },
  users: { bg: "#f5f3ff", fg: "#7c3aed" },
  award: { bg: "#ecfdf5", fg: "#059669" },
  book: { bg: "#eff6ff", fg: "#2563eb" },
  globe: { bg: "#ecfeff", fg: "#0891b2" },
  heart: { bg: "#fdf2f8", fg: "#db2777" },
  briefcase: { bg: "#f8fafc", fg: "#475569" },
  calendar: { bg: "#fffbeb", fg: "#d97706" },
};

const resourceLabel = (count: number) => `${count} ${count === 1 ? "resursă" : "resurse"}`;

export function CategoryCard({ category }: { category: CategoryCardData }) {
  const Icon = ICONS[category.icon] ?? CATEGORY_ICONS.folder;
  const tint = ICON_TINT[category.icon] ?? ICON_TINT.folder;

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
        <Icon size={20} />
      </span>

      <h2 className="font-heading text-lg font-bold text-[#162040] wrap-break-word">
        {category.nume}
      </h2>
      {category.descriere ? (
        <p className="mt-2 text-sm leading-relaxed text-[#475569] wrap-break-word">
          {category.descriere}
        </p>
      ) : null}

      {/* `mt-auto` absorbs the leftover height, so the count and the link sit on
          the card's bottom edge whatever the description's length — every card in
          a row lines them up. The spacing above comes from padding rather than a
          margin, which `mt-auto` would otherwise override. */}
      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-[#475569]">
          {resourceLabel(category.numarArticole)}
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#2dbe8f]">
          Vezi resurse <ChevronRight size={15} />
        </span>
      </div>
    </Link>
  );
}
