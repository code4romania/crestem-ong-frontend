import { localApiFetch } from "./local";

export interface DirectoryProgram {
  documentId: string;
  name: string;
}

export interface DirectoryPerson {
  documentId: string;
  nume: string;
  functie: string;
  organizatie: string;
  tip: "persoana-resursa" | "echipa-fdsc";
  programe: DirectoryProgram[];
  avatar: { url: string; name: string } | null;
  /** ISO date the account was created — backs the "Cele mai recente" sort. */
  adaugatLa: string;
}

export interface DirectoryPeopleParams {
  type?: "toate" | "persoana-resursa" | "echipa-fdsc";
  /** Programme documentIds; a person matches if they belong to any of them. */
  programe?: string[];
  sort?: "az" | "za" | "recente";
  /** Positive cap, or `null`/omitted for "Toate". */
  limit?: number | null;
}

/**
 * People shown by the "People Collection" block — mentors ("Persoană resursă")
 * and FDSC staff ("Echipa FDSC"). Proxied through the Next `/api` layer, which
 * forwards the FDSC-staff JWT to Strapi's `/api/people-directory`.
 */
export function getDirectoryPeople(params: DirectoryPeopleParams = {}) {
  const search = new URLSearchParams();
  if (params.type && params.type !== "toate") search.set("type", params.type);
  if (params.programe && params.programe.length > 0) {
    search.set("programe", params.programe.join(","));
  }
  if (params.sort) search.set("sort", params.sort);
  if (typeof params.limit === "number") search.set("limit", String(params.limit));

  const query = search.toString();
  return localApiFetch<{ data: DirectoryPerson[] }>(
    `/api/people-directory${query ? `?${query}` : ""}`,
  );
}

/** Programme list for the block's "Program" filter picker. */
export function getDirectoryPrograms() {
  return localApiFetch<{ data: DirectoryProgram[] }>(
    "/api/people-directory/programs",
  );
}
