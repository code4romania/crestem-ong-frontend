"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { RichTextField } from "@/components/features/page-builder/rich-text/RichTextField";
import { getMediaUrl } from "@/lib/api/client";
import { uploadPageImageAction } from "@/lib/api/page-blocks-actions";
import { updateFooterAction } from "@/lib/api/footer-actions";
import { SOCIAL_LABEL, type FooterContent, type SocialLink } from "@/lib/api/footer-types";
import { SocialLinksField, type EditableSocial } from "./SocialLinksField";

const inputClass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-[#2dbe8f] focus:outline-none";

const newId = () => Math.random().toString(36).slice(2, 11);

/**
 * Completes an address typed without a scheme — `facebook.com/crestem` becomes
 * `https://facebook.com/crestem`. A site path is left alone so the caller can
 * refuse it: a social profile lives on another host. Mirrors the backend rule.
 */
const withScheme = (url: string) =>
  !url || url.startsWith("/") || /^https?:\/\//i.test(url) ? url : `https://${url}`;

/**
 * The footer's left side, edited alongside the footer menu because they render
 * as one strip: this panel is the left column, the menu tree below is the
 * columns on the right.
 *
 * Unlike a menu item — where "Adaugă" is itself the commit — these fields are
 * one document, so they save together on "Salvează".
 */
export function FooterContentPanel({ footer }: { footer: FooterContent }) {
  const [description, setDescription] = useState(footer.description);
  const [copyright, setCopyright] = useState(footer.copyright);
  const [socials, setSocials] = useState<EditableSocial[]>(() =>
    footer.socials.map((social) => ({
      id: newId(),
      platform: social.platform,
      label: social.label ?? "",
      url: social.url,
    })),
  );

  const [pending, startTransition] = useTransition();

  /**
   * Images inserted in the description go through the same upload endpoint the
   * page builder uses; the editor stores the returned URL in the HTML.
   */
  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("files", file);
    const result = await uploadPageImageAction(formData);

    if (result.error || !result.image) {
      toast.error(result.error ?? "Nu am putut încărca imaginea.");
      return null;
    }
    return getMediaUrl(result.image.url);
  };

  const collectSocials = (): SocialLink[] | null => {
    const collected: SocialLink[] = [];

    for (const social of socials) {
      const label = social.label.trim();
      const url = withScheme(social.url.trim());
      const name = social.platform === "other" ? label : SOCIAL_LABEL[social.platform];

      // A row added and left untouched is dropped rather than blocking the save.
      if (!url && !label) continue;

      if (social.platform === "other" && !label) {
        toast.error("Dă un nume fiecărei rețele adăugate manual.");
        return null;
      }
      if (!url) {
        toast.error(`Adaugă adresa pentru ${name}.`);
        return null;
      }
      if (url.startsWith("/")) {
        toast.error(`Adresa pentru ${name} trebuie să fie una externă, nu o cale din site.`);
        return null;
      }

      collected.push(
        social.platform === "other"
          ? { platform: "other", label, url }
          : { platform: social.platform, url },
      );
    }

    return collected;
  };

  const save = () => {
    const collected = collectSocials();
    if (!collected) return;

    startTransition(async () => {
      const result = await updateFooterAction({
        description,
        copyright: copyright.trim(),
        socials: collected,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      // Show what was actually stored, so a completed address stops looking
      // like the half-written one the editor typed.
      setSocials((current) =>
        current.map((social) => ({ ...social, url: withScheme(social.url.trim()) })),
      );
      toast.success("Footerul a fost salvat.");
    });
  };

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-border bg-white">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-heading text-[1.0625rem] font-bold text-[#162040]">
          Conținutul footerului
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Partea stângă a footerului. Coloanele din dreapta vin din meniul de mai jos.
        </p>
      </div>

      <div className="space-y-5 px-5 py-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#475569]">Descriere</label>
          <RichTextField
            value={description}
            onChange={setDescription}
            allowImages
            onUploadImage={uploadImage}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Poți insera imagini direct în text, inclusiv un logo.
          </p>
        </div>

        <SocialLinksField value={socials} onChange={setSocials} />

        <div>
          <label
            htmlFor="footer-copyright"
            className="mb-1.5 block text-xs font-semibold text-[#475569]"
          >
            Text copyright
          </label>
          <input
            id="footer-copyright"
            value={copyright}
            onChange={(event) => setCopyright(event.target.value)}
            placeholder="© 2026 Crestem. Toate drepturile rezervate."
            className={inputClass}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="rounded-xl bg-[#2dbe8f] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Se salvează…" : "Salvează"}
          </button>
        </div>
      </div>
    </div>
  );
}
