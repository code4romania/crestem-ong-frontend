import { ExternalLink } from "lucide-react";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { socialName } from "@/lib/api/footer-types";
import { ContactForm } from "./ContactForm";
import { CONTACT_ICONS } from "./icons";
import { mapEmbedUrl, mapLinkUrl } from "./map-url";
import type { ContactData } from "./schema";

export function Contact({ data }: { data: ContactData }) {
  const embed = data.mapEnabled ? mapEmbedUrl(data.mapAddress) : "";
  const link = data.mapEnabled ? mapLinkUrl(data.mapAddress) : "";
  const hasLeftColumn =
    data.infoItems.length > 0 || data.socials.length > 0 || Boolean(embed);

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-12">
      <div
        className={
          hasLeftColumn
            ? "grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr]"
            : "grid gap-10"
        }
      >
        {hasLeftColumn && (
          <div>
            {data.infoTitle && (
              <h2 className="font-heading text-2xl font-extrabold text-[#1c1c81]">
                {data.infoTitle}
              </h2>
            )}

            {data.infoItems.length > 0 && (
              <ul className="mt-6 space-y-5">
                {data.infoItems.map((item, index) => {
                  const Icon = CONTACT_ICONS[item.icon];
                  return (
                    <li key={index} className="flex items-start gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eafaf4] text-[#007d58]">
                        <Icon size={18} />
                      </span>
                      <span>
                        {item.label && (
                          <span className="block text-xs font-bold tracking-wide text-muted-foreground">
                            {item.label}
                          </span>
                        )}
                        <span className="block text-sm font-semibold text-[#1c1c81]">
                          {item.value}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {data.socials.length > 0 && (
              <div className="mt-8">
                {data.socialTitle && (
                  <h3 className="text-xs font-bold tracking-wide text-muted-foreground">
                    {data.socialTitle}
                  </h3>
                )}
                <ul className="mt-3 flex flex-wrap gap-3">
                  {data.socials.map((social, index) => (
                    <li key={index}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#1c1c81] hover:border-slate-300"
                      >
                        <SocialIcon platform={social.platform} />
                        {/* `socialName` cade pe eticheta implicită doar pentru
                            `null`/`undefined`, iar schema dă `""` — fără
                            normalizarea asta, o rețea `other` fără nume s-ar
                            randa cu text gol. */}
                        {socialName({ ...social, label: social.label || undefined })}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {embed && (
              <div className="mt-8">
                {data.mapTitle && (
                  <h3 className="text-xs font-bold tracking-wide text-muted-foreground">
                    {data.mapTitle}
                  </h3>
                )}
                <div className="relative mt-3 overflow-hidden rounded-xl border border-slate-200">
                  <iframe
                    src={embed}
                    title={data.mapAddress}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-56 w-full border-0"
                  />
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-[#1c1c81] shadow-sm"
                  >
                    Deschide în Maps
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        <ContactForm
          title={data.formTitle}
          subjects={data.subjects}
          privacyUrl={data.privacyUrl}
        />
      </div>
    </section>
  );
}
