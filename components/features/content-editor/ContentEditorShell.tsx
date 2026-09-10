"use client";

import { useState, type ReactNode } from "react";
import { PageBuilder } from "@/components/features/page-builder/PageBuilder";
import { RenderModeProvider } from "@/components/features/page-builder/blocks/shared/render-mode";
import type { BlockInstance } from "@/components/features/page-builder/types";
import type { PageOption, VisibilityAudience } from "@/lib/api/pages-types";
import type { LibraryCategory } from "@/lib/api/library-categories-types";
import { VisibilityField } from "@/components/features/pages/VisibilityField";
import { slugify } from "./slugify";

export const inputClass =
  "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:border-[#2dbe8f] focus:outline-none";

export interface ContentEditorValue {
  titlu: string;
  slug: string;
  vizibilitate: VisibilityAudience[];
  blocuri: BlockInstance[];
}

/**
 * What a page and an article genuinely share: a title that seeds a slug, an
 * audience list, a block canvas, and a save bar. Everything either type owns
 * alone — the page's parent tree and status, the article's subcategory and
 * tags — arrives through `extraFields` and `extraActions`, so no page-only
 * branch ever lands in here. State lives in the wrapper, which stays the one
 * place that knows how to save.
 */
export function ContentEditorShell({
  value,
  onChange,
  extraFields,
  extraActions,
  slugHint,
  builderTitle,
  builderDescription,
  saveLabel,
  pending,
  onSave,
  onCancel,
  hasExistingRecord,
  pages = [],
  currentPageId = null,
  currentPath = "",
  categories = [],
}: {
  value: ContentEditorValue;
  /**
   * Accepts a plain next value or an updater, exactly like React's own
   * `setState`. A consumer that calls this after an `await` MUST use the
   * updater form: `value` captured before the await is stale by then, so
   * spreading it would silently revert every other field — the block tree
   * included.
   */
  onChange: (next: ContentEditorValue | ((prev: ContentEditorValue) => ContentEditorValue)) => void;
  /** Fields the wrapping editor owns, rendered as further cells of the same grid. */
  extraFields?: ReactNode;
  /** Buttons the wrapping editor owns, rendered between cancel and save. */
  extraActions?: ReactNode;
  /** Rendered under the slug input — the article's derived path, say. */
  slugHint?: ReactNode;
  /**
   * The block canvas heading. Forwarded to `PageBuilder`, which owns that
   * heading — the shell used to print a second one of its own above it, so an
   * article read "Conținut articol" and then the builder's own "Pagini".
   * Omitted leaves the builder's page wording in place.
   */
  builderTitle?: string;
  /** The line under that heading, same rule. */
  builderDescription?: string;
  saveLabel: string;
  pending: boolean;
  onSave: () => void;
  onCancel: () => void;
  /** An existing record's slug is already deliberate, so it stops tracking the title. */
  hasExistingRecord: boolean;
  /** Forwarded to `PageBuilder` so link blocks can resolve site pages. */
  pages?: PageOption[];
  /** The record being edited, so a link can offer to file its target underneath. */
  currentPageId?: string | null;
  /** That record's path as it will be after saving. */
  currentPath?: string;
  /** Forwarded to `PageBuilder` so `biblioteca-categorii` previews on the canvas. */
  categories?: LibraryCategory[];
}) {
  const [slugTouched, setSlugTouched] = useState(hasExistingRecord);

  const changeTitlu = (titlu: string) => {
    // The slug follows the title until the editor writes one by hand; after
    // that it is theirs, and a rename must not silently break existing links.
    onChange({ ...value, titlu, slug: slugTouched ? value.slug : slugify(titlu) });
  };

  return (
    <>
      <div className="mb-6 space-y-5 rounded-xl border border-border bg-white p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="page-titlu" className="mb-1.5 block text-xs font-semibold text-[#475569]">
              Titlu
            </label>
            <input
              id="page-titlu"
              value={value.titlu}
              onChange={(event) => changeTitlu(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="page-slug" className="mb-1.5 block text-xs font-semibold text-[#475569]">
              Slug
            </label>
            <input
              id="page-slug"
              value={value.slug}
              onChange={(event) => {
                setSlugTouched(true);
                onChange({ ...value, slug: event.target.value });
              }}
              className={inputClass}
            />
            {slugHint}
          </div>
          {extraFields}
        </div>

        <VisibilityField
          value={value.vizibilitate}
          onChange={(vizibilitate) => onChange({ ...value, vizibilitate })}
        />
      </div>

      {/* Marks everything below as the builder, so a `custom-html` block
          renders inert here instead of running the page's own scripts. */}
      <RenderModeProvider value="editor">
        <PageBuilder
          value={value.blocuri}
          onChange={(blocuri) => onChange({ ...value, blocuri })}
          title={builderTitle}
          description={builderDescription}
          pages={pages}
          currentPageId={currentPageId}
          currentPath={currentPath}
          categories={categories}
        />
      </RenderModeProvider>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          Anulează
        </button>
        {extraActions}
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          className="rounded-xl bg-[#2dbe8f] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saveLabel}
        </button>
      </div>
    </>
  );
}
