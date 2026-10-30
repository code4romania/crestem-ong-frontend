"use server";

import { revalidateDashboardPath } from "./revalidate";
import { serverApiFetch } from "./server";
import { getApiErrorCode, getApiErrorMessage } from "./client";
import type { EvaluationDetail } from "./evaluations";

export interface SaveDimensionInput {
  dimensionKey: string;
  submit: boolean;
  comment: string;
  quiz: { questionId: string; answer: number }[];
}

export async function saveEvaluationDimensionAction(
  evaluationDocumentId: string,
  block: SaveDimensionInput,
): Promise<{ data?: EvaluationDetail; error?: string; code?: string }> {
  try {
    const res = await serverApiFetch<{ data: EvaluationDetail }>(`/api/evaluations/${evaluationDocumentId}`, {
      method: "PUT",
      body: JSON.stringify({ dimensions: [block] }),
    });
    revalidateDashboardPath("/dashboard/user-ong", "layout");
    return { data: res.data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut salva răspunsurile."), code: getApiErrorCode(err) };
  }
}

export async function finalizeEvaluationAction(
  evaluationDocumentId: string,
): Promise<{ data?: EvaluationDetail; error?: string; code?: string }> {
  try {
    const res = await serverApiFetch<{ data: EvaluationDetail }>(
      `/api/evaluations/${evaluationDocumentId}/finish`,
      { method: "POST" },
    );
    revalidateDashboardPath("/dashboard/user-ong", "layout");
    return { data: res.data };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut finaliza evaluarea."), code: getApiErrorCode(err) };
  }
}
