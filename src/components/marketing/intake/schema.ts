/**
 * Public intake form schema. Shared by the /start form (client) and the
 * submitPublicIntake server action. Built from the shared zod blocks in
 * src/lib/validation/common.ts. Safe to import in client components.
 */
import { z } from "zod";

import { CASE_CATEGORIES, type CaseCategory, type LeadUrgency } from "@/lib/db/enums";
import {
  caseCategorySchema,
  leadUrgencySchema,
  optionalEmailSchema,
  optionalText,
  requiredText,
  whatsappSchema,
} from "@/lib/validation/common";

/** Countries offered in the form. "Other" lets people type nothing extra. */
export const INTAKE_COUNTRIES = [
  "United Kingdom",
  "United States",
  "Canada",
  "Saudi Arabia",
  "United Arab Emirates",
  "Qatar",
  "Oman",
  "Kuwait",
  "Bahrain",
  "Australia",
  "New Zealand",
  "Ireland",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Norway",
  "Sweden",
  "Denmark",
  "Malaysia",
  "Pakistan",
  "Other",
] as const;

export const URGENCY_DESCRIPTIONS: Record<LeadUrgency, string> = {
  low: "No deadline. I want to understand my options.",
  normal: "I need to act in the next few weeks.",
  urgent: "Something is happening now, or a deadline is close.",
};

export const intakeSchema = z.object({
  name: requiredText("Your name", 120),
  whatsapp: whatsappSchema,
  email: optionalEmailSchema,
  country: z.enum(INTAKE_COUNTRIES, { error: "Choose the country you live in." }),
  category: caseCategorySchema,
  urgency: leadUrgencySchema,
  description: z
    .string()
    .trim()
    .min(20, "Tell us a little more (at least 20 characters).")
    .max(4000, "Please keep this under 4,000 characters."),
  referralCode: optionalText(40),
  consent: z.boolean().refine((v) => v === true, {
    message: "Please confirm you have read the disclaimer.",
  }),
  /** Honeypot. Real people never see or fill this. */
  website: z.string().max(200).optional(),
  /** Where the visitor came from (?src=). Defaults to "website". */
  source: z.string().max(60).optional(),
});

export type IntakeInput = z.input<typeof intakeSchema>;
export type IntakeValues = z.output<typeof intakeSchema>;

export function isCaseCategory(value: unknown): value is CaseCategory {
  return typeof value === "string" && (CASE_CATEGORIES as readonly string[]).includes(value);
}

/** Lowercase slug for the lead source: "fb-group_uk" etc. Falls back to "website". */
export function cleanSource(value: unknown): string {
  if (typeof value !== "string") return "website";
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 40);
  return cleaned || "website";
}

/** Referral codes: letters, digits, dash and underscore, uppercased. */
export function cleanReferralCode(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 40)
    .toUpperCase();
}
