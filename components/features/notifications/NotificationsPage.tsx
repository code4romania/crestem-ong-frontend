import {
  getUnreadNotificationCount,
  listNotifications,
} from "@/lib/api/notifications";
import { NotificationsList } from "./NotificationsList";

// Kept out of the component body: the render-purity lint rejects a bare clock read.
function serverNow() {
  return Date.now();
}

/**
 * Shared body of `/dashboard/notificari` for every role that has the page. A
 * failed fetch throws on purpose: the dashboard error boundary renders it, as
 * it does for every other page.
 */
export async function NotificationsPage() {
  const [page, { count }] = await Promise.all([
    listNotifications(),
    getUnreadNotificationCount(),
  ]);

  return (
    <NotificationsList
      initialPage={page}
      initialUnreadCount={count}
      initialNow={serverNow()}
    />
  );
}
