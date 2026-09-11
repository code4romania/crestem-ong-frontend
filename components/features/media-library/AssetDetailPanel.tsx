"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowUpRight, Download, FileText, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { getMediaUrl } from "@/lib/api/client";
import { uploadSizeError } from "@/components/features/page-builder/upload";
import { useGalleryLightbox } from "@/components/features/page-builder/blocks/gallery/useGalleryLightbox";
import { FileTypeBadge } from "./FileTypeBadge";
import { pluralPagini } from "./format";
import {
  createMediaTagAction,
  deleteMediaAssetAction,
  deleteMediaTagAction,
  replaceMediaAssetFileAction,
  updateMediaAssetAction,
} from "@/lib/api/media-library-actions";
import type {
  MediaAssetDetail,
  MediaTag,
  PageUsageRef,
} from "@/lib/api/media-library-types";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors disabled:opacity-60";
const sectionTitleClass = "font-heading text-sm font-semibold text-[#162040]";

export function AssetDetailPanel({
  asset,
  tags,
  onClose,
  onChanged,
}: {
  asset: MediaAssetDetail;
  tags: MediaTag[];
  onClose: () => void;
  onChanged: (updated: MediaAssetDetail | null) => void;
}) {
  const [titlu, setTitlu] = useState(asset.titlu);
  const [descriere, setDescriere] = useState(asset.descriere);
  const [altText, setAltText] = useState(asset.altText);
  const [newTag, setNewTag] = useState("");
  const [deletingTag, setDeletingTag] = useState<MediaTag | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [usageBlocking, setUsageBlocking] = useState<PageUsageRef[] | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Click the preview to see the image full-size, uncropped. Reuses the gallery
  // block's zoom overlay (Esc, scroll-lock, focus restore) with a one-item list.
  const { open: openZoom, overlay: zoomOverlay, isOpen: zoomOpen } =
    useGalleryLightbox(
      asset.tip === "image"
        ? [
            {
              id: asset.fisier.id,
              url: asset.fisier.url,
              name: asset.fisier.name,
              alt: asset.altText,
              caption: "",
            },
          ]
        : [],
    );

  // Slide-in on mount, and close on Escape — mirrors BlockConfigDrawer so the
  // media panel and the page-block panel behave identically.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // While the zoom overlay is up, Esc closes just that (it has its own handler).
      if (e.key === "Escape" && !zoomOpen) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, zoomOpen]);

  const [savePending, startSave] = useTransition();
  const [tagsPending, startTags] = useTransition();
  const [replacePending, startReplace] = useTransition();
  const [deletePending, startDelete] = useTransition();

  // Re-seed the editable fields whenever the parent hands us a different asset.
  // Render-phase reset keyed on documentId (React's "adjust state on prop change"
  // pattern) so switching assets refreshes the form without a setState-in-effect.
  const [seededFor, setSeededFor] = useState(asset.documentId);
  if (seededFor !== asset.documentId) {
    setSeededFor(asset.documentId);
    setTitlu(asset.titlu);
    setDescriere(asset.descriere);
    setAltText(asset.altText);
  }

  const currentIds = asset.etichete.map((e) => e.id);

  const handleSave = () => {
    startSave(async () => {
      const res = await updateMediaAssetAction(asset.documentId, {
        titlu,
        descriere,
        altText,
      });
      if (res.error || !res.asset) {
        toast.error(res.error ?? "Nu am putut salva modificările.");
        return;
      }
      toast.success("Modificări salvate.");
      onChanged(res.asset);
    });
  };

  const toggleTag = (tag: MediaTag) => {
    const nextIds = currentIds.includes(tag.id)
      ? currentIds.filter((id) => id !== tag.id)
      : [...currentIds, tag.id];
    startTags(async () => {
      const res = await updateMediaAssetAction(asset.documentId, {
        eticheteIds: nextIds,
      });
      if (res.error || !res.asset) {
        toast.error(res.error ?? "Nu am putut actualiza etichetele.");
        return;
      }
      onChanged(res.asset);
    });
  };

  const handleCreateTag = () => {
    const nume = newTag.trim();
    if (!nume) return;
    startTags(async () => {
      const created = await createMediaTagAction(nume);
      if (created.error || !created.tag) {
        toast.error(created.error ?? "Nu am putut crea eticheta.");
        return;
      }
      toast.success("Etichetă creată.");
      const res = await updateMediaAssetAction(asset.documentId, {
        eticheteIds: [...currentIds, created.tag.id],
      });
      if (res.error || !res.asset) {
        toast.error(res.error ?? "Eticheta a fost creată, dar nu am putut-o atașa.");
        return;
      }
      setNewTag("");
      onChanged(res.asset);
    });
  };

  const handleDeleteTag = (tag: MediaTag) => {
    startTags(async () => {
      const res = await deleteMediaTagAction(tag.documentId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Etichetă ștearsă.");
      setDeletingTag(null);
      // Re-pull the tag list (and the asset, in case it carried this tag).
      onChanged(asset);
    });
  };

  const doReplace = (file: File) => {
    startReplace(async () => {
      const form = new FormData();
      form.append("files", file);
      const res = await replaceMediaAssetFileAction(asset.documentId, form);
      if (res.error || !res.asset) {
        toast.error(res.error ?? "Înlocuirea a eșuat.");
        return;
      }
      toast.success("Fișier înlocuit.");
      onChanged(res.asset);
    });
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const sizeErr = uploadSizeError(file);
    if (sizeErr) {
      toast.error(sizeErr);
      return;
    }
    doReplace(file);
  };

  const doDelete = (force = false) => {
    startDelete(async () => {
      const res = await deleteMediaAssetAction(asset.documentId, { force });
      if (res.utilizari && res.utilizari.length > 0) {
        setUsageBlocking(res.utilizari);
        return;
      }
      if (res.error) {
        toast.error(res.error);
        return;
      }
      if (res.ok) {
        setUsageBlocking(null);
        toast.success("Fișier șters din bibliotecă.");
        onChanged(null);
        return;
      }
      // 409 with no `details` payload → utilizari: [] and no error/ok. Don't
      // let the button silently do nothing.
      toast.error(res.error ?? "Nu am putut șterge fișierul.");
    });
  };

  const usageDescription = usageBlocking
    ? `Acest fișier e folosit pe ${pluralPagini(usageBlocking.length)}: ${usageBlocking
        .map((u) => u.titlu)
        .join(", ")}. Ștergi oricum? Blocurile care îl folosesc vor rămâne fără fișier.`
    : "";

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex justify-end">
        <button
          type="button"
          aria-label="Închide"
          onClick={onClose}
          className="absolute inset-0 h-full w-full cursor-default bg-black/40"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="asset-detail-title"
          className={`relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-200 ${
            entered ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
            <h2
              id="asset-detail-title"
              className="min-w-0 truncate font-heading text-lg font-extrabold text-[#162040]"
            >
              {asset.titlu}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Închide panoul"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
            {/* Preview */}
            <div>
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-border bg-slate-50">
                {asset.tip === "image" ? (
                  <button
                    type="button"
                    onClick={() => openZoom(0)}
                    aria-label="Vezi imaginea la dimensiune completă"
                    className="h-full w-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getMediaUrl(asset.fisier.url)}
                      alt=""
                      className="h-full w-full cursor-zoom-in object-cover"
                    />
                  </button>
                ) : asset.tip === "video" ? (
                  <video
                    src={getMediaUrl(asset.fisier.url)}
                    aria-label={asset.altText || asset.fisier.name}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full bg-black object-contain"
                  />
                ) : (
                  <FileTypeBadge ext={asset.fisier.ext} url={asset.fisier.url} />
                )}
              </div>
              <p className="mt-2 truncate text-xs text-[#94a3b8]">{asset.fisier.name}</p>
              <a
                href={`/api/media-library/download/${asset.documentId}`}
                download={asset.fisier.name}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Descarcă fișierul
              </a>
            </div>

            {/* Metadata form */}
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="asset-titlu" className={labelClass}>
                  Titlu
                </label>
                <input
                  id="asset-titlu"
                  className={inputClass}
                  value={titlu}
                  onChange={(e) => setTitlu(e.target.value)}
                  disabled={savePending}
                />
              </div>
              <div>
                <label htmlFor="asset-descriere" className={labelClass}>
                  Descriere
                </label>
                <textarea
                  id="asset-descriere"
                  rows={3}
                  className={inputClass}
                  value={descriere}
                  onChange={(e) => setDescriere(e.target.value)}
                  disabled={savePending}
                />
              </div>
              <div>
                <label htmlFor="asset-alt" className={labelClass}>
                  Text alternativ
                </label>
                <input
                  id="asset-alt"
                  className={inputClass}
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  disabled={savePending}
                />
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={savePending}
                className="self-start rounded-xl bg-[#2dbe8f] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {savePending ? "Se salvează..." : "Salvează"}
              </button>
            </div>

            {/* Tag editor */}
            <div className="flex flex-col gap-3">
              <span className={sectionTitleClass}>Etichete</span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-1">
                    <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-[#475569]">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border accent-[#2dbe8f]"
                        checked={asset.etichete.some((e) => e.id === tag.id)}
                        onChange={() => toggleTag(tag)}
                        disabled={tagsPending}
                      />
                      <span className="truncate">{tag.nume}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setDeletingTag(tag)}
                      disabled={tagsPending}
                      aria-label={`Șterge eticheta ${tag.nume}`}
                      className="shrink-0 rounded p-1 text-[#94a3b8] transition-colors hover:bg-red-50 hover:text-[#dc2626] disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {tags.length === 0 && (
                  <p className="col-span-2 text-xs text-[#94a3b8]">Nicio etichetă definită încă.</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  className={inputClass}
                  placeholder="adaugă etichetă"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateTag();
                    }
                  }}
                  disabled={tagsPending}
                />
                <button
                  type="button"
                  onClick={handleCreateTag}
                  disabled={tagsPending || !newTag.trim()}
                  className="shrink-0 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50 disabled:opacity-60"
                >
                  Adaugă
                </button>
              </div>
            </div>

            {/* Replace file */}
            <div className="flex flex-col gap-2">
              <span className={sectionTitleClass}>Înlocuiește fișierul</span>
              <p className="text-xs text-[#94a3b8]">
                Fișierul nou trebuie să aibă același format
                {asset.fisier.ext
                  ? ` (${asset.fisier.ext.replace(/^\./, "").toUpperCase()})`
                  : asset.fisier.mime
                    ? ` (${asset.fisier.mime})`
                    : ""}
                . Pentru alt format, încarcă un fișier nou în bibliotecă.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                accept={asset.fisier.ext ?? asset.fisier.mime ?? undefined}
                className="hidden"
                onChange={onFileInputChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={replacePending}
                className="self-start rounded-xl border border-border px-4 py-2 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                {replacePending ? "Se înlocuiește..." : "Alege un fișier nou"}
              </button>
            </div>

            {/* Usage */}
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-2">
                <span className={sectionTitleClass}>Folosit pe</span>
                {asset.utilizari.length > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2dbe8f]/10 px-1.5 text-xs font-semibold text-[#2dbe8f]">
                    {asset.utilizari.length}
                  </span>
                )}
              </span>
              {asset.utilizari.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {asset.utilizari.map((u) => (
                    <li key={u.documentId}>
                      <Link
                        href={u.cale}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-xl border border-border px-3 py-2 transition-colors hover:border-[#2dbe8f]/40 hover:bg-slate-50"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2dbe8f]/10 text-[#2dbe8f]">
                          <FileText className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-[#162040]">
                            {u.titlu || u.cale}
                          </span>
                          <span className="block truncate text-xs text-[#94a3b8]">
                            {u.cale}
                          </span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-[#94a3b8] transition-colors group-hover:text-[#2dbe8f]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-6 text-center">
                  <FileText className="h-5 w-5 text-[#cbd5e1]" />
                  <p className="text-sm text-[#94a3b8]">Nefolosit încă.</p>
                </div>
              )}
            </div>

            {/* Delete */}
            <div className="border-t border-border pt-5">
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                disabled={deletePending}
                className="rounded-xl bg-[#dc2626] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {deletePending ? "Se șterge..." : "Șterge din bibliotecă"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Ștergi acest fișier?"
        description={`„${asset.titlu}" va fi șters definitiv din bibliotecă. Acțiunea nu poate fi anulată.`}
        confirmLabel="Șterge"
        confirmVariant="danger"
        loading={deletePending}
        loadingLabel="Se șterge..."
        onConfirm={() => {
          setConfirmingDelete(false);
          doDelete(false);
        }}
        onCancel={() => setConfirmingDelete(false)}
      />

      <ConfirmDialog
        open={usageBlocking !== null}
        title="Fișier folosit pe pagini"
        description={usageDescription}
        confirmLabel="Șterge oricum"
        confirmVariant="danger"
        loading={deletePending}
        loadingLabel="Se șterge..."
        onConfirm={() => doDelete(true)}
        onCancel={() => setUsageBlocking(null)}
      />

      <ConfirmDialog
        open={deletingTag !== null}
        title="Ștergi eticheta?"
        description={
          deletingTag
            ? `Eticheta „${deletingTag.nume}” va fi ștearsă definitiv și eliminată de pe toate imaginile.`
            : ""
        }
        confirmLabel="Șterge eticheta"
        confirmVariant="danger"
        loading={tagsPending}
        loadingLabel="Se șterge..."
        onConfirm={() => deletingTag && handleDeleteTag(deletingTag)}
        onCancel={() => setDeletingTag(null)}
      />

      {zoomOverlay}
    </ModalPortal>
  );
}
