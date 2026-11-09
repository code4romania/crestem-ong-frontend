import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { NotificationView } from "@/lib/api/notifications";
import {
  FALLBACK_APPEARANCE,
  NOTIFICATION_APPEARANCE,
} from "./notification-appearance";
import { formatNotificationTime } from "./notification-time";

const ROW_CLASS =
  "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#eeeefb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1c1c81]/40 sm:gap-4 sm:px-5";

export function NotificationRow({
  notification,
  now,
  onOpen,
}: {
  notification: NotificationView;
  now: Date;
  /** Marks the notification read, then navigates; see `NotificationsList`. */
  onOpen: (notification: NotificationView, event: React.MouseEvent) => void;
}) {
  const { icon: Icon, tile } =
    NOTIFICATION_APPEARANCE[notification.type] ?? FALLBACK_APPEARANCE;
  const unread = notification.readAt === null;

  const content = (
    <>
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border ${tile}`}
        aria-hidden
      >
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm ${
            unread ? "font-bold text-[#1c1c81]" : "font-medium text-[#334155]"
          }`}
        >
          {notification.title}
        </span>
        <span className="mt-0.5 block text-sm text-[#475569]">{notification.body}</span>
        <span className="mt-1 block text-xs text-[#5b6779]">
          {formatNotificationTime(notification.createdAt, now)}
        </span>
      </span>
      {unread && (
        <>
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#1c1c81]" aria-hidden />
          <span className="sr-only">Necitită</span>
        </>
      )}
      <ChevronRight size={16} className="hidden shrink-0 text-[#94a3b8] sm:block" aria-hidden />
    </>
  );

  const className = `${ROW_CLASS} ${unread ? "bg-[#f5f5fd]" : "bg-white"}`;

  return (
    <li>
      {notification.link ? (
        <Link
          href={notification.link}
          onClick={(event) => onOpen(notification, event)}
          className={className}
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          onClick={(event) => onOpen(notification, event)}
          className={className}
        >
          {content}
        </button>
      )}
    </li>
  );
}
