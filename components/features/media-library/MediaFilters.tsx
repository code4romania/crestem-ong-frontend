"use client";

import { Search } from "lucide-react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { MediaTag } from "@/lib/api/media-library-types";

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
  onChange,
}: {
  search: string;
  tip: string;
  tagSlugs: string[];
  tags: MediaTag[];
  onChange: (next: { search: string; tip: string; tagSlugs: string[] }) => void;
}) {
  const toggleTag = (slug: string) => {
    const nextTagSlugs = tagSlugs.includes(slug)
      ? tagSlugs.filter((s) => s !== slug)
      : [...tagSlugs, slug];
    onChange({ search, tip, tagSlugs: nextTagSlugs });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
        />
        <input
          value={search}
          onChange={(event) =>
            onChange({ search: event.target.value, tip, tagSlugs })
          }
          placeholder="Caută după titlu…"
          aria-label="Caută după titlu"
          className="w-full rounded-xl border border-border py-2.5 pl-10 pr-4 text-sm focus:border-[#2dbe8f] focus:outline-none"
        />
      </div>

      <SegmentedControl
        options={TIP_OPTIONS}
        value={tip}
        onChange={(next) => onChange({ search, tip: next, tagSlugs })}
        ariaLabel="Filtrează după tip"
      />

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
