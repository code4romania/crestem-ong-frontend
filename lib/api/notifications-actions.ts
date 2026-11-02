"use server";

import { getApiErrorMessage } from "./client";
import { serverApiFetch } from "./server";
import {
  getUnreadNotificationCount,
  listNotifications,
  NOTIFICATIONS_PAGE_SIZE,
  type NotificationsPage,
  type NotificationView,
} from "./notifications";

export type FetchNotificationsResult =
  | { ok: true; page: NotificationsPage }
  | { ok: false; error: string };

/** The next page of the infinite list; the first one is rendered on the server. */
export async function fetchNotificationsPageAction(
  start: number,
): Promise<FetchNotificationsResult> {
  try {
    const page = await listNotifications(
      Math.max(0, Math.floor(start) || 0),
      NOTIFICATIONS_PAGE_SIZE,
    );
    return { ok: true, page };
  } catch (err) {
    return {
      ok: false,
      error: getApiErrorMessage(err, "Nu am putut încărca notificările."),
    };
  }
}

/**
 * The sidebar badge. `null` on any failure (including 403 for a role without
 * notifications): the badge then simply stays hidden.
 */
export async function getUnreadCountAction(): Promise<number | null> {
  try {
    const { count } = await getUnreadNotificationCount();
    return typeof count === "number" ? count : null;
  } catch {
    return null;
  }
}

export async function markNotificationReadAction(
  documentId: string,
): Promise<{ notification?: NotificationView; error?: string }> {
  try {
    const { data } = await serverApiFetch<{ data: NotificationView }>(
      `/api/notifications/${encodeURIComponent(documentId)}/read`,
      { method: "POST" },
    );
    return { notification: data };
  } catch (err) {
    return {
      error: getApiErrorMessage(err, "Notificarea nu a putut fi marcată ca citită."),
    };
  }
}

export async function markAllNotificationsReadAction(): Promise<{
  updated?: number;
  error?: string;
}> {
  try {
    const { updated } = await serverApiFetch<{ updated: number }>(
      "/api/notifications/read-all",
      { method: "POST" },
    );
    return { updated };
  } catch (err) {
    return {
      error: getApiErrorMessage(err, "Notificările nu au putut fi marcate ca citite."),
    };
  }
}
