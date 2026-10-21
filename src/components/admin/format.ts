/**
 * Formatting helpers for the control panel. Pure functions, safe on server
 * and client. Dates render in UTC so server and browser agree (see LEARNINGS).
 */
export { formatUsd } from "@/lib/pricing";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const shortDateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

type D = Date | string | null | undefined;
const toDate = (d: D) => (d ? (d instanceof Date ? d : new Date(d)) : null);

export function formatDate(d: D, fallback = "-"): string {
  const date = toDate(d);
  return date ? dateFmt.format(date) : fallback;
}

export function formatShortDate(d: D, fallback = "-"): string {
  const date = toDate(d);
  return date ? shortDateFmt.format(date) : fallback;
}

export function formatDateTime(d: D, fallback = "-"): string {
  const date = toDate(d);
  return date ? `${dateTimeFmt.format(date)} UTC` : fallback;
}

/** Value for `<input type="date">`: "2026-10-21", or "". */
export function toDateInput(d: D): string {
  const date = toDate(d);
  return date ? date.toISOString().slice(0, 10) : "";
}

const DAY = 24 * 60 * 60 * 1000;

/** Whole UTC days from `now` to `d` (negative when in the past). */
export function daysFromToday(d: Date, now: Date): number {
  const a = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const b = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.round((b - a) / DAY);
}

export function dueLabel(d: Date, now: Date): { label: string; tone: "danger" | "warning" | "neutral" } {
  const n = daysFromToday(d, now);
  if (n < 0) return { label: `${-n}d overdue`, tone: "danger" };
  if (n === 0) return { label: "Today", tone: "warning" };
  if (n === 1) return { label: "Tomorrow", tone: "neutral" };
  return { label: `In ${n}d`, tone: "neutral" };
}

export function ageLabel(d: Date, now: Date): string {
  const n = -daysFromToday(d, now);
  if (n <= 0) return "today";
  if (n === 1) return "yesterday";
  return `${n} days ago`;
}

export type Opt = { value: string; label: string };

export function enumOptions<T extends string>(values: readonly T[], labels: Record<T, string>): Opt[] {
  return values.map((value) => ({ value, label: labels[value] }));
}

/** Build a list URL from the current params plus a patch (undefined/"" removes). */
export function buildHref(
  basePath: string,
  params: Record<string, string | undefined>,
  patch: Record<string, string | undefined> = {},
): string {
  const merged = { ...params, ...patch };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) if (v) qs.set(k, v);
  const s = qs.toString();
  return s ? `${basePath}?${s}` : basePath;
}

export function pluralise(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}
