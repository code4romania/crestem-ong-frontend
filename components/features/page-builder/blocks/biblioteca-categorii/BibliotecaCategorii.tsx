import { CategoryCard } from "@/components/features/biblioteca-public/CategoryCard";
import type { BibliotecaCategoriiData } from "./schema";

const COL_CLASS: Record<BibliotecaCategoriiData["coloane"], string> = {
  "1": "sm:grid-cols-1 lg:grid-cols-1",
  "2": "sm:grid-cols-2 lg:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * "Categorii Bibliotecă" — the library's entry point on any page. Each card
 * carries the category's icon, name, description and visible article count, and
 * links to `/biblioteca/<slug>`, where the existing filtered list and article
 * page continue the journey.
 *
 * Pure and synchronous, with no hooks and no `"use client"`, because
 * `registry.ts` makes this the same component on the public page and on the
 * builder's client canvas. The categories arrive pre-resolved in
 * `categoriiRezolvate`.
 *
 * It renders the same `CategoryCard` as `/biblioteca` itself, so the two views
 * of the same data cannot drift apart.
 */
export function BibliotecaCategorii({ data }: { data: BibliotecaCategoriiData }) {
  const categorii = data.categoriiRezolvate ?? [];

  // Nothing resolved means either an unresolved block on a canvas that has not
  // been handed the taxonomy, or a library with nothing published yet. Both
  // render nothing rather than an empty heading over blank space.
  if (categorii.length === 0) return null;

  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        {data.titlu ? (
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2
              className="font-heading wrap-break-word"
              style={{
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#162040",
              }}
            >
              {data.titlu}
            </h2>
          </div>
        ) : null}

        <div className={`grid grid-cols-1 gap-6 ${COL_CLASS[data.coloane]}`}>
          {categorii.map((categorie) => (
            <CategoryCard key={categorie.documentId} category={categorie} />
          ))}
        </div>
      </div>
    </section>
  );
}
