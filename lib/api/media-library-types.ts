export interface MediaTag {
  id: number;
  documentId: string;
  nume: string;
  slug: string;
}

export interface PageUsageRef {
  documentId: string;
  titlu: string;
  cale: string;
}

export interface MediaAssetFile {
  id: number;
  url: string;
  name: string;
  mime: string | null;
  ext: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
}

export type MediaAssetType = "image" | "video" | "file";

export interface MediaAssetCard {
  documentId: string;
  titlu: string;
  fisier: MediaAssetFile;
  tip: MediaAssetType;
  etichete: MediaTag[];
  utilizariCount: number;
}

export interface MediaAssetDetail extends MediaAssetCard {
  descriere: string;
  altText: string;
  adaugatDe: string;
  adaugatLa: string | null;
  utilizari: PageUsageRef[];
}

export interface MediaAssetListResult {
  data: MediaAssetCard[];
  meta: { pagination: { page: number; pageSize: number; total: number; pageCount: number } };
}
