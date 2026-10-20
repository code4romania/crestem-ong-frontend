import { ChevronRight } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import {
  imageRatioClass,
  type ImageRatioWithImplicit,
} from "../shared/image-ratio";
import type { Person, PeopleGridData } from "./schema";
import { RichTextContent } from "../../rich-text/RichTextContent";
import { hasRichText } from "../../rich-text/has-rich-text";

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

function CardBody({
  person,
  clickable,
  raport,
}: {
  person: Person;
  clickable: boolean;
  raport: ImageRatioWithImplicit;
}) {
  return (
    <>
      {person.imagine ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={getMediaUrl(person.imagine.url)}
          alt={person.imagineAlt || person.nume}
          className={`block w-full ${
            raport === "implicit" ? "h-64 object-cover" : imageRatioClass(raport)
          }`}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold text-[#1c1c81] wrap-break-word">
          {person.nume}
        </h3>

        {person.rol ? (
          <p className="mt-1 text-sm font-semibold text-[#007d58] wrap-break-word">
            {person.rol}
          </p>
        ) : null}

        {person.organizatie ? (
          <p className="mt-0.5 text-sm text-[#5b6779] wrap-break-word">
            {person.organizatie}
          </p>
        ) : null}

        <RichTextContent html={person.descriere} className="mt-3 text-sm leading-relaxed text-[#475569] wrap-break-word line-clamp-4" />

        <div className="mt-auto">
          {person.taguri.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-4">
              {person.taguri.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full px-2.5 py-1 text-xs font-medium wrap-break-word"
                  style={{ background: "rgba(0,212,149,0.12)", color: "#007d58" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {clickable ? (
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#007d58]">
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
  raport,
  onSelect,
}: {
  person: Person;
  index: number;
  raport: ImageRatioWithImplicit;
  onSelect?: (index: number) => void;
}) {
  // Only a person who actually has something more to read is worth opening.
  const clickable = Boolean(onSelect) && hasRichText(person.descriere);

  if (!clickable) {
    return (
      <div className={CARD_CLASS}>
        <CardBody person={person} clickable={false} raport={raport} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect?.(index)}
      aria-label={`Vezi descrierea completă: ${person.nume}`}
      className={`group cursor-pointer text-left transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-[#00d495]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007d58] ${CARD_CLASS}`}
    >
      <CardBody person={person} clickable raport={raport} />
    </button>
  );
}

export function PeopleCards({
  people,
  coloane,
  raport,
  onSelect,
}: {
  people: Person[];
  coloane: PeopleGridData["coloane"];
  raport: ImageRatioWithImplicit;
  onSelect?: (index: number) => void;
}) {
  return (
    <div className={`grid grid-cols-1 gap-6 ${COL_CLASS[coloane]}`}>
      {people.map((person, index) => (
        <PersonCard
          key={index}
          person={person}
          index={index}
          raport={raport}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
