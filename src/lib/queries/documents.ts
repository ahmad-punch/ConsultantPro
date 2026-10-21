import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { DOCUMENT_TYPES, type DocumentType } from "@/lib/db/enums";
import { brandingSettings, cases, clients, documentTemplates, generatedDocuments } from "@/lib/db/schema";
import { DEFAULT_BRANDING, type BrandingData, type TemplateData } from "@/lib/pdf/model";
import { site } from "@/lib/site";

export type DocumentTemplate = typeof documentTemplates.$inferSelect;

/** The single branding row, or defaults when none is saved yet. */
export async function getBranding(): Promise<BrandingData & { id: string | null }> {
  const [row] = await db.select().from(brandingSettings).orderBy(asc(brandingSettings.createdAt)).limit(1);
  if (!row) return { ...DEFAULT_BRANDING, tradingName: site.name, id: null };
  return {
    id: row.id,
    legalName: row.legalName,
    tradingName: row.tradingName,
    addressLines: row.addressLines,
    email: row.email,
    phone: row.phone,
    website: row.website,
    logoUrl: row.logoUrl,
    primaryColor: row.primaryColor,
    accentColor: row.accentColor,
    showLogo: row.showLogo,
    footerText: row.footerText,
    taxLabel: row.taxLabel,
    taxNumber: row.taxNumber,
    bankDetails: row.bankDetails,
    currency: row.currency,
  };
}

const NOT_LEGAL =
  "Rasta is not a law firm. Everything we provide is general information about process, not legal advice. Where legal advice or representation is needed, an independent advocate advises you directly and bills you separately under their own engagement.";

/** One sensible "official" default per document type. */
export const DEFAULT_TEMPLATES: Record<DocumentType, Omit<typeof documentTemplates.$inferInsert, "type">> = {
  invoice: {
    name: "Standard invoice",
    isDefault: true,
    title: "Invoice",
    intro: "Thank you for choosing us. This invoice covers the services listed below.",
    terms: "Payment is due by the due date shown. Please quote the invoice number with your payment. Fees are fixed and in whole US dollars. Government fees, stamp duty and advocate fees are not included unless listed.",
    footer: NOT_LEGAL,
    sections: [],
    options: { showBankDetails: true, showSignature: false, showTaxLine: true, showCaseReference: true },
  },
  receipt: {
    name: "Standard receipt",
    isDefault: true,
    title: "Receipt",
    intro: "We confirm receipt of the payment below. Thank you.",
    terms: "Keep this receipt for your records.",
    footer: NOT_LEGAL,
    sections: [],
    options: { showBankDetails: false, showSignature: false, showTaxLine: true, showCaseReference: true },
  },
  quote: {
    name: "Standard quote",
    isDefault: true,
    title: "Quote",
    intro: "Here is our fixed-price quote for the work described below.",
    terms: "This quote is valid for 30 days from the issue date. Work starts once the quote is accepted and payment is received. Government fees, stamp duty and advocate fees are not included unless listed.",
    footer: NOT_LEGAL,
    sections: [],
    options: { showBankDetails: false, showSignature: false, showTaxLine: true, showCaseReference: true },
  },
  engagement_letter: {
    name: "Standard engagement letter",
    isDefault: true,
    title: "Engagement letter",
    intro: "Dear {client},\n\nThank you for asking us to help with case {case}. This letter sets out what we will do, what we will not do, and how we charge.",
    terms: "By paying the fee you confirm you have read and accept this letter. Either side may end the engagement in writing; work already delivered is not refundable.",
    footer: NOT_LEGAL,
    sections: [
      { heading: "What we do", body: "We explain the process, identify which office or forum owns your problem, set out the realistic options, timelines and costs, and coordinate the next steps with you." },
      { heading: "We are not a law firm", body: "Rasta is not a law firm and does not give legal advice. Our work is general information about process. Nothing in our memos, calls or messages is a legal opinion." },
      { heading: "Advocates", body: "If your matter needs legal advice or representation, an independent advocate will advise you directly. The advocate engages with you under their own terms and bills you separately. Their fees are not part of our fee." },
      { heading: "Fees", body: "Our fee is fixed and stated in US dollars. Government fees, stamp duty, courier and similar costs are paid on top and shown to you before they are incurred." },
    ],
    options: { showBankDetails: false, showSignature: true, showTaxLine: false, showCaseReference: true },
  },
  case_summary: {
    name: "Standard case summary",
    isDefault: true,
    title: "Case summary",
    intro: "Summary of case {case} for {client}.",
    terms: "",
    footer: NOT_LEGAL,
    sections: [],
    options: { showBankDetails: false, showSignature: false, showTaxLine: false, showCaseReference: true },
  },
};

/** Seed one default template per type when the table is empty. Idempotent. */
export async function ensureDefaultTemplates(): Promise<void> {
  const [existing] = await db.select({ id: documentTemplates.id }).from(documentTemplates).limit(1);
  if (existing) return;
  await db
    .insert(documentTemplates)
    .values(DOCUMENT_TYPES.map((type) => ({ type, ...DEFAULT_TEMPLATES[type] })));
}

export async function listTemplates(): Promise<DocumentTemplate[]> {
  await ensureDefaultTemplates();
  return db.select().from(documentTemplates).orderBy(asc(documentTemplates.type), desc(documentTemplates.isDefault), asc(documentTemplates.name));
}

export async function getTemplate(id: string): Promise<DocumentTemplate | null> {
  const [row] = await db.select().from(documentTemplates).where(eq(documentTemplates.id, id)).limit(1);
  return row ?? null;
}

export async function getDefaultTemplate(type: DocumentType): Promise<DocumentTemplate | null> {
  await ensureDefaultTemplates();
  const [row] = await db
    .select()
    .from(documentTemplates)
    .where(and(eq(documentTemplates.type, type), eq(documentTemplates.isDefault, true)))
    .limit(1);
  if (row) return row;
  const [any] = await db.select().from(documentTemplates).where(eq(documentTemplates.type, type)).limit(1);
  return any ?? null;
}

export function toTemplateData(t: DocumentTemplate | null, type: DocumentType): TemplateData {
  const src = t ?? { ...DEFAULT_TEMPLATES[type] };
  return {
    title: src.title ?? "",
    intro: src.intro ?? "",
    terms: src.terms ?? "",
    footer: src.footer ?? "",
    sections: (src.sections as TemplateData["sections"]) ?? [],
    options: (src.options as TemplateData["options"]) ?? {},
  };
}

export async function listGeneratedDocuments() {
  return db
    .select({
      doc: generatedDocuments,
      caseNumber: cases.caseNumber,
      clientName: clients.name,
    })
    .from(generatedDocuments)
    .leftJoin(cases, eq(generatedDocuments.caseId, cases.id))
    .leftJoin(clients, eq(generatedDocuments.clientId, clients.id))
    .orderBy(desc(generatedDocuments.createdAt))
    .limit(100);
}

export async function getGeneratedDocument(id: string) {
  const [row] = await db.select().from(generatedDocuments).where(eq(generatedDocuments.id, id)).limit(1);
  return row ?? null;
}
