"use client";

import { PeopleCards } from "./PeopleCards";
import { usePersonDialog } from "./usePersonDialog";
import type { PeopleGridData, Person } from "./schema";

/**
 * Card grid with click-to-expand. Used whenever at least one person has a
 * description — the card text is clamped to four lines, so the dialog is the
 * only way to read the rest. The overlay itself lives in `usePersonDialog`.
 */
export function PeopleGridDialog({
  people,
  coloane,
}: {
  people: Person[];
  coloane: PeopleGridData["coloane"];
}) {
  const { open, overlay } = usePersonDialog(people);

  return (
    <>
      <PeopleCards people={people} coloane={coloane} onSelect={open} />
      {overlay}
    </>
  );
}
