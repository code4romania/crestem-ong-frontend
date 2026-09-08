"use client";

import { useRef, useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { uploadPageImageAction } from "@/lib/api/page-blocks-actions";
import { TagInput } from "./TagInput";
import { EMPTY_PERSON, type Person } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";
const errorClass = "mt-1 text-xs text-[#ef4444]";

/**
 * The "Persoane" repeater for People Grid. Master-detail flow cloned from
 * Feature Cards' `CardList`: a list of added people, plus a separate sub-form
 * ("Persoană nouă" / edit) with its own draft buffer that only commits on
 * "Salvează persoana". Image handling matches the Hero blocks
 * (`uploadPageImageAction` + preview).
 */
export function PersonList({
  value,
  onChange,
  error,
}: {
  value: Person[];
  onChange: (next: Person[]) => void;
  error?: string;
}) {
  // `editing === value.length` means a brand-new person is being drafted.
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Person>(EMPTY_PERSON);
  const [isUploading, startUpload] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    setDraft({ ...EMPTY_PERSON });
    setUploadError(null);
    setEditing(value.length);
  };

  const openExisting = (index: number) => {
    setDraft({ ...value[index] });
    setUploadError(null);
    setEditing(index);
  };

  const closeForm = () => setEditing(null);

  const missingAlt = Boolean(draft.imagine) && !draft.imagineAlt.trim();
  const canSave = Boolean(draft.nume.trim()) && !missingAlt;

  const saveDraft = () => {
    if (!canSave) return;
    const clean: Person = {
      ...draft,
      nume: draft.nume.trim(),
      imagineAlt: draft.imagineAlt.trim(),
    };
    onChange(
      editing === value.length
        ? [...value, clean]
        : value.map((p, i) => (i === editing ? clean : p)),
    );
    setEditing(null);
  };

  const remove = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  if (editing !== null) {
    const setField = (patch: Partial<Person>) =>
      setDraft((d) => ({ ...d, ...patch }));

    const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      setUploadError(null);
      startUpload(async () => {
        const form = new FormData();
        form.append("files", file);
        const result = await uploadPageImageAction(form);
        if (result.error || !result.image) {
          setUploadError(result.error ?? "Nu am putut încărca imaginea.");
          return;
        }
        setField({ imagine: result.image });
      });
    };

    return (
      <div className="rounded-xl border border-border p-4">
        <button
          type="button"
          onClick={closeForm}
          className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-[#2563eb] hover:underline"
        >
          <ChevronLeft size={16} /> Înapoi la lista de persoane
        </button>

        <p className="mb-4 text-sm font-bold text-[#162040]">
          {editing === value.length ? "Persoană nouă" : "Editează persoana"}
        </p>

        <div className="space-y-4">
          <div>
            <span className={labelClass}>Imagine</span>
            {draft.imagine ? (
              <div className="overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getMediaUrl(draft.imagine.url)}
                  alt=""
                  className="h-40 w-full object-cover"
                />
                <div className="flex items-center justify-between gap-3 border-t border-border bg-white px-4 py-2.5">
                  <span className="truncate text-sm text-[#475569]">
                    {draft.imagine.name || "imagine"}
                  </span>
                  <span className="flex shrink-0 items-center gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="text-sm font-semibold text-[#2563eb] hover:opacity-80 disabled:opacity-60"
                    >
                      {isUploading ? "Se încarcă..." : "Schimbă imaginea"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setField({ imagine: null })}
                      className="text-sm font-semibold text-[#ef4444] hover:opacity-80"
                    >
                      Elimină imaginea
                    </button>
                  </span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-8 text-sm font-semibold text-[#475569] transition-colors hover:border-[#2dbe8f] hover:text-[#162040] disabled:opacity-60"
              >
                {isUploading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <ImagePlus size={20} />
                )}
                {isUploading ? "Se încarcă..." : "Selectează imagine"}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            <button
              type="button"
              disabled
              title="În curând"
              className="mt-2 text-xs font-semibold text-[#94a3b8]"
            >
              Alege din Media Library · în curând
            </button>
            {uploadError && <p className={errorClass}>{uploadError}</p>}
          </div>

          {draft.imagine ? (
            <div>
              <label htmlFor="pl-person-alt" className={labelClass}>
                Text alternativ imagine <span className="text-[#ef4444]">*</span>
              </label>
              <input
                id="pl-person-alt"
                className={inputClass}
                value={draft.imagineAlt}
                onChange={(e) => setField({ imagineAlt: e.target.value })}
                placeholder="Descriere accesibilă a imaginii"
                aria-invalid={missingAlt}
              />
              {missingAlt && (
                <p className={errorClass}>
                  Adaugă un text alternativ pentru imagine.
                </p>
              )}
            </div>
          ) : null}

          <div>
            <label htmlFor="pl-person-nume" className={labelClass}>
              Nume <span className="text-[#ef4444]">*</span>
            </label>
            <input
              id="pl-person-nume"
              className={inputClass}
              value={draft.nume}
              onChange={(e) => setField({ nume: e.target.value })}
              placeholder="ex. Ana Moldovan"
            />
          </div>

          <div>
            <label htmlFor="pl-person-rol" className={labelClass}>
              Rol
            </label>
            <input
              id="pl-person-rol"
              className={inputClass}
              value={draft.rol}
              onChange={(e) => setField({ rol: e.target.value })}
              placeholder="ex. Director Executiv"
            />
          </div>

          <div>
            <label htmlFor="pl-person-organizatie" className={labelClass}>
              Organizație
            </label>
            <input
              id="pl-person-organizatie"
              className={inputClass}
              value={draft.organizatie}
              onChange={(e) => setField({ organizatie: e.target.value })}
              placeholder="ex. Crestem.ONG"
            />
          </div>

          <div>
            <label htmlFor="pl-person-descriere" className={labelClass}>
              Descriere
            </label>
            <textarea
              id="pl-person-descriere"
              rows={3}
              className={inputClass}
              value={draft.descriere}
              onChange={(e) => setField({ descriere: e.target.value })}
              placeholder="Scurtă descriere a persoanei..."
            />
          </div>

          <div>
            <span className={labelClass}>Taguri</span>
            <TagInput
              value={draft.taguri}
              onChange={(taguri) => setField({ taguri })}
            />
          </div>

          <button
            type="button"
            onClick={saveDraft}
            disabled={!canSave}
            className="rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Salvează persoana
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#475569]">
          Persoane
        </span>
        <span className="text-xs text-[#94a3b8]">{value.length} adăugate</span>
      </div>

      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-[#94a3b8]">
          Nicio persoană adăugată încă.
        </p>
      ) : (
        <ul className="space-y-2">
          {value.map((person, index) => (
            <li
              key={index}
              className="flex items-center gap-2 rounded-xl border border-border bg-slate-50/60 p-2 pl-3"
            >
              <button
                type="button"
                onClick={() => openExisting(index)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#eff6ff] text-[#2563eb]">
                  {person.imagine ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={getMediaUrl(person.imagine.url)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={16} />
                  )}
                </span>
                <span className="truncate text-sm font-semibold text-[#162040]">
                  {person.nume || "fără nume"}
                </span>
              </button>
              <span className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Mută mai sus"
                  className="rounded-lg p-1.5 text-[#475569] transition-colors hover:bg-slate-200 disabled:opacity-40"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  aria-label="Mută mai jos"
                  className="rounded-lg p-1.5 text-[#475569] transition-colors hover:bg-slate-200 disabled:opacity-40"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label="Elimină persoana"
                  className="rounded-lg p-1.5 text-[#ef4444] transition-colors hover:bg-[#fef2f2]"
                >
                  <Trash2 size={16} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-1 text-xs text-[#ef4444]">{error}</p>}

      <button
        type="button"
        onClick={openNew}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-semibold text-[#475569] transition-colors hover:border-[#2dbe8f] hover:text-[#162040]"
      >
        <Plus size={16} /> Adaugă persoană
      </button>
    </div>
  );
}
