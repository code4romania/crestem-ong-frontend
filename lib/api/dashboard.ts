import { serverApiFetch } from "./server";

/**
 * The three "Panou principal" payloads. Each role gets one endpoint returning
 * exactly the counters its dashboard renders, so a page is a single request and
 * no counting happens in the browser.
 */

export interface FdscDashboard {
  ongCount: number;
  finishedReportCount: number;
  activeProgramCount: number;
  fdscReportCount: number;
}

export function getFdscDashboard() {
  return serverApiFetch<{ data: FdscDashboard }>("/api/dashboard/fdsc");
}

export interface OngDashboardMentor {
  documentId: string;
  /** `Anonim <documentId>` once the account is deleted. */
  nume: string;
  mentorJobTitle: string | null;
  avatar: { documentId: string; name: string; url: string } | null;
  /** Deleted accounts stay listed (BR-34) but render greyed out. */
  isDeleted: boolean;
  program: {
    documentId: string;
    name: string;
    startDate: string;
    endDate: string;
  } | null;
}

export interface OngDashboard {
  memberCount: number;
  programCount: number;
  activeProgramCount: number;
  finishedReportCount: number;
  /** Newest finished round's overall score, already a 0–100 percentage. */
  lastScore: number | null;
  /** Mean across this organization's scored rounds. */
  averageScore: number | null;
  mentors: OngDashboardMentor[];
  recentPrograms: { documentId: string; name: string; programStatus: string }[];
}

export function getOngDashboard() {
  return serverApiFetch<{ data: OngDashboard }>("/api/dashboard/ong");
}

export interface MentorMeetingRef {
  documentId: string;
  ongName: string;
  subiect: string;
  dataOra: string;
}

export interface MentorDashboard {
  meetingsHeld: number;
  meetingsTotal: number;
  mentoredOngCount: number;
  reportsSent: number;
  reportsMissing: number;
  activeProgramCount: number;
  /** Capped at 5 by the backend; `reportsMissing` stays the full count. */
  missingReports: MentorMeetingRef[];
  nextMeeting: (MentorMeetingRef & { format: string }) | null;
  currentPrograms: {
    documentId: string;
    name: string;
    startDate: string;
    endDate: string;
    programStatus: string;
  }[];
  mentoredOngs: {
    ong: { documentId: string; name: string };
    program: { documentId: string; name: string };
  }[];
}

export function getMentorDashboard() {
  return serverApiFetch<{ data: MentorDashboard }>("/api/dashboard/mentor");
}
