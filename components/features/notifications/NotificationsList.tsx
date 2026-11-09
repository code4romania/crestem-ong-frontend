"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import {
  fetchNotificationsPageAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/api/notifications-actions";
import type { NotificationView, NotificationsPage } from "@/lib/api/notifications";
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { DashboardEmptyState } from "@/components/features/dashboard/DashboardEmptyState";
import { groupNotificationsByDay } from "./notification-time";
import { emitNotificationsChanged } from "./notifications-changed";
import { NotificationRow } from "./NotificationRow";

/** Relative labels ("acum 5 minute") are re-read this often while the page stays open. */
const CLOCK_TICK_MS = 60_000;

function unreadSubtitle(count: number): string {
  if (count === 0) return "Nu ai notificări necitite.";
  if (count === 1) return "Ai o notificare necitită.";
  return `Ai ${count} notificări necitite.`;
}

/**
 * Appends a page, dropping notifications already on screen. Pages are cut by
 * offset and the list is newest first, so a notification arriving between two
 * requests pushes the previous last row onto the next page.
 */
function mergeById(current: NotificationView[], incoming: NotificationView[]) {
  const seen = new Set(current.map((item) => item.documentId));
  return [...current, ...incoming.filter((item) => !seen.has(item.documentId))];
}

export function NotificationsList({
  initialPage,
  initialUnreadCount,
  initialNow,
}: {
  initialPage: NotificationsPage;
  initialUnreadCount: number;
  /** Server clock (ms), so the first client render matches the server HTML. */
  initialNow: number;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialPage.data);
  const [nextStart, setNextStart] = useState(
    initialPage.meta.start + initialPage.data.length,
  );
  const [hasMore, setHasMore] = useState(initialPage.meta.hasMore);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [now, setNow] = useState(initialNow);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const markingRef = useRef(new Set<string>());
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);
    setLoadError(null);
    const result = await fetchNotificationsPageAction(nextStart);
    if (result.ok) {
      setItems((current) => mergeById(current, result.page.data));
      setNextStart(result.page.meta.start + result.page.data.length);
      setHasMore(result.page.meta.hasMore);
    } else {
      setLoadError("Nu am putut încărca mai multe notificări. Încearcă din nou.");
    }
    loadingRef.current = false;
    setLoadingMore(false);
  }, [nextStart]);

  // The next page arrives when the bottom of the list scrolls into view.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loadingMore || loadError) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) void loadMore();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadError, loadMore]);

  async function markRead(notification: NotificationView) {
    const { documentId } = notification;
    // A double click must not send (or count) the read twice.
    if (markingRef.current.has(documentId)) return;
    markingRef.current.add(documentId);
    let result: Awaited<ReturnType<typeof markNotificationReadAction>>;
    try {
      result = await markNotificationReadAction(documentId);
    } finally {
      markingRef.current.delete(documentId);
    }
    if (!result.notification) {
      setActionError(result.error ?? "Notificarea nu a putut fi marcată ca citită.");
      return;
    }
    const { readAt } = result.notification;
    setActionError(null);
    // Count down only on a real unread -> read transition (a "mark all" may have won).
    const wasUnread = itemsRef.current.some(
      (item) => item.documentId === documentId && item.readAt === null,
    );
    setItems((current) =>
      current.map((item) =>
        item.documentId === documentId && item.readAt === null
          ? { ...item, readAt }
          : item,
      ),
    );
    if (wasUnread) {
      setUnreadCount((count) => Math.max(0, count - 1));
    }
    emitNotificationsChanged();
  }

  async function handleOpen(notification: NotificationView, event: React.MouseEvent) {
    const unread = notification.readAt === null;
    const modified =
      event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

    // "Open in a new tab": the browser opens the link, we only record the read.
    if (modified && notification.link) {
      if (unread) void markRead(notification);
      return;
    }

    event.preventDefault();
    if (unread) await markRead(notification);
    if (notification.link) router.push(notification.link);
  }

  async function handleMarkAll() {
    setMarkingAll(true);
    setActionError(null);
    const result = await markAllNotificationsReadAction();
    setMarkingAll(false);
    if (result.error) {
      setActionError(result.error);
      return;
    }
    const readAt = new Date().toISOString();
    setItems((current) =>
      current.map((item) => (item.readAt === null ? { ...item, readAt } : item)),
    );
    setUnreadCount(0);
    emitNotificationsChanged();
  }

  const clock = new Date(now);
  const groups = groupNotificationsByDay(items, clock);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-x-4">
        <DashboardHeader title="Notificări" subtitle={unreadSubtitle(unreadCount)} />
        <button
          type="button"
          onClick={handleMarkAll}
          disabled={unreadCount === 0 || markingAll}
          className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-[#334155] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1c81]/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
        >
          <CheckCheck size={16} aria-hidden />
          Marchează-le pe toate citite
        </button>
      </div>

      {actionError && (
        <p className="mb-4 text-sm text-[#b91c1c]" role="alert">
          {actionError}
        </p>
      )}

      {items.length === 0 ? (
        <DashboardEmptyState
          icon={Bell}
          title="Nu ai nicio notificare încă."
          description="Vei vedea aici activitatea relevantă pentru contul tău."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
          {groups.map((group) => (
            <section
              key={group.group}
              aria-label={group.label}
              className="border-t border-[#e2e8f0] first:border-t-0"
            >
              <h2 className="border-b border-[#e2e8f0] bg-[#f8fafc] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#5b6779] sm:px-5">
                {group.label}
              </h2>
              <ul className="divide-y divide-[#e2e8f0]">
                {group.items.map((notification) => (
                  <NotificationRow
                    key={notification.documentId}
                    notification={notification}
                    now={clock}
                    onOpen={handleOpen}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {loadingMore && (
        <p
          className="mt-4 text-center text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          Se încarcă mai multe notificări…
        </p>
      )}

      {loadError && (
        <div className="mt-4 flex flex-col items-center gap-3">
          <p className="text-sm text-[#b91c1c]">
            {loadError}
          </p>
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Încearcă din nou
          </button>
        </div>
      )}

      {hasMore && !loadError && <div ref={sentinelRef} className="h-px" aria-hidden />}

      {!hasMore && items.length > 0 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Ai văzut toate notificările.
        </p>
      )}
    </div>
  );
}
