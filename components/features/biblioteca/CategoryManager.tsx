"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CATEGORY_ICONS } from "@/components/features/page-builder/blocks/category-grid/icons";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/lib/api/library-categories-actions";
import type {
  LibraryCategory,
  LibraryIconKey,
  LibrarySubcategory,
} from "@/lib/api/library-categories-types";
import { slugify } from "@/components/features/content-editor/slugify";
import { CategoryIconPicker } from "./CategoryIconPicker";

const inputClass =
  "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:border-[#2dbe8f] focus:outline-none";

const articleLabel = (count: number) => `${count} ${count === 1 ? "articol" : "articole"}`;

const subcategoryLabel = (count: number) =>
  `${count} ${count === 1 ? "subcategorie" : "subcategorii"}`;

/**
 * Name plus slug, with the slug tracking the name until someone edits it — the
 * same behaviour as the page wizard, so an editor learns it once.
 */
function NameSlugFields({
  nume,
  slug,
  onNume,
  onSlug,
  namePlaceholder,
}: {
  nume: string;
  slug: string;
  onNume: (value: string) => void;
  onSlug: (value: string) => void;
  namePlaceholder: string;
}) {
  return (
    <>
      <input
        value={nume}
        onChange={(event) => onNume(event.target.value)}
        placeholder={namePlaceholder}
        aria-label={namePlaceholder}
        className={inputClass}
      />
      <input
        value={slug}
        onChange={(event) => onSlug(event.target.value)}
        placeholder="slug"
        aria-label="Slug"
        className={`${inputClass} font-mono`}
      />
    </>
  );
}

