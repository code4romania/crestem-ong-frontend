"use client";

import { useId, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  Layers,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
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
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { BLOCK_REGISTRY } from "../../registry";
import type { DragHandle } from "../../SortableBlock";
import { BlockRow } from "../section/BlockRow";
import { columnCountFor, columnsSummary, type ColumnsData } from "./schema";

const iconBtn =
  "rounded-lg p-1.5 text-[#475569] transition-colors hover:bg-slate-200 disabled:opacity-40";

export interface ColumnsCanvasActions {
  onEdit: () => void;
  onDuplicate: () => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onAddChild: (columnIndex: number) => void;
  onEditChild: (columnIndex: number, childId: string) => void;
  onDuplicateChild: (columnIndex: number, childId: string) => void;
  onMoveChild: (columnIndex: number, childId: string, dir: -1 | 1) => void;
  onReorderChildren: (columnIndex: number, from: number, to: number) => void;
  onDeleteChild: (columnIndex: number, childId: string) => void;
}

/**
 * The editor-canvas representation of a Columns block: a management shell
 * (header + a row of column drop-zones) rather than the public grid output.
 * Each column holds its own child list with per-column drag-to-reorder; child
 * blocks are edited in place through the same config drawer as top-level blocks.
 * Blocks cannot be dragged between columns — reorder is within a column only.
 */
export function ColumnsCanvas({
  data,
  actions,
  dragHandle,
}: {
  data: ColumnsData;
  actions: ColumnsCanvasActions;
  dragHandle?: DragHandle;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const count = columnCountFor(data.numarColoane);
  const columns = data.coloane.slice(0, count);
  const totalBlocks = columns.reduce((sum, c) => sum + c.blocuri.length, 0);

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

  const handleColumnDragEnd = (columnIndex: number) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const list = columns[columnIndex]?.blocuri ?? [];
    const from = list.findIndex((c) => c.id === active.id);
    const to = list.findIndex((c) => c.id === over.id);
    if (from === -1 || to === -1) return;
    actions.onReorderChildren(columnIndex, from, to);
  };

  return (
    <div className="group rounded-2xl border border-border bg-slate-50/60">
      <div className="flex items-center gap-3 rounded-t-2xl border-b border-border bg-slate-100/70 px-4 py-3">
        <button
          type="button"
          ref={dragHandle?.setActivatorNodeRef}
          {...dragHandle?.attributes}
          {...(dragHandle?.listeners ?? {})}
          aria-label="Trage pentru reordonare"
          className="shrink-0 cursor-grab touch-none text-[#94a3b8] transition-colors hover:text-[#64748b]"
        >
          <GripVertical size={16} aria-hidden="true" />
        </button>
        <Layers size={16} className="shrink-0 text-[#64748b]" aria-hidden="true" />
        <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-[#475569]">
          Columns
        </span>
        <span className="truncate text-sm text-[#94a3b8]">
          {columnsSummary(data)}
        </span>
        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-[#475569] ring-1 ring-border">
          {totalBlocks === 1 ? "1 bloc" : `${totalBlocks} blocuri`}
        </span>

        <span className="ml-auto flex shrink-0 items-center gap-1">
          <span className="flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
            <button
              type="button"
              onClick={actions.onEdit}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#2563eb] transition-colors hover:bg-[#eff6ff]"
            >
              <Pencil size={14} /> Editează
            </button>
            <button
              type="button"
              onClick={actions.onDuplicate}
              aria-label="Duplică blocul"
              className={iconBtn}
            >
              <Copy size={15} />
            </button>
            <button
              type="button"
              onClick={() => actions.onMove(-1)}
              disabled={!actions.canMoveUp}
              aria-label="Mută mai sus"
              className={iconBtn}
            >
              <ChevronUp size={15} />
            </button>
            <button
              type="button"
              onClick={() => actions.onMove(1)}
              disabled={!actions.canMoveDown}
              aria-label="Mută mai jos"
              className={iconBtn}
            >
              <ChevronDown size={15} />
            </button>
            <button
              type="button"
              onClick={actions.onDelete}
              aria-label="Șterge blocul"
              className="rounded-lg p-1.5 text-[#ef4444] transition-colors hover:bg-[#fef2f2]"
            >
              <Trash2 size={15} />
            </button>
          </span>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Extinde blocul" : "Restrânge blocul"}
            aria-expanded={!collapsed}
            className={iconBtn}
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </span>
      </div>

      {collapsed ? null : (
        <div
          className={`grid gap-3 p-4 ${
            count === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
          }`}
        >
          {columns.map((column, columnIndex) => (
            <div
              key={columnIndex}
              className="rounded-xl border border-dashed border-border p-3"
            >
              <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                Coloana {columnIndex + 1}
              </p>

              {column.blocuri.length > 0 ? (
                <DndContext
                  // Explicit id: dnd-kit otherwise numbers its accessibility description
                  // from a module counter that differs between server and browser, and
                  // hydration fails on `aria-describedby`.
                  id={`${dndId}-${columnIndex}`}
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleColumnDragEnd(columnIndex)}
                >
                  <SortableContext
                    items={column.blocuri.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul className="space-y-2">
                      {column.blocuri.map((child, index) => (
                        <BlockRow
                          key={child.id}
                          block={child}
                          definition={BLOCK_REGISTRY[child.type]}
                          canMoveUp={index > 0}
                          canMoveDown={index < column.blocuri.length - 1}
                          onEdit={() =>
                            actions.onEditChild(columnIndex, child.id)
                          }
                          onDuplicate={() =>
                            actions.onDuplicateChild(columnIndex, child.id)
                          }
                          onMove={(dir) =>
                            actions.onMoveChild(columnIndex, child.id, dir)
                          }
                          onDelete={() =>
                            actions.onDeleteChild(columnIndex, child.id)
                          }
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              ) : null}

              <div className="mt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => actions.onAddChild(columnIndex)}
                  className="flex items-center gap-1.5 rounded-full border border-[#2563eb] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#2563eb] transition-colors hover:bg-[#eff6ff]"
                >
                  <Plus size={15} /> Adaugă bloc
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
