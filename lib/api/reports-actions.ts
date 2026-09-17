"use server";

import { revalidateDashboardPath } from "./revalidate";
import { serverApiFetch } from "./server";
import { getApiErrorMessage } from "./client";

export async function startEvaluationAction(
  members: string[],
  program?: string,
): Promise<{ error?: string; reportId?: string }> {
  let reportId: string;
  try {
    const res = await serverApiFetch<{ data: { report: { documentId: string } } }>("/api/reports/start", {
      method: "POST",
      body: JSON.stringify(program ? { program, members } : { members }),
    });
    reportId = res.data.report.documentId;
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut porni evaluarea.") };
  }

  revalidateDashboardPath("/dashboard/ong/programe");
  revalidateDashboardPath("/dashboard/ong/evaluari");
  return { reportId };
}

export async function addReportMembersAction(
  reportId: string,
  members: string[],
): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/reports/${reportId}/members`, {
      method: "POST",
      body: JSON.stringify({ members }),
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut adăuga membrii.") };
  }

  revalidateDashboardPath(`/dashboard/ong/evaluari/${reportId}`);
  return {};
}

export async function removeReportMemberAction(
  reportId: string,
  evaluationId: string,
): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/reports/${reportId}/members/${evaluationId}`, {
      method: "DELETE",
    });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut elimina membrul.") };
  }

  revalidateDashboardPath(`/dashboard/ong/evaluari/${reportId}`);
  return {};
}

export async function finishReportAction(reportId: string): Promise<{ error?: string }> {
  try {
    await serverApiFetch(`/api/reports/${reportId}/finish`, { method: "POST" });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut finaliza evaluarea.") };
  }

  revalidateDashboardPath(`/dashboard/ong/evaluari/${reportId}`);
  revalidateDashboardPath("/dashboard/ong/evaluari");
  revalidateDashboardPath("/dashboard/ong/programe");
  return {};
}
