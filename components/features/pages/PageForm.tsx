"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { BlockInstance } from "@/components/features/page-builder/types";
import {
  ContentEditorShell,
  inputClass,
  type ContentEditorValue,
} from "@/components/features/content-editor/ContentEditorShell";
import {
  createPageAction,
  setPagePublishedAction,
  updatePageAction,
} from "@/lib/api/pages-actions";
import type { PageDetail, PageOption } from "@/lib/api/pages-types";
import type { LibraryCategory } from "@/lib/api/library-categories-types";

/** A page's path may hold at most this many segments, matching the backend. */
const MAX_PATH_DEPTH = 4;

export function PageForm({
  page,
  pages,
  categories = [],
}: {
  page: PageDetail | null;
  pages: PageOption[];
  categories?: LibraryCategory[];
}) {
  const router = useRouter();
  const [content, setContent] = useState<ContentEditorValue>({
    titlu: page?.titlu ?? "",
    slug: page?.slug ?? "",
    vizibilitate: page?.vizibilitate ?? ["public"],
    blocuri: (page?.blocuri as BlockInstance[]) ?? [],
  });
  const [parinte, setParinte] = useState<string | null>(page?.parinte ?? null);
  const [publicat, setPublicat] = useState(page?.publicat ?? false);
  const [pending, startTransition] = useTransition();

  const { titlu, slug, vizibilitate, blocuri } = content;

  /**
   * A page cannot sit under itself or under one of its own subpages — that
   * would be a cycle — and it cannot sit so deep that its own subpages run past
   * the depth cap. The backend refuses both; the select simply does not offer
   * them.
   */
  const parentOptions = useMemo(() => {
    const childrenOf = new Map<string, string[]>();
    for (const option of pages) {
      if (!option.parinte) continue;
      childrenOf.set(option.parinte, [...(childrenOf.get(option.parinte) ?? []), option.documentId]);
    }

    if (!page) return pages.filter((option) => option.cale.split("/").length - 1 < MAX_PATH_DEPTH);

    const banned = new Set<string>([page.documentId]);
    const queue = [page.documentId];
    let carried = 0;
    while (queue.length) {
      const next: string[] = [];
      for (const id of queue) {
        for (const child of childrenOf.get(id) ?? []) {
          if (banned.has(child)) continue;
          banned.add(child);
          next.push(child);
        }
      }
      if (next.length) carried += 1;
      queue.length = 0;
      queue.push(...next);
    }

    return pages.filter((option) => {
      if (banned.has(option.documentId)) return false;
      const depth = option.cale.split("/").length - 1;
      return depth + 1 + carried <= MAX_PATH_DEPTH;
    });
  }, [page, pages]);

  /** What the page's URL will be once saved. */
  const previewCale = useMemo(() => {
    const parentCale = pages.find((option) => option.documentId === parinte)?.cale ?? "";
    return `${parentCale}/${slug.trim() || "…"}`;
  }, [pages, parinte, slug]);

  /**
   * `asDraft` is the "Salvează ca draft" shortcut: it saves the content and
   * forces the status to draft, whatever the select says. Everything else
   * follows the select, which is the page's intended status.
   */
  const save = (asDraft = false) => {
    if (!titlu.trim()) {
      toast.error("Titlul este obligatoriu.");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slugul este obligatoriu.");
      return;
    }
    if (vizibilitate.length === 0) {
      toast.error("Alege cel puțin o audiență.");
      return;
    }

    const input = { titlu: titlu.trim(), slug: slug.trim(), parinte, vizibilitate, blocuri };
    const wantPublished = asDraft ? false : publicat;

    startTransition(async () => {
      if (page) {
        const result = await updatePageAction(page.documentId, input, page.cale);
        if (result.error) {
          toast.error(result.error);
          return;
        }

        // An update never touches the page's status on the backend, so only a
        // change of status needs its own call.
        if (wantPublished !== page.publicat) {
          const status = await setPagePublishedAction(page.documentId, wantPublished);
          if (status.error) {
            toast.error(status.error);
            return;
          }
        }

        setPublicat(wantPublished);
        toast.success(
          wantPublished ? "Pagina a fost publicată." : "Pagina a fost salvată ca schiță.",
        );
        router.refresh();
        return;
      }

      const result = await createPageAction(input);
      if (result.error || !result.documentId) {
        toast.error(result.error ?? "Nu am putut crea pagina.");
        return;
      }

      // A new page is always created as a draft; publishing it is a second call.
      if (wantPublished) {
        const status = await setPagePublishedAction(result.documentId, true);
        if (status.error) {
          toast.error(status.error);
          router.push(`/dashboard/pagini/${result.documentId}`);
          return;
        }
      }

      toast.success(
        wantPublished ? "Pagina a fost creată și publicată." : "Pagina a fost salvată ca schiță.",
      );
      router.push(`/dashboard/pagini/${result.documentId}`);
    });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-heading text-2xl font-extrabold text-[#162040]">
        {page ? "Editează pagina" : "Creează pagină nouă"}
      </h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">
        {page ? page.cale : "Completează informațiile, apoi adaugă conținutul."}
      </p>

      <ContentEditorShell
        value={content}
        onChange={setContent}
        hasExistingRecord={Boolean(page)}
        pending={pending}
        onSave={() => save()}
        onCancel={() => router.push("/dashboard/pagini")}
        pages={pages}
        currentPageId={page?.documentId ?? null}
        currentPath={previewCale}
        categories={categories}
        saveLabel={
          pending
            ? "Se salvează…"
            : page
              ? "Salvează modificările"
              : publicat
                ? "Publică pagina"
                : "Salvează"
        }
        extraFields={
          <>
            <div>
              <label
                htmlFor="page-parinte"
                className="mb-1.5 block text-xs font-semibold text-[#475569]"
              >
                Pagină părinte
              </label>
              <select
                id="page-parinte"
                value={parinte ?? ""}
                onChange={(event) => setParinte(event.target.value || null)}
                className={inputClass}
              >
                <option value="">Fără (pagină de nivel principal)</option>
                {parentOptions.map((option) => (
                  <option key={option.documentId} value={option.documentId}>
                    {option.titlu} ({option.cale})
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Adresa paginii: <span className="font-medium">{previewCale}</span>
              </p>
            </div>
            <div>
              <label
                htmlFor="page-status"
                className="mb-1.5 block text-xs font-semibold text-[#475569]"
              >
                Status
              </label>
              <select
                id="page-status"
                value={publicat ? "publicat" : "schita"}
                onChange={(event) => setPublicat(event.target.value === "publicat")}
                className={inputClass}
              >
                <option value="schita">Schiță</option>
                <option value="publicat">Publicat</option>
              </select>
              <p className="mt-1.5 text-xs text-muted-foreground">
                O schiță nu apare pe site. Statusul se aplică la salvare.
              </p>
            </div>
          </>
        }
        extraActions={
          /* The draft shortcut only makes sense while creating: an existing page
             already has a status, and the select above is where it changes. */
          !page ? (
            <button
              type="button"
              onClick={() => save(true)}
              disabled={pending}
              className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              Salvează ca draft
            </button>
          ) : null
        }
      />
    </div>
  );
}
