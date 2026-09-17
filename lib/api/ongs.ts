import { localApiFetch } from "./local";
import { ongListQuery, type OngListParams } from "./ong-list-query";
import { apiFetch } from "./client";
import type { ReportScores } from "./reports";
import type { EvaluationDimensionBlock, EvaluationProgress } from "./evaluations";

export type { OngListParams } from "./ong-list-query";
export { ongListQuery } from "./ong-list-query";

export interface ActiveOng {
  documentId: string;
  name: string;
}

/**
 * An organization whose profile was deleted (`Șterge ONG`) keeps its reports,
 * evaluations and program enrollment (BR-33) and is shown as withdrawn wherever
 * it still appears. Lives here rather than in `programs.ts` because `ngoStatus`
 * is an attribute of the organization, and both the FDSC organizations list and
 * the program assignment table need the same predicate.
 */
export function isRetras(ong: { ngoStatus?: string }): boolean {
  return ong.ngoStatus === "deleted";
}

export interface Ong {
  documentId: string;
  name: string;
  cui: string;
  /** `"deleted"` once `Șterge ONG` has run — render the "Retras" badge. */
  ngoStatus?: string;
  website: string;
  adresa: string;
  dataInfiintare: string;
  domeniuActivitate: string;
  domeniuSecundar: string | null;
  socialMedia: string | null;
  descriere: string | null;
  memberCount: number;
  admin: {
    nume: string;
    email?: string;
    telefon?: string | null;
    createdAt?: string;
    lastLogin?: string | null;
  } | null;
  programs: { documentId: string; name: string }[];
  judet: { documentId: string; nume: string } | null;
  localitate: { documentId: string; nume: string } | null;
}

export interface OngListMeta {
  pagination: { page: number; pageSize: number; pageCount: number; total: number };
  /**
   * Every county that has organizations, for the filter dropdown. Sent with the
   * first page only — the pages after it would repeat the same list, and it
   * must not shrink to the counties the loaded pages happen to cover.
   */
  judete?: { documentId: string; nume: string }[];
}

export interface OngListResult {
  data: Ong[];
  meta: OngListMeta;
}

/** An organization as the filter dropdowns need it: something to label a choice. */
export interface OngName {
  documentId: string;
  name: string;
}

/**
 * One page of the FDSC organizations list, fetched from the browser as the
 * screen scrolls. It goes through the app's own route handler because the
 * session token is httpOnly and never reaches client code.
 */
export async function fetchOngPage(params: OngListParams): Promise<OngListResult> {
  const query = ongListQuery(params);
  const res = await fetch(`/api/ongs${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error("Nu am putut încărca organizațiile.");
  return (await res.json()) as OngListResult;
}

export interface Domain {
  documentId: string;
  name: string;
}

export function listDomains() {
  return apiFetch<{ data: Domain[] }>("/api/domains");
}

export interface MyOng {
  documentId: string;
  name: string;
  cui: string;
  judet: { documentId: string; nume: string } | null;
  localitate: { documentId: string; nume: string } | null;
  contact: { nume: string; email: string; telefon: string };
  website: string | null;
  logo: { url: string } | null;
  domeniuPrincipal: { documentId: string; name: string } | null;
  domeniuSecundar: { documentId: string; name: string } | null;
  socialMedia: string | null;
  descriere: string | null;
  cuvinteCheie: string | null;
}

export interface OngEvaluation {
  documentId: string;
  name: string;
  createdAt: string;
  finished: boolean;
  finishedAt: string | null;
  invitedCount: number;
  completedCount: number;
  scores: { dimensions: Record<string, number | null>; overall: number | null };
  phases: {
    documentId: string;
    title: string;
    startDate: string;
    endDate: string;
    program: { documentId: string; name: string } | null;
  }[];
}

export function listOngEvaluations(ongDocumentId: string, programDocumentId?: string) {
  const query = programDocumentId ? `?${new URLSearchParams({ program: programDocumentId })}` : "";
  return localApiFetch<{ data: OngEvaluation[] }>(`/api/ongs/${ongDocumentId}/evaluations${query}`);
}

export interface OngOverview {
  totalEvaluations: number;
  currentEvaluation: {
    documentId: string;
    invitedCount: number;
    completedCount: number;
    program: { documentId: string; name: string } | null;
  } | null;
  lastFinalizedDate: string | null;
}

/** One distinct article read by any of the org's members — see `ong.libraryActivity`. */
export interface OngLibraryActivityRow {
  resourceTitle: string;
  type: string;
  accessedAt: string;
  totalAccesses: number;
  /** Null when the article's taxonomy relation is incomplete and it has no addressable URL. */
  cale: string | null;
}

export interface OngFdscReport {
  documentId: string;
  name: string;
  uploadedAt: string;
  evaluation: {
    documentId: string;
    name: string;
    program: { documentId: string; name: string } | null;
  } | null;
  file: { url: string; name: string; ext: string } | null;
}

export interface OngMentor {
  documentId: string;
  /** `Anonim <documentId>` once the account is deleted. */
  nume: string;
  /** Null once the account is deleted — the stored address is a placeholder. */
  email: string | null;
  mentorJobTitle: string | null;
  mentorOrganization: string | null;
  ariiDeExpertiza: string[];
  avatar: { documentId: string; name: string; url: string } | null;
  programs: { documentId: string; name: string }[];
  /** Deleted accounts keep their assignment (BR-34); they render greyed and inert. */
  isDeleted: boolean;
}

export interface OngEvaluationDetail {
  documentId: string;
  name: string;
  createdAt: string;
  finished: boolean;
  finishedAt: string | null;
  closedBy: "manual" | "auto" | null;
  ong: { documentId: string; name: string };
  phases: {
    documentId: string;
    title: string;
    startDate: string;
    endDate: string;
    program: { documentId: string; name: string } | null;
  }[];
  invitedCount: number;
  completedCount: number;
  scores: ReportScores;
  /**
   * One entry per invited member, with their own scores and the arguments they
   * wrote. Only FDSC staff and mentors reach this endpoint, so respondents are
   * named here; the ONG admin's `/api/reports/:documentId` carries no
   * per-member data at all.
   */
  evaluations: OngEvaluationRespondent[];
}

export interface OngEvaluationRespondent {
  documentId: string;
  user: { documentId: string; nume: string; email: string | null } | null;
  progress: EvaluationProgress;
  /** `null` until the respondent has submitted every dimension. */
  completedAt: string | null;
  scores: ReportScores;
  dimensions: EvaluationDimensionBlock[];
}
