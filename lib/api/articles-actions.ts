"use server";

import { revalidatePath } from "next/cache";
import { getApiErrorMessage } from "./client";
import { revalidateDashboardPath } from "./revalidate";
import { getArticle } from "./articles";
import { serverApiFetch } from "./server";
import { getCurrentUser } from "./session-server";
import { isFdscStaff } from "@/lib/roles";
import type { PageBlock, VisibilityAudience } from "./articles-types";

export interface ArticleInput {
  titlu: string;
  slug: string;
  rezumat: string;
  /** Subcategory documentId. An article never attaches to a bare category. */
  subcategorie: string;
  autor: string;
  etichete: string[];
  tip: string;
  vizibilitate: VisibilityAudience[];
  blocuri: PageBlock[];
}

const FORBIDDEN = "Nu ai permisiunea necesară pentru această acțiune.";

/**
 * A Server Action is an addressable endpoint, so the staff check lives here as
 * well as in the layout that renders the screens.
 */
async function refuseNonStaff(): Promise<{ error: string } | null> {
  const user = await getCurrentUser();
  return isFdscStaff(user?.role?.type) ? null : { error: FORBIDDEN };
}

/**
 * An article is addressed by its derived path, so that path is the cache key.
 * Moving it to another subcategory changes the path, which makes the old one
 * stale too — and every `article-grid` that listed it.
 */
function revalidateArticle(cale: string | null, previousCale?: string | null) {
  revalidateDashboardPath("/dashboard/fdsc/biblioteca");
  if (cale) revalidatePath(cale);
  if (previousCale && previousCale !== cale) revalidatePath(previousCale);
  // Any page may host an `article-grid` listing this article.
  revalidatePath("/", "layout");
}

export async function createArticleAction(
  input: ArticleInput,
): Promise<{ error?: string; documentId?: string }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;

  try {
    const { data } = await serverApiFetch<{ data: { documentId: string; cale: string | null } }>(
      "/api/articles",
      { method: "POST", body: JSON.stringify(input) },
    );
    revalidateArticle(data.cale);
    return { documentId: data.documentId };
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut crea articolul.") };
  }
}

export async function updateArticleAction(
  documentId: string,
  input: ArticleInput,
  previousCale?: string | null,
): Promise<{ error?: string }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;

  let cale: string | null;
  try {
    const { data } = await serverApiFetch<{ data: { cale: string | null } }>(
      `/api/articles/${documentId}`,
      { method: "PUT", body: JSON.stringify(input) },
    );
    cale = data.cale;
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut salva articolul.") };
  }

  revalidateArticle(cale, previousCale);
  return {};
}

/** The article's own path, read back from the backend, so the caller need not derive it. */
async function currentCale(documentId: string): Promise<string | null> {
  try {
    return (await getArticle(documentId)).cale;
  } catch {
    return null;
  }
}

export async function deleteArticleAction(documentId: string): Promise<{ error?: string }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;

  const cale = await currentCale(documentId);

  try {
    await serverApiFetch(`/api/articles/${documentId}`, { method: "DELETE" });
  } catch (err) {
    return { error: getApiErrorMessage(err, "Nu am putut șterge articolul.") };
  }

  revalidateArticle(cale);
  return {};
}

export async function setArticlePublishedAction(
  documentId: string,
  published: boolean,
): Promise<{ error?: string }> {
  const forbidden = await refuseNonStaff();
  if (forbidden) return forbidden;

  const cale = await currentCale(documentId);

  try {
    await serverApiFetch(
      `/api/articles/${documentId}/${published ? "publish" : "unpublish"}`,
      { method: "POST" },
    );
  } catch (err) {
    return {
      error: getApiErrorMessage(
        err,
        published ? "Nu am putut publica articolul." : "Nu am putut retrage articolul.",
      ),
    };
  }

  revalidateArticle(cale);
  return {};
}
