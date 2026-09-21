"use client";

import { toast } from "sonner";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { ChangeEvent, DragEvent, MouseEvent } from "react";
import { ChevronDown, Loader2, Upload, X } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { listDomains, type Domain, type MyOng } from "@/lib/api/ongs";
import { updateMyOngAction, uploadFileAction } from "@/lib/api/ongs-actions";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

const ACCEPTED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors bg-white text-sm";

const selectClass = `${inputClass} appearance-none pr-10`;

export function EditOngNivel2Modal({ ong, onClose }: { ong: MyOng; onClose: () => void }) {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [domeniuPrincipal, setDomeniuPrincipal] = useState(ong.domeniuPrincipal?.documentId ?? "");
  const [domeniuSecundar, setDomeniuSecundar] = useState(ong.domeniuSecundar?.documentId ?? "");
  const [website, setWebsite] = useState(ong.website ?? "");
  const [socialMedia, setSocialMedia] = useState(ong.socialMedia ?? "");
  const [descriere, setDescriere] = useState(ong.descriere ?? "");
  const [cuvinteCheie, setCuvinteCheie] = useState(ong.cuvinteCheie ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const logoObjectUrl = useMemo(() => (logoFile ? URL.createObjectURL(logoFile) : null), [logoFile]);
  const existingLogoUrl = !logoRemoved && ong.logo ? getMediaUrl(ong.logo.url) : null;
  const logoPreviewUrl = logoObjectUrl ?? existingLogoUrl;

  useEffect(() => {
    listDomains()
      .then((res) => setDomains(res.data))
      .catch(() => setDomains([]));
  }, []);

  useEffect(() => {
    return () => {
      if (logoObjectUrl) URL.revokeObjectURL(logoObjectUrl);
    };
  }, [logoObjectUrl]);

  const processLogoFile = (file: File | null) => {
    setLogoError(null);
    if (!file) {
      setLogoFile(null);
      return;
    }
    if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
      setLogoError("Format neacceptat. Folosește PNG, JPG, WebP sau SVG.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("Fișierul este prea mare. Dimensiunea maximă este 2MB.");
      return;
    }
    setLogoRemoved(false);
    setLogoFile(file);
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    processLogoFile(e.target.files?.[0] ?? null);
  };

  const handleLogoDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    processLogoFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleRemoveLogo = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setLogoError(null);
    if (logoFile) {
      setLogoFile(null);
    } else {
      setLogoRemoved(true);
    }
  };

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      let logoId: number | null | undefined;
      if (logoFile) {
        const form = new FormData();
        form.append("files", logoFile);
        const uploadResult = await uploadFileAction(form);
        if (uploadResult.error) {
          setError(uploadResult.error);
          return;
        }
        logoId = uploadResult.id;
      } else if (logoRemoved) {
        logoId = null;
      }

      const result = await updateMyOngAction({
        ...(logoId !== undefined ? { logo: logoId } : {}),
        ...(domeniuPrincipal ? { domeniuPrincipal } : {}),
        ...(domeniuSecundar ? { domeniuSecundar } : {}),
        ...(website ? { website } : {}),
        ...(socialMedia ? { socialMedia } : {}),
        ...(descriere ? { descriere } : {}),
        ...(cuvinteCheie ? { cuvinteCheie } : {}),
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Profilul organizației a fost actualizat.");
      onClose();
    });
  };

  return (
    <ModalOverlay labelledBy="edit-ong-nivel2-title">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <h2 id="edit-ong-nivel2-title" className="font-heading font-extrabold text-lg" style={{ color: "#162040" }}>
            Editează informații adiționale
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
            <p className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Logo
            </p>
            <div className="relative">
              <label
                htmlFor="ong-logo"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingLogo(true);
                }}
                onDragLeave={() => setIsDraggingLogo(false)}
                onDrop={handleLogoDrop}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-8 text-center cursor-pointer transition-colors ${
                  isDraggingLogo
                    ? "border-[#2dbe8f] bg-[#2dbe8f]/5"
                    : "border-border bg-slate-50 hover:bg-slate-100"
                }`}
              >
                {logoPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreviewUrl}
                    alt="Previzualizare logo"
                    className="h-16 w-16 rounded-lg object-cover border border-border"
                  />
                ) : (
                  <Upload size={20} className="text-muted-foreground" />
                )}
                <p className="text-sm font-medium" style={{ color: "#162040" }}>
                  {logoFile
                    ? logoFile.name
                    : logoPreviewUrl
                      ? "Click sau trage un fișier nou pentru a înlocui logo-ul"
                      : "Trage și plasează un fișier aici sau click pentru a încărca"}
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WebP sau SVG. Maxim 2MB.</p>
                <input
                  id="ong-logo"
                  type="file"
                  accept={ACCEPTED_LOGO_TYPES.join(",")}
                  onChange={handleLogoChange}
                  className="sr-only"
                />
              </label>
              {logoPreviewUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  aria-label="Elimină logo-ul"
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-border text-muted-foreground hover:text-[#ef4444] hover:border-[#fca5a5] transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {logoError && <p className="mt-1.5 text-xs" style={{ color: "#ef4444" }}>{logoError}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ong-domeniu-principal" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
                Domeniu principal
              </label>
              <div className="relative">
                <select
                  id="ong-domeniu-principal"
                  className={selectClass}
                  value={domeniuPrincipal}
                  onChange={(e) => setDomeniuPrincipal(e.target.value)}
                >
                  <option value="">Selectează</option>
                  {domains.map((d) => (
                    <option key={d.documentId} value={d.documentId}>
                      {d.name}
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
              <label htmlFor="ong-domeniu-secundar" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
                Domeniu secundar
              </label>
              <div className="relative">
                <select
                  id="ong-domeniu-secundar"
                  className={selectClass}
                  value={domeniuSecundar}
                  onChange={(e) => setDomeniuSecundar(e.target.value)}
                >
                  <option value="">Selectează</option>
                  {domains
                    .filter((d) => d.documentId !== domeniuPrincipal)
                    .map((d) => (
                      <option key={d.documentId} value={d.documentId}>
                        {d.name}
                      </option>
                    ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="ong-website" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Website
            </label>
            <input
              id="ong-website"
              type="text"
              className={inputClass}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="www.organizatia.ro"
            />
          </div>

          <div>
            <label htmlFor="ong-social-media" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Social media
            </label>
            <input
              id="ong-social-media"
              type="text"
              className={inputClass}
              value={socialMedia}
              onChange={(e) => setSocialMedia(e.target.value)}
              placeholder="facebook.com/organizatia"
            />
          </div>

          <div>
            <label htmlFor="ong-descriere" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Descrierea activității
            </label>
            <textarea
              id="ong-descriere"
              className={inputClass}
              rows={4}
              value={descriere}
              onChange={(e) => setDescriere(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="ong-cuvinte-cheie" className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Cuvinte cheie
            </label>
            <input
              id="ong-cuvinte-cheie"
              type="text"
              className={inputClass}
              value={cuvinteCheie}
              onChange={(e) => setCuvinteCheie(e.target.value)}
              placeholder="separate prin virgulă"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isPending} className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-50 text-[#475569]">
            Anulează
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-70"
            style={{ background: "#2dbe8f" }}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isPending ? "Se salvează..." : "Salvează"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
