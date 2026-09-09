"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { FileText, Film, X } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { getMediaUrl } from "@/lib/api/client";
import { uploadSizeError } from "@/components/features/page-builder/upload";
import { pluralPagini } from "./format";
import {
  createMediaTagAction,
  deleteMediaAssetAction,
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
  const [pendingReplace, setPendingReplace] = useState<File | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [usageBlocking, setUsageBlocking] = useState<PageUsageRef[] | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Slide-in on mount, and close on Escape — mirrors BlockConfigDrawer so the
  // media panel and the page-block panel behave identically.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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

  const doReplace = (file: File, force = false) => {
    startReplace(async () => {
      const form = new FormData();
      form.append("files", file);
      const res = await replaceMediaAssetFileAction(asset.documentId, form, { force });
      if (res.mismatch) {
        setPendingReplace(file);
        return;
      }
      if (res.error || !res.asset) {
        toast.error(res.error ?? "Înlocuirea a eșuat.");
        return;
      }
      setPendingReplace(null);
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
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getMediaUrl(asset.fisier.url)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : asset.tip === "video" ? (
                  <Film size={28} className="text-[#94a3b8]" />
                ) : (
                  <FileText size={28} className="text-[#94a3b8]" />
                )}
              </div>
              <p className="mt-2 truncate text-xs text-[#94a3b8]">{asset.fisier.name}</p>
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
              <div className="flex flex-col gap-2">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-2 text-sm text-[#475569]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border accent-[#2dbe8f]"
                      checked={asset.etichete.some((e) => e.id === tag.id)}
                      onChange={() => toggleTag(tag)}
                      disabled={tagsPending}
                    />
                    {tag.nume}
                  </label>
                ))}
                {tags.length === 0 && (
                  <p className="text-xs text-[#94a3b8]">Nicio etichetă definită încă.</p>
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
              <input
                type="file"
                ref={fileInputRef}
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
              <span className={sectionTitleClass}>Folosit pe</span>
              {asset.utilizari.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {asset.utilizari.map((u) => (
                    <li key={u.documentId}>
                      <Link
                        href={u.cale}
                        className="text-sm text-[#2563eb] hover:underline"
                      >
                        {u.titlu || u.cale}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#94a3b8]">Nefolosit încă.</p>
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
        open={pendingReplace !== null}
        title="Tip diferit de fișier"
        description="Fișierul nou are alt tip decât cel curent. Continui?"
        confirmLabel="Continuă"
        confirmVariant="accent"
        loading={replacePending}
        loadingLabel="Se înlocuiește..."
        onConfirm={() => {
          if (pendingReplace) doReplace(pendingReplace, true);
        }}
        onCancel={() => setPendingReplace(null)}
      />

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
    </ModalPortal>
  );
}
