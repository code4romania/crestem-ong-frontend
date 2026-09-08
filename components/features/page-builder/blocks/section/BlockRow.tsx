"use client";

import {
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  LayoutGrid,
  Pencil,
  Trash2,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BlockDefinition } from "../../types";
import type { SectionChild } from "./schema";

/** Keys worth showing as a one-line preview of a child block, in priority order. */
const PREVIEW_KEYS = [
  "titlu",
  "titluSectiune",
  "supratitlu",
  "text",
  "textIntroductiv",
  "subtitlu",
  "intrebare",
  "citat",
  "valoare",
  "eticheta",
  "descriere",
];

function previewText(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const record = data as Record<string, unknown>;
  for (const key of PREVIEW_KEYS) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

const iconBtn =
  "rounded-lg p-1.5 text-[#475569] transition-colors hover:bg-slate-100 disabled:opacity-40";

export function BlockRow({
  block,
  definition,
  canMoveUp,
  canMoveDown,
  onEdit,
  onDuplicate,
  onMove,
  onDelete,
}: {
  block: SectionChild;
  definition: BlockDefinition | undefined;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  const Icon = definition?.icon ?? LayoutGrid;
  const name = definition?.name ?? block.type;
  const text = previewText(block.data);

  const {
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging,
  } = useSortable({ id: block.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group/row flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 ${
        isDragging ? "opacity-80 shadow-md" : ""
      }`}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label="Trage pentru reordonare"
        className="shrink-0 cursor-grab touch-none text-[#cbd5e1] transition-colors hover:text-[#94a3b8]"
      >
        <GripVertical size={16} aria-hidden="true" />
      </button>
      <Icon size={16} className="shrink-0 text-[#64748b]" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[#162040]">{name}</span>
        {text ? (
          <span className="mt-0.5 block truncate text-xs text-[#94a3b8]">
            {text}
          </span>
        ) : null}
      </span>
      <span className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover/row:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#2563eb] transition-colors hover:bg-[#eff6ff]"
        >
          <Pencil size={14} /> Editează
        </button>
        <button
          type="button"
          onClick={onDuplicate}
          aria-label="Duplică blocul"
          className={iconBtn}
        >
          <Copy size={15} />
        </button>
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={!canMoveUp}
          aria-label="Mută mai sus"
          className={iconBtn}
        >
          <ChevronUp size={15} />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={!canMoveDown}
          aria-label="Mută mai jos"
          className={iconBtn}
        >
          <ChevronDown size={15} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Șterge blocul"
          className="rounded-lg p-1.5 text-[#ef4444] transition-colors hover:bg-[#fef2f2]"
        >
          <Trash2 size={15} />
        </button>
      </span>
    </li>
  );
}
