"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";
import { SOCIAL_LABEL, SOCIAL_PLATFORMS } from "@/lib/api/footer-types";
import { IconPicker } from "./IconPicker";
import {
  EMPTY_INFO_ITEM,
  EMPTY_SOCIAL,
  type ContactData,
  type ContactInfoItem,
  type ContactSocial,
} from "./schema";
import type { BlockFieldErrors } from "../../types";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";
const sectionClass = "rounded-xl border border-border p-4 space-y-4";
const sectionTitleClass = "text-sm font-bold text-[#162040]";
const errorClass = "text-xs text-[#ef4444]";
const iconButtonClass =
  "rounded-lg border border-border p-1.5 text-[#475569] hover:border-slate-300 disabled:opacity-40";

/** Mută elementul de pe `index` cu o poziție în direcția `dir`, sau îl lasă pe loc la capăt. */
function moved<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function ContactEditor({
  value,
  onChange,
  errors,
}: {
  value: ContactData;
  onChange: (next: ContactData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<ContactData>) => onChange({ ...value, ...patch });

  const setSubject = (index: number, next: string) =>
    set({ subjects: value.subjects.map((s, i) => (i === index ? next : s)) });

  const setInfoItem = (index: number, patch: Partial<ContactInfoItem>) =>
    set({
      infoItems: value.infoItems.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    });

  const setSocial = (index: number, patch: Partial<ContactSocial>) =>
    set({
      socials: value.socials.map((social, i) =>
        i === index ? { ...social, ...patch } : social,
      ),
    });

  return (
    <div className="space-y-5">
      <div className={sectionClass}>
        <p className={sectionTitleClass}>Formular</p>

        <div>
          <label htmlFor="ct-form-title" className={labelClass}>
            Titlu formular
          </label>
          <input
            id="ct-form-title"
            className={inputClass}
            value={value.formTitle}
            onChange={(e) => set({ formTitle: e.target.value })}
            placeholder="ex. Trimite-ne un mesaj"
          />
        </div>

        <div>
          <span className={labelClass}>
            Subiecte <span className="text-[#ef4444]">*</span>
          </span>
          <div className="space-y-2">
            {value.subjects.map((subject, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  className={inputClass}
                  value={subject}
                  onChange={(e) => setSubject(index, e.target.value)}
                  placeholder="ex. Parteneriate"
                  aria-label={`Subiect ${index + 1}`}
                />
                <button
                  type="button"
                  className={iconButtonClass}
                  aria-label="Mută subiectul mai sus"
                  disabled={index === 0}
                  onClick={() => set({ subjects: moved(value.subjects, index, -1) })}
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  className={iconButtonClass}
                  aria-label="Mută subiectul mai jos"
                  disabled={index === value.subjects.length - 1}
                  onClick={() => set({ subjects: moved(value.subjects, index, 1) })}
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  type="button"
                  className={iconButtonClass}
                  aria-label="Șterge subiectul"
                  onClick={() =>
                    set({ subjects: value.subjects.filter((_, i) => i !== index) })
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => set({ subjects: [...value.subjects, ""] })}
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#2563eb] hover:underline"
          >
            <Plus size={16} /> Adaugă subiect
          </button>

          {value.subjects.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Fără niciun subiect, formularul nu poate fi trimis.
            </p>
          )}
          {errors.subjects && <p className={`mt-2 ${errorClass}`}>{errors.subjects}</p>}
        </div>

        <div>
          <label htmlFor="ct-privacy" className={labelClass}>
            Link politica de confidențialitate
          </label>
          <input
            id="ct-privacy"
            className={inputClass}
            value={value.privacyUrl}
            onChange={(e) => set({ privacyUrl: e.target.value })}
            placeholder="/politica-de-confidentialitate"
          />
        </div>
      </div>

      <div className={sectionClass}>
        <p className={sectionTitleClass}>Informații de contact</p>

        <div>
          <label htmlFor="ct-info-title" className={labelClass}>
            Titlu coloană
          </label>
          <input
            id="ct-info-title"
            className={inputClass}
            value={value.infoTitle}
            onChange={(e) => set({ infoTitle: e.target.value })}
            placeholder="ex. Informații de contact"
          />
        </div>

        <div className="space-y-3">
          {value.infoItems.map((item, index) => (
            <div key={index} className="rounded-xl border border-border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#475569]">
                  Rândul {index + 1}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={iconButtonClass}
                    aria-label="Mută rândul mai sus"
                    disabled={index === 0}
                    onClick={() => set({ infoItems: moved(value.infoItems, index, -1) })}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    className={iconButtonClass}
                    aria-label="Mută rândul mai jos"
                    disabled={index === value.infoItems.length - 1}
                    onClick={() => set({ infoItems: moved(value.infoItems, index, 1) })}
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    className={iconButtonClass}
                    aria-label="Șterge rândul"
                    onClick={() =>
                      set({ infoItems: value.infoItems.filter((_, i) => i !== index) })
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div>
                <span className={labelClass}>Iconiță</span>
                <IconPicker
                  value={item.icon}
                  onChange={(icon) => setInfoItem(index, { icon })}
                />
              </div>

              <div>
                <label htmlFor={`ct-info-label-${index}`} className={labelClass}>
                  Etichetă
                </label>
                <input
                  id={`ct-info-label-${index}`}
                  className={inputClass}
                  value={item.label}
                  onChange={(e) => setInfoItem(index, { label: e.target.value })}
                  placeholder="ex. ADRESĂ"
                />
              </div>

              <div>
                <label htmlFor={`ct-info-value-${index}`} className={labelClass}>
                  Valoare <span className="text-[#ef4444]">*</span>
                </label>
                <input
                  id={`ct-info-value-${index}`}
                  className={inputClass}
                  value={item.value}
                  onChange={(e) => setInfoItem(index, { value: e.target.value })}
                  placeholder="ex. Str. Academiei nr. 14, București"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => set({ infoItems: [...value.infoItems, { ...EMPTY_INFO_ITEM }] })}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563eb] hover:underline"
        >
          <Plus size={16} /> Adaugă rând
        </button>

        {errors.infoItems && <p className={errorClass}>{errors.infoItems}</p>}
      </div>

      <div className={sectionClass}>
        <p className={sectionTitleClass}>Social media</p>

        <div>
          <label htmlFor="ct-social-title" className={labelClass}>
            Titlu secțiune
          </label>
          <input
            id="ct-social-title"
            className={inputClass}
            value={value.socialTitle}
            onChange={(e) => set({ socialTitle: e.target.value })}
            placeholder="ex. SOCIAL MEDIA"
          />
        </div>

        <div className="space-y-3">
          {value.socials.map((social, index) => (
            <div key={index} className="rounded-xl border border-border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#475569]">
                  Rețeaua {index + 1}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={iconButtonClass}
                    aria-label="Mută rețeaua mai sus"
                    disabled={index === 0}
                    onClick={() => set({ socials: moved(value.socials, index, -1) })}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    className={iconButtonClass}
                    aria-label="Mută rețeaua mai jos"
                    disabled={index === value.socials.length - 1}
                    onClick={() => set({ socials: moved(value.socials, index, 1) })}
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    className={iconButtonClass}
                    aria-label="Șterge rețeaua"
                    onClick={() =>
                      set({ socials: value.socials.filter((_, i) => i !== index) })
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor={`ct-social-platform-${index}`} className={labelClass}>
                  Platformă
                </label>
                <select
                  id={`ct-social-platform-${index}`}
                  className={inputClass}
                  value={social.platform}
                  onChange={(e) =>
                    setSocial(index, {
                      platform: e.target.value as ContactSocial["platform"],
                    })
                  }
                >
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {SOCIAL_LABEL[platform]}
                    </option>
                  ))}
                </select>
              </div>

              {social.platform === "other" && (
                <div>
                  <label htmlFor={`ct-social-label-${index}`} className={labelClass}>
                    Numele rețelei
                  </label>
                  <input
                    id={`ct-social-label-${index}`}
                    className={inputClass}
                    value={social.label}
                    onChange={(e) => setSocial(index, { label: e.target.value })}
                    placeholder="ex. Threads"
                  />
                </div>
              )}

              <div>
                <label htmlFor={`ct-social-url-${index}`} className={labelClass}>
                  Link <span className="text-[#ef4444]">*</span>
                </label>
                <input
                  id={`ct-social-url-${index}`}
                  className={inputClass}
                  value={social.url}
                  onChange={(e) => setSocial(index, { url: e.target.value })}
                  placeholder="https://facebook.com/organizatia"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => set({ socials: [...value.socials, { ...EMPTY_SOCIAL }] })}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563eb] hover:underline"
        >
          <Plus size={16} /> Adaugă rețea
        </button>

        {errors.socials && <p className={errorClass}>{errors.socials}</p>}
      </div>

      <div className={sectionClass}>
        <p className={sectionTitleClass}>Hartă</p>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
          <span className="block text-sm font-semibold text-[#162040]">
            Afișează harta
          </span>
          <Toggle
            ariaLabel="Afișează harta"
            checked={value.mapEnabled}
            onChange={(mapEnabled) => set({ mapEnabled })}
          />
        </div>

        {value.mapEnabled && (
          <>
            <div>
              <label htmlFor="ct-map-title" className={labelClass}>
                Titlu secțiune
              </label>
              <input
                id="ct-map-title"
                className={inputClass}
                value={value.mapTitle}
                onChange={(e) => set({ mapTitle: e.target.value })}
                placeholder="ex. LOCAȚIE"
              />
            </div>

            <div>
              <label htmlFor="ct-map-address" className={labelClass}>
                Adresă <span className="text-[#ef4444]">*</span>
              </label>
              <input
                id="ct-map-address"
                className={inputClass}
                value={value.mapAddress}
                onChange={(e) => set({ mapAddress: e.target.value })}
                placeholder="Str. Academiei nr. 14, Sector 1, București"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Adresa completă, așa cum ai căuta-o în Google Maps.
              </p>
              {errors.mapAddress && <p className={`mt-1 ${errorClass}`}>{errors.mapAddress}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
