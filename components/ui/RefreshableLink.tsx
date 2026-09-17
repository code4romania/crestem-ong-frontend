"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition, type ComponentProps, type MouseEvent } from "react";
import { Loader2 } from "lucide-react";
import { samePageAction } from "./refreshable-link-target";
import { emitPageRefresh } from "./page-refresh-signal";

/**
 * A menu link that reloads the page when it points at the page already open.
 * Next would otherwise treat such a click as a no-op, so pressing "Bibliotecă"
 * while on the library did nothing at all.
 *
 * Query params (filters, paging) are cleared on the way, which is what visitors
 * expect from pressing the menu entry again. The current address is read from
 * `window.location` inside the handler rather than through `useSearchParams`,
 * so a navbar rendered in a layout does not drag every page into dynamic
 * rendering or need a Suspense boundary.
 */
export function RefreshableLink({
  href,
  onClick,
  children,
  spinnerSize = 14,
  ...rest
}: ComponentProps<typeof Link> & { spinnerSize?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    // Let the browser keep its own behaviour for "open in a new tab" clicks,
    // and leave object hrefs to Link — menu entries are plain strings.
    if (event.defaultPrevented || typeof href !== "string") return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const action = samePageAction(href, pathname, window.location.search);
    if (action === "navigate") return;

    event.preventDefault();

    // Remount the page subtree first, so the click reads like a navigation to
    // any other page: client state gone, enter animation replayed, content in
    // place while the fresh server payload is still on its way.
    emitPageRefresh();

    startTransition(() => {
      // `replace` drops the query without stacking a history entry; `refresh`
      // re-runs the server components either way, so a page with no query
      // params still gets fresh data.
      if (action === "reset-and-refresh") router.replace(href, { scroll: false });
      router.refresh();
    });
    // Instant, not smooth: this is a navigation, and navigations jump.
    window.scrollTo({ top: 0 });
  }

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
      {/* `LinkPendingIndicator` stays silent here: `useLinkStatus` only reports
          real navigations, and a same-page refresh is not one. */}
      {pending && (
        <>
          <Loader2 size={spinnerSize} className="shrink-0 animate-spin" aria-hidden />
          <span className="sr-only">Se încarcă…</span>
        </>
      )}
    </Link>
  );
}
