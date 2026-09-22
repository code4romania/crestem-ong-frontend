export type EvaluationStatus = "neinceput" | "in_lucru" | "completat" | "nefinalizat";

export interface RoundSummary {
  documentId: string;
  name: string;
  finished: boolean;
  invitedCount: number;
  completedCount: number;
  score: number | null;
}

export interface RoundPhase {
  documentId: string;
  title: string;
  startDate: string;
  endDate: string;
  hasEvaluation: boolean;
  active: boolean;
  report: RoundSummary | null;
}

export interface ProgramRound {
  program: {
    documentId: string;
    name: string;
    startDate: string;
    endDate: string;
    programStatus: "Upcoming" | "Active" | "Finished";
    ongsCount: number;
  };
  phases: RoundPhase[];
}

export interface ReportsCurrent {
  programRounds: ProgramRound[];
  standaloneReports: RoundSummary[];
}

/**
 * The program the Overview tab reports on: the one with a phase running today,
 * falling back to the most recently started `Active` program. An ONG enrolled
 * only in finished/upcoming programs has no current program at all.
 */
export function findCurrentProgramRound(programRounds: ProgramRound[]): ProgramRound | null {
  const running = programRounds.find(({ phases }) => phases.some((phase) => phase.active));
  if (running) return running;
  const active = programRounds.filter(({ program }) => program.programStatus === "Active");
  if (active.length === 0) return null;
  return active.reduce((latest, round) =>
    `${round.program.startDate}` > `${latest.program.startDate}` ? round : latest,
  );
}

export interface ProgramOverviewStats {
  /** Distinct reports the ONG ran inside this program. */
  totalEvaluationSessions: number;
  /** The evaluation to surface as "Evaluare curentă", if one is under way. */
  currentReport: RoundSummary | null;
  /** End of the evaluation phase in play — the deadline shown on the card. */
  evaluationEndDate: string | null;
}

/** Counters for the Overview tab, all scoped to a single program round. */
export function getProgramOverviewStats({ phases }: ProgramRound): ProgramOverviewStats {
  // A report can be attached to more than one phase, so count report ids, not phases.
  const reportIds = new Set(
    phases.map((phase) => phase.report?.documentId).filter((id): id is string => Boolean(id)),
  );
  const evaluationPhases = phases.filter((phase) => phase.hasEvaluation);
  const currentPhase =
    evaluationPhases.find((phase) => phase.active) ??
    evaluationPhases.find((phase) => phase.report && !phase.report.finished) ??
    null;
  const currentReport =
    currentPhase?.report ??
    phases.find((phase) => phase.report && !phase.report.finished)?.report ??
    null;
  return {
    totalEvaluationSessions: reportIds.size,
    currentReport,
    evaluationEndDate:
      currentPhase?.endDate ?? evaluationPhases.at(-1)?.endDate ?? null,
  };
}

export interface ActiveEvaluationContext {
  report: RoundSummary;
  /** null when the active report is independent (not tied to a program). */
  programName: string | null;
  phaseTitle: string | null;
}

/**
 * An ONG can have at most one active (unfinished) evaluation at a time (BR-19),
 * whether it's tied to a program phase or independent. Finds that report, if any,
 * along with the program/phase it belongs to.
 */
export function findActiveEvaluationContext(
  programRounds: ProgramRound[],
  standaloneReports: RoundSummary[],
): ActiveEvaluationContext | null {
  const standalone = standaloneReports.find((report) => !report.finished);
  if (standalone) return { report: standalone, programName: null, phaseTitle: null };
  for (const { program, phases } of programRounds) {
    for (const phase of phases) {
      if (phase.report && !phase.report.finished) {
        return { report: phase.report, programName: program.name, phaseTitle: phase.title };
      }
    }
  }
  return null;
}

/**
 * An ONG can have at most one active (unfinished) evaluation at a time (BR-19),
 * whether it's tied to a program phase or independent. Finds that report, if any.
 */
export function findActiveReport(
  programRounds: ProgramRound[],
  standaloneReports: RoundSummary[],
): RoundSummary | null {
  return findActiveEvaluationContext(programRounds, standaloneReports)?.report ?? null;
}

