import { PeopleCards } from "./PeopleCards";
import { PeopleGridDialog } from "./PeopleGridDialog";
import type { PeopleGridData } from "./schema";

/**
 * "People Grid" — a titled section with a responsive grid of authored people
 * cards (image, name, role, organisation, description, tags). Content is
 * hand-entered in the editor. Server component: card descriptions are clamped
 * to four lines, so as soon as one person has a description the grid is handed
 * to the `"use client"` `<PeopleGridDialog>` that makes those cards open a
 * detail modal (same split as the Gallery block). With no descriptions at all
 * there is nothing to expand, and the pure `<PeopleCards>` renders on the
 * server unchanged.
 */
export function PeopleGrid({ data }: { data: PeopleGridData }) {
  const expandable = data.persoane.some((person) => person.descriere);

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

        {data.persoane.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            Nicio persoană de afișat.
          </p>
        ) : expandable ? (
          <PeopleGridDialog people={data.persoane} coloane={data.coloane} />
        ) : (
          <PeopleCards people={data.persoane} coloane={data.coloane} />
        )}
      </div>
    </section>
  );
}
