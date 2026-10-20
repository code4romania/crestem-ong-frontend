"use client";

import { PeopleCards } from "./PeopleCards";
import { usePersonDialog } from "./usePersonDialog";
import type { ImageRatioWithImplicit } from "../shared/image-ratio";
import type { PeopleGridData, Person } from "./schema";

/**
 * Card grid with click-to-expand. Used whenever at least one person has a
 * description — the card text is clamped to four lines, so the dialog is the
 * only way to read the rest. The overlay itself lives in `usePersonDialog`.
 */
export function PeopleGridDialog({
  people,
  coloane,
  raport,
}: {
  people: Person[];
  coloane: PeopleGridData["coloane"];
  raport: ImageRatioWithImplicit;
}) {
  // Any explicit ratio means the admin cares about the image's framing, so the
  // dialog shows it whole instead of re-cropping it to its own banner.
  const { open, overlay } = usePersonDialog(people, raport !== "implicit");

  return (
    <>
      <PeopleCards
        people={people}
        coloane={coloane}
        raport={raport}
        onSelect={open}
      />
      {overlay}
    </>
  );
}
