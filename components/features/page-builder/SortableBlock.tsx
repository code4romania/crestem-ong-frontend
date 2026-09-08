"use client";

import type { ReactNode } from "react";
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface DragHandle {
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
  isDragging: boolean;
}

/**
 * Makes one top-level canvas item sortable. Provides the drag-handle props via a
 * render prop so each block can attach them to its own grip (the section header
 * grip, or a floating handle on a plain block card).
 */
export function SortableBlock({
  id,
  children,
}: {
  id: string;
  children: (handle: DragHandle) => ReactNode;
}) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        // Translate only — `CSS.Transform` also emits a no-op `scaleX/scaleY`.
        transform: CSS.Translate.toString(transform),
        // The dragged copy lives in the <DragOverlay>; the in-flow original is
        // hidden and must not lag the pointer with a transform transition.
        transition: isDragging ? undefined : transition,
      }}
      className={isDragging ? "opacity-0" : undefined}
    >
      {children({ setActivatorNodeRef, attributes, listeners, isDragging })}
    </div>
  );
}
