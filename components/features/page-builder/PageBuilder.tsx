"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { AddBlockModal } from "./AddBlockModal";
import { BlockConfigDrawer } from "./BlockConfigDrawer";
import { BLOCK_REGISTRY } from "./registry";
import { SortableBlock, type DragHandle } from "./SortableBlock";
import {
  SectionCanvas,
  type SectionCanvasActions,
} from "./blocks/section/SectionCanvas";
import {
  ColumnsCanvas,
  type ColumnsCanvasActions,
} from "./blocks/columns/ColumnsCanvas";
import type { SectionData } from "./blocks/section/schema";
import { PageOptionsProvider } from "./blocks/shared/page-options";
import { resolveBlockLinks } from "./blocks/shared/resolve-links";
import type { PageOption } from "@/lib/api/pages-types";
import type { ColumnsData } from "./blocks/columns/schema";
import type { BlockFieldErrors, BlockInstance } from "./types";

/**
 * Where a container child lives: `blockId` names the container; `columnIndex`
 * picks the column for a Columns block and is left undefined for a Section
 * (which has a single child list).
 */
type ChildPath = { blockId: string; columnIndex?: number };
/** Where a newly picked block should land — a container child slot, or null for top level. */
type AddTarget = ChildPath | null;
/** Which existing block the drawer is editing. */
type EditRef = { id: string; parent: ChildPath | null } | null;

/** Types that may never be nested inside a container (containers stay top-level). */
const CONTAINER_TYPES = ["section", "columns"];

/** Inert actions for the static container copy shown inside the <DragOverlay>. */
const NOOP = () => {};
const NOOP_SECTION_ACTIONS: SectionCanvasActions = {
  onEdit: NOOP,
  onDuplicate: NOOP,
  onMove: NOOP,
  onDelete: NOOP,
  canMoveUp: false,
  canMoveDown: false,
  onAddChild: NOOP,
  onEditChild: NOOP,
  onDuplicateChild: NOOP,
  onMoveChild: NOOP,
  onReorderChildren: NOOP,
  onDeleteChild: NOOP,
};
const NOOP_COLUMNS_ACTIONS: ColumnsCanvasActions = {
  onEdit: NOOP,
  onDuplicate: NOOP,
  onMove: NOOP,
  onDelete: NOOP,
  canMoveUp: false,
  canMoveDown: false,
  onAddChild: NOOP,
  onEditChild: NOOP,
  onDuplicateChild: NOOP,
  onMoveChild: NOOP,
  onReorderChildren: NOOP,
  onDeleteChild: NOOP,
};

function isSectionData(value: unknown): value is SectionData {
  return (
    !!value &&
    typeof value === "object" &&
    Array.isArray((value as { blocuri?: unknown }).blocuri)
  );
}

function isColumnsData(value: unknown): value is ColumnsData {
  return (
    !!value &&
    typeof value === "object" &&
    Array.isArray((value as { coloane?: unknown }).coloane)
  );
}

/** Read the child list a `ChildPath` points at, or null if the shape doesn't match. */
function readChildList(
  data: unknown,
  columnIndex: number | undefined,
): BlockInstance[] | null {
  if (columnIndex === undefined) {
    return isSectionData(data) ? (data.blocuri as BlockInstance[]) : null;
  }
  if (isColumnsData(data)) {
    return (data.coloane[columnIndex]?.blocuri as BlockInstance[]) ?? null;
  }
  return null;
}

/** Return a copy of `data` with the child list at `columnIndex` replaced. */
function writeChildList(
  data: unknown,
  columnIndex: number | undefined,
  list: BlockInstance[],
): unknown {
  if (columnIndex === undefined && isSectionData(data)) {
    return { ...data, blocuri: list };
  }
  if (columnIndex !== undefined && isColumnsData(data)) {
    return {
      ...data,
      coloane: data.coloane.map((column, index) =>
        index === columnIndex ? { ...column, blocuri: list } : column,
      ),
    };
  }
  return data;
}

