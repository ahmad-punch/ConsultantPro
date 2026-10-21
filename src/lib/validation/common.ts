/**
 * Shared zod building blocks. Enum schemas mirror the Postgres enums in
 * src/lib/db/schema.ts (both are built from src/lib/db/enums.ts).
 * Safe to import in client components.
 */
import { z } from "zod";

import {
  CASE_CATEGORIES,
  CASE_STAGES,
  CHANNEL_PLATFORMS,
  CHANNEL_STATUSES,
  CONTENT_FORMATS,
  CONTENT_LANGUAGES,
  CONTENT_STATUSES,
  LEAD_STATUSES,
  LEAD_URGENCIES,
  PARTNER_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PRODUCTS,
  RETAINER_STATUSES,
  RETAINER_TIERS,
  TEAM_ROLES,
} from "@/lib/db/enums";

export const caseCategorySchema = z.enum(CASE_CATEGORIES);
export const caseStageSchema = z.enum(CASE_STAGES);
export const productSchema = z.enum(PRODUCTS);
export const paymentStatusSchema = z.enum(PAYMENT_STATUSES);
export const leadStatusSchema = z.enum(LEAD_STATUSES);
export const leadUrgencySchema = z.enum(LEAD_URGENCIES);
export const partnerTypeSchema = z.enum(PARTNER_TYPES);
export const channelPlatformSchema = z.enum(CHANNEL_PLATFORMS);
export const channelStatusSchema = z.enum(CHANNEL_STATUSES);
export const contentStatusSchema = z.enum(CONTENT_STATUSES);
export const contentFormatSchema = z.enum(CONTENT_FORMATS);
export const contentLanguageSchema = z.enum(CONTENT_LANGUAGES);
export const retainerTierSchema = z.enum(RETAINER_TIERS);
export const retainerStatusSchema = z.enum(RETAINER_STATUSES);
export const paymentMethodSchema = z.enum(PAYMENT_METHODS);
export const teamRoleSchema = z.enum(TEAM_ROLES);

/** Trimmed required text. */
export const requiredText = (label = "This field", max = 2000) =>
  z.string().trim().min(1, `${label} is required.`).max(max);

/** Trimmed optional text: "" becomes undefined. */
export const optionalText = (max = 5000) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

/** WhatsApp number in international format, e.g. +44 7700 900000. */
export const whatsappSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a WhatsApp number with country code, e.g. +44 7700 900000.");

export const optionalEmailSchema = z
  .union([z.literal(""), z.email("Enter a valid email address.")])
  .optional()
  .transform((v) => (v ? v : undefined));

export const optionalUrlSchema = z
  .union([z.literal(""), z.url("Enter a full link starting with https://")])
  .optional()
  .transform((v) => (v ? v : undefined));

/** Whole US dollars from a form field ("249" -> 249). */
export const usdSchema = z.coerce.number().int().min(0).max(1_000_000);

export const uuidSchema = z.uuid();

/** Standard result shape for server actions used with useActionState. */
export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };
