"use client";

import { toast } from "sonner";
import { useEffect, useState, useTransition } from "react";
import { ChevronDown, Loader2, X } from "lucide-react";
import { updateIndividualProfileAction } from "@/lib/api/users-actions";
import { listCities, listCounties } from "@/lib/api/geo";
import type { City, County } from "@/lib/api/geo";
import type { IndividualProfile } from "@/lib/api/individual-profile";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-colors bg-white text-sm";

const disabledInputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-sm cursor-not-allowed";

const selectClass = `${inputClass} appearance-none pr-10`;

export function EditIndividualProfileModal({
  profile,
  onClose,
}: {
  profile: IndividualProfile;
  onClose: () => void;
}) {
  const [nume, setNume] = useState(profile.nume ?? "");
  const [judet, setJudet] = useState(profile.judet?.documentId ?? "");
  const [localitate, setLocalitate] = useState(profile.localitate?.documentId ?? "");
  const [counties, setCounties] = useState<County[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCounties, setLoadingCounties] = useState(true);
  const [loadingCities, setLoadingCities] = useState(!!profile.judet);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    listCounties()
      .then((res) => setCounties(res.data))
      .catch(() => setError("Nu am putut încărca lista de județe."))
      .finally(() => setLoadingCounties(false));
  }, []);

  useEffect(() => {
    if (!judet) return;
    let active = true;
    listCities(judet)
      .then((res) => {
        if (active) setCities(res.data);
      })
      .catch(() => {
        if (active) setError("Nu am putut încărca lista de localități.");
      })
      .finally(() => {
        if (active) setLoadingCities(false);
      });
    return () => {
      active = false;
    };
  }, [judet]);

  const handleSubmit = () => {
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      try {
        const result = await updateIndividualProfileAction({
          nume,
          judet: judet || undefined,
          localitate: localitate || undefined,
        });
        if (result.error || Object.keys(result.fieldErrors ?? {}).length > 0) {
          setFieldErrors(result.fieldErrors ?? {});
          setError(result.error ?? null);
          return;
        }
        toast.success("Profilul a fost actualizat.");
        onClose();
      } catch {
        setError("A apărut o eroare neașteptată. Încearcă din nou.");
      }
    });
  };

  return (
    <ModalOverlay labelledBy="edit-individual-profile-title">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <h2
            id="edit-individual-profile-title"
            className="font-heading font-extrabold text-lg"
            style={{ color: "#162040" }}
          >
            Editează profilul
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Închide"
            className="text-muted-foreground hover:text-foreground"
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
            <label htmlFor="edit-individual-profile-nume" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Nume complet <span style={{ color: "#2563eb" }}>*</span>
            </label>
            <input
              id="edit-individual-profile-nume"
              type="text"
              className={inputClass}
              value={nume}
              onChange={(e) => setNume(e.target.value)}
              placeholder="ex. Ion Popescu"
            />
            {fieldErrors.nume && (
              <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>{fieldErrors.nume}</p>
            )}
          </div>

          <div>
            <label htmlFor="edit-individual-profile-email" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Adresă email
            </label>
            <input
              id="edit-individual-profile-email"
              type="email"
              value={profile.email}
              disabled
              className={disabledInputClass}
            />
            <p className="mt-1 text-xs text-muted-foreground">Adresa de email nu poate fi modificată aici.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-individual-profile-judet" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
                Județ
              </label>
              <div className="relative">
                <select
                  id="edit-individual-profile-judet"
                  className={selectClass}
                  disabled={loadingCounties}
                  value={judet}
                  onChange={(e) => {
                    setJudet(e.target.value);
                    setLocalitate("");
                    setCities([]);
                    setLoadingCities(!!e.target.value);
                  }}
                >
                  <option value="">{loadingCounties ? "Se încarcă județele..." : "Selectează județul"}</option>
                  {counties.map((c) => (
                    <option key={c.documentId} value={c.documentId}>
                      {c.nume}
                    </option>
                  ))}
                </select>
                {loadingCounties ? (
                  <Loader2
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin pointer-events-none"
                    style={{ color: "#94a3b8" }}
                  />
                ) : (
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "#94a3b8" }}
                  />
                )}
              </div>
              {fieldErrors.judet && (
                <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>{fieldErrors.judet}</p>
              )}
            </div>

            <div>
              <label htmlFor="edit-individual-profile-localitate" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
                Localitate
              </label>
              <div className="relative">
                <select
                  id="edit-individual-profile-localitate"
                  className={selectClass}
                  disabled={!judet || loadingCities}
                  value={localitate}
                  onChange={(e) => setLocalitate(e.target.value)}
                >
                  <option value="">
                    {!judet ? "Selectează județul mai întâi" : loadingCities ? "Se încarcă localitățile..." : "Selectează localitatea"}
                  </option>
                  {cities.map((c) => (
                    <option key={c.documentId} value={c.documentId}>
                      {c.nume}
                    </option>
                  ))}
                </select>
                {loadingCities ? (
                  <Loader2
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin pointer-events-none"
                    style={{ color: "#94a3b8" }}
                  />
                ) : (
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "#94a3b8" }}
                  />
                )}
              </div>
              {fieldErrors.localitate && (
                <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>{fieldErrors.localitate}</p>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isPending} className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-50 text-[#475569]">
            Anulează
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !nume.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-70"
            style={{ background: "#2563eb" }}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isPending ? "Se salvează..." : "Salvează"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
