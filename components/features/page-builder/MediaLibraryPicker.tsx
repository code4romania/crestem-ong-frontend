"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { ModalOverlay } from "@/components/ui/ModalOverlay";
import { MediaFilters } from "@/components/features/media-library/MediaFilters";
import { AssetGrid } from "@/components/features/media-library/AssetGrid";
import {
  listMediaAssetsAction,
  listMediaTagsAction,
} from "@/lib/api/media-library-actions";
import type {
  MediaAssetCard,
  MediaAssetListResult,
  MediaTag,
} from "@/lib/api/media-library-types";

type PickedFile = { id: number; url: string; name: string };

/**
 * In-builder picker: lets FDSC staff choose an existing library asset instead of
 * uploading a new file when configuring a block. Renders nothing while `open` is
 * false. `accept` locks the type filter (segmented control hidden). `onPick`
 * always receives an array — single-select confirms immediately and closes.
 */
export function MediaLibraryPicker({
  open,
  multiple,
  accept,
  onClose,
  onPick,
}: {
  open: boolean;
  multiple?: boolean;
  accept?: "image" | "video" | "file";
  onClose: () => void;
  onPick: (files: PickedFile[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [tip, setTip] = useState<string>(accept ?? "");
  const [tagSlugs, setTagSlugs] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<MediaAssetListResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<MediaTag[]>([]);
  const tagsRequested = useRef(false);
  const finishedRef = useRef(false);

  // Selected cards kept whole so the confirm payload is built without having to
  // re-find them in a grid that may have paged past the selection.
  const [selectedCards, setSelectedCards] = useState<Map<string, MediaAssetCard>>(
    () => new Map(),
  );
  const selectedIds = useMemo(
    () => new Set(selectedCards.keys()),
    [selectedCards],
  );

  // The component stays mounted while `open` is false, so reset every piece of
  // per-session state each time it (re)opens — render-phase "adjust state on
  // prop change" pattern (see MediaFilters `syncedTo`, AssetDetailPanel
  // `seededFor`), not an effect. Converges: after `setWasOpen(open)` the next
  // render sees `open === wasOpen`. The `tagsRequested` cache is deliberately
  // kept across opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSearch("");
      setTip(accept ?? "");
      setTagSlugs([]);
      setPage(1);
      setSelectedCards(new Map());
      setResult(null);
    }
  }

  const tagKey = tagSlugs.join(",");

  useEffect(() => {
    if (!open) return;
    let ignore = false;
    // Kick the request off a microtask so the `loading` flip happens in a
    // callback, not synchronously in the effect body (react-hooks/set-state-in-effect).
    Promise.resolve()
      .then(() => {
        if (ignore) return null;
        setLoading(true);
        return listMediaAssetsAction({
          search,
          tip,
          etichete: tagKey ? tagKey.split(",") : [],
          page,
        });
      })
      .then((res) => {
        if (ignore || !res) return;
        if (res.error) toast.error(res.error);
        else if (res.result) setResult(res.result);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [open, search, tip, tagKey, page]);

  useEffect(() => {
    if (!open || tagsRequested.current) return;
    tagsRequested.current = true;
    listMediaTagsAction().then((res) => {
      if (res.error) toast.error(res.error);
      else if (res.tags) setTags(res.tags);
    });
  }, [open]);

  // Re-arm the single-select double-fire guard on each open. Kept out of the
  // render-phase reset block because ref writes aren't allowed during render
  // (react-hooks/refs); an effect touches no state so set-state-in-effect is
  // not in play.
  useEffect(() => {
    if (open) finishedRef.current = false;
  }, [open]);

  if (!open) return null;

  const finish = (cards: MediaAssetCard[]) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onPick(
      cards.map((c) => ({
        id: c.fisier.id,
        url: c.fisier.url,
        name: c.fisier.name,
      })),
    );
    onClose();
  };

  const handleSelect = (card: MediaAssetCard) => {
    if (!multiple) {
      finish([card]);
      return;
    }
    setSelectedCards((prev) => {
      const next = new Map(prev);
      if (next.has(card.documentId)) next.delete(card.documentId);
      else next.set(card.documentId, card);
      return next;
    });
  };

  const pagination = result?.meta.pagination;
  const canPrev = (pagination?.page ?? 1) > 1;
  const canNext = pagination ? pagination.page < pagination.pageCount : false;

  return (
    <ModalOverlay labelledBy="media-picker-title">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2
              id="media-picker-title"
              className="font-heading text-lg font-extrabold text-[#162040]"
            >
              Alege din bibliotecă
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Selectează un fișier deja încărcat în bibliotecă.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Închide"
            className="shrink-0 rounded-lg p-1 text-[#475569] transition-colors hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-5">
            <MediaFilters
              search={search}
              tip={tip}
              tagSlugs={tagSlugs}
              tags={tags}
              lockedTip={accept}
              onChange={(next) => {
                setSearch(next.search);
                setTip(next.tip);
                setTagSlugs(next.tagSlugs);
                setPage(1);
              }}
            />
          </div>

          <div
            aria-busy={loading}
            className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}
          >
            <AssetGrid
              assets={result?.data ?? []}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              emptyLabel="Niciun fișier în bibliotecă pentru acest filtru."
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border p-5">
          <nav
            aria-label="Paginare bibliotecă"
            className="flex items-center gap-1"
          >
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!canPrev}
              className="rounded-lg border border-border px-3 py-2 text-sm text-[#475569] transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={!canNext}
              className="rounded-lg border border-border px-3 py-2 text-sm text-[#475569] transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Următor
            </button>
          </nav>

          {multiple && (
            <button
              type="button"
              onClick={() => finish([...selectedCards.values()])}
              disabled={selectedIds.size < 1}
              className="rounded-xl bg-[#2dbe8f] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Selectează{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
            </button>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}
