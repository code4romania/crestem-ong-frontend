"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { BlockFieldErrors } from "../../types";
import type { ArticleHeaderData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors disabled:opacity-60";
const errorClass = "mt-1 text-xs text-[#ef4444]";

export function ArticleHeaderEditor({
  value,
  onChange,
  errors,
}: {
  value: ArticleHeaderData;
  onChange: (next: ArticleHeaderData) => void;
  errors: BlockFieldErrors;
}) {
  const [draftEticheta, setDraftEticheta] = useState("");
  const set = (patch: Partial<ArticleHeaderData>) => onChange({ ...value, ...patch });

  /** Adds the typed tag unless it is blank or already in the list. */
  const addEticheta = () => {
    const tag = draftEticheta.trim();
    if (!tag || value.etichete.includes(tag)) {
      setDraftEticheta("");
      return;
    }
    set({ etichete: [...value.etichete, tag] });
    setDraftEticheta("");
  };

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="ah-titlu" className={labelClass}>
          Titlu <span className="text-[#ef4444]">*</span>
        </label>
        <input
          id="ah-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="ex. Template: Regulament de organizare internă"
          aria-invalid={Boolean(errors.titlu)}
        />
        {errors.titlu ? <p className={errorClass}>{errors.titlu}</p> : null}
      </div>

      <div>
        <label htmlFor="ah-eticheta" className={labelClass}>
          Etichetă principală
        </label>
        <input
          id="ah-eticheta"
          className={inputClass}
          value={value.eticheta}
          onChange={(e) => set({ eticheta: e.target.value })}
          placeholder="ex. Template"
        />
        <p className="mt-1 text-xs text-[#94a3b8]">Apare ca badge deasupra titlului.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ah-categorie" className={labelClass}>
            Categorie
          </label>
          <input
            id="ah-categorie"
            className={inputClass}
            value={value.categorie}
            onChange={(e) => set({ categorie: e.target.value })}
            placeholder="ex. Managementul ONG"
          />
        </div>
        <div>
          <label htmlFor="ah-data" className={labelClass}>
            Dată
          </label>
          <input
            id="ah-data"
            className={inputClass}
            value={value.data}
            onChange={(e) => set({ data: e.target.value })}
            placeholder="ex. 10 Ian 2024"
          />
        </div>
      </div>

      <div>
        <span className={labelClass}>Etichete</span>
        {value.etichete.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {value.etichete.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-[#475569]"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() =>
                    set({ etichete: value.etichete.filter((entry) => entry !== tag) })
                  }
                  aria-label={`Elimină eticheta ${tag}`}
                  className="text-[#94a3b8] transition-colors hover:text-[#dc2626]"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <input
          id="ah-etichete"
          className={inputClass}
          value={draftEticheta}
          onChange={(e) => setDraftEticheta(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== ",") return;
            // Enter would submit the drawer's form and a comma would just be
            // typed into the tag, so both are intercepted here.
            e.preventDefault();
            addEticheta();
          }}
          onBlur={addEticheta}
          placeholder="Adaugă o etichetă și apasă Enter"
          aria-label="Adaugă o etichetă"
        />
      </div>

      <div>
        <span className={labelClass}>Fundal</span>
        <SegmentedControl
          ariaLabel="Fundal"
          value={value.background}
          onChange={(background) => set({ background })}
          options={[
            { value: "default", label: "Alb" },
            { value: "light", label: "Deschis" },
            { value: "accent", label: "Închis" },
          ]}
        />
      </div>
    </div>
  );
}
