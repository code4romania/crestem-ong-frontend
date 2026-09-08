"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { updateMenuItemsAction } from "@/lib/api/menus-actions";
import type { Menu, MenuItem, MenuLocation } from "@/lib/api/menus";
import type { FooterContent } from "@/lib/api/footer-types";
import type { PageOption } from "@/lib/api/pages-types";
import { FooterContentPanel } from "./FooterContentPanel";
import { MenuItemForm, type MenuItemValues, type PageMode } from "./MenuItemForm";
import { MenuItemRow } from "./MenuItemRow";

interface EditableChild {
  id: string;
  label: string;
  /** Resolved from `pagina` when the item points at a page. */
  url?: string;
  pagina?: string;
}

interface EditableItem extends EditableChild {
  children: EditableChild[];
}

interface EditableMenu {
  location: MenuLocation;
  name: string;
  items: EditableItem[];
}

type FormState =
  | { mode: "add-root" }
  | { mode: "add-child"; parentId: string }
  | { mode: "edit-root"; itemId: string }
  | { mode: "edit-child"; parentId: string; childId: string };

interface DeleteTarget {
  id: string;
  parentId?: string;
  label: string;
  childCount: number;
}

const LOCATION_LABEL: Record<MenuLocation, string> = {
  header: "Header",
  footer: "Footer",
};

/**
 * Rows are Strapi components and arrive without identifiers, so the editor mints
 * its own. They exist only to key React lists and drag operations, and are
 * stripped before the tree is sent back.
 */
const newId = () => Math.random().toString(36).slice(2, 11);

const toEditable = (menus: Menu[]): EditableMenu[] =>
  menus.map((menu) => ({
    location: menu.location,
    name: menu.name,
    items: menu.items.map((item) => ({
      id: newId(),
      label: item.label,
      url: item.url,
      pagina: item.pagina,
      children: (item.children ?? []).map((child) => ({
        id: newId(),
        label: child.label,
        url: child.url,
        pagina: child.pagina,
      })),
    })),
  }));

/**
 * A page-linked item sends only its relation: the address is derived from the
 * page's slug server-side, so storing a copy here would go stale the moment the
 * page is renamed.
 */
const toLink = (entry: EditableChild) => (entry.pagina ? { pagina: entry.pagina } : {});

const toPayload = (items: EditableItem[]): MenuItem[] =>
  items.map((item) => ({
    label: item.label,
    ...toLink(item),
    children: item.children.map((child) => ({ label: child.label, ...toLink(child) })),
  }));

