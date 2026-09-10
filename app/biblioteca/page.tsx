import { listPublicCategories } from "@/lib/api/biblioteca-public";
import { CategoryCard } from "@/components/features/biblioteca-public/CategoryCard";

export const metadata = {
  title: "Bibliotecă",
  description:
    "Articole, instrumente și modele de documente pentru organizațiile neguvernamentale.",
};

export default async function Page() {
  const categories = await listPublicCategories();

  return (
    <>
      <section className="relative overflow-hidden" style={{ background: "#162040" }}>
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <h1
            className="font-heading text-white"
            style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", fontWeight: 800, lineHeight: 1.1 }}
          >
            Bibliotecă
          </h1>
          <p
            className="mt-5 max-w-xl text-lg leading-relaxed"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            Am strâns pentru tine și colegii tăi articole, instrumente și modele de documente
            care să vă ajute să vă creșteți organizația în următorul nivel. Resursele sunt
            organizate pe categorii tematice.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        {categories.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-white px-6 py-12 text-center text-sm text-muted-foreground">
            Biblioteca nu are încă resurse publicate.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.documentId} category={category} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
