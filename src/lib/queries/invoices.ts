import "server-only";

import { and, asc, desc, eq, sql, type SQL } from "drizzle-orm";

import { db as defaultDb, type Database } from "@/lib/db";
import { DOCUMENT_TYPES, INVOICE_STATUSES, PRODUCT_LABELS } from "@/lib/db/enums";
import { cases, clients, invoiceItems, invoices } from "@/lib/db/schema";
import type { BrandingData, DocModel, PartyData, TemplateData } from "@/lib/pdf/model";
import { getProduct, type OfferingId } from "@/lib/pricing";

import { getBranding, getTemplate, toTemplateData } from "./documents";
import { enumParam, type SearchParams } from "./params";

export const INVOICE_NUMBER_PREFIX = "INV-";

/** Format a sequence number as an invoice number: 7 -> "INV-0007". */
export function formatInvoiceNumber(n: number): string {
  return `${INVOICE_NUMBER_PREFIX}${String(n).padStart(4, "0")}`;
}

/**
 * The next free invoice number, one above the highest existing number
 * ("INV-0001" when there are none). Receipts and quotes share the sequence.
 * Callers retry once on a unique violation (23505).
 */
export async function nextInvoiceNumber(database: Database = defaultDb): Promise<string> {
  const [row] = await database
    .select({
      max: sql<number | string | null>`max(cast(substring(${invoices.invoiceNumber} from '[0-9]+$') as integer))`,
    })
    .from(invoices);
  const current = row?.max == null ? 0 : Number(row.max);
  return formatInvoiceNumber(current + 1);
}

export function readInvoiceFilters(sp: SearchParams) {
  return {
    status: enumParam(sp, "status", INVOICE_STATUSES),
    type: enumParam(sp, "type", DOCUMENT_TYPES),
  };
}

export async function listInvoices(f: ReturnType<typeof readInvoiceFilters>) {
  const where: SQL[] = [];
  if (f.status) where.push(eq(invoices.status, f.status));
  if (f.type) where.push(eq(invoices.type, f.type));
  return defaultDb
    .select({ invoice: invoices, clientName: clients.name, caseNumber: cases.caseNumber })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .leftJoin(cases, eq(invoices.caseId, cases.id))
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(invoices.issueDate), desc(invoices.invoiceNumber));
}

export async function getInvoice(id: string) {
  const [row] = await defaultDb
    .select({ invoice: invoices, clientName: clients.name, caseNumber: cases.caseNumber })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .leftJoin(cases, eq(invoices.caseId, cases.id))
    .where(eq(invoices.id, id))
    .limit(1);
  if (!row) return null;
  const items = await defaultDb
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, id))
    .orderBy(asc(invoiceItems.position));
  return { ...row, items };
}

export type InvoiceDetail = NonNullable<Awaited<ReturnType<typeof getInvoice>>>;

export type InvoiceSnapshot = {
  client?: PartyData;
  branding?: BrandingData;
  template?: TemplateData;
  caseNumber?: string | null;
};

/** Build the render model from an invoice and its snapshot (live data as fallback). */
export async function buildInvoiceModel(d: InvoiceDetail): Promise<DocModel> {
  const snap = d.invoice.snapshot as InvoiceSnapshot;
  const branding = snap.branding ?? (await getBranding());
  const template =
    snap.template ??
    toTemplateData(d.invoice.templateId ? await getTemplate(d.invoice.templateId) : null, d.invoice.type);
  return {
    type: d.invoice.type,
    number: d.invoice.invoiceNumber,
    status: d.invoice.status,
    issueDate: d.invoice.issueDate.toISOString(),
    dueDate: d.invoice.dueDate?.toISOString() ?? null,
    caseNumber: snap.caseNumber ?? d.caseNumber,
    branding,
    template,
    billTo: snap.client ?? (d.clientName ? { name: d.clientName } : null),
    items: d.items.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      unitUsd: i.unitUsd,
      amountUsd: i.amountUsd,
    })),
    subtotalUsd: d.invoice.subtotalUsd,
    taxUsd: d.invoice.taxUsd,
    totalUsd: d.invoice.totalUsd,
    notes: d.invoice.notes,
  };
}

export type CaseBillingOption = {
  value: string;
  label: string;
  clientId: string;
  description: string;
  priceUsd: number;
};

/** Cases with what an invoice line needs: client, product name and agreed price. */
export async function getCaseBillingOptions(): Promise<CaseBillingOption[]> {
  const rows = await defaultDb
    .select({
      id: cases.id,
      caseNumber: cases.caseNumber,
      clientId: cases.clientId,
      client: clients.name,
      product: cases.product,
      priceUsd: cases.priceUsd,
    })
    .from(cases)
    .innerJoin(clients, eq(cases.clientId, clients.id))
    .orderBy(desc(cases.caseNumber));
  return rows.map((r) => ({
    value: r.id,
    label: `${r.caseNumber} · ${r.client}`,
    clientId: r.clientId,
    description: caseLineDescription(r.product, r.caseNumber),
    priceUsd: r.priceUsd,
  }));
}

export function caseLineDescription(product: string, caseNumber: string): string {
  let name = PRODUCT_LABELS[product as keyof typeof PRODUCT_LABELS] ?? product;
  try {
    name = getProduct(product as OfferingId).name;
  } catch {
    // "retainer" is not an offering id; keep the label.
  }
  return `${name} (case ${caseNumber})`;
}