export function MenuBuilder({
  menus,
  footer,
  pages,
}: {
  menus: Menu[];
  footer: FooterContent;
  pages: PageOption[];
}) {
  const [state, setState] = useState<EditableMenu[]>(() => toEditable(menus));
  const [activeLocation, setActiveLocation] = useState<MenuLocation>(
    menus[0]?.location ?? "header",
  );
  const [form, setForm] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [pending, startTransition] = useTransition();

  const activeMenu = state.find((menu) => menu.location === activeLocation);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /**
   * A footer parent is a column heading and never redirects, so it gets no page
   * field at all. A header parent's page is optional: at the moment it is added
   * nobody knows yet whether it will get sub-elements, and one that does is a
   * dropdown that opens rather than a link that navigates.
   */
  const rootPageMode: PageMode = activeLocation === "footer" ? "hidden" : "optional";

  const items = useMemo(() => activeMenu?.items ?? [], [activeMenu]);

  const pageById = useMemo(
    () => new Map(pages.map((option) => [option.documentId, option])),
    [pages],
  );

  /**
   * The address the server would resolve, worked out locally so a row stops
   * reading "fără pagină" the moment a page is picked, instead of waiting for a
   * reload. `url` is only ever a legacy value from before menus became
   * page-only.
   */
  const displayUrl = (entry: { url?: string; pagina?: string }) => {
    if (!entry.pagina) return entry.url;
    const option = pageById.get(entry.pagina);
    return option ? option.cale : undefined;
  };

  /** What a row says in place of an address, and each case means something different. */
  const missingLabelFor = (
    entry: { pagina?: string; children?: unknown[] },
    isFooterRoot: boolean,
  ) => {
    if (entry.pagina) return "Pagina legată nu mai există";
    if (isFooterRoot) return "Titlu de coloană — fără link";
    // A parent with sub-elements is a dropdown: it opens, it does not navigate,
    // and it is on the site whether or not it names a page of its own.
    if ((entry.children?.length ?? 0) > 0) return "Deschide un dropdown — fără pagină";
    return "Fără pagină — nu apare pe site";
  };

  /**
   * Saves the whole tree, showing the change immediately and rolling back to the
   * previous one if the request fails.
   */
  const commit = (nextItems: EditableItem[]) => {
    const previous = items;
    setState((current) =>
      current.map((menu) =>
        menu.location === activeLocation ? { ...menu, items: nextItems } : menu,
      ),
    );

    startTransition(async () => {
      const result = await updateMenuItemsAction(activeLocation, toPayload(nextItems));
      if (result.error) {
        setState((current) =>
          current.map((menu) =>
            menu.location === activeLocation ? { ...menu, items: previous } : menu,
          ),
        );
        toast.error(result.error);
      }
    });
  };

  const handleFormSubmit = (values: MenuItemValues) => {
    if (!form) return;

    if (form.mode === "add-root") {
      commit([
        ...items,
        { id: newId(), label: values.label, url: undefined, pagina: values.pagina, children: [] },
      ]);
    }

    if (form.mode === "add-child") {
      commit(
        items.map((item) =>
          item.id === form.parentId
            ? {
                ...item,
                children: [
                  ...item.children,
                  { id: newId(), label: values.label, url: undefined, pagina: values.pagina },
                ],
              }
            : item,
        ),
      );
    }

    if (form.mode === "edit-root") {
      commit(
        items.map((item) =>
          item.id === form.itemId
            ? { ...item, label: values.label, url: undefined, pagina: values.pagina }
            : item,
        ),
      );
    }

    if (form.mode === "edit-child") {
      commit(
        items.map((item) =>
          item.id === form.parentId
            ? {
                ...item,
                children: item.children.map((child) =>
                  child.id === form.childId
                    ? { ...child, label: values.label, url: undefined, pagina: values.pagina }
                    : child,
                ),
              }
            : item,
        ),
      );
    }

    setForm(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    commit(
      deleteTarget.parentId
        ? items.map((item) =>
            item.id === deleteTarget.parentId
              ? {
                  ...item,
                  children: item.children.filter((child) => child.id !== deleteTarget.id),
                }
              : item,
          )
        : items.filter((item) => item.id !== deleteTarget.id),
    );

    setDeleteTarget(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const rootFrom = items.findIndex((item) => item.id === activeId);
    if (rootFrom !== -1) {
      const rootTo = items.findIndex((item) => item.id === overId);
      // Only reordering within a list is supported; a row dragged onto another
      // level has no destination and is left where it was.
      if (rootTo === -1) return;
      commit(arrayMove(items, rootFrom, rootTo));
      return;
    }

    const parent = items.find((item) =>
      item.children.some((child) => child.id === activeId),
    );
    if (!parent) return;

    const childFrom = parent.children.findIndex((child) => child.id === activeId);
    const childTo = parent.children.findIndex((child) => child.id === overId);
    if (childTo === -1) return;

    commit(
      items.map((item) =>
        item.id === parent.id
          ? { ...item, children: arrayMove(item.children, childFrom, childTo) }
          : item,
      ),
    );
  };

  if (!activeMenu) {
    return (
      <p className="text-sm text-muted-foreground">
        Niciun meniu configurat. Repornește serverul pentru a le crea.
      </p>
    );
  }

  const editingRoot = form?.mode === "edit-root" ? items.find((i) => i.id === form.itemId) : null;
  const editingChild =
    form?.mode === "edit-child"
      ? items
          .find((i) => i.id === form.parentId)
          ?.children.find((c) => c.id === form.childId)
      : null;

  return (
    <div>
      <h1 className="font-heading text-2xl font-extrabold text-[#162040]">Menu Builder</h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">
        Creează și gestionează meniurile de navigare ale site-ului public
      </p>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full shrink-0 lg:w-64">
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <div className="border-b border-border px-4 py-3">
              <p className="font-heading text-sm font-bold text-[#162040]">Meniuri</p>
            </div>
            <div className="divide-y divide-border">
              {state.map((menu) => {
                const selected = menu.location === activeLocation;
                return (
                  <button
                    key={menu.location}
                    type="button"
                    onClick={() => {
                      setActiveLocation(menu.location);
                      setForm(null);
                    }}
                    aria-current={selected}
                    className={`w-full px-4 py-3.5 text-left transition-colors ${
                      selected ? "bg-[#eff6ff]" : "hover:bg-slate-50"
                    }`}
                  >
                    <p
                      className={`font-heading text-sm font-semibold ${
                        selected ? "text-[#2563eb]" : "text-[#162040]"
                      }`}
                    >
                      {menu.name}
                    </p>
                    <p
                      className={`mt-0.5 text-xs ${
                        selected ? "text-[#93c5fd]" : "text-muted-foreground"
                      }`}
                    >
                      {LOCATION_LABEL[menu.location]}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {activeLocation === "footer" && <FooterContentPanel footer={footer} />}

          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <h2 className="font-heading text-[1.0625rem] font-bold text-[#162040]">
                  {activeMenu.name}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Suportă până la 2 niveluri de imbricare
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ mode: "add-root" })}
                disabled={pending}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                <Plus size={14} />
                Adaugă element
              </button>
            </div>

            {form?.mode === "add-root" && (
              <MenuItemForm
                variant="root"
                title="Adaugă element la nivel principal"
                pageMode={rootPageMode}
                pages={pages}
                submitLabel="Adaugă"
                pending={pending}
                onSubmit={handleFormSubmit}
                onCancel={() => setForm(null)}
              />
            )}

            {editingRoot && (
              <MenuItemForm
                variant="root"
                title="Editează elementul"
                pageMode={rootPageMode}
                pages={pages}
                initialPagina={editingRoot.pagina ?? ""}
                initialLabel={editingRoot.label}
                
                submitLabel="Salvează"
                pending={pending}
                onSubmit={handleFormSubmit}
                onCancel={() => setForm(null)}
              />
            )}

            {items.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Niciun element în acest meniu. Adaugă primul element.
                </p>
              </div>
            ) : (
              <DndContext
                // Without an explicit id, dnd-kit numbers its accessibility
                // description from a module counter that runs to a different
                // value on the server than in the browser, and the ids it puts
                // in `aria-describedby` fail hydration.
                id="menu-items"
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((item) => (
                    <div key={item.id}>
                      <MenuItemRow
                        id={item.id}
                        label={item.label}
                        url={displayUrl(item)}
                        childCount={item.children.length}
                        missingLabel={missingLabelFor(item, activeLocation === "footer")}
                        disabled={pending}
                        onAddChild={() => setForm({ mode: "add-child", parentId: item.id })}
                        onEdit={() => setForm({ mode: "edit-root", itemId: item.id })}
                        onDelete={() =>
                          setDeleteTarget({
                            id: item.id,
                            label: item.label,
                            childCount: item.children.length,
                          })
                        }
                      />

                      {form?.mode === "add-child" && form.parentId === item.id && (
                        <MenuItemForm
                          variant="child"
                          title="Adaugă sub-element"
                          pageMode="required"
                          pages={pages}
                          submitLabel="Adaugă"
                          pending={pending}
                          onSubmit={handleFormSubmit}
                          onCancel={() => setForm(null)}
                        />
                      )}

                      <SortableContext
                        items={item.children.map((child) => child.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {item.children.map((child) =>
                          editingChild?.id === child.id ? (
                            <MenuItemForm
                              key={child.id}
                              variant="child"
                              title="Editează sub-elementul"
                              pageMode="required"
                              pages={pages}
                              initialPagina={child.pagina ?? ""}
                              initialLabel={child.label}
                              
                              submitLabel="Salvează"
                              pending={pending}
                              onSubmit={handleFormSubmit}
                              onCancel={() => setForm(null)}
                            />
                          ) : (
                            <MenuItemRow
                              key={child.id}
                              id={child.id}
                              label={child.label}
                              url={displayUrl(child)}
                              nested
                              missingLabel={missingLabelFor(child, false)}
                              disabled={pending}
                              onEdit={() =>
                                setForm({
                                  mode: "edit-child",
                                  parentId: item.id,
                                  childId: child.id,
                                })
                              }
                              onDelete={() =>
                                setDeleteTarget({
                                  id: child.id,
                                  parentId: item.id,
                                  label: child.label,
                                  childCount: 0,
                                })
                              }
                            />
                          ),
                        )}
                      </SortableContext>
                    </div>
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Ștergi acest element?"
        description={
          deleteTarget?.childCount
            ? `„${deleteTarget.label}” conține ${deleteTarget.childCount} ${
                deleteTarget.childCount === 1 ? "sub-element" : "sub-elemente"
              }. Ștergerea îl elimină împreună cu ele. Paginile către care duc rămân neatinse.`
            : `„${deleteTarget?.label}” va fi eliminat din meniu. Pagina către care duce rămâne neatinsă.`
        }
        confirmLabel="Șterge"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
