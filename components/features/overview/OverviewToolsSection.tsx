import Link from "next/link";

const TOOLS: { title: string; description: string; href: string | null }[] = [
  {
    title: "Biblioteca de resurse",
    description: "Accesează resursele disponibile pentru ONG",
    href: "/biblioteca",
  },
  // E-learning: module not implemented yet, hidden until it ships.
  // {
  //   title: "E-Learning",
  //   description: "Accesează cursurile online disponibile pentru ONG-ul tău",
  //   href: null,
  // },
];

/**
 * A tool without an `href` is still unbuilt, so its `Vezi →` stays inert text
 * rather than a link that would dead-end on a placeholder page.
 */
export function OverviewToolsSection() {
  return (
    <section>
      <h2 className="text-xl font-heading font-extrabold text-primary mb-4">
        Alte instrumente disponibile
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {TOOLS.map((tool) => (
          <div key={tool.title} className="bg-white rounded-xl border border-border p-5">
            <p className="text-base font-heading font-bold text-primary">{tool.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
            {tool.href ? (
              <Link
                href={tool.href}
                className="mt-4 inline-block text-sm font-semibold text-accent-strong hover:underline"
              >
                Vezi →
              </Link>
            ) : (
              <p className="mt-4 text-sm font-semibold text-accent-strong opacity-60 cursor-not-allowed" title="Disponibil în curând">
                Vezi →
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
