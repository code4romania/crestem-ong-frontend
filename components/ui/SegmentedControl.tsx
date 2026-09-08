"use client";

/**
 * A small pill toggle: 2+ mutually exclusive options laid out side by side, the
 * selected one raised on a white background. Used by block config forms
 * (e.g. "Poziție imagine", "Aliniere verticală").
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  disabled = false,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex w-full gap-1 rounded-2xl border border-border bg-slate-100 p-1.5"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
              selected
                ? "border border-slate-200/80 bg-white text-[#162040] shadow-sm"
                : "text-[#475569] hover:text-[#162040]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
