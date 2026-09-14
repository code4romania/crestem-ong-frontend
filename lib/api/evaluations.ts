import { serverApiFetch } from "./server";
import type {
  EvaluationStatus,
  ReportPhaseInfo,
  ReportScores,
} from "./reports";

export interface MyOngProgram {
  documentId: string;
  name: string;
  programStatus: "Upcoming" | "Active" | "Finished";
}

export interface MyOng {
  documentId: string;
  name: string;
  cui: string;
  website: string | null;
  adresa: string | null;
  dataInfiintare: string | null;
  domeniuActivitate: string | null;
  /** The member's own function in this organization. Null for memberships created before roles existed. */
  rol: string | null;
  programs: MyOngProgram[];
  /** The newest evaluation round this member still owes a response on, or null if none is open. */
  pendingEvaluation: { documentId: string; status: EvaluationStatus } | null;
}

export interface EvaluationProgress {
  completedDimensions: string[];
  draftDimensions: string[];
  nextDimension: string | null;
  complete: boolean;
  status: EvaluationStatus;
}

export interface OngEvaluationListItem {
  documentId: string;
  name: string | null;
  completedAt: string | null;
  progress: EvaluationProgress;
  scores: ReportScores;
  report: {
    documentId: string;
    finished: boolean;
    phases: ReportPhaseInfo[];
  } | null;
}

export interface EvaluationAnswer {
  questionId: string;
  question: string | null;
  tag: string | null;
  answer: number | null;
  answerLabel: string | null;
}

export interface EvaluationDimensionBlock {
  dimensionKey: string;
  name: string | null;
  comment: string;
  submitted: boolean;
  quiz: EvaluationAnswer[];
}

export interface EvaluationDetail {
  documentId: string;
  user: { documentId: string; nume: string; email: string } | null;
  progress: EvaluationProgress;
  completedAt: string | null;
  scores: ReportScores;
  dimensions: EvaluationDimensionBlock[];
  report: {
    documentId: string;
    name: string;
    createdAt: string;
    finished: boolean;
    finishedAt: string | null;
    phases: ReportPhaseInfo[];
  } | null;
}

/**
 * The most recent evaluation this member has neither finished answering nor
 * had closed out from under them — the one the "Evaluare în așteptare" banner
 * and its CTA point at. Mirrors the ordering the backend already returns
 * (newest first), so the first match is the one to surface.
 */
export function findActiveEvaluation(
  evaluations: OngEvaluationListItem[],
): OngEvaluationListItem | null {
  return (
    evaluations.find(
      (evaluation) =>
        !evaluation.report?.finished &&
        evaluation.progress.status !== "completat",
    ) ?? null
  );
}

export interface AdminEvaluationRow {
  documentId: string;
  ong: { documentId: string; name: string } | null;
  /** `email` is null once the account is deleted — the stored address is a placeholder. */
  user: { documentId: string; nume: string; email: string | null } | null;
  programs: { documentId: string; name: string }[];
  /** The round belongs to no program: the organization ran it on its own. */
  independent: boolean;
  status: EvaluationStatus;
  score: number | null;
  completedAt: string | null;
  report: { documentId: string; name: string } | null;
}

/** One evaluation round an organization ran — a row of the organizations tab. */
export interface AdminReportRow {
  documentId: string;
  name: string;
  ong: { documentId: string; name: string } | null;
  programs: { documentId: string; name: string }[];
  independent: boolean;
  roundStatus: "in_desfasurare" | "finalizata";
  completedCount: number;
  invitedCount: number;
  score: number | null;
  finishedAt: string | null;
}

export interface AdminEvaluationsPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface AdminListParams {
  /** Respondent address on the users tab; admin address or CUI on the rounds tab. */
  search?: string;
  /** Organization documentIds. */
  ongs?: string[];
  /** Program documentIds, possibly including `independent`. */
  programs?: string[];
  status?: string;
  page?: number;
}

function adminListQuery(params: AdminListParams) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.ongs?.length) query.set("ongs", params.ongs.join(","));
  if (params.programs?.length) query.set("programs", params.programs.join(","));
  if (params.status) query.set("status", params.status);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

/** Users tab: one row per respondent per round. */
export function listAdminEvaluations(params: AdminListParams = {}) {
  return serverApiFetch<{
    data: AdminEvaluationRow[];
    meta: { pagination: AdminEvaluationsPagination };
  }>(`/api/admin/evaluations${adminListQuery(params)}`);
}

/** Organizations tab: one row per round. */
export function listAdminReports(params: AdminListParams = {}) {
  return serverApiFetch<{
    data: AdminReportRow[];
    meta: { pagination: AdminEvaluationsPagination };
  }>(`/api/admin/reports${adminListQuery(params)}`);
}
