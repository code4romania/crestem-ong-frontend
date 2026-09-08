"use client";

import { ChevronRight, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { SortableRow } from "./SortableRow";

/**
 * One row of the menu tree. Children are indented and get no "add" button — the
 * tree is two levels deep by design, and the schema refuses a third.
 */
export function MenuItemRow({
  id,
  label,
  url,
  childCount = 0,
  nested = false,
  disabled = false,
  missingLabel = "Titlu de coloană — fără link",
  onAddChild,
  onEdit,
  onDelete,
}: {
  id: string;
  label: string;
  url?: string;
  childCount?: number;
  nested?: boolean;
  disabled?: boolean;
  /**
   * Shown in place of the address. A footer column heading has none by design;
   * anywhere else, an item without one is pointing at a page that was deleted.
   */
  missingLabel?: string;
  onAddChild?: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <SortableRow id={id}>
      {({ setActivatorNodeRef, attributes, listeners }) => (
        <div
          className={`group flex items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-slate-50 ${
            nested ? "pl-12" : ""
          }`}
        >
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            disabled={disabled}
            aria-label={`Mută „${label}”`}
            className="shrink-0 cursor-grab text-[#cbd5e1] hover:text-[#94a3b8] disabled:cursor-not-allowed"
          >
            <GripVertical size={14} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-semibold text-[#162040]">{label}</p>
            {url ? (
              <p className="truncate text-xs text-muted-foreground">{url}</p>
            ) : (
              <p className="truncate text-xs italic text-muted-foreground">
                {missingLabel}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {childCount > 0 && (
              <span className="mr-1 inline-flex items-center text-xs font-semibold text-[#64748b]">
                <ChevronRight size={12} />
                {childCount}
              </span>
            )}
            {onAddChild && (
              <button
                type="button"
                onClick={onAddChild}
                disabled={disabled}
                aria-label={`Adaugă sub-element în „${label}”`}
                className="rounded p-1 text-[#94a3b8] transition-colors hover:bg-[#eff6ff] hover:text-[#2563eb] disabled:opacity-50"
              >
                <Plus size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={onEdit}
              disabled={disabled}
              aria-label={`Editează „${label}”`}
              className="rounded p-1 text-[#94a3b8] transition-colors hover:bg-slate-100 hover:text-[#475569] disabled:opacity-50"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={disabled}
              aria-label={`Șterge „${label}”`}
              className="rounded p-1 text-[#94a3b8] transition-colors hover:bg-red-50 hover:text-[#dc2626] disabled:opacity-50"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </SortableRow>
  );
}
