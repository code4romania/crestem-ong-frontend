import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CATEGORY_ICONS } from "./icons";
import type { Category, CategoryGridData } from "./schema";

const COL_CLASS: Record<CategoryGridData["coloane"], string> = {
  "1": "sm:grid-cols-1 lg:grid-cols-1",
  "2": "sm:grid-cols-2 lg:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

function CategoryCard({ category }: { category: Category }) {
  const Icon = CATEGORY_ICONS[category.icon];
  const hasCount = category.numarResurse !== null;
  const hasFooter = hasCount || Boolean(category.href);

  return (
    <div className="flex min-w-0 flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ background: "rgba(45,190,143,0.12)", color: "#2dbe8f" }}
      >
        <Icon size={20} />
      </span>

      <h3 className="mt-4 min-w-0 text-lg font-semibold text-[#162040] wrap-break-word">
        {category.titlu}
      </h3>

      {category.descriere ? (
        <p className="mt-2 text-sm leading-relaxed text-[#475569] wrap-break-word line-clamp-3">
          {category.descriere}
        </p>
      ) : null}

      {hasFooter ? (
        <div className="mt-auto flex items-center gap-3 pt-5">
          {hasCount ? (
            <span
              className="rounded-lg px-2.5 py-1 text-xs font-medium"
              style={{ background: "#f1f5f9", color: "#64748b" }}
            >
              {category.numarResurse}{" "}
              {category.numarResurse === 1 ? "resursă" : "resurse"}
            </span>
          ) : null}

          {category.href ? (
            <Link
              href={category.href}
              className="ml-auto flex items-center gap-1 text-sm font-semibold wrap-break-word"
              style={{ color: "#2dbe8f" }}
            >
              Vezi resurse <ChevronRight size={15} className="shrink-0" />
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * "Category Grid" — a titled section with a responsive grid of authored
 * category cards (icon, title, description, resource count, link). Content is
 * hand-entered in the editor. Pure (no hooks, no `"use client"`) so it can
 * render on the public page unchanged.
 */
export function CategoryGrid({ data }: { data: CategoryGridData }) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        {data.titlu ? (
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2
              className="font-heading wrap-break-word"
              style={{
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#162040",
              }}
            >
              {data.titlu}
            </h2>
          </div>
        ) : null}

        {data.categorii.length > 0 ? (
          <div className={`grid grid-cols-1 gap-6 ${COL_CLASS[data.coloane]}`}>
            {data.categorii.map((category, index) => (
              <CategoryCard key={index} category={category} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border-2 border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            Nicio categorie de afișat.
          </p>
        )}
      </div>
    </section>
  );
}