export type EvaluationLock =
  | { reason: "active-phase"; programName: string }
  | { reason: "active-report"; report: RoundSummary };

/**
 * BR-19: while any of the ONG's programs has an evaluation phase currently in
 * its date window, the ONG cannot start an independent evaluation — it must
 * start the program's evaluation instead. Failing that, it's blocked by any
 * other active report. Mirrors the checks in the backend `report.start` action.
 */
export function getIndependentStartLock(
  programRounds: ProgramRound[],
  standaloneReports: RoundSummary[],
): EvaluationLock | null {
  const activePhaseProgram = programRounds.find(({ phases }) =>
    phases.some((phase) => phase.hasEvaluation && phase.active && !phase.report?.finished),
  )?.program;
  if (activePhaseProgram) {
    return { reason: "active-phase", programName: activePhaseProgram.name };
  }
  const activeReport = findActiveReport(programRounds, standaloneReports);
  return activeReport ? { reason: "active-report", report: activeReport } : null;
}

export interface ReportPhaseInfo {
  documentId: string;
  title: string;
  startDate: string;
  endDate: string;
  program: { documentId: string; name: string } | null;
}

export interface ReportScores {
  dimensions: Record<string, number | null>;
  /** Sub-indicator scores keyed by question id — one entry per quiz question. */
  questions: Record<string, number | null>;
  overall: number | null;
}

export interface DimensionComment {
  /** `null` when the payload withholds attribution, as the ONG admin's does. */
  author: string | null;
  text: string;
}

export interface ReportListItem {
  documentId: string;
  name: string;
  createdAt: string;
  finished: boolean;
  finishedAt: string | null;
  closedBy: "manual" | "auto" | null;
  phases: ReportPhaseInfo[];
  invitedCount: number;
  completedCount: number;
  /**
   * Report-level averages, the same numbers `/api/reports/:documentId` returns.
   * They ride along on the list so the Comparație tab can chart every finished
   * evaluation from one request. Dimensions with no complete respondent are
   * `null`, and `overall` is `null` unless every dimension has a score.
   */
  scores: ReportScores;
}

export interface ReportDetail {
  documentId: string;
  name: string;
  createdAt: string;
  finished: boolean;
  finishedAt: string | null;
  closedBy: "manual" | "auto" | null;
  canDelete: boolean;
  phases: ReportPhaseInfo[];
  invitedCount: number;
  completedCount: number;
  scores: ReportScores;
  /**
   * Members' written arguments per dimension, keyed by dimension key. Always
   * unattributed on this endpoint — the ONG admin sees what was said, not who
   * said it.
   */
  comments: Record<string, DimensionComment[]>;
}

export interface ReportMember {
  documentId: string;
  /** `email` is `null` once the respondent anonymized their account (BR-27). */
  user: { documentId: string; nume: string; email: string | null } | null;
  status: EvaluationStatus;
  completedAt: string | null;
  notificationSentAt: string | null;
}

export interface ReportMembers {
  invited: ReportMember[];
  invitedCount: number;
  completedCount: number;
}

export interface MyFdscReport {
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

/** Groups the ONG's own FDSC reports by the program derived from each one's evaluation. */
export function groupFdscReportsByProgram(
  reports: MyFdscReport[],
): Map<string, MyFdscReport[]> {
  const grouped = new Map<string, MyFdscReport[]>();
  for (const report of reports) {
    const programId = report.evaluation?.program?.documentId;
    if (!programId) continue;
    const list = grouped.get(programId) ?? [];
    list.push(report);
    grouped.set(programId, list);
  }
  return grouped;
}

export interface OngMember {
  /** Numeric id — required by the resend-invitation endpoint. */
  id: number;
  /** String id — required by the remove-member endpoint. */
  documentId: string;
  nume: string;
  email: string;
  /** Function inside the organization, set by the admin. Null for members added before roles existed. */
  rol: string | null;
  accountStatus: "pending" | "active";
  createdAt: string;
  /**
   * Temporary: the API returns the raw activation URL only while invitation
   * emails are not wired up yet, and omits the key entirely otherwise. Guard on
   * the field being present, never on `accountStatus`, so the UI degrades
   * cleanly the day the backend stops sending it.
   */
}
