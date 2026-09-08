"use client";

import { useState } from "react";
import { usePageOptions } from "./page-options";

/** Anything with a link on it: a CTA, or a card/category/programme entry. */
interface LinkTarget {
  href: string;
  pagina: string;
  subPagina: boolean;
}

const controlClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";

/**
 * Routes the app owns rather than the CMS. They have no page to point at, so
 * they are offered by address — otherwise every "Creează cont" button would
 * have to be typed by hand.
 */
const APP_ROUTES = [
  { href: "/autentificare", label: "Autentificare" },
  { href: "/inregistrare", label: "Înregistrare" },
];

/** Sentinel for the "type an address" entry; never stored. */
const CUSTOM = "__custom__";

/**
 * Where a button goes, in one control: a page of this site, a route the app
 * owns, or a typed address.
 *
 * Picking a page stores its documentId, so the link follows the page when it is
 * renamed or moved under a different parent — a typed path would go stale, and
 * a page has to exist before it can be linked. The text field appears only for
 * "Link extern", which is what external sites need.
 */
export function CtaTargetField<T extends LinkTarget>({
  value,
  onChange,
  ariaLabel,
  placeholder = "https://exemplu.ro",
}: {
  value: T;
  onChange: (next: T) => void;
  ariaLabel: string;
  placeholder?: string;
}) {
  const { pages, currentPageId, currentPath } = usePageOptions();
  const isAppRoute = APP_ROUTES.some((route) => route.href === value.href);
  const target = pages.find((page) => page.documentId === value.pagina) ?? null;

  // A typed address is the only choice the stored value cannot express on its
  // own: an empty href looks the same as "nothing picked yet".
  const [custom, setCustom] = useState(Boolean(value.href) && !isAppRoute && !value.pagina);

  const selected = value.pagina || (isAppRoute ? value.href : custom ? CUSTOM : "");

  // An external address has to be written in full: a bare `exemplu.ro` is read
  // by the browser as a path on this site, so the button would 404.
  const externalIncomplete =
    custom &&
    value.href.trim() !== "" &&
    !/^(https?:\/\/|mailto:|tel:)/i.test(value.href.trim());

  const pick = (next: string) => {
    if (next === CUSTOM) {
      setCustom(true);
      onChange({ ...value, pagina: "", subPagina: false });
      return;
    }

    setCustom(false);
    if (next.startsWith("/") || next === "") {
      onChange({ ...value, href: next, pagina: "", subPagina: false });
      return;
    }

    // A page picked fresh is offered as a subpage by default: linking to it
    // from here is usually what "it belongs under this page" means.
    const picked = pages.find((page) => page.documentId === next);
    const canAdopt = Boolean(picked && picked.documentId !== currentPageId && !picked.parinte);
    onChange({ ...value, href: "", pagina: next, subPagina: canAdopt });
  };

  return (
    <div className="space-y-2">
      <select
        className={controlClass}
        value={selected}
        onChange={(event) => pick(event.target.value)}
        aria-label={ariaLabel}
      >
        <option value="">Alege destinația…</option>
        {pages.length > 0 && (
          <optgroup label="Pagini din site">
            {pages.map((page) => (
              <option key={page.documentId} value={page.documentId}>
                {page.titlu} ({page.cale})
              </option>
            ))}
          </optgroup>
        )}
        <optgroup label="Aplicație">
          {APP_ROUTES.map((route) => (
            <option key={route.href} value={route.href}>
              {route.label} ({route.href})
            </option>
          ))}
        </optgroup>
        <optgroup label="Extern">
          <option value={CUSTOM}>Link extern</option>
        </optgroup>
      </select>

      {custom && (
        <input
          className={controlClass}
          value={value.href}
          onChange={(event) => onChange({ ...value, href: event.target.value, pagina: "" })}
          placeholder={placeholder}
          aria-label={`${ariaLabel}: adresă`}
        />
      )}

      {externalIncomplete && (
        <p className="text-xs text-[#ef4444]">
          Scrie linkul complet, cu <span className="font-medium">https://</span> la început.
        </p>
      )}

      {/* Only a top-level target can be adopted: a page already filed under
          another parent was put there on purpose, and saving this page must not
          move it. Its current address is shown instead. */}
      {target && target.documentId !== currentPageId && !target.parinte && (
        <label className="flex items-start gap-2 text-xs text-[#475569]">
          <input
            type="checkbox"
            checked={value.subPagina}
            onChange={(event) => onChange({ ...value, subPagina: event.target.checked })}
            className="mt-0.5"
          />
          <span>
            Pune pagina sub <span className="font-medium">{currentPath || "pagina curentă"}</span> —
            butonul va duce la{" "}
            <span className="font-medium">
              {value.subPagina ? `${currentPath}/${target.slug}` : target.cale}
            </span>
          </span>
        </label>
      )}

      {target && target.parinte && (
        <p className="text-xs text-muted-foreground">
          Pagina este deja sub <span className="font-medium">{target.cale}</span>.
        </p>
      )}
    </div>
  );
}
