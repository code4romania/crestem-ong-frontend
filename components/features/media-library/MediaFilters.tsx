"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
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
}) {
  const [searchDraft, setSearchDraft] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks the last `search` prop value we've reconciled the draft against, so a
  // prop change from outside (back button, filter reset) re-seeds the input
  // without a setState-in-effect — React's "adjust state on prop change"
  // pattern, mirroring AssetDetailPanel's `seededFor` guard.
  const [syncedTo, setSyncedTo] = useState(search);

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
          className="w-full rounded-xl border border-border py-2.5 pl-10 pr-4 text-sm focus:border-[#2dbe8f] focus:outline-none"
        />
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
            return (
              <button
                key={tag.slug}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleTag(tag.slug)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  selected
                    ? "bg-[#2dbe8f] text-white"
                    : "bg-slate-100 text-[#475569]"
                }`}
              >
                {tag.nume}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
