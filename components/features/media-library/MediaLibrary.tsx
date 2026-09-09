"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckSquare, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AssetGrid } from "@/components/features/media-library/AssetGrid";
import { MediaFilters } from "@/components/features/media-library/MediaFilters";
import { AssetDetailPanel } from "@/components/features/media-library/AssetDetailPanel";
import { BatchUploadPanel } from "@/components/features/media-library/BatchUploadPanel";
import { useMediaUpload } from "@/components/features/media-library/useMediaUpload";
import {
  deleteMediaAssetsBatchAction,
  getMediaAssetAction,
} from "@/lib/api/media-library-actions";
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
  const [batchAssets, setBatchAssets] = useState<MediaAssetDetail[] | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [confirmingBulkDelete, setConfirmingBulkDelete] = useState(false);
  const [navPending, startNav] = useTransition();
  const [detailPending, startDetail] = useTransition();
  const [bulkPending, startBulk] = useTransition();

  // Selection only ever applies to the page currently on screen; ids left over
  // from a previous filter/page are ignored rather than deleted by surprise.
  const visibleIds = new Set(initial.data.map((c) => c.documentId));
  const selected = new Set([...selectedIds].filter((id) => visibleIds.has(id)));
  const selectedUsedCount = initial.data.filter(
    (c) => selected.has(c.documentId) && c.utilizariCount > 0,
  ).length;

  const toggleSelect = (documentId: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(documentId)) next.delete(documentId);
      else next.add(documentId);
      return next;
    });

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
    setPanelAsset(null);
  };

  const bulkDelete = () => {
    const ids = [...selected];
    startBulk(async () => {
      const res = await deleteMediaAssetsBatchAction(ids);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      if (res.failed.length) {
        toast.error(
          `${res.deleted.length} șterse, ${res.failed.length} nu au putut fi șterse.`,
        );
      } else {
        toast.success(
          res.deleted.length === 1
            ? "Fișier șters din bibliotecă."
            : `${res.deleted.length} fișiere șterse din bibliotecă.`,
        );
      }
      exitSelectMode();
      router.refresh();
    });
  };

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
    (uploaded) => {
      router.refresh();
      if (uploaded.length === 1) setPanelAsset(uploaded[0]);
      else if (uploaded.length > 1) setBatchAssets(uploaded);
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
          multiple
          className="hidden"
          onChange={onFileInputChange}
        />
        <div className="flex shrink-0 items-center gap-2">
          {initial.data.length > 0 && (
            <button
              type="button"
              onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50"
            >
              {selectMode ? <X size={15} /> : <CheckSquare size={15} />}
              {selectMode ? "Anulează" : "Selectează"}
            </button>
          )}
          <button
            type="button"
            onClick={open}
            disabled={isUploading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2dbe8f] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Plus size={15} />
            {isUploading ? "Se încarcă…" : "Încarcă fișier"}
          </button>
        </div>
      </div>

      {selectMode && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-slate-50 px-4 py-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#162040]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-[#2dbe8f]"
              checked={
                initial.data.length > 0 && selected.size === initial.data.length
              }
              ref={(el) => {
                if (el) {
                  el.indeterminate =
                    selected.size > 0 && selected.size < initial.data.length;
                }
              }}
              onChange={() =>
                setSelectedIds(
                  selected.size === initial.data.length
                    ? new Set()
                    : new Set(initial.data.map((c) => c.documentId)),
                )
              }
            />
            Selectează tot
          </label>
          <span className="text-sm text-[#94a3b8]">·</span>
          <span className="text-sm font-semibold text-[#162040]">
            {selected.size} selectate
          </span>
          <button
            type="button"
            onClick={() => setConfirmingBulkDelete(true)}
            disabled={selected.size === 0 || bulkPending}
            className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[#dc2626] px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Trash2 size={14} />
            {bulkPending ? "Se șterge…" : "Șterge selecția"}
          </button>
        </div>
      )}

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
          selectable={selectMode}
          selectedIds={selectMode ? selected : undefined}
          onSelect={(card) =>
            selectMode ? toggleSelect(card.documentId) : openDetail(card.documentId)
          }
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

      {batchAssets && (
        <BatchUploadPanel
          assets={batchAssets}
          tags={tags}
          onClose={() => {
            setBatchAssets(null);
            router.refresh();
          }}
        />
      )}

      <ConfirmDialog
        open={confirmingBulkDelete}
        title={`Ștergi ${selected.size} ${selected.size === 1 ? "fișier" : "fișiere"}?`}
        description={
          `${selected.size === 1 ? "Fișierul selectat va fi șters" : `Cele ${selected.size} fișiere selectate vor fi șterse`} definitiv din bibliotecă.` +
          (selectedUsedCount > 0
            ? ` ${selectedUsedCount} ${selectedUsedCount === 1 ? "este folosit" : "sunt folosite"} pe pagini — blocurile care le folosesc vor rămâne fără fișier.`
            : "") +
          " Acțiunea nu poate fi anulată."
        }
        confirmLabel="Șterge"
        confirmVariant="danger"
        loading={bulkPending}
        loadingLabel="Se șterge…"
        onConfirm={() => {
          setConfirmingBulkDelete(false);
          bulkDelete();
        }}
        onCancel={() => setConfirmingBulkDelete(false)}
      />
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
