/** Row schemas for the CSV importers (channels, leads). */
import { z } from "zod";

import { CHANNEL_PLATFORMS, CHANNEL_STATUSES } from "@/lib/db/enums";

import { caseCategorySchema, leadUrgencySchema, requiredText, whatsappSchema } from "./common";
import { nullableEmail, nullableInt, nullableText } from "./fields";

export const CHANNEL_IMPORT_COLUMNS = [
  "name",
  "platform",
  "country",
  "member_count",
  "admin_contact",
  "status",
  "ambassador",
  "notes",
] as const;

export const LEAD_IMPORT_COLUMNS = [
  "name",
  "whatsapp",
  "email",
  "country",
  "category",
  "urgency",
  "description",
  "referral_code",
  "source",
] as const;

const lower = (v: unknown) => (typeof v === "string" ? v.trim().toLowerCase().replace(/[\s-]+/g, "_") : v);

export const channelImportRowSchema = z.object({
  name: requiredText("Name", 200),
  platform: z.preprocess(lower, z.enum(CHANNEL_PLATFORMS, `Platform must be one of: ${CHANNEL_PLATFORMS.join(", ")}`)),
  country: nullableText(100),
  member_count: nullableInt(0, 10_000_000),
  admin_contact: nullableText(200),
  status: z.preprocess(
    (v) => (v === "" || v === undefined ? "identified" : lower(v)),
    z.enum(CHANNEL_STATUSES, `Status must be one of: ${CHANNEL_STATUSES.join(", ")}`),
  ),
  /** Ambassador name or referral code; resolved on the server. */
  ambassador: nullableText(200),
  notes: nullableText(5000),
});

export const leadImportRowSchema = z.object({
  name: requiredText("Name", 200),
  whatsapp: whatsappSchema,
  email: nullableEmail(),
  country: requiredText("Country", 100),
  category: z.preprocess(lower, caseCategorySchema),
  urgency: z.preprocess((v) => (v === "" || v === undefined ? "normal" : lower(v)), leadUrgencySchema),
  description: requiredText("Description", 5000),
  referral_code: nullableText(40),
  source: z.preprocess((v) => (v === "" || v === undefined ? "import" : v), requiredText("Source", 60)),
});

export type ImportPreviewRow = {
  line: number;
  values: Record<string, string>;
  errors: string[];
  duplicate: boolean;
};

export type ImportPreview = {
  ok: boolean;
  error?: string;
  missingColumns: string[];
  rows: ImportPreviewRow[];
  validCount: number;
};

export type ImportResult = { ok: boolean; message?: string; error?: string; imported: number; skipped: number };