/** Deep-clone a block, assigning fresh ids to it and any nested children. */
function cloneInstance(block: {
  id: string;
  type: string;
  data?: unknown;
}): BlockInstance {
  const data = structuredClone(block.data);
  if (isSectionData(data)) {
    data.blocuri = data.blocuri.map(cloneInstance);
  } else if (isColumnsData(data)) {
    data.coloane = data.coloane.map((column) => ({
      ...column,
      blocuri: column.blocuri.map(cloneInstance),
    }));
  }
  return { id: crypto.randomUUID(), type: block.type, data };
}

function moveInArray<T>(items: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function PageBuilder({
  value,
  onChange,
  pages = [],
  currentPageId = null,
  currentPath = "",
}: {
  /** Controlled tree. Omit both props to keep the standalone behaviour. */
  value?: BlockInstance[];
  onChange?: (blocks: BlockInstance[]) => void;
  /** The site's pages, so a CTA can point at one and the preview can resolve it. */
  pages?: PageOption[];
  /** The page being edited, so a link can offer to file its target underneath. */
  currentPageId?: string | null;
  /** That page's path as it will be after saving. */
  currentPath?: string;
} = {}) {
  const [ownBlocks, setOwnBlocks] = useState<BlockInstance[]>([]);
  const blocks = value ?? ownBlocks;
  const setBlocks = (next: BlockInstance[] | ((current: BlockInstance[]) => BlockInstance[])) => {
    const resolved = typeof next === "function" ? next(blocks) : next;
    if (onChange) onChange(resolved);
    else setOwnBlocks(resolved);
  };
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addTarget, setAddTarget] = useState<AddTarget>(null);
  const [draftType, setDraftType] = useState<string | null>(null);
  const [draftData, setDraftData] = useState<unknown>(null);
  const [draftErrors, setDraftErrors] = useState<BlockFieldErrors>({});
  const [editRef, setEditRef] = useState<EditRef>(null);
  const [preview, setPreview] = useState(false);
  /** The block currently being dragged at the top level, shown in the overlay. */
  const [activeId, setActiveId] = useState<string | null>(null);

  const draftDefinition = draftType ? BLOCK_REGISTRY[draftType] : undefined;
  const isEditing = editRef !== null;
  const activeIndex = activeId
    ? blocks.findIndex((b) => b.id === activeId)
    : -1;
  const activeBlock = activeIndex >= 0 ? blocks[activeIndex] : null;

  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreview(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);

  const closeDraft = () => {
    setDraftType(null);
    setDraftData(null);
    setDraftErrors({});
    setEditRef(null);
    setAddTarget(null);
  };

  /**
   * Replace the child list a `ChildPath` points at via an updater, leaving every
   * other block — and the container's other columns — alone.
   */
  const updateChildList = (
    path: ChildPath,
    updater: (list: BlockInstance[]) => BlockInstance[],
  ) => {
    setBlocks((current) =>
      current.map((block) => {
        if (block.id !== path.blockId) return block;
        const list = readChildList(block.data, path.columnIndex);
        if (!list) return block;
        return {
          ...block,
          data: writeChildList(block.data, path.columnIndex, updater(list)),
        };
      }),
    );
  };

  const openPickerTop = () => {
    setAddTarget(null);
    setPickerOpen(true);
  };

  const openPickerForContainer = (path: ChildPath) => {
    setAddTarget(path);
    setPickerOpen(true);
  };

  const handleSelectBlock = (type: string) => {
    const definition = BLOCK_REGISTRY[type];
    setPickerOpen(false);
    if (!definition) return;
    setEditRef(null);
    setDraftType(type);
    setDraftData(structuredClone(definition.defaults));
    setDraftErrors({});
  };

  const handleEditBlock = (id: string, parent: ChildPath | null) => {
    let instance: { type: string; data?: unknown } | undefined;
    if (parent) {
      const container = blocks.find((b) => b.id === parent.blockId);
      const list = container
        ? readChildList(container.data, parent.columnIndex)
        : null;
      instance = list?.find((c) => c.id === id);
    } else {
      instance = blocks.find((b) => b.id === id);
    }
    if (!instance) return;
    setAddTarget(null);
    setEditRef({ id, parent });
    setDraftType(instance.type);
    setDraftData(structuredClone(instance.data));
    setDraftErrors({});
  };

  const handleSubmitDraft = () => {
    if (!draftDefinition || !draftType) return;
    const result = draftDefinition.parse(draftData);
    if (!result.success) {
      setDraftErrors(result.errors);
      return;
    }

    if (editRef) {
      if (editRef.parent) {
        updateChildList(editRef.parent, (list) =>
          list.map((c) =>
            c.id === editRef.id ? { ...c, data: result.data } : c,
          ),
        );
      } else {
        setBlocks((current) =>
          current.map((b) =>
            b.id === editRef.id ? { ...b, data: result.data } : b,
          ),
        );
      }
    } else if (addTarget) {
      const child = {
        id: crypto.randomUUID(),
        type: draftType,
        data: result.data,
      };
      updateChildList(addTarget, (list) => [...list, child]);
    } else {
      setBlocks((current) => [
        ...current,
        { id: crypto.randomUUID(), type: draftType, data: result.data },
      ]);
    }
    closeDraft();
  };

  // --- top-level block ops ---
  const duplicateBlock = (id: string) => {
    setBlocks((current) => {
      const index = current.findIndex((b) => b.id === id);
      if (index === -1) return current;
      const next = [...current];
      next.splice(index + 1, 0, cloneInstance(current[index]));
      return next;
    });
  };
  const moveBlock = (id: string, dir: -1 | 1) => {
    setBlocks((current) => {
      const index = current.findIndex((b) => b.id === id);
      return index === -1 ? current : moveInArray(current, index, dir);
    });
  };
  const deleteBlock = (id: string) => {
    setBlocks((current) => current.filter((b) => b.id !== id));
  };

  // --- container child ops (Section: one list; Columns: one list per column) ---
  const duplicateChild = (path: ChildPath, childId: string) => {
    updateChildList(path, (list) => {
      const index = list.findIndex((c) => c.id === childId);
      if (index === -1) return list;
      const next = [...list];
      next.splice(index + 1, 0, cloneInstance(list[index]));
      return next;
    });
  };
  const moveChild = (path: ChildPath, childId: string, dir: -1 | 1) => {
    updateChildList(path, (list) => {
      const index = list.findIndex((c) => c.id === childId);
      return index === -1 ? list : moveInArray(list, index, dir);
    });
  };
  const deleteChild = (path: ChildPath, childId: string) => {
    updateChildList(path, (list) => list.filter((c) => c.id !== childId));
  };
  const reorderChildren = (path: ChildPath, from: number, to: number) => {
    updateChildList(path, (list) => arrayMove(list, from, to));
  };

  // --- drag-and-drop (reorder within a list) ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  // `DndContext` derives its draggables' `aria-describedby` from a module-level
  // counter unless it gets an `id`. That counter keeps climbing on the Node
  // server but restarts at 0 in the browser, so an id-less context hydrates
  // mismatched. `useId` is stable across both.
  const dndId = useId();
  const handleTopDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };
  const handleTopDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBlocks((current) => {
      const from = current.findIndex((b) => b.id === active.id);
      const to = current.findIndex((b) => b.id === over.id);
      return from === -1 || to === -1
        ? current
        : arrayMove(current, from, to);
    });
  };

  /**
   * One top-level block's canvas node. `dragHandle` is the live sortable handle
   * for the in-flow row, or `null` for the static copy rendered in the
   * <DragOverlay> (which gets inert actions and no grip).
   */
  const renderBlockNode = (
    block: BlockInstance,
    index: number,
    dragHandle: DragHandle | null,
  ): ReactNode => {
    const definition = BLOCK_REGISTRY[block.type];
    if (!definition) return null;

    if (definition.container && isSectionData(block.data)) {
      return (
        <SectionCanvas
          data={block.data}
          dragHandle={dragHandle ?? undefined}
          actions={
            dragHandle
              ? {
                  onEdit: () => handleEditBlock(block.id, null),
                  onDuplicate: () => duplicateBlock(block.id),
                  onMove: (dir) => moveBlock(block.id, dir),
                  onDelete: () => deleteBlock(block.id),
                  canMoveUp: index > 0,
                  canMoveDown: index < blocks.length - 1,
                  onAddChild: () =>
                    openPickerForContainer({ blockId: block.id }),
                  onEditChild: (childId) =>
                    handleEditBlock(childId, { blockId: block.id }),
                  onDuplicateChild: (childId) =>
                    duplicateChild({ blockId: block.id }, childId),
                  onMoveChild: (childId, dir) =>
                    moveChild({ blockId: block.id }, childId, dir),
                  onReorderChildren: (from, to) =>
                    reorderChildren({ blockId: block.id }, from, to),
                  onDeleteChild: (childId) =>
                    deleteChild({ blockId: block.id }, childId),
                }
              : NOOP_SECTION_ACTIONS
          }
        />
      );
    }

    if (definition.container && isColumnsData(block.data)) {
      return (
        <ColumnsCanvas
          data={block.data}
          dragHandle={dragHandle ?? undefined}
          actions={
            dragHandle
              ? {
                  onEdit: () => handleEditBlock(block.id, null),
                  onDuplicate: () => duplicateBlock(block.id),
                  onMove: (dir) => moveBlock(block.id, dir),
                  onDelete: () => deleteBlock(block.id),
                  canMoveUp: index > 0,
                  canMoveDown: index < blocks.length - 1,
                  onAddChild: (columnIndex) =>
                    openPickerForContainer({ blockId: block.id, columnIndex }),
                  onEditChild: (columnIndex, childId) =>
                    handleEditBlock(childId, { blockId: block.id, columnIndex }),
                  onDuplicateChild: (columnIndex, childId) =>
                    duplicateChild({ blockId: block.id, columnIndex }, childId),
                  onMoveChild: (columnIndex, childId, dir) =>
                    moveChild({ blockId: block.id, columnIndex }, childId, dir),
                  onReorderChildren: (columnIndex, from, to) =>
                    reorderChildren(
                      { blockId: block.id, columnIndex },
                      from,
                      to,
                    ),
                  onDeleteChild: (columnIndex, childId) =>
                    deleteChild({ blockId: block.id, columnIndex }, childId),
                }
              : NOOP_COLUMNS_ACTIONS
          }
        />
      );
    }

    const { Renderer } = definition;
    const cardBtn =
      "rounded-md p-1 text-[#64748b] transition-colors hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent";

    return (
      <div className="group relative">
        {dragHandle ? (
          <button
            type="button"
            ref={dragHandle.setActivatorNodeRef}
            {...dragHandle.attributes}
            {...(dragHandle.listeners ?? {})}
            aria-label="Trage pentru reordonare"
            className="absolute left-3 top-3 z-10 cursor-grab touch-none rounded-md bg-white/90 p-1 text-[#94a3b8] opacity-0 shadow-sm transition-opacity hover:text-[#64748b] group-hover:opacity-100"
          >
            <GripVertical size={16} aria-hidden="true" />
          </button>
        ) : null}

        {/* Sections carry these actions in their own header; a plain block had
            none at all, so a block added by mistake could not be removed. */}
        {dragHandle ? (
          <span className="absolute right-3 top-3 z-10 flex items-center gap-0.5 rounded-lg bg-white/95 p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => handleEditBlock(block.id, null)}
              aria-label="Editează blocul"
              className={cardBtn}
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => duplicateBlock(block.id)}
              aria-label="Duplică blocul"
              className={cardBtn}
            >
              <Copy size={15} />
            </button>
            <button
              type="button"
              onClick={() => moveBlock(block.id, -1)}
              disabled={index === 0}
              aria-label="Mută mai sus"
              className={cardBtn}
            >
              <ChevronUp size={15} />
            </button>
            <button
              type="button"
              onClick={() => moveBlock(block.id, 1)}
              disabled={index === blocks.length - 1}
              aria-label="Mută mai jos"
              className={cardBtn}
            >
              <ChevronDown size={15} />
            </button>
            <button
              type="button"
              onClick={() => deleteBlock(block.id)}
              aria-label="Șterge blocul"
              className="rounded-md p-1 text-[#ef4444] transition-colors hover:bg-[#fef2f2]"
            >
              <Trash2 size={15} />
            </button>
          </span>
        ) : null}
        <div
          className={
            definition.bare
              ? undefined
              : "overflow-hidden rounded-2xl border border-border bg-white"
          }
        >
          <Renderer data={resolveBlockLinks(block.data, pages)} />
        </div>
      </div>
    );
  };

  return (
    <PageOptionsProvider value={{ pages, currentPageId, currentPath }}>
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-[#162040]">
            Pagini
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Adaugă secțiuni de conținut în pagină.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setPreview(true)}
            disabled={blocks.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <Eye size={16} />
            Previzualizează
          </button>
          <button
            type="button"
            onClick={openPickerTop}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#2dbe8f" }}
          >
            <Plus size={16} />
            Adaugă bloc
          </button>
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border px-6 py-20 text-center">
          <p className="text-sm text-muted-foreground">
            Nicio secțiune adăugată. Apasă «Adaugă bloc» pentru a începe.
          </p>
        </div>
      ) : (
        <DndContext
          // Explicit id: dnd-kit otherwise numbers its accessibility description
          // from a module counter that differs between server and browser, and
          // hydration fails on `aria-describedby`.
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleTopDragStart}
          onDragEnd={handleTopDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {blocks.map((block, index) =>
                BLOCK_REGISTRY[block.type] ? (
                  <SortableBlock key={block.id} id={block.id}>
                    {(dragHandle) => renderBlockNode(block, index, dragHandle)}
                  </SortableBlock>
                ) : null,
              )}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeBlock ? (
              <div className="cursor-grabbing">
                {renderBlockNode(activeBlock, activeIndex, null)}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {pickerOpen && (
        <AddBlockModal
          onSelect={handleSelectBlock}
          onClose={() => {
            setPickerOpen(false);
            setAddTarget(null);
          }}
          excludeTypes={addTarget ? CONTAINER_TYPES : undefined}
        />
      )}

      {preview && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex flex-col bg-white">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-6 py-3">
              <span className="text-sm font-semibold text-[#162040]">
                Previzualizare
              </span>
              <button
                type="button"
                onClick={() => setPreview(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50"
              >
                <X size={16} />
                Închide
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {blocks.map((block) => {
                const definition = BLOCK_REGISTRY[block.type];
                if (!definition) return null;
                const { Renderer } = definition;
                return <Renderer key={block.id} data={resolveBlockLinks(block.data, pages)} />;
              })}
            </div>
          </div>
        </ModalPortal>
      )}

      {draftDefinition && (
        <BlockConfigDrawer
          definition={draftDefinition}
          draft={draftData}
          errors={draftErrors}
          submitLabel={isEditing ? "Salvează" : "Adaugă blocul"}
          onChange={(next) => {
            setDraftData(next);
            setDraftErrors({});
          }}
          onCancel={closeDraft}
          onSubmit={handleSubmitDraft}
        />
      )}
    </div>
    </PageOptionsProvider>
  );
}
