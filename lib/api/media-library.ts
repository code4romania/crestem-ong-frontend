import { serverApiFetch } from "./server";
import type {
  MediaAssetDetail,
  MediaAssetListResult,
  MediaTag,
} from "./media-library-types";

export * from "./media-library-types";

export async function listMediaAssets(
  params: { search?: string; tip?: string; etichete?: string[]; page?: number } = {},
): Promise<MediaAssetListResult> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.tip) query.set("tip", params.tip);
  if (params.etichete && params.etichete.length) query.set("etichete", params.etichete.join(","));
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const suffix = query.toString() ? `?${query}` : "";
  return serverApiFetch<MediaAssetListResult>(`/api/media-assets${suffix}`);
}

export async function getMediaAsset(documentId: string): Promise<MediaAssetDetail> {
  const { data } = await serverApiFetch<{ data: MediaAssetDetail }>(
    `/api/media-assets/${documentId}`,
  );
  return data;
}

export async function listMediaTags(): Promise<MediaTag[]> {
  const { data } = await serverApiFetch<{ data: MediaTag[] }>("/api/media-tags");
  return data;
}
