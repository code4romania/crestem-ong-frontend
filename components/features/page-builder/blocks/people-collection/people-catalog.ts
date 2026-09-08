import type { PeopleCollectionData } from "./schema";

/**
 * Offline fallback fixture. The block fetches the real people directory
 * (`lib/api/people.ts`); this list is only rendered when that request fails, so
 * the admin preview never collapses to an empty section. Keep the shape in sync
 * with `DirectoryPerson`.
 */

export type PersonType = "persoana-resursa" | "echipa-fdsc";

export interface CatalogPerson {
  id: string;
  nume: string;
  functie: string;
  organizatie: string;
  tip: PersonType;
  programe: string[];
  /** ISO date — drives the "Cele mai recente" ordering. */
  adaugatLa: string;
}

/** Label shown under the name when "Afișează tipul" is on. */
export const PERSON_TYPE_LABEL: Record<PersonType, string> = {
  "persoana-resursa": "Persoană resursă",
  "echipa-fdsc": "Echipa FDSC",
};

export const FALLBACK_PROGRAMS: { documentId: string; name: string }[] = [
  { documentId: "accelerator-schimbare-sociala", name: "Social Change Accelerator" },
  { documentId: "leadership-ong", name: "Leadership în ONG" },
  { documentId: "fundraising-avansat", name: "Fundraising avansat" },
  { documentId: "management-financiar", name: "Management financiar" },
];

export const FALLBACK_PEOPLE: CatalogPerson[] = [
  {
    id: "ana-moldovan",
    nume: "Ana Moldovan",
    functie: "Fondatoare & CEO",
    organizatie: "Creștem ONG",
    tip: "echipa-fdsc",
    programe: [],
    adaugatLa: "2024-01-15",
  },
  {
    id: "radu-ionescu",
    nume: "Radu Ionescu",
    functie: "Director de Programe",
    organizatie: "Creștem ONG",
    tip: "echipa-fdsc",
    programe: [],
    adaugatLa: "2024-02-01",
  },
  {
    id: "elena-popa",
    nume: "Elena Popa",
    functie: "Manager Comunitate",
    organizatie: "Creștem ONG",
    tip: "echipa-fdsc",
    programe: [],
    adaugatLa: "2024-03-10",
  },
  {
    id: "mihai-constantin",
    nume: "Mihai Constantin",
    functie: "Expert juridic",
    organizatie: "Creștem ONG",
    tip: "echipa-fdsc",
    programe: [],
    adaugatLa: "2024-04-05",
  },
  {
    id: "ioana-danila",
    nume: "Ioana Dănilă",
    functie: "Manager Conținut",
    organizatie: "Creștem ONG",
    tip: "echipa-fdsc",
    programe: [],
    adaugatLa: "2024-05-20",
  },
  {
    id: "cristian-barbu",
    nume: "Cristian Barbu",
    functie: "Manager Parteneriate",
    organizatie: "Creștem ONG",
    tip: "echipa-fdsc",
    programe: [],
    adaugatLa: "2024-06-12",
  },
  {
    id: "radu-constantin",
    nume: "Radu Constantin",
    functie: "Consultant Senior",
    organizatie: "EcoSens",
    tip: "persoana-resursa",
    programe: ["fundraising-avansat"],
    adaugatLa: "2024-07-01",
  },
  {
    id: "maria-ene",
    nume: "Maria Ene",
    functie: "Trainer Leadership",
    organizatie: "Independent",
    tip: "persoana-resursa",
    programe: ["leadership-ong"],
    adaugatLa: "2024-08-18",
  },
  {
    id: "andrei-vlad",
    nume: "Andrei Vlad",
    functie: "Mentor Fundraising",
    organizatie: "DonorLab",
    tip: "persoana-resursa",
    programe: ["fundraising-avansat", "accelerator-schimbare-sociala"],
    adaugatLa: "2024-09-09",
  },
  {
    id: "sorina-marcu",
    nume: "Sorina Marcu",
    functie: "Expert Financiar",
    organizatie: "ContaPlus",
    tip: "persoana-resursa",
    programe: ["management-financiar"],
    adaugatLa: "2024-10-02",
  },
  {
    id: "paul-dima",
    nume: "Paul Dima",
    functie: "Consultant Strategie",
    organizatie: "Independent",
    tip: "persoana-resursa",
    programe: ["accelerator-schimbare-sociala"],
    adaugatLa: "2024-11-14",
  },
  {
    id: "diana-rusu",
    nume: "Diana Rusu",
    functie: "Mentor Comunicare",
    organizatie: "Independent",
    tip: "persoana-resursa",
    programe: [],
    adaugatLa: "2024-12-01",
  },
];

/**
 * "Ana Moldovan" -> "AM". Used for the avatar fallback. Tolerates a missing
 * name: legacy user rows can have no `nume`, and an empty badge beats a crash.
 */
export function personInitials(nume: string | null | undefined): string {
  return (nume ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Same filter/sort/cap the backend applies, run against the fixture so the
 * offline fallback still honours the block's settings.
 */
export function resolveFallbackPeople(
  data: PeopleCollectionData,
): CatalogPerson[] {
  let list = [...FALLBACK_PEOPLE];

  if (data.tipPersoana !== "toate") {
    list = list.filter((p) => p.tip === data.tipPersoana);
  }

  if (data.programe.length > 0) {
    const wanted = new Set(data.programe);
    list = list.filter((p) => p.programe.some((slug) => wanted.has(slug)));
  }

  if (data.sortare === "az") {
    list.sort((a, b) => a.nume.localeCompare(b.nume, "ro"));
  } else if (data.sortare === "za") {
    list.sort((a, b) => b.nume.localeCompare(a.nume, "ro"));
  } else {
    list.sort((a, b) => b.adaugatLa.localeCompare(a.adaugatLa));
  }

  if (data.numarPersoane !== "toate") {
    list = list.slice(0, Number(data.numarPersoane));
  }

  return list;
}
