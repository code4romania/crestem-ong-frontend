// lib/utils/date.ts
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const bucharestDay = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Europe/Bucharest",
});

/**
 * The calendar day (`YYYY-MM-DD`) of a date or datetime, as seen in Bucharest.
 * Strapi sends datetimes in UTC, so slicing the string would show the previous
 * day for anything done after local midnight. Date-only values pass through
 */
export function toBucharestDay(iso: string): string | null {
  if (DATE_ONLY.test(iso)) return iso;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return bucharestDay.format(date);
}

export function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const bucharest = toBucharestDay(iso);
  if (!bucharest) return "—";
  const [year, month, day] = bucharest.split("-");
  return `${day}.${month}.${year}`;
}

export function formatShortDate(iso?: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Bucharest",
  })
    .format(date)
    .replace(".", "");
}

export function formatMeetingDateTime(iso: string) {
  const date = new Date(iso);
  const datePart = new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Bucharest",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Bucharest",
  }).format(date);
  return `${datePart} · ${timePart}`;
}

export function formatLongDate(iso?: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Bucharest",
  }).format(date);
}
