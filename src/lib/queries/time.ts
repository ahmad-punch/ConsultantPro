/**
 * Day arithmetic for the control panel. All day boundaries are UTC (see
 * docs/LEARNINGS.md): dates from date inputs are stored at 12:00 UTC, so they
 * land on the right calendar day for both the UK and Pakistan.
 */
export const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDayUtc(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

export function startOfMonthUtc(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

/** Monday 00:00 UTC of the week containing `d`. */
export function startOfWeekUtc(d: Date): Date {
  const day = startOfDayUtc(d);
  const dow = (day.getUTCDay() + 6) % 7; // Monday = 0
  return addDays(day, -dow);
}

const isWeekend = (d: Date) => d.getUTCDay() === 0 || d.getUTCDay() === 6;

/** The date `n` working days (Mon-Fri) before `d`. */
export function subtractWorkingDays(d: Date, n: number): Date {
  let out = new Date(d);
  let left = n;
  while (left > 0) {
    out = addDays(out, -1);
    if (!isWeekend(out)) left -= 1;
  }
  return out;
}

/**
 * Working days elapsed from `from` to `to`, counting whole weekdays after the
 * start day plus the fraction of time, e.g. Monday 10:00 to Wednesday 10:00 is 2.
 */
export function workingDaysBetween(from: Date, to: Date): number {
  if (to <= from) return 0;
  let days = 0;
  let cursor = startOfDayUtc(from);
  const end = startOfDayUtc(to);
  while (cursor < end) {
    cursor = addDays(cursor, 1);
    if (!isWeekend(cursor)) days += 1;
  }
  return days;
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** 12:00 UTC on the same UTC day: how date-only values are stored. */
export function noonUtc(d: Date): Date {
  return new Date(startOfDayUtc(d).getTime() + DAY_MS / 2);
}
