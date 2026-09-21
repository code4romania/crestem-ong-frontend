"use client";

import { toast } from "sonner";
import { useState, useTransition } from "react";
import { ChevronDown, Loader2, X } from "lucide-react";
import { createMentorMeetingAction, updateMentorMeetingAction } from "@/lib/api/meetings-actions";
import type { Dimension } from "@/lib/api/dimensions";
import type { MentorOng, OngMeeting } from "@/lib/api/meetings";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors bg-white text-sm";

const selectClass = `${inputClass} appearance-none pr-10`;

const toggleBase = "py-3 rounded-xl text-sm font-semibold transition-colors border";

function toDateInputValue(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toTimeInputValue(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

interface MentorMeetingFormModalProps {
  open: boolean;
  onClose: () => void;
  ongs: MentorOng[];
  dimensions: Dimension[];
  meeting?: OngMeeting;
}

/**
 * Keyed on the meeting being edited (or "create") so each open gets a fresh
 * `MentorMeetingFormModalInner` instance with state initialized straight from
 * props — avoids syncing form state via a `useEffect`.
 */
export function MentorMeetingFormModal(props: MentorMeetingFormModalProps) {
  if (!props.open) return null;
  return <MentorMeetingFormModalInner key={props.meeting?.documentId ?? "create"} {...props} />;
}

function MentorMeetingFormModalInner({
  onClose,
  ongs,
  dimensions,
  meeting,
}: MentorMeetingFormModalProps) {
  const isEdit = Boolean(meeting);

  const [ong, setOng] = useState(meeting?.ong?.documentId ?? "");
  const [program, setProgram] = useState(meeting?.program?.documentId ?? "");
  const [subiect, setSubiect] = useState(meeting?.subiect ?? "");
  const [data, setData] = useState(meeting ? toDateInputValue(meeting.dataOra) : "");
  const [ora, setOra] = useState(meeting ? toTimeInputValue(meeting.dataOra) : "");
  const [format, setFormat] = useState<"online" | "fata_in_fata">(meeting?.format ?? "online");
  const [linkIntalnire, setLinkIntalnire] = useState(meeting?.linkIntalnire ?? "");
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>(meeting?.dimensiuni ?? []);
  const [comentarii, setComentarii] = useState(meeting?.comentarii ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedOng = ongs.find((o) => o.documentId === ong);
  const availablePrograms = selectedOng?.programs ?? [];

  const canSubmit = ong.trim() !== "" && subiect.trim() !== "" && data !== "" && ora !== "";

  const toggleDimension = (key: string) => {
    setSelectedDimensions((current) =>
      current.includes(key) ? current.filter((value) => value !== key) : [...current, key],
    );
  };

  const handleOngChange = (value: string) => {
    setOng(value);
    const nextOng = ongs.find((o) => o.documentId === value);
    if (!nextOng?.programs.some((p) => p.documentId === program)) {
      setProgram("");
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    setError(null);
    startTransition(async () => {
      const dataOra = new Date(`${data}T${ora}`).toISOString();
      const input = {
        subiect: subiect.trim(),
        dataOra,
        format,
        linkIntalnire: linkIntalnire.trim() || undefined,
        ong,
        program: program || undefined,
        dimensiuni: selectedDimensions,
        comentarii: comentarii.trim() || undefined,
      };
      const result = meeting
        ? await updateMentorMeetingAction(meeting.documentId, input)
        : await createMentorMeetingAction(input);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success(meeting ? "Întâlnirea a fost actualizată." : "Întâlnirea a fost creată.");
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mentor-meeting-form-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <h2 id="mentor-meeting-form-title" className="font-heading font-extrabold text-lg" style={{ color: "#162040" }}>
            {isEdit ? "Editează întâlnire" : "Adaugă întâlnire"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Închide"
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          {error && (
            <p role="alert" className="rounded-lg px-3 py-2 text-sm bg-[#fff5f5] border-[1.5px] border-[#fca5a5] text-[#ef4444]">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="mentor-meeting-ong" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              ONG <span style={{ color: "#ef4444" }}>*</span>
            </label>
            {isEdit ? (
              <p className={inputClass} style={{ color: "#162040" }}>
                {selectedOng?.name ?? "—"}
              </p>
            ) : (
              <div className="relative">
                <select
                  id="mentor-meeting-ong"
                  className={selectClass}
                  value={ong}
                  onChange={(e) => handleOngChange(e.target.value)}
                >
                  <option value="">Selectează organizația...</option>
                  {ongs.map((o) => (
                    <option key={o.documentId} value={o.documentId}>
                      {o.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="mentor-meeting-program" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Program
            </label>
            <div className="relative">
              <select
                id="mentor-meeting-program"
                className={selectClass}
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                disabled={!ong}
              >
                <option value="">Selectează programul...</option>
                {availablePrograms.map((p) => (
                  <option key={p.documentId} value={p.documentId}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            </div>
          </div>

          <div>
            <label htmlFor="mentor-meeting-subiect" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Subiect întâlnire <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              id="mentor-meeting-subiect"
              type="text"
              className={inputClass}
              value={subiect}
              onChange={(e) => setSubiect(e.target.value)}
              placeholder="ex. Sesiune de feedback"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="mentor-meeting-data" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
                Data <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                id="mentor-meeting-data"
                type="date"
                className={inputClass}
                style={{ color: "#162040" }}
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="mentor-meeting-ora" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
                Ora <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                id="mentor-meeting-ora"
                type="time"
                className={inputClass}
                style={{ color: "#162040" }}
                value={ora}
                onChange={(e) => setOra(e.target.value)}
              />
            </div>
          </div>

          <div>
            <p className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Format
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("online")}
                className={toggleBase}
                style={
                  format === "online"
                    ? { background: "#162040", color: "#fff", borderColor: "transparent" }
                    : { color: "#475569", borderColor: "var(--border)" }
                }
              >
                Online
              </button>
              <button
                type="button"
                onClick={() => setFormat("fata_in_fata")}
                className={toggleBase}
                style={
                  format === "fata_in_fata"
                    ? { background: "#162040", color: "#fff", borderColor: "transparent" }
                    : { color: "#475569", borderColor: "var(--border)" }
                }
              >
                Față în față
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="mentor-meeting-link" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Detalii
            </label>
            <input
              id="mentor-meeting-link"
              type="text"
              className={inputClass}
              value={linkIntalnire}
              onChange={(e) => setLinkIntalnire(e.target.value)}
              placeholder="Link pentru întâlnire sau adresa fizică"
            />
          </div>

          <div>
            <p className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Dimensiuni matrice
            </p>
            <div className="flex flex-wrap gap-2">
              {dimensions.map((dimension) => {
                const selected = selectedDimensions.includes(dimension.key);
                return (
                  <button
                    key={dimension.key}
                    type="button"
                    onClick={() => toggleDimension(dimension.key)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium border transition-colors"
                    style={
                      selected
                        ? { background: "#f0faf6", color: "#162040", borderColor: "#2dbe8f" }
                        : { background: "#fff", color: "#64748b", borderColor: "var(--border)" }
                    }
                  >
                    {dimension.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="mentor-meeting-comentarii" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Comentarii adiționale
            </label>
            <textarea
              id="mentor-meeting-comentarii"
              className={inputClass}
              rows={3}
              value={comentarii}
              onChange={(e) => setComentarii(e.target.value)}
              placeholder="Note, context sau observații pentru această întâlnire..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-50"
            style={{ color: "#475569" }}
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: "#162040" }}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isPending ? "Se salvează..." : isEdit ? "Salvează modificările" : "Adaugă întâlnirea"}
          </button>
        </div>
      </div>
    </div>
  );
}
