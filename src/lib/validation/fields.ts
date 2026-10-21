/**
 * Form-field building blocks for the control panel. Unlike `common.ts`, empty
 * values become `null` (not `undefined`) so an edit form can clear a column.
 * Safe to import in client components.
 */
import { z } from "zod";

import type { ActionResult } from "./common";

/** Sentinel for "no selection" in Radix selects (which cannot use ""). */
export const NONE = "__none";

/** State shape every control-panel form action receives and returns. */
export type FormState = ActionResult<{ id?: string }> | null;

const emptyToNull = (value: unknown) => {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && (value.trim() === "" || value === NONE)) return null;
  return value;
};

/** Optional text; "" becomes null. */
export const nullableText = (max = 5000) =>
  z.preprocess(emptyToNull, z.string().trim().max(max).nullable());

/** Optional http(s) link; "" becomes null. Other schemes are rejected. */
export const nullableUrl = () =>
  z.preprocess(
    emptyToNull,
    z.url({ protocol: /^https?$/, error: "Enter a full link starting with https://" }).nullable(),
  );

export const nullableEmail = () =>
  z.preprocess(emptyToNull, z.email("Enter a valid email address.").nullable());

export const nullableUuid = () => z.preprocess(emptyToNull, z.uuid().nullable());

/** Optional whole number in a range; "" becomes null. */
export const nullableInt = (min: number, max: number) =>
  z.preprocess(emptyToNull, z.coerce.number().int().min(min).max(max).nullable());

/**
 * A date from `<input type="date">` ("2026-10-21"). Stored at 12:00 UTC so it
 * shows as the same calendar day in every time zone from UTC-11 to UTC+11.
 */
export function parseDateInput(value: string): Date {
  return new Date(`${value}T12:00:00Z`);
}

const toDate = (value: unknown) => {
  const v = emptyToNull(value);
  if (v === null) return null;
  if (v instanceof Date) return v;
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return parseDateInput(v);
  return new Date(String(v));
};

export const nullableDate = () => z.preprocess(toDate, z.date("Enter a valid date.").nullable());

export const requiredDate = () => z.preprocess(toDate, z.date("Enter a valid date."));

/** Native checkbox: present ("on") is true, absent is false. */
export const checkbox = () =>
  z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

/** "yes" / "no" / "" select mapped to true / false / null. */
export const nullableBoolean = () =>
  z.preprocess((v) => {
    if (v === "yes" || v === "true" || v === true) return true;
    if (v === "no" || v === "false" || v === false) return false;
    return null;
  }, z.boolean().nullable());

export const idField = () => z.uuid("Missing record id.");