function AddForm({
  parinte,
  namePlaceholder,
  buttonLabel,
  isCategory,
}: {
  parinte: string | null;
  namePlaceholder: string;
  buttonLabel: string;
  /** A subcategory's icon is never rendered, so its picker is skipped. */
  isCategory: boolean;
}) {
  const router = useRouter();
  const [nume, setNume] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [descriere, setDescriere] = useState("");
  const [icon, setIcon] = useState<LibraryIconKey>("folder");
  const [pending, startTransition] = useTransition();

  const setName = (value: string) => {
    setNume(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const submit = () => {
    if (!nume.trim() || !slug.trim()) {
      toast.error("Completează numele și slugul.");
      return;
    }

    startTransition(async () => {
      // `icon` is sent for subcategories too, always "folder" — the field
      // exists on every row and the backend defaults it anyway, so branching
      // on it here would only add a case with no visible effect.
      const result = await createCategoryAction({
        nume: nume.trim(),
        slug: slug.trim(),
        parinte,
        descriere: descriere.trim(),
        icon,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setNume("");
      setSlug("");
      setDescriere("");
      setIcon("folder");
      setSlugTouched(false);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_200px_auto] gap-3">
        <NameSlugFields
          nume={nume}
          slug={slug}
          onNume={setName}
          onSlug={(value) => {
            setSlugTouched(true);
            setSlug(value);
          }}
          namePlaceholder={namePlaceholder}
        />
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-xl bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {buttonLabel}
        </button>
      </div>
      {/* Description and icon belong to a top-level category: they are what its
          card on the public library index shows. A subcategory appears only as
          an option in that category's filter, so it needs neither. */}
      {isCategory ? (
        <>
          <textarea
            value={descriere}
            onChange={(event) => setDescriere(event.target.value)}
            rows={2}
            placeholder="Scurtă descriere, afișată pe cardul din bibliotecă"
            aria-label="Descriere"
            className={inputClass}
          />
          <CategoryIconPicker value={icon} onChange={setIcon} />
        </>
      ) : null}
    </div>
  );
}

function EditForm({
  row,
  isCategory,
  onDone,
}: {
  row: LibrarySubcategory;
  isCategory: boolean;
  onDone: () => void;
}) {
  const router = useRouter();
  const [nume, setNume] = useState(row.nume);
  const [slug, setSlug] = useState(row.slug);
  const [descriere, setDescriere] = useState(row.descriere);
  const [icon, setIcon] = useState<LibraryIconKey>(row.icon);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!nume.trim() || !slug.trim()) {
      toast.error("Completează numele și slugul.");
      return;
    }

    startTransition(async () => {
      // Only the four editable fields go up. `parinte` is deliberately absent:
      // the backend leaves an omitted parent alone, and this screen has no
      // move-between-categories affordance.
      const result = await updateCategoryAction(row.documentId, {
        nume: nume.trim(),
        slug: slug.trim(),
        // Only what this form actually edits goes up, for the same reason
        // `parinte` is absent: the backend's update schema uses undefaulted
        // bases, so an omitted field is genuinely left alone.
        ...(isCategory ? { descriere: descriere.trim(), icon } : {}),
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      onDone();
      router.refresh();
    });
  };

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-[1fr_200px] gap-3">
        <input
          value={nume}
          onChange={(event) => setNume(event.target.value)}
          aria-label="Nume"
          className={inputClass}
        />
        <input
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          aria-label="Slug"
          className={`${inputClass} font-mono`}
        />
      </div>
      {/* Top level only — see the note in `AddForm`. */}
      {isCategory ? (
        <>
          <textarea
            value={descriere}
            onChange={(event) => setDescriere(event.target.value)}
            rows={2}
            placeholder="Scurtă descriere, afișată pe cardul din bibliotecă"
            aria-label="Descriere"
            className={inputClass}
          />
          <CategoryIconPicker value={icon} onChange={setIcon} />
        </>
      ) : null}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onDone}
          disabled={pending}
          className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          Anulează
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-xl bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          Salvează
        </button>
      </div>
    </div>
  );
}

export function CategoryManager({ categories }: { categories: LibraryCategory[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<
    { documentId: string; nume: string; kind: "categorie" | "subcategorie" } | null
  >(null);
  const [editing, setEditing] = useState<string | null>(null);
  /**
   * Which cards are open, by documentId. Cards open independently rather than as
   * an accordion — managing two categories side by side is an ordinary thing to
   * want — and because the set is keyed by id, a card stays open through the
   * `router.refresh()` that follows adding a subcategory to it.
   */
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpanded = (documentId: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(documentId)) next.delete(documentId);
      else next.add(documentId);
      return next;
    });
  };

  /**
   * Collapsed by default, so a long list stays scannable — except a category
   * with no subcategories yet, whose body holds the only way to add the first
   * one. Hiding that behind a chevron on a freshly created category is the one
   * case where collapsing actively gets in the way.
   */
  const isExpanded = (category: LibraryCategory) =>
    expanded.has(category.documentId) || category.copii.length === 0;
  const [pending, startTransition] = useTransition();

  const confirmDelete = () => {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    startTransition(async () => {
      const result = await deleteCategoryAction(target.documentId);
      if (result.error) toast.error(result.error);
      else router.refresh();
    });
  };

  /**
   * Disabled while the count is non-zero, with the reason in the tooltip. The
   * server refuses independently — a disabled button is not a rule.
   */
  const deleteButton = (
    row: LibrarySubcategory,
    kind: "categorie" | "subcategorie",
    blocked: string | null,
  ) => (
    <button
      type="button"
      onClick={() => setDeleting({ documentId: row.documentId, nume: row.nume, kind })}
      disabled={Boolean(blocked) || pending}
      title={blocked ?? `Șterge ${row.nume}`}
      aria-label={`Șterge ${row.nume}`}
      className="rounded-lg p-1.5 text-[#94a3b8] transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#94a3b8]"
    >
      <Trash2 size={15} />
    </button>
  );

  const editButton = (row: LibrarySubcategory) => (
    <button
      type="button"
      onClick={() => setEditing(row.documentId)}
      disabled={pending}
      title={`Editează ${row.nume}`}
      aria-label={`Editează ${row.nume}`}
      className="rounded-lg p-1.5 text-[#94a3b8] transition-colors hover:bg-slate-100 hover:text-[#162040] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Pencil size={15} />
    </button>
  );

  return (
    <div>
      <Link
        href="/dashboard/biblioteca"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-[#162040]"
      >
        <ArrowLeft size={15} />
        Înapoi la bibliotecă
      </Link>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-extrabold text-[#162040]">
          Gestionează categorii &amp; subcategorii
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Categoriile grupează articolele din bibliotecă. Un articol se adaugă într-o
          subcategorie, nu direct într-o categorie.
        </p>
      </div>

      <section className="mb-6 rounded-xl border border-border bg-white p-6">
        <h2 className="mb-4 font-heading text-lg font-bold text-[#162040]">
          Adaugă categorie nouă
        </h2>
        <AddForm
          parinte={null}
          namePlaceholder="Nume categorie"
          buttonLabel="Adaugă categorie"
          isCategory
        />
      </section>

      {categories.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-white px-6 py-10 text-center text-sm text-muted-foreground">
          Nu există încă nicio categorie. Adaugă prima mai sus.
        </p>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <section key={category.documentId} className="rounded-xl border border-border bg-white">
              <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
                {editing === category.documentId ? (
                  <EditForm
                    row={category}
                    isCategory
                    onDone={() => setEditing(null)}
                  />
                ) : (
                  <>
                    <div className="flex min-w-0 items-start gap-3">
                      {(() => {
                        const Icon = CATEGORY_ICONS[category.icon] ?? CATEGORY_ICONS.folder;
                        return (
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#475569]">
                            <Icon size={16} />
                          </span>
                        );
                      })()}
                      <div className="min-w-0">
                        <h3 className="font-heading text-base font-bold text-[#162040]">
                          {category.nume}
                        </h3>
                        <code className="text-xs text-[#94a3b8]">{category.slug}</code>
                        {category.descriere ? (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {category.descriere}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* The subcategory count rides along so a collapsed card
                          still says what is inside it. */}
                      <span className="text-sm font-medium text-[#7c3aed]">
                        {articleLabel(category.numarArticole)}
                        <span className="text-[#94a3b8]">
                          {" · "}
                          {subcategoryLabel(category.copii.length)}
                        </span>
                      </span>
                      {editButton(category)}
                      {deleteButton(
                        category,
                        "categorie",
                        category.copii.length > 0
                          ? "Șterge mai întâi subcategoriile"
                          : null,
                      )}
                      {/* A category with no subcategories is always open, so its
                          toggle would do nothing — it is omitted rather than
                          shown inert. */}
                      {category.copii.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(category.documentId)}
                          aria-expanded={isExpanded(category)}
                          aria-controls={`subcategorii-${category.documentId}`}
                          aria-label={
                            isExpanded(category)
                              ? `Restrânge ${category.nume}`
                              : `Extinde ${category.nume}`
                          }
                          title={isExpanded(category) ? "Restrânge" : "Extinde"}
                          className="rounded-lg p-1.5 text-[#94a3b8] transition-colors hover:bg-slate-100 hover:text-[#162040]"
                        >
                          {isExpanded(category) ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                      ) : null}
                    </div>
                  </>
                )}
              </header>

              <div
                id={`subcategorii-${category.documentId}`}
                className="px-6 py-5"
                hidden={!isExpanded(category)}
              >
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Subcategorii
                </h4>
                <AddForm
                  parinte={category.documentId}
                  namePlaceholder="Nume subcategorie"
                  buttonLabel="Adaugă"
                  isCategory={false}
                />

                <ul className="mt-4 divide-y divide-border">
                  {category.copii.map((child) => (
                    <li
                      key={child.documentId}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      {editing === child.documentId ? (
                        <EditForm
                          row={child}
                          isCategory={false}
                          onDone={() => setEditing(null)}
                        />
                      ) : (
                        <>
                          <div className="min-w-0">
                            <p className="font-heading text-sm font-semibold text-[#162040]">
                              {child.nume}
                            </p>
                            <code className="text-xs text-[#94a3b8]">{child.slug}</code>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-[#7c3aed]">
                              {articleLabel(child.numarArticole)}
                            </span>
                            {editButton(child)}
                            {deleteButton(
                              child,
                              "subcategorie",
                              child.numarArticole > 0 ? "Mută mai întâi articolele" : null,
                            )}
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title={deleting?.kind === "subcategorie" ? "Ștergi această subcategorie?" : "Ștergi această categorie?"}
        description={`„${deleting?.nume ?? ""}” va fi ștearsă definitiv. Acțiunea nu poate fi anulată.`}
        confirmLabel="Șterge"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
