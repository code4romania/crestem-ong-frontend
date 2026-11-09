import { serverApiFetch } from "./server";

export const NOTIFICATION_TYPES = [
  "account-activated",
  "member-joined",
  "admin-transfer",
  "meeting-created",
  "meeting-updated",
  "meeting-cancelled",
  "phase-ended",
  "mentor-assigned",
  "ong-added-to-program",
  "ong-registered",
  "message-received",
  "phase-ending-soon",
  "phase-dates-changed",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** Title, body and link arrive precomputed from the backend; render them as given. */
export interface NotificationView {
  documentId: string;
  type: NotificationType;
  title: string;
  body: string;
  /** Role-relative `/dashboard/...` path; may be empty. */
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsPageMeta {
  start: number;
  limit: number;
  hasMore: boolean;
}

export interface NotificationsPage {
  data: NotificationView[];
  meta: NotificationsPageMeta;
}

export const NOTIFICATIONS_PAGE_SIZE = 20;

export function listNotifications(start = 0, limit = NOTIFICATIONS_PAGE_SIZE) {
  const query = new URLSearchParams({
    start: String(start),
    limit: String(limit),
  });
  return serverApiFetch<NotificationsPage>(`/api/notifications?${query}`);
}

export function getUnreadNotificationCount() {
  return serverApiFetch<{ count: number }>("/api/notifications/unread-count");
}
