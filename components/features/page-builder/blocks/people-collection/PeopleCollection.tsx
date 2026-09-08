"use client";

import { useEffect, useState } from "react";
import { getMediaUrl } from "@/lib/api/client";
import { getDirectoryPeople, type DirectoryPerson } from "@/lib/api/people";
import {
  MIN_CELL_WIDTH,
  PeopleCollectionView,
  peoplePerRow,
  type ViewPerson,
} from "./PeopleCollectionView";
import {
  resolveFallbackPeople,
  type CatalogPerson,
} from "./people-catalog";
import type { PeopleCollectionData } from "./schema";

function fromDirectory(person: DirectoryPerson): ViewPerson {
  return {
    id: person.documentId,
    nume: person.nume ?? "",
    functie: person.functie ?? "",
    tip: person.tip,
    avatarUrl: person.avatar ? getMediaUrl(person.avatar.url) : null,
  };
}

function fromFallback(person: CatalogPerson): ViewPerson {
  return {
    id: person.id,
    nume: person.nume,
    functie: person.functie,
    tip: person.tip,
    avatarUrl: null,
  };
}

interface FetchState {
  key: string;
  people: ViewPerson[];
  failed: boolean;
}

/**
 * Registered renderer for the "People Collection" block. Fetches the live people
 * directory for the current filters; on failure it renders the offline fixture
 * (honouring the same settings) so the admin preview always shows something.
 */
export function PeopleCollection({ data }: { data: PeopleCollectionData }) {
  const limit =
    data.numarPersoane === "toate" ? null : Number(data.numarPersoane);
  const requestKey = [
    data.tipPersoana,
    data.programe.join(","),
    data.sortare,
    limit ?? "all",
  ].join("|");

  const [result, setResult] = useState<FetchState | null>(null);

  useEffect(() => {
    let active = true;

    getDirectoryPeople({
      type: data.tipPersoana,
      programe: data.programe,
      sort: data.sortare,
      limit,
    })
      .then((res) => {
        if (active) {
          setResult({
            key: requestKey,
            people: res.data.map(fromDirectory),
            failed: false,
          });
        }
      })
      .catch(() => {
        if (active) {
          setResult({
            key: requestKey,
            people: resolveFallbackPeople(data).map(fromFallback),
            failed: true,
          });
        }
      });

    return () => {
      active = false;
    };
    // `requestKey` folds in every filter input the fetch and fallback depend on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  if (!result || result.key !== requestKey) {
    return (
      <PeopleCollectionSkeleton
        data={data}
        placeholders={Math.min(limit ?? 8, 8)}
      />
    );
  }

  return (
    <>
      {result.failed ? (
        <p className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-xs text-amber-700">
          Previzualizare cu date demonstrative — nu am putut încărca persoanele
          din sistem.
        </p>
      ) : null}
      <PeopleCollectionView data={data} people={result.people} />
    </>
  );
}

function PeopleCollectionSkeleton({
  data,
  placeholders,
}: {
  data: PeopleCollectionData;
  /** How many placeholder cells to draw, not how many rows. */
  placeholders: number;
}) {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-20">
        {data.supratitlu || data.titlu ? (
          <div className="mx-auto mb-12 flex max-w-sm flex-col items-center gap-3">
            {data.supratitlu ? (
              <div className="h-4 w-56 animate-pulse rounded bg-muted" />
            ) : null}
            {data.titlu ? (
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            ) : null}
          </div>
        ) : null}
        {/* Same row maths as the loaded view, so the layout doesn't jump. */}
        <div className="-mx-6 overflow-x-auto px-6">
          <div
            className="grid gap-x-6 gap-y-10"
            style={{
              gridTemplateColumns: `repeat(${peoplePerRow(
                placeholders,
                data.randuri,
              )}, minmax(${MIN_CELL_WIDTH}px, 1fr))`,
            }}
          >
            {Array.from({ length: placeholders }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3"
                aria-hidden
              >
                {data.afiseazaFotografia ? (
                  <div className="h-20 w-20 animate-pulse rounded-2xl bg-muted" />
                ) : null}
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
