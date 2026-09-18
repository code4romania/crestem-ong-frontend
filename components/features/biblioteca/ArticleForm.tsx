"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  ContentEditorShell,
  inputClass,
  type ContentEditorValue,
} from "@/components/features/content-editor/ContentEditorShell";
import type { BlockInstance } from "@/components/features/page-builder/types";
import {
  createArticleAction,
  setArticlePublishedAction,
  updateArticleAction,
} from "@/lib/api/articles-actions";
import type { ArticleDetail, RelatedArticleRef } from "@/lib/api/articles-types";
import type { LibraryCategory } from "@/lib/api/library-categories-types";
import type { PageOption } from "@/lib/api/pages-types";
import { RelatedArticlesField } from "./RelatedArticlesField";
import { SubcategorySelect } from "./SubcategorySelect";
import { TagsField } from "./TagsField";

// Mirrors the backend's `rezumatBase` cap in article validation.
const REZUMAT_MAX_LENGTH = 400;

export function ArticleForm({
  article,
  categories,
  tagSuggestions,
  pages = [],
  relatedCandidates = [],
}: {
  article: ArticleDetail | null;
  categories: LibraryCategory[];
  tagSuggestions: string[];
  /** The site's pages, so a button inside the article can point at one. */
  pages?: PageOption[];
  /** The top-10 tag-matched candidates for this article; empty on the create screen. */
  relatedCandidates?: RelatedArticleRef[];
}) {
  const router = useRouter();

  const [shell, setShell] = useState<ContentEditorValue>({
    titlu: article?.titlu ?? "",
    slug: article?.slug ?? "",
    vizibilitate: article?.vizibilitate ?? ["public"],
    blocuri: (article?.blocuri as BlockInstance[]) ?? [],
  });
  const [rezumat, setRezumat] = useState(article?.rezumat ?? "");
  const [autor, setAutor] = useState(article?.autor ?? "");
  const [tip, setTip] = useState(article?.tip ?? "");
  const [etichete, setEtichete] = useState<string[]>(article?.etichete ?? []);
  const [subcategorie, setSubcategorie] = useState(article?.subcategorie?.documentId ?? "");
  const [articoleRelationate, setArticoleRelationate] = useState<string[]>(
    article?.articoleRelationate?.map((r) => r.documentId) ?? [],
  );
  /**
   * The status the select is asking for, which is not necessarily the status
   * the article currently has — it is applied on save, exactly as on the Pagini
   * wizard, because the update endpoint deliberately never touches `stare`.
   */
  const [publicat, setPublicat] = useState(article?.publicat ?? false);
  const [pending, startTransition] = useTransition();

  /**
   * Only subcategories are selectable — an article's path is assembled from the
   * subcategory and its parent, so a bare category would leave it unaddressable.
   * Categories appear as `optgroup` labels, which are not choosable.
   */
  const groups = useMemo(
    () => categories.filter((category) => category.copii.length > 0),
    [categories],
  );

  /** What the article's URL will be once saved. Empty until a subcategory is chosen. */
  const previewCale = useMemo(() => {
    const parent = categories.find((category) =>
      category.copii.some((child) => child.documentId === subcategorie),
    );
    const child = parent?.copii.find((entry) => entry.documentId === subcategorie);
    if (!parent || !child) return null;
    return `/biblioteca/${parent.slug}/${child.slug}/${shell.slug.trim() || "…"}`;
  }, [categories, subcategorie, shell.slug]);

  /**
   * `asDraft` is the "Salvează ca draft" shortcut: it saves the content and
   * forces the status to draft, whatever the select says. Everything else
   * follows the select, which is the article's intended status.
   */
  const save = (asDraft = false) => {
    if (!shell.titlu.trim()) {
      toast.error("Titlul este obligatoriu.");
      return;
    }
    if (!shell.slug.trim()) {
      toast.error("Slugul este obligatoriu.");
      return;
    }
    if (shell.vizibilitate.length === 0) {
      toast.error("Alege cel puțin o audiență.");
      return;
    }
    if (!subcategorie) {
      toast.error("Alege o subcategorie.");
      return;
    }

    const input = {
      titlu: shell.titlu.trim(),
      slug: shell.slug.trim(),
      rezumat: rezumat.trim(),
      subcategorie,
      autor: autor.trim(),
      etichete,
      tip: tip.trim(),
      vizibilitate: shell.vizibilitate,
      blocuri: shell.blocuri,
      articoleRelationate,
    };

    const wantPublished = asDraft ? false : publicat;

    startTransition(async () => {
      if (article) {
        const result = await updateArticleAction(article.documentId, input, article.cale);
        if (result.error) {
          toast.error(result.error);
          return;
        }

        // An update never touches the article's status on the backend, so only
        // a change of status needs its own call.
        if (wantPublished !== article.publicat) {
          const status = await setArticlePublishedAction(article.documentId, wantPublished);
          if (status.error) {
            toast.error(status.error);
            return;
          }
        }

        setPublicat(wantPublished);
        toast.success(
          wantPublished
            ? "Articolul a fost publicat."
            : "Articolul a fost salvat ca schiță.",
        );
        router.refresh();
        return;
      }

      const result = await createArticleAction(input);
      if (result.error || !result.documentId) {
        toast.error(result.error ?? "Nu am putut crea articolul.");
        return;
      }

      // A new article is always created as a draft; publishing it is a second call.
      if (wantPublished) {
        const status = await setArticlePublishedAction(result.documentId, true);
        if (status.error) {
          toast.error(status.error);
          router.push(`/dashboard/biblioteca/${result.documentId}`);
          return;
        }
      }

      toast.success(
        wantPublished ? "Articolul a fost publicat." : "Articolul a fost creat.",
      );
      router.push(`/dashboard/biblioteca/${result.documentId}`);
    });
  };

  /**
   * A saved pick can drop out of the ranked top-10 (e.g. the article's tags
   * changed) without being unselected — it must stay visible and checkable
   * even though it's no longer among `relatedCandidates`.
   */
  const mergedCandidates = [
    ...relatedCandidates,
    ...(article?.articoleRelationate ?? []).filter(
      (existing) => !relatedCandidates.some((c) => c.documentId === existing.documentId),
    ),
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-[#162040]">
            {article ? "Editează articolul" : "Articol nou"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {article?.cale ?? "Completează informațiile, apoi adaugă conținutul."}
          </p>
        </div>
      </div>

      <ContentEditorShell
        value={shell}
        onChange={setShell}
        hasExistingRecord={Boolean(article)}
        builderTitle="Conținut articol"
        builderDescription="Adaugă secțiuni de conținut în articol."
        pending={pending}
        /* Not `onSave={save}` — that would hand the click event to `asDraft`,
           which is truthy, and force every save to a draft. */
        onSave={() => save()}
        onCancel={() => router.push("/dashboard/biblioteca")}
        pages={pages}
        categories={categories}
        saveLabel={
          pending ? "Se salvează…" : article ? "Salvează modificările" : "Creează articolul"
        }
        slugHint={
          previewCale ? (
            <span className="mt-1.5 block font-mono text-xs text-[#94a3b8]">{previewCale}</span>
          ) : null
        }
        extraFields={
          <div className="space-y-4 sm:col-span-2">
            <div>
              <label
                htmlFor="articol-rezumat"
                className="mb-1.5 block text-xs font-semibold text-[#475569]"
              >
                Rezumat
              </label>
              <textarea
                id="articol-rezumat"
                value={rezumat}
                onChange={(event) =>
                  setRezumat(event.target.value.slice(0, REZUMAT_MAX_LENGTH))
                }
                rows={2}
                maxLength={REZUMAT_MAX_LENGTH}
                placeholder="Scurtă descriere, afișată în listă și pe carduri"
                className={inputClass}
              />
              <p
                className={`mt-1 text-right text-xs ${
                  rezumat.length >= REZUMAT_MAX_LENGTH ? "text-red-600" : "text-muted-foreground"
                }`}
                aria-live="polite"
              >
                {rezumat.length}/{REZUMAT_MAX_LENGTH}
                {rezumat.length >= REZUMAT_MAX_LENGTH
                  ? " — ai atins limita maximă de caractere"
                  : ""}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="articol-subcategorie"
                  className="mb-1.5 block text-xs font-semibold text-[#475569]"
                >
                  Subcategorie
                </label>
                <SubcategorySelect groups={groups} value={subcategorie} onChange={setSubcategorie} />
              </div>

              <div>
                <label
                  htmlFor="articol-autor"
                  className="mb-1.5 block text-xs font-semibold text-[#475569]"
                >
                  Autor
                </label>
                <input
                  id="articol-autor"
                  value={autor}
                  onChange={(event) => setAutor(event.target.value)}
                  placeholder="Nume autor"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="article-tip"
                  className="mb-1.5 block text-xs font-semibold text-[#475569]"
                >
                  Tip
                </label>
                <input
                  id="article-tip"
                  value={tip}
                  onChange={(event) => setTip(event.target.value)}
                  placeholder="ex. Ghid, Template, Video"
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Apare ca etichetă pe card și în filtrul „Tip” din bibliotecă.
                </p>
              </div>
            </div>

            <TagsField value={etichete} onChange={setEtichete} suggestions={tagSuggestions} />

            <div>
              <label
                htmlFor="article-status"
                className="mb-1.5 block text-xs font-semibold text-[#475569]"
              >
                Status
              </label>
              <div className="relative">
                <select
                  id="article-status"
                  value={publicat ? "publicat" : "schita"}
                  onChange={(event) => setPublicat(event.target.value === "publicat")}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="schita">Schiță</option>
                  <option value="publicat">Publicat</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                O schiță nu apare pe site. Statusul se aplică la salvare.
              </p>
            </div>
          </div>
        }
        hideActions
      />

      {article ? (
        <div className="mt-8 rounded-xl border border-border bg-white p-6">
          <RelatedArticlesField
            candidates={mergedCandidates}
            value={articoleRelationate}
            onChange={setArticoleRelationate}
          />
        </div>
      ) : null}

      {/* Owned here, not by `ContentEditorShell` (see its `hideActions` prop),
          so the buttons stay the last thing on the page, after the
          related-articles box, instead of appearing above it. */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard/biblioteca")}
          disabled={pending}
          className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          Anulează
        </button>
        {/* The draft shortcut only makes sense while creating: an existing
            article already has a status, and the select above is where it
            changes. Matches the Pagini wizard. */}
        {!article ? (
          <button
            type="button"
            onClick={() => save(true)}
            disabled={pending}
            className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Salvează ca draft
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => save()}
          disabled={pending}
          className="rounded-xl bg-[#2dbe8f] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Se salvează…" : article ? "Salvează modificările" : "Creează articolul"}
        </button>
      </div>
    </div>
  );
}
