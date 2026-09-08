"use client";

import { useState } from "react";
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
import { GripVertical, Plus, Trash2, X } from "lucide-react";
import { ModalOverlay } from "@/components/ui/ModalOverlay";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { SortableRow } from "./SortableRow";
import {
  KNOWN_PLATFORMS,
  SOCIAL_LABEL,
  type SocialPlatform,
} from "@/lib/api/footer-types";

export interface EditableSocial {
  id: string;
  platform: SocialPlatform;
  /** Used only by `other`, which names itself. */
  label: string;
  url: string;
}

const fieldBase =
  "rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-[#2dbe8f] focus:outline-none";

const newId = () => Math.random().toString(36).slice(2, 11);

/**
 * The footer's social links: nothing until the editor adds one. "Adaugă rețea
 * socială" opens the list of platforms not yet used — `other` stays available
 * however many times, since it covers everything without a built-in icon.
 */
export function SocialLinksField({
  value,
  onChange,
}: {
  value: EditableSocial[];
  onChange: (next: EditableSocial[]) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /** Row order is the order the icons appear in the footer. */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const from = value.findIndex((social) => social.id === active.id);
    const to = value.findIndex((social) => social.id === over.id);
    if (from === -1 || to === -1) return;

    onChange(arrayMove(value, from, to));
  };

  const available: SocialPlatform[] = [
    ...KNOWN_PLATFORMS.filter(
      (platform) => !value.some((social) => social.platform === platform),
    ),
    "other",
  ];

  const add = (platform: SocialPlatform) => {
    onChange([...value, { id: newId(), platform, label: "", url: "" }]);
    setPickerOpen(false);
  };

  const update = (id: string, patch: Partial<EditableSocial>) => {
    onChange(value.map((social) => (social.id === id ? { ...social, ...patch } : social)));
  };

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-[#475569]">Rețele sociale</p>

      {value.length === 0 ? (
        <p className="mb-3 text-xs text-muted-foreground">
          Nicio rețea adăugată. Footerul nu afișează iconițe sociale.
        </p>
      ) : (
        <DndContext
          // Explicit id: dnd-kit otherwise numbers its accessibility
          // description from a module counter that differs between server and
          // browser, and hydration fails on `aria-describedby`.
          id="social-links"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={value.map((social) => social.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="mb-3 space-y-2">
              {value.map((social) => (
                <SortableRow key={social.id} id={social.id}>
                  {({ setActivatorNodeRef, attributes, listeners }) => {
                    const name =
                      social.platform === "other"
                        ? social.label || "rețeaua"
                        : SOCIAL_LABEL[social.platform];

                    return (
                      <div className="flex min-w-0 items-center gap-2">
                        {/* Only the grip starts a drag, so the inputs beside it
                            stay editable. */}
                        <button
                          type="button"
                          ref={setActivatorNodeRef}
                          {...attributes}
                          {...listeners}
                          aria-label={`Mută ${name}`}
                          className="shrink-0 cursor-grab text-[#cbd5e1] transition-colors hover:text-[#94a3b8]"
                        >
                          <GripVertical size={14} />
                        </button>

                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#475569]">
                          <SocialIcon platform={social.platform} />
                        </span>

                        {social.platform === "other" ? (
                          <input
                            value={social.label}
                            onChange={(event) =>
                              update(social.id, { label: event.target.value })
                            }
                            placeholder="Nume rețea"
                            aria-label="Nume rețea"
                            className={`${fieldBase} w-36 shrink-0`}
                          />
                        ) : (
                          <span className="w-28 shrink-0 text-sm font-medium text-[#475569]">
                            {SOCIAL_LABEL[social.platform]}
                          </span>
                        )}

                        <input
                          value={social.url}
                          onChange={(event) => update(social.id, { url: event.target.value })}
                          placeholder="https://…"
                          aria-label={`Adresă ${name}`}
                          // `min-w-0` so a long address shrinks instead of
                          // pushing the row past the card: a flex item defaults
                          // to min-width:auto.
                          className={`${fieldBase} min-w-0 flex-1`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            onChange(value.filter((item) => item.id !== social.id))
                          }
                          aria-label={`Elimină ${name}`}
                          className="shrink-0 rounded-lg p-2 text-[#94a3b8] transition-colors hover:bg-red-50 hover:text-[#dc2626]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  }}
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50"
      >
        <Plus size={14} />
        Adaugă rețea socială
      </button>

      {pickerOpen && (
        <ModalOverlay labelledBy="social-picker-title">
          <div className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <h2
                  id="social-picker-title"
                  className="font-heading text-lg font-extrabold text-[#162040]"
                >
                  Adaugă rețea socială
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Alege platforma pe care vrei să o afișezi în footer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                aria-label="Închide"
                className="shrink-0 rounded-lg p-1.5 text-[#94a3b8] transition-colors hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* The list outgrows the dialog once every platform is offered, so
                the body scrolls while the header and its close button stay put. */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {available.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => add(platform)}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border px-3 py-4 text-center transition-colors hover:border-[#2dbe8f] hover:bg-[#f0faf6]"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#475569]">
                      <SocialIcon platform={platform} size={18} />
                    </span>
                    <span className="text-sm font-semibold text-[#162040]">
                      {SOCIAL_LABEL[platform]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
