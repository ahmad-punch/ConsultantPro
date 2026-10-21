import { z } from "zod";

import { DOCUMENT_TYPES } from "@/lib/db/enums";

import { checkbox, idField, nullableText, nullableUrl, nullableUuid } from "./fields";

const text = (max = 2000) => z.preprocess((v) => (v == null ? "" : v), z.string().trim().max(max));
const hex = z.preprocess(
  (v) => (typeof v === "string" ? v.trim() : v),
  z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a colour like #0F3D2E."),
);

export const brandingSchema = z.object({
  legalName: text(200),
  tradingName: text(200),
  addressLines: text(1000),
  email: text(200),
  phone: text(100),
  website: text(200),
  logoUrl: nullableUrl(),
  primaryColor: hex,
  accentColor: hex,
  showLogo: checkbox(),
  footerText: text(1000),
  taxLabel: text(50),
  taxNumber: text(100),
  bankDetails: text(2000),
  currency: z.preprocess((v) => (v ? String(v).toUpperCase() : "USD"), z.string().regex(/^[A-Z]{3}$/, "Three-letter code, e.g. USD.")),
});

export const TEMPLATE_OPTIONS = ["showBankDetails", "showSignature", "showTaxLine", "showCaseReference"] as const;
export type TemplateOption = (typeof TEMPLATE_OPTIONS)[number];
export const TEMPLATE_OPTION_LABELS: Record<TemplateOption, string> = {
  showBankDetails: "Show bank details",
  showSignature: "Show signature block",
  showTaxLine: "Show tax line",
  showCaseReference: "Show case reference",
};

const sectionsField = z.preprocess(
  (v) => {
    if (typeof v !== "string" || v.trim() === "") return [];
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  },
  z
    .array(z.object({ heading: z.string().trim().max(200), body: z.string().trim().max(5000) }))
    .max(20)
    .transform((rows) => rows.filter((r) => r.heading || r.body)),
);

export const templateSchema = z.object({
  id: nullableUuid(),
  type: z.enum(DOCUMENT_TYPES),
  name: z.string().trim().min(1, "Give the template a name.").max(120),
  title: text(200),
  intro: text(5000),
  terms: text(5000),
  footer: text(1000),
  sections: sectionsField,
  showBankDetails: checkbox(),
  showSignature: checkbox(),
  showTaxLine: checkbox(),
  showCaseReference: checkbox(),
  isDefault: checkbox(),
});

export const idOnlySchema = z.object({ id: idField() });

export const generateDocumentSchema = z.object({
  caseId: idField(),
  templateId: idField(),
  note: nullableText(5000),
});
