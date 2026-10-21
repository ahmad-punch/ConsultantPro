/**
 * Category-specific intake questions. Shared by the /start form (client), the
 * intake zod schema, the admin lead page and the convert-to-case action, so it
 * must stay free of server-only imports. Every question is optional.
 */
import type { CaseCategory } from "@/lib/db/enums";

export type DetailQuestion = {
  key: string;
  label: string;
  type: "text" | "select" | "yesno" | "date";
  options?: readonly string[];
  placeholder?: string;
};

const YES_NO = ["Yes", "No"] as const;

export const DETAIL_QUESTIONS: Partial<Record<CaseCategory, readonly DetailQuestion[]>> = {
  property: [
    { key: "district", label: "District", type: "text", placeholder: "For example: Lahore" },
    {
      key: "record_type",
      label: "Type of record",
      type: "select",
      options: ["Fard", "Registry", "Allotment", "Other"],
    },
    { key: "occupant", label: "Who is occupying it?", type: "text" },
    { key: "power_of_attorney", label: "Do you hold a power of attorney?", type: "yesno" },
  ],
  inheritance: [
    { key: "deceased_name", label: "Name of the deceased", type: "text" },
    { key: "date_of_death", label: "Date of death", type: "date" },
    { key: "legal_heirs", label: "Number of legal heirs", type: "text", placeholder: "For example: 5" },
    { key: "dispute", label: "Is there a dispute?", type: "yesno" },
  ],
  police_fir: [
    { key: "district", label: "District", type: "text" },
    { key: "fir_number", label: "FIR number, if you have it", type: "text" },
    {
      key: "role",
      label: "Are you the complainant or the accused?",
      type: "select",
      options: ["Complainant", "Accused", "Neither"],
    },
  ],
  tax_fbr: [
    { key: "has_ntn", label: "Do you have an NTN?", type: "yesno" },
    { key: "missing_years", label: "Years of returns missing", type: "text", placeholder: "For example: 2022, 2023" },
  ],
  nadra: [
    {
      key: "document_type",
      label: "Document type",
      type: "select",
      options: ["CNIC", "NICOP", "POC", "FRC", "Other"],
    },
    { key: "status", label: "Expired or lost?", type: "select", options: ["Expired", "Lost", "Other"] },
  ],
  attestation: [
    { key: "document_type", label: "Document type", type: "text", placeholder: "For example: degree, birth certificate" },
    { key: "issuer", label: "Board or university", type: "text" },
  ],
  company_secp: [
    { key: "company_name", label: "Proposed company name", type: "text" },
    { key: "directors", label: "Number of directors", type: "text", placeholder: "For example: 2" },
  ],
  court: [
    { key: "court_case", label: "Court and case number", type: "text" },
    { key: "next_hearing", label: "Next hearing date", type: "date" },
  ],
  errand: [
    { key: "request", label: "What exactly is needed?", type: "text" },
    { key: "city", label: "City", type: "text" },
  ],
};

export const DETAIL_VALUE_MAX = 500;

export function detailQuestionsFor(category: CaseCategory | undefined): readonly DetailQuestion[] {
  return (category && DETAIL_QUESTIONS[category]) || [];
}

export { YES_NO as DETAIL_YES_NO };

/**
 * Keep only keys defined for the category, trim values, drop empties, cap length.
 * Returns undefined when nothing is left.
 */
export function cleanDetails(
  category: CaseCategory,
  raw: Record<string, unknown> | null | undefined,
): Record<string, string> | undefined {
  if (!raw) return undefined;
  const out: Record<string, string> = {};
  for (const q of detailQuestionsFor(category)) {
    const v = raw[q.key];
    if (typeof v !== "string") continue;
    const trimmed = v.trim().slice(0, DETAIL_VALUE_MAX);
    if (trimmed) out[q.key] = trimmed;
  }
  return Object.keys(out).length ? out : undefined;
}

/** Labelled answers for display, in question order. Unknown keys fall back to the key. */
export function labelledDetails(
  category: CaseCategory,
  details: Record<string, string> | null | undefined,
): { key: string; label: string; value: string }[] {
  if (!details) return [];
  const known = detailQuestionsFor(category);
  const rows = known
    .filter((q) => details[q.key])
    .map((q) => ({ key: q.key, label: q.label.replace(/\?$/, ""), value: details[q.key] }));
  const knownKeys = new Set(known.map((q) => q.key));
  for (const [key, value] of Object.entries(details)) {
    if (!knownKeys.has(key) && value) rows.push({ key, label: key, value });
  }
  return rows;
}
