"use client";

import { useEffect, useState, useTransition } from "react";
import { Film, X } from "lucide-react";
import { toast } from "sonner";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { getMediaUrl } from "@/lib/api/client";
import { FileTypeBadge } from "./FileTypeBadge";
import {
  createMediaTagAction,
  updateMediaAssetAction,
} from "@/lib/api/media-library-actions";
import { AssetDetailPanel } from "./AssetDetailPanel";
import type { MediaAssetDetail, MediaTag } from "@/lib/api/media-library-types";

const inputClass =
  "w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors disabled:opacity-60";

function tagIdsOf(asset: MediaAssetDetail): number[] {
  return asset.etichete.map((e) => e.id);
}

/**
 * Opens after a multi-file upload. Lists the freshly created assets as small
 * cards so staff can tag the whole batch (per card, or all at once) without
 * leaving the flow. Description / alt text / replace / delete for a single file
 * happen in its full editor, which opens stacked when a card is clicked.
 */
export function BatchUploadPanel({
  assets,
  tags,
  onClose,
}: {
  assets: MediaAssetDetail[];
  tags: MediaTag[];
  onClose: () => void;
}) {
  const [items, setItems] = useState<MediaAssetDetail[]>(assets);
  const [tagList, setTagList] = useState<MediaTag[]>(tags);
  const [bulkTagIds, setBulkTagIds] = useState<Set<number>>(() => new Set());
  const [newTag, setNewTag] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const [applyPending, startApply] = useTransition();
  const [tagPending, startTag] = useTransition();
  const busy = applyPending || tagPending;

  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !openId) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, openId]);

  const replaceItem = (updated: MediaAssetDetail) =>
    setItems((prev) =>
      prev.map((it) => (it.documentId === updated.documentId ? updated : it)),
    );

  const toggleBulkTag = (id: number) =>
    setBulkTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleCardTag = (asset: MediaAssetDetail, tagId: number) => {
    const current = tagIdsOf(asset);
    const next = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    startTag(async () => {
      const res = await updateMediaAssetAction(asset.documentId, {
        eticheteIds: next,
      });
      if (res.error || !res.asset) {
        toast.error(res.error ?? "Nu am putut actualiza etichetele.");
        return;
      }
      replaceItem(res.asset);
    });
  };

  const applyToAll = () => {
    if (bulkTagIds.size === 0) return;
    startApply(async () => {
      let ok = 0;
      for (const asset of items) {
        const merged = Array.from(
          new Set([...tagIdsOf(asset), ...bulkTagIds]),
        );
        const res = await updateMediaAssetAction(asset.documentId, {
          eticheteIds: merged,
        });
        if (res.asset) {
          replaceItem(res.asset);
          ok += 1;
        }
      }
      if (ok === items.length) toast.success("Etichete aplicate tuturor.");
      else toast.error(`Etichete aplicate pe ${ok} din ${items.length} fișiere.`);
    });
  };

  const createTag = () => {
    const nume = newTag.trim();
    if (!nume) return;
    startTag(async () => {
      const res = await createMediaTagAction(nume);
      if (res.error || !res.tag) {
        toast.error(res.error ?? "Nu am putut crea eticheta.");
        return;
      }
      setTagList((prev) =>
        prev.some((t) => t.id === res.tag!.id) ? prev : [...prev, res.tag!],
      );
      setNewTag("");
      toast.success("Etichetă creată.");
    });
  };

  const openAsset = openId
    ? items.find((it) => it.documentId === openId) ?? null
    : null;

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
          aria-labelledby="batch-upload-title"
          className={`relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl transition-transform duration-200 ${
            entered ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
            <div className="min-w-0">
              <h2
                id="batch-upload-title"
                className="font-heading text-lg font-extrabold text-[#162040]"
              >
                {items.length} fișiere adăugate
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Setează etichetele acum. Titlul, descrierea și textul alternativ
                se editează deschizând fiecare fișier.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Închide panoul"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          {/* Apply-to-all */}
          <div className="flex flex-col gap-3 border-b border-border px-6 py-4">
            <span className="font-heading text-sm font-semibold text-[#162040]">
              Aplică etichete tuturor
            </span>
            {tagList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tagList.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    aria-pressed={bulkTagIds.has(tag.id)}
                    onClick={() => toggleBulkTag(tag.id)}
                    className={`rounded-full px-3 py-1 text-xs transition-colors ${
                      bulkTagIds.has(tag.id)
                        ? "bg-[#2dbe8f] text-white"
                        : "bg-slate-100 text-[#475569]"
                    }`}
                  >
                    {tag.nume}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#94a3b8]">Nicio etichetă definită încă.</p>
            )}
            <div className="flex items-center gap-2">
              <input
                className={inputClass}
                placeholder="adaugă etichetă"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    createTag();
                  }
                }}
                disabled={busy}
              />
              <button
                type="button"
                onClick={createTag}
                disabled={busy || !newTag.trim()}
                className="shrink-0 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                Adaugă
              </button>
            </div>
            <button
              type="button"
              onClick={applyToAll}
              disabled={busy || bulkTagIds.size === 0}
              className="self-start rounded-xl bg-[#2dbe8f] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {applyPending ? "Se aplică…" : "Aplică tuturor"}
            </button>
          </div>

          {/* Cards */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto px-6 py-5 sm:grid-cols-2">
            {items.map((asset) => {
              const assigned = new Set(tagIdsOf(asset));
              return (
                <div
                  key={asset.documentId}
                  className="flex flex-col overflow-hidden rounded-xl border border-border"
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(asset.documentId)}
                    className="group block w-full text-left"
                  >
                    <div className="flex aspect-[4/3] items-center justify-center bg-slate-50">
                      {asset.tip === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getMediaUrl(asset.fisier.url)}
                          alt=""
                          className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
                        />
                      ) : asset.tip === "video" ? (
                        <Film size={22} className="text-[#94a3b8]" />
                      ) : (
                        <FileTypeBadge
                          ext={asset.fisier.ext}
                          url={asset.fisier.url}
                          size="sm"
                        />
                      )}
                    </div>
                    <span className="block truncate px-2 pt-2 text-xs font-semibold text-[#162040]">
                      {asset.titlu}
                    </span>
                  </button>
                  <div className="flex flex-wrap gap-1 p-2">
                    {tagList.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        aria-pressed={assigned.has(tag.id)}
                        onClick={() => toggleCardTag(asset, tag.id)}
                        disabled={busy}
                        className={`rounded-full px-2 py-0.5 text-[11px] transition-colors disabled:opacity-60 ${
                          assigned.has(tag.id)
                            ? "bg-[#2dbe8f] text-white"
                            : "bg-slate-100 text-[#475569]"
                        }`}
                      >
                        {tag.nume}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#2dbe8f] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Gata
            </button>
          </div>
        </div>
      </div>

      {openAsset && (
        <AssetDetailPanel
          asset={openAsset}
          tags={tagList}
          onClose={() => setOpenId(null)}
          onChanged={(updated) => {
            if (!updated) {
              const remaining = items.filter(
                (it) => it.documentId !== openAsset.documentId,
              );
              setItems(remaining);
              setOpenId(null);
              if (remaining.length === 0) onClose();
              return;
            }
            replaceItem(updated);
            setOpenId(null);
          }}
        />
      )}
    </ModalPortal>
  );
}
