"use client";

import { ChevronDown } from "lucide-react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ArticlePicker } from "./ArticlePicker";
import { ARTICLE_CATEGORIES, type ArticleCategory } from "./schema";
import { CATEGORY_META } from "./catalog";
import type { BlockFieldErrors } from "../../types";
import type { ArticleGridData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors disabled:opacity-60";
const selectClass = `${inputClass} appearance-none pr-10`;
const errorClass = "mt-1 text-xs text-[#ef4444]";

export function ArticleGridEditor({
  value,
  onChange,
  errors,
}: {
  value: ArticleGridData;
  onChange: (next: ArticleGridData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<ArticleGridData>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="ag-titlu" className={labelClass}>
          Titlu <span className="text-[#ef4444]">*</span>
        </label>
        <input
          id="ag-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="ex. Articole recente"
          aria-invalid={Boolean(errors.titlu)}
        />
        {errors.titlu && <p className={errorClass}>{errors.titlu}</p>}
      </div>

      <div>
        <span className={labelClass}>Sursa articolelor</span>
        <SegmentedControl
          ariaLabel="Sursa articolelor"
          value={value.sursa}
          onChange={(sursa) => set({ sursa })}
          options={[
            { value: "manuala", label: "Selectare manuală" },
            { value: "recente", label: "Cele mai recente" },
          ]}
        />
      </div>

      {value.sursa === "manuala" ? (
        <ArticlePicker
          value={value.articoleSelectate}
          onChange={(articoleSelectate) => set({ articoleSelectate })}
          error={errors.articoleSelectate}
        />
      ) : (
        <>
          <div>
            <span className={labelClass}>Număr articole</span>
            <SegmentedControl
              ariaLabel="Număr articole"
              value={value.numarArticole}
              onChange={(numarArticole) => set({ numarArticole })}
              options={[
                { value: "3", label: "3" },
                { value: "6", label: "6" },
                { value: "9", label: "9" },
                { value: "12", label: "12" },
              ]}
            />
          </div>

          <div>
            <label htmlFor="ag-categorie" className={labelClass}>
              Filtrează după categorie{" "}
              <span className="font-normal normal-case tracking-normal text-[#94a3b8]">
                (opțional)
              </span>
            </label>
            <div className="relative">
              <select
                id="ag-categorie"
                className={selectClass}
                value={value.categorie ?? ""}
                onChange={(e) =>
                  set({
                    categorie: e.target.value
                      ? (e.target.value as ArticleCategory)
                      : null,
                  })
                }
              >
                <option value="">Toate categoriile</option>
                {ARTICLE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_META[category].label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            </div>
          </div>
        </>
      )}

      <div>
        <span className={labelClass}>Layout</span>
        <SegmentedControl
          ariaLabel="Layout"
          value={value.coloane}
          onChange={(coloane) => set({ coloane })}
          options={[
            { value: "1", label: "1 col." },
            { value: "2", label: "2 col." },
            { value: "3", label: "3 col." },
            { value: "4", label: "4 col." },
          ]}
        />
      </div>
    </div>
  );
}
