"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteMediaTagAction } from "@/lib/api/media-library-actions";
import type { MediaTag } from "@/lib/api/media-library-types";

const SEARCH_DEBOUNCE_MS = 300;

const TIP_OPTIONS = [
  { value: "", label: "Toate" },
  { value: "image", label: "Imagini" },
  { value: "video", label: "Video" },
  { value: "file", label: "Documente" },
];

export function MediaFilters({
  search,
  tip,
  tagSlugs,
  tags,
  lockedTip,
  onChange,
  onTagDeleted,
}: {
  search: string;
  tip: string;
  tagSlugs: string[];
  tags: MediaTag[];
  /**
   * When set, the type filter is fixed to this value: the segmented control is
   * hidden and every emitted payload carries `tip: lockedTip` regardless of the
   * `tip` prop. Used by the in-builder picker, which locks the asset type.
   */
  lockedTip?: "image" | "video" | "file";
  onChange: (next: { search: string; tip: string; tagSlugs: string[] }) => void;
  /**
   * When provided, each tag chip gets a delete control that removes the tag from
   * the library (via `deleteMediaTagAction`), and this fires afterwards so the
   * caller can re-pull the tag list. Omit it to render read-only filter chips
   * (the in-builder picker does this).
   */
  onTagDeleted?: () => void;
}) {
  const [searchDraft, setSearchDraft] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks the last `search` prop value we've reconciled the draft against, so a
  // prop change from outside (back button, filter reset) re-seeds the input
  // without a setState-in-effect — React's "adjust state on prop change"
  // pattern, mirroring AssetDetailPanel's `seededFor` guard.
  const [syncedTo, setSyncedTo] = useState(search);
  const [deletingTag, setDeletingTag] = useState<MediaTag | null>(null);
  const [deletePending, startDelete] = useTransition();

  // Only adopt the incoming prop when it genuinely changed from what we last
  // synced AND no debounced push is in flight — otherwise the round-trip echo of
  // a value the user is still typing would clobber the draft mid-keystroke.
  if (search !== syncedTo) {
    setSyncedTo(search);
    if (debounceRef.current === null) {
      setSearchDraft(search);
    }
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchDraft(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      onChange({ search: value, tip: lockedTip ?? tip, tagSlugs });
    }, SEARCH_DEBOUNCE_MS);
  };

  // `tip` and tag changes apply immediately and must flush any pending search so
  // the debounced keystrokes aren't lost on the navigation this triggers.
  const flushSearch = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };

  const clearSearch = () => {
    flushSearch();
    setSearchDraft("");
    onChange({ search: "", tip: lockedTip ?? tip, tagSlugs });
  };

  const handleTipChange = (next: string) => {
    flushSearch();
    onChange({ search: searchDraft, tip: lockedTip ?? next, tagSlugs });
  };

  const toggleTag = (slug: string) => {
    const nextTagSlugs = tagSlugs.includes(slug)
      ? tagSlugs.filter((s) => s !== slug)
      : [...tagSlugs, slug];
    flushSearch();
    onChange({ search: searchDraft, tip: lockedTip ?? tip, tagSlugs: nextTagSlugs });
  };

  const handleDeleteTag = (tag: MediaTag) => {
    startDelete(async () => {
      const res = await deleteMediaTagAction(tag.documentId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Etichetă ștearsă.");
      setDeletingTag(null);
      // Drop a filter for the now-deleted tag before asking the caller to refetch.
      if (tagSlugs.includes(tag.slug)) {
        flushSearch();
        onChange({
          search: searchDraft,
          tip: lockedTip ?? tip,
          tagSlugs: tagSlugs.filter((s) => s !== tag.slug),
        });
      }
      onTagDeleted?.();
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
        />
        <input
          value={searchDraft}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Caută după titlu…"
          aria-label="Caută după titlu"
          className={`w-full rounded-xl border border-border py-2.5 pl-10 text-sm focus:border-[#2dbe8f] focus:outline-none ${
            searchDraft ? "pr-10" : "pr-4"
          }`}
        />
        {searchDraft && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Șterge căutarea"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#94a3b8] transition-colors hover:bg-slate-100 hover:text-[#475569]"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {!lockedTip && (
        <SegmentedControl
          options={TIP_OPTIONS}
          value={tip}
          onChange={handleTipChange}
          ariaLabel="Filtrează după tip"
        />
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const selected = tagSlugs.includes(tag.slug);
            const chipTone = selected
              ? "bg-[#2dbe8f] text-white"
              : "bg-slate-100 text-[#475569]";
            return (
              <span
                key={tag.id}
                className={`inline-flex items-center rounded-full text-xs transition-colors ${chipTone}`}
              >
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleTag(tag.slug)}
                  className={`rounded-full py-1 pl-3 ${onTagDeleted ? "pr-1.5" : "pr-3"}`}
                >
                  {tag.nume}
                </button>
                {onTagDeleted && (
                  <button
                    type="button"
                    onClick={() => setDeletingTag(tag)}
                    disabled={deletePending}
                    aria-label={`Șterge eticheta ${tag.nume}`}
                    className={`mr-1 rounded-full p-0.5 transition-colors disabled:opacity-50 ${
                      selected ? "hover:bg-white/20" : "hover:bg-slate-200"
                    }`}
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            );
          })}
        </div>
      )}

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
        loading={deletePending}
        loadingLabel="Se șterge…"
        onConfirm={() => deletingTag && handleDeleteTag(deletingTag)}
        onCancel={() => setDeletingTag(null)}
      />
    </div>
  );
}
