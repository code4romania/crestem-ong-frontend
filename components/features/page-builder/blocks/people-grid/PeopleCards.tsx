import { ChevronRight } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import type { Person, PeopleGridData } from "./schema";

/**
 * Shared card grid for the People Grid block. Pure (no hooks, no `"use client"`)
 * so `PeopleGrid.tsx` can render it on the server; `PeopleGridDialog` reuses the
 * exact same layout on the client and passes `onSelect` to turn every card with
 * a description into a "read the full text" trigger. Column classes are spelled
 * out as literals so the Tailwind v4 scanner picks them up.
 */
const COL_CLASS: Record<PeopleGridData["coloane"], string> = {
  "1": "sm:grid-cols-1 lg:grid-cols-1",
  "2": "sm:grid-cols-2 lg:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

const CARD_CLASS =
  "flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-border";

function CardBody({ person, clickable }: { person: Person; clickable: boolean }) {
  return (
    <>
      {person.imagine ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={getMediaUrl(person.imagine.url)}
          alt={person.imagineAlt || person.nume}
          className="block h-64 w-full object-cover"
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold text-[#162040] wrap-break-word">
          {person.nume}
        </h3>

        {person.rol ? (
          <p className="mt-1 text-sm font-semibold text-[#2dbe8f] wrap-break-word">
            {person.rol}
          </p>
        ) : null}

        {person.organizatie ? (
          <p className="mt-0.5 text-sm text-[#64748b] wrap-break-word">
            {person.organizatie}
          </p>
        ) : null}

        {person.descriere ? (
          <p className="mt-3 text-sm leading-relaxed text-[#475569] wrap-break-word line-clamp-4">
            {person.descriere}
          </p>
        ) : null}

        <div className="mt-auto">
          {person.taguri.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-4">
              {person.taguri.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full px-2.5 py-1 text-xs font-medium wrap-break-word"
                  style={{ background: "rgba(45,190,143,0.12)", color: "#2dbe8f" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {clickable ? (
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#2dbe8f]">
              Citește mai mult
              <ChevronRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          ) : null}
        </div>
      </div>
    </>
  );
}

function PersonCard({
  person,
  index,
  onSelect,
}: {
  person: Person;
  index: number;
  onSelect?: (index: number) => void;
}) {
  // Only a person who actually has something more to read is worth opening.
  const clickable = Boolean(onSelect && person.descriere);

  if (!clickable) {
    return (
      <div className={CARD_CLASS}>
        <CardBody person={person} clickable={false} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect?.(index)}
      aria-label={`Vezi descrierea completă: ${person.nume}`}
      className={`group cursor-pointer text-left transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-[#2dbe8f]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbe8f] ${CARD_CLASS}`}
    >
      <CardBody person={person} clickable />
    </button>
  );
}

export function PeopleCards({
  people,
  coloane,
  onSelect,
}: {
  people: Person[];
  coloane: PeopleGridData["coloane"];
  onSelect?: (index: number) => void;
}) {
  return (
    <div className={`grid grid-cols-1 gap-6 ${COL_CLASS[coloane]}`}>
      {people.map((person, index) => (
        <PersonCard
          key={index}
          person={person}
          index={index}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
