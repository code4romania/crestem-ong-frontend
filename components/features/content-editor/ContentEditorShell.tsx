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
  lockSlug = false,
  lockVisibility = false,
  minBlocks = 0,
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
  hideActions = false,
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
   * Keeps the slug as stored. The homepage uses it: its address is the site
   * root whatever the slug says, and the backend refuses a change anyway.
   */
  lockSlug?: boolean;
  /** Same, for the audience list — the landing page is public, always. */
  lockVisibility?: boolean;
  /** Forwarded to `PageBuilder`: the floor on the block count. */
  minBlocks?: number;
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
  /**
   * Skips this shell's own Cancel/Save bar. For a wrapping editor that has
   * more of its own content after this shell (the article's related-articles
   * picker, say), which owns rendering that same bar itself so the buttons
   * stay the last thing on the page instead of appearing above that content.
   */
  hideActions?: boolean;
}) {
  const [slugTouched, setSlugTouched] = useState(hasExistingRecord);

  const changeTitlu = (titlu: string) => {
    // A locked slug does not follow anything: renaming the homepage must not
    // rewrite a field the backend will then refuse.
    if (lockSlug) {
      onChange({ ...value, titlu });
      return;
    }

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
              readOnly={lockSlug}
              onChange={(event) => {
                if (lockSlug) return;
                setSlugTouched(true);
                onChange({ ...value, slug: event.target.value });
              }}
              className={
                lockSlug ? `${inputClass} bg-slate-50 text-muted-foreground` : inputClass
              }
            />
            {slugHint}
          </div>
          {extraFields}
        </div>

        <VisibilityField
          value={value.vizibilitate}
          disabled={lockVisibility}
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
          minBlocks={minBlocks}
        />
      </RenderModeProvider>

      {hideActions ? null : (
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
      )}
    </>
  );
}
