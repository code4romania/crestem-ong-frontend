"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AssetGrid } from "@/components/features/media-library/AssetGrid";
import { MediaFilters } from "@/components/features/media-library/MediaFilters";
import { AssetDetailPanel } from "@/components/features/media-library/AssetDetailPanel";
import { useMediaUpload } from "@/components/features/media-library/useMediaUpload";
import { getMediaAssetAction } from "@/lib/api/media-library-actions";
import type {
  MediaAssetDetail,
  MediaAssetListResult,
  MediaTag,
} from "@/lib/api/media-library-types";

const LIBRARY_PATH = "/dashboard/media-library";

export function MediaLibrary({
  initial,
  tags,
  query,
}: {
  initial: MediaAssetListResult;
  tags: MediaTag[];
  query: { search: string; tip: string; etichete: string[]; page: number };
}) {
  const router = useRouter();
  const [panelAsset, setPanelAsset] = useState<MediaAssetDetail | null>(null);
  const [navPending, startNav] = useTransition();
  const [detailPending, startDetail] = useTransition();

  const openDetail = (documentId: string) => {
    startDetail(async () => {
      const res = await getMediaAssetAction(documentId);
      if (res.error || !res.asset) {
        toast.error(res.error ?? "Nu am putut încărca detaliile fișierului.");
        return;
      }
      setPanelAsset(res.asset);
    });
  };

  const { open, isUploading, fileInputRef, onFileInputChange } = useMediaUpload(
    (createdDocumentId) => {
      router.refresh();
      if (createdDocumentId) openDetail(createdDocumentId);
    },
  );

  const buildQuery = (next: { search: string; tip: string; tagSlugs: string[] }, page = 1) => {
    const params = new URLSearchParams();
    if (next.search) params.set("search", next.search);
    if (next.tip) params.set("tip", next.tip);
    if (next.tagSlugs.length) params.set("etichete", next.tagSlugs.join(","));
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `${LIBRARY_PATH}${qs ? `?${qs}` : ""}`;
  };

  const applyFilters = (next: { search: string; tip: string; tagSlugs: string[] }) => {
    // Filter changes always reset to page 1.
    startNav(() => router.push(buildQuery(next)));
  };

  const hrefForPage = (targetPage: number) =>
    buildQuery(
      { search: query.search, tip: query.tip, tagSlugs: query.etichete },
      targetPage,
    );

  const { pagination } = initial.meta;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-[#162040]">
            Bibliotecă media
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Imagini, video și documente reutilizabile pe site-ul public
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={onFileInputChange}
        />
        <button
          type="button"
          onClick={open}
          disabled={isUploading}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#2dbe8f] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Plus size={15} />
          {isUploading ? "Se încarcă…" : "Încarcă fișier"}
        </button>
      </div>

      <div className="mb-5">
        <MediaFilters
          search={query.search}
          tip={query.tip}
          tagSlugs={query.etichete}
          tags={tags}
          onChange={applyFilters}
        />
      </div>

      <div
        aria-busy={navPending || detailPending}
        className={navPending ? "opacity-60 transition-opacity" : "transition-opacity"}
      >
        <AssetGrid
          assets={initial.data}
          onSelect={(card) => openDetail(card.documentId)}
          emptyLabel="Niciun fișier găsit. Încarcă primul fișier sau ajustează filtrele."
        />
      </div>

      {pagination.pageCount > 1 && (
        <nav
          aria-label="Paginare bibliotecă"
          className="mt-6 flex items-center justify-center gap-1"
        >
          <PagerLink
            href={hrefForPage(Math.max(1, pagination.page - 1))}
            disabled={pagination.page === 1}
          >
            Anterior
          </PagerLink>
          <PagerLink
            href={hrefForPage(Math.min(pagination.pageCount, pagination.page + 1))}
            disabled={pagination.page === pagination.pageCount}
          >
            Următor
          </PagerLink>
        </nav>
      )}

      {panelAsset && (
        <AssetDetailPanel
          asset={panelAsset}
          tags={tags}
          onClose={() => setPanelAsset(null)}
          onChanged={(updated) => {
            setPanelAsset(updated);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function PagerLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="rounded-lg border border-border px-3 py-2 text-sm opacity-40"
        style={{ color: "#94a3b8" }}
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-slate-50"
      style={{ color: "#475569" }}
    >
      {children}
    </Link>
  );
}
