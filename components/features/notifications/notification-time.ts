/**
 * Time labels and day grouping for the notifications list. Everything is read
 * in Europe/Bucharest, whatever the viewer's own timezone, so "today" means the
 * same thing as in the notification copy the backend writes. Pure: `now` is
 * always passed in.
 */

const TIME_ZONE = "Europe/Bucharest";

const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dateFormat = new Intl.DateTimeFormat("ro-RO", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const timeFormat = new Intl.DateTimeFormat("ro-RO", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export type NotificationDayGroup = "today" | "yesterday" | "earlier";

export const DAY_GROUP_LABELS: Record<NotificationDayGroup, string> = {
  today: "Astăzi",
  yesterday: "Ieri",
  earlier: "Mai devreme",
};

const DAY_GROUP_ORDER: NotificationDayGroup[] = ["today", "yesterday", "earlier"];

/** `YYYY-MM-DD` of the Bucharest calendar day containing `date`. */
function bucharestDayKey(date: Date): string {
  return dayKeyFormat.format(date);
}

/** The calendar day before `key`, done on the calendar so DST days stay correct. */
function previousDayKey(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day - 1)).toISOString().slice(0, 10);
}

export function notificationDayGroup(
  createdAt: string | Date,
  now: Date,
): NotificationDayGroup {
  const key = bucharestDayKey(new Date(createdAt));
  const today = bucharestDayKey(now);
  if (key === today) return "today";
  if (key === previousDayKey(today)) return "yesterday";
  return "earlier";
}

/** "20 de minute", "5 minute": Romanian puts "de" before a noun after 19. */
function counted(n: number, noun: string): string {
  const rest = n % 100;
  return rest === 0 || rest >= 20 ? `${n} de ${noun}` : `${n} ${noun}`;
}

export function formatNotificationTime(createdAt: string | Date, now: Date): string {
  const created = new Date(createdAt);
  const group = notificationDayGroup(created, now);
  const time = timeFormat.format(created);

  if (group === "yesterday") return `ieri, ${time}`;
  if (group === "earlier") return `${dateFormat.format(created)}, ${time}`;

  // Today. A timestamp slightly ahead of this clock reads as "just now".
  const minutes = Math.max(0, Math.floor((now.getTime() - created.getTime()) / 60_000));
  if (minutes < 1) return "chiar acum";
  if (minutes === 1) return "acum un minut";
  if (minutes < 60) return `acum ${counted(minutes, "minute")}`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "acum o oră";
  return `acum ${counted(hours, "ore")}`;
}

export interface NotificationGroup<T> {
  group: NotificationDayGroup;
  label: string;
  items: T[];
}

/** Buckets the items by Bucharest day, in display order, skipping empty groups. */
export function groupNotificationsByDay<T extends { createdAt: string }>(
  items: T[],
  now: Date,
): NotificationGroup<T>[] {
  const buckets: Record<NotificationDayGroup, T[]> = {
    today: [],
    yesterday: [],
    earlier: [],
  };
  for (const item of items) {
    buckets[notificationDayGroup(item.createdAt, now)].push(item);
  }
  return DAY_GROUP_ORDER.filter((group) => buckets[group].length > 0).map((group) => ({
    group,
    label: DAY_GROUP_LABELS[group],
    items: buckets[group],
  }));
}
