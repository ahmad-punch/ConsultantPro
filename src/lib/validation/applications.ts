/**
 * Partner-network applications: shared constants and zod schemas.
 * Safe to import in client components (no server deps).
 */
import { z } from "zod";

import { APPLICATION_STATUSES, APPLICATION_TYPES } from "@/lib/db/enums";

import { idField, nullableText } from "./fields";

/** Government offices a provider can work with. Stored comma separated on partners.departments. */
export const DEPARTMENTS = [
  "NADRA",
  "FBR",
  "Land Revenue",
  "SECP",
  "Courts",
  "HEC/IBCC",
  "Passport",
  "Police records",
  "Banks",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

/** Split a comma-separated column into trimmed, non-empty values. */
export function splitList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Case-insensitive "does this comma list contain v". */
export function listHas(list: string | null | undefined, v: string | null | undefined): boolean {
  if (!v) return false;
  const needle = v.trim().toLowerCase();
  return splitList(list).some((x) => x.toLowerCase() === needle);
}

const text = (label: string, max: number) =>
  z.string(`${label} is required.`).trim().min(1, `${label} is required.`).max(max);
const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

/** Public "Work with us" form. Departments arrive as several `departments` entries. */
export const publicApplicationSchema = z
  .object({
    type: z.enum(APPLICATION_TYPES, "Choose what kind of work you do."),
    name: text("Name", 200),
    whatsapp: z
      .string("WhatsApp number is required.")
      .trim()
      .min(7, "Enter a WhatsApp number with country code.")
      .max(40)
      .regex(/^[+0-9 ()-]+$/, "Use digits, spaces and + only."),
    email: z
      .string()
      .trim()
      .max(200)
      .optional()
      .transform((v) => (v ? v : undefined))
      .pipe(z.email("Enter a valid email address.").optional()),
    country: text("Country", 100),
    city: optional(100),
    barCouncilNumber: optional(100),
    yearsExperience: z
      .string()
      .optional()
      .transform((v) => (v && v.trim() !== "" ? Number(v) : undefined))
      .pipe(z.number().int().min(0).max(70).optional()),
    specialties: optional(1000),
    departments: z.array(z.enum(DEPARTMENTS)).default([]),
    serviceAreas: optional(500),
    languages: optional(300),
    bio: optional(3000),
    channelOrNetwork: optional(1000),
    acceptTerms: z.literal("on", "Please accept the terms to apply."),
    website: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.type === "advocate" && !v.barCouncilNumber) {
      ctx.addIssue({ code: "custom", path: ["barCouncilNumber"], message: "Advocates must give a Bar Council enrolment number." });
    }
    if (v.type === "ambassador" && !v.channelOrNetwork) {
      ctx.addIssue({ code: "custom", path: ["channelOrNetwork"], message: "Tell us about your community or channel." });
    }
  });
export type PublicApplicationInput = z.input<typeof publicApplicationSchema>;

/**
 * partner_applications has no departments / serviceAreas columns, so the
 * public action stores them as tagged lines in `notes`. These helpers write
 * and read that format; approval copies them onto the partners row.
 */
export const DEPT_PREFIX = "Departments: ";
export const AREAS_PREFIX = "Service areas: ";

export function readTaggedLine(notes: string | null | undefined, prefix: string): string | null {
  if (!notes) return null;
  const line = notes.split("\n").find((l) => l.startsWith(prefix));
  return line ? line.slice(prefix.length).trim() || null : null;
}

export const applicationStatusSchema = z.object({
  id: idField(),
  status: z.enum(APPLICATION_STATUSES),
});

export const applicationNotesSchema = z.object({
  id: idField(),
  notes: nullableText(5000),
});

export const rejectApplicationSchema = z.object({
  id: idField(),
  reason: z.string().trim().min(3, "Give a short reason.").max(1000),
});
