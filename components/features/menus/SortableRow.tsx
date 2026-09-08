"use client";

import type { ReactNode } from "react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface RowDragHandle {
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
  isDragging: boolean;
}

/**
 * Makes one menu row sortable, handing the grip props to the row through a
 * render prop so only the grip starts a drag — the pencil and trash buttons
 * beside it stay clickable.
 */
export function SortableRow({
  id,
  children,
}: {
  id: string;
  children: (handle: RowDragHandle) => ReactNode;
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
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "relative z-10 bg-white opacity-80" : undefined}
    >
      {children({ setActivatorNodeRef, attributes, listeners, isDragging })}
    </div>
  );
}
