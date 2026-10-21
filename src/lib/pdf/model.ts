/**
 * The one shape every rendered document (PDF, HTML preview, print view) is
 * built from: branding + template + data. Pure types and helpers, safe
 * anywhere.
 */
import type { DocumentType } from "@/lib/db/enums";

export type BrandingData = {
  legalName: string;
  tradingName: string;
  addressLines: string;
  email: string;
  phone: string;
  website: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  showLogo: boolean;
  footerText: string;
  taxLabel: string;
  taxNumber: string;
  bankDetails: string;
  currency: string;
};

export type TemplateData = {
  title: string;
  intro: string;
  terms: string;
  footer: string;
  sections: Array<{ heading: string; body: string }>;
  options: Record<string, boolean | string>;
};

export type PartyData = {
  name: string;
  email?: string | null;
  whatsapp?: string | null;
  city?: string | null;
  country?: string | null;
};

export type DocModel = {
  type: DocumentType;
  number: string;
  status?: string | null;
  issueDate: string;
  dueDate?: string | null;
  caseNumber?: string | null;
  branding: BrandingData;
  template: TemplateData;
  billTo: PartyData | null;
  items: Array<{ description: string; quantity: number; unitUsd: number; amountUsd: number }>;
  subtotalUsd: number;
  taxUsd: number;
  totalUsd: number;
  notes?: string | null;
};

export const DEFAULT_BRANDING: BrandingData = {
  legalName: "",
  tradingName: "",
  addressLines: "",
  email: "",
  phone: "",
  website: "",
  logoUrl: null,
  primaryColor: "#0F3D2E",
  accentColor: "#B5542D",
  showLogo: true,
  footerText: "",
  taxLabel: "",
  taxNumber: "",
  bankDetails: "",
  currency: "USD",
};

export function opt(model: DocModel, key: string): boolean {
  return model.template.options[key] === true;
}

/** Money in the document currency, whole units: 1500 -> "$1,500" / "GBP 1,500". */
export function money(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-US")}`;
  }
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export function docDate(iso: string | null | undefined): string {
  return iso ? dateFmt.format(new Date(iso)) : "";
}

/** Fill {client}, {case}, {number} placeholders in template text. */
export function fill(text: string, model: DocModel): string {
  return text
    .replaceAll("{client}", model.billTo?.name ?? "")
    .replaceAll("{case}", model.caseNumber ?? "")
    .replaceAll("{number}", model.number);
}

export function brandName(b: BrandingData): string {
  return b.tradingName || b.legalName || "Rasta";
}
