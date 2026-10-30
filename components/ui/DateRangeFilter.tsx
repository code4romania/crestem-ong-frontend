"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { ro } from "react-day-picker/locale";
import { CalendarDays, X } from "lucide-react";
import "react-day-picker/style.css";

/** Both ends as `YYYY-MM-DD`, "" when unset. */
export interface DayRange {
  from: string;
  to: string;
}

export const EMPTY_DAY_RANGE: DayRange = { from: "", to: "" };

// The calendar works in local `Date`s; the filter travels as calendar days. Both
// directions go through the local date parts, never UTC, so a day never shifts.
function toDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function fromDay(day: string): Date | undefined {
  if (!day) return undefined;
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date);
}

function displayDay(day: string): string {
  const [year, month, date] = day.split("-");
  return `${date}.${month}.${year}`;
}

function rangeLabel({ from, to }: DayRange): string | null {
  if (!from) return null;
  if (!to || to === from) return displayDay(from);
  return `${displayDay(from)} – ${displayDay(to)}`;
}

const CALENDAR_STYLE = {
  "--rdp-accent-color": "#1c1c81",
  "--rdp-accent-background-color": "#e8e8fb",
  "--rdp-day-height": "38px",
  "--rdp-day-width": "38px",
  "--rdp-day_button-height": "36px",
  "--rdp-day_button-width": "36px",
} as CSSProperties;

/**
 * A pill that opens a calendar for picking a range of days, the way a booking
 * site does: the first click picks a day, the second one closes the range. The
 * range is held as a draft while the calendar is open and only handed to
 * `onChange` once it closes, so picking the two ends refetches once, not twice.
 */
export function DateRangeFilter({
  label,
  value,
  onChange,
  className = "w-full sm:w-auto",
}: {
  label: string;
  value: DayRange;
  onChange: (next: DayRange) => void;
  /** Sizes the pill; the button fills it. */
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();
  const containerRef = useRef<HTMLDivElement>(null);

  const openCalendar = () => {
    setDraft(
      value.from ? { from: fromDay(value.from), to: fromDay(value.to) } : undefined,
    );
    setOpen(true);
  };

  const close = useCallback(() => {
    setOpen(false);
    const next: DayRange = draft?.from
      ? { from: toDay(draft.from), to: toDay(draft.to ?? draft.from) }
      : EMPTY_DAY_RANGE;
    if (next.from !== value.from || next.to !== value.to) onChange(next);
  }, [draft, value, onChange]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, close]);

  const shown = rangeLabel(value);
  const today = new Date();

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => (open ? close() : openCalendar())}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`w-full inline-flex items-center gap-2 pl-4 py-2.5 rounded-full border border-border text-sm bg-white whitespace-nowrap ${
          shown ? "pr-9" : "pr-4"
        }`}
      >
        <CalendarDays size={14} className="text-slate-400 shrink-0" />
        <span className={`truncate ${shown ? "" : "text-slate-500"}`}>
          {shown ?? label}
        </span>
      </button>
      {shown && (
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onChange(EMPTY_DAY_RANGE);
          }}
          aria-label={`Șterge filtrul „${label}”`}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X size={14} />
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute right-0 z-30 mt-2 p-3 bg-white rounded-xl border border-border shadow-lg"
        >
          <DayPicker
            mode="range"
            locale={ro}
            selected={draft}
            onSelect={setDraft}
            defaultMonth={draft?.from ?? today}
            disabled={{ after: today }}
            endMonth={today}
            style={CALENDAR_STYLE}
          />
          <div className="mt-2 pt-3 border-t border-border flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setDraft(undefined)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-muted"
            >
              Resetează
            </button>
            <button
              type="button"
              onClick={close}
              className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: "#1c1c81" }}
            >
              Aplică
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
