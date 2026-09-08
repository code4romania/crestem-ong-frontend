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
import { BlockRow } from "./BlockRow";
import type { SectionData } from "./schema";

const FUNDAL_LABEL: Record<SectionData["fundal"], string> = {
  default: "Default",
  light: "Light",
  accent: "Accent",
  imagine: "Imagine",
};

const FUNDAL_DOT: Record<SectionData["fundal"], string> = {
  default: "#94a3b8",
  light: "#2dbe8f",
  accent: "#162040",
  imagine: "#4f46e5",
};

function countLabel(n: number): string {
  return n === 1 ? "1 bloc" : `${n} blocuri`;
}

const iconBtn =
  "rounded-lg p-1.5 text-[#475569] transition-colors hover:bg-slate-200 disabled:opacity-40";

export interface SectionCanvasActions {
  onEdit: () => void;
  onDuplicate: () => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onAddChild: () => void;
  onEditChild: (childId: string) => void;
  onDuplicateChild: (childId: string) => void;
  onMoveChild: (childId: string, dir: -1 | 1) => void;
  onReorderChildren: (from: number, to: number) => void;
  onDeleteChild: (childId: string) => void;
}

/**
 * The editor-canvas representation of a Section: a management shell (header +
 * child list + "Adaugă bloc") rather than the public `<section>` output. Child
 * blocks are edited in place through the same config drawer as top-level blocks.
 */
export function SectionCanvas({
  data,
  actions,
  dragHandle,
}: {
  data: SectionData;
  actions: SectionCanvasActions;
  dragHandle?: DragHandle;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const children = data.blocuri;

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

  const handleChildDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = children.findIndex((c) => c.id === active.id);
    const to = children.findIndex((c) => c.id === over.id);
    if (from === -1 || to === -1) return;
    actions.onReorderChildren(from, to);
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
          Section
        </span>
        <span className="truncate text-sm text-[#94a3b8]">
          — {data.numeIntern || "nume intern"}
        </span>
        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-[#475569] ring-1 ring-border">
          {countLabel(children.length)}
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-xs text-[#94a3b8]">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: FUNDAL_DOT[data.fundal] }}
          />
          {FUNDAL_LABEL[data.fundal]}
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
              aria-label="Duplică secțiunea"
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
              aria-label="Șterge secțiunea"
              className="rounded-lg p-1.5 text-[#ef4444] transition-colors hover:bg-[#fef2f2]"
            >
              <Trash2 size={15} />
            </button>
          </span>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Extinde secțiunea" : "Restrânge secțiunea"}
            aria-expanded={!collapsed}
            className={iconBtn}
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </span>
      </div>

      {collapsed ? null : (
        <div className="space-y-3 p-4">
          {children.length > 0 ? (
            <DndContext
              // Explicit id: dnd-kit otherwise numbers its accessibility description
              // from a module counter that differs between server and browser, and
              // hydration fails on `aria-describedby`.
              id={dndId}
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleChildDragEnd}
            >
              <SortableContext
                items={children.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {children.map((child, index) => (
                    <BlockRow
                      key={child.id}
                      block={child}
                      definition={BLOCK_REGISTRY[child.type]}
                      canMoveUp={index > 0}
                      canMoveDown={index < children.length - 1}
                      onEdit={() => actions.onEditChild(child.id)}
                      onDuplicate={() => actions.onDuplicateChild(child.id)}
                      onMove={(dir) => actions.onMoveChild(child.id, dir)}
                      onDelete={() => actions.onDeleteChild(child.id)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          ) : null}

          <div className="relative flex items-center justify-center">
            <span
              className="absolute inset-x-0 top-1/2 h-px bg-border"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={actions.onAddChild}
              className="relative flex items-center gap-1.5 rounded-full border border-[#2563eb] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#2563eb] transition-colors hover:bg-[#eff6ff]"
            >
              <Plus size={15} /> Adaugă bloc
            </button>
          </div>

          {children.length === 0 ? (
            <p className="text-center text-sm text-[#94a3b8]">
              Această secțiune nu conține încă blocuri.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
