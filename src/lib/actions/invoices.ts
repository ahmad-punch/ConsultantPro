"use server";

import { eq } from "drizzle-orm";

import { requirePermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { DOCUMENT_TYPE_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/db/enums";
import { caseNotes, cases, clients, invoiceItems, invoices, payments } from "@/lib/db/schema";
import { formatUsd } from "@/lib/pricing";
import { getBranding, getDefaultTemplate, getTemplate, toTemplateData } from "@/lib/queries/documents";
import { getInvoice, nextInvoiceNumber, type InvoiceSnapshot } from "@/lib/queries/invoices";
import { idOnlySchema } from "@/lib/validation/documents";
import type { FormState } from "@/lib/validation/fields";
import { computeTotals, invoiceSchema, markPaidSchema } from "@/lib/validation/invoices";

import { done, failed, getActorName, isUniqueViolation, parseForm, revalidateAdmin, unexpected } from "./helpers";

type InvoiceInsert = Omit<typeof invoices.$inferInsert, "invoiceNumber">;

async function insertWithNumber(values: InvoiceInsert): Promise<{ id: string; invoiceNumber: string }> {
  for (let attempt = 0; ; attempt++) {
    try {
      const invoiceNumber = await nextInvoiceNumber();
      const [row] = await db
        .insert(invoices)
        .values({ ...values, invoiceNumber })
        .returning({ id: invoices.id, invoiceNumber: invoices.invoiceNumber });
      return row;
    } catch (error) {
      if (attempt === 0 && isUniqueViolation(error)) continue;
      throw error;
    }
  }
}

/** Create an invoice, receipt or quote with its lines; snapshots client, branding and template. */
export async function createInvoiceAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(invoiceSchema, formData);
  if (!parsed.ok) return parsed.state;
  const v = parsed.data;
  try {
    const [client] = await db.select().from(clients).where(eq(clients.id, v.clientId)).limit(1);
    if (!client) return failed("Client not found.");
    let caseNumber: string | null = null;
    if (v.caseId) {
      const [c] = await db.select({ n: cases.caseNumber }).from(cases).where(eq(cases.id, v.caseId)).limit(1);
      caseNumber = c?.n ?? null;
    }
    const template = v.templateId ? await getTemplate(v.templateId) : await getDefaultTemplate(v.type);
    const branding = await getBranding();
    const { id: _brandingId, ...brandingData } = branding;
    void _brandingId;
    const snapshot: InvoiceSnapshot = {
      client: { name: client.name, email: client.email, whatsapp: client.whatsapp, city: client.city, country: client.country },
      branding: brandingData,
      template: toTemplateData(template, v.type),
      caseNumber,
    };
    const totals = computeTotals(v.items, v.taxUsd);
    const row = await insertWithNumber({
      type: v.type,
      clientId: v.clientId,
      caseId: v.caseId,
      templateId: template?.id ?? null,
      issueDate: v.issueDate,
      dueDate: v.dueDate,
      currency: branding.currency,
      subtotalUsd: totals.subtotalUsd,
      taxUsd: totals.taxUsd,
      totalUsd: totals.totalUsd,
      notes: v.notes,
      snapshot: snapshot as Record<string, unknown>,
    });
    await db.insert(invoiceItems).values(
      totals.lines.map((l, position) => ({ invoiceId: row.id, position, ...l })),
    );
    revalidateAdmin();
    return done(`${DOCUMENT_TYPE_LABELS[v.type]} ${row.invoiceNumber} created.`, row.id);
  } catch (error) {
    return unexpected(error, "create the invoice");
  }
}

export async function markInvoiceSentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(idOnlySchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const d = await getInvoice(parsed.data.id);
    if (!d) return failed("Invoice not found.");
    if (d.invoice.status !== "draft") return failed("Only a draft can be marked sent.");
    await db.update(invoices).set({ status: "sent", sentAt: new Date() }).where(eq(invoices.id, d.invoice.id));
    revalidateAdmin();
    return done(`${d.invoice.invoiceNumber} marked sent.`);
  } catch (error) {
    return unexpected(error, "mark the invoice sent");
  }
}

/** Mark paid: records a payment, links it, and updates the case payment status. */
export async function markInvoicePaidAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(markPaidSchema, formData);
  if (!parsed.ok) return parsed.state;
  const v = parsed.data;
  try {
    const d = await getInvoice(v.id);
    if (!d) return failed("Invoice not found.");
    if (d.invoice.status === "paid") return failed("This invoice is already paid.");
    if (d.invoice.status === "void") return failed("A void invoice cannot be paid.");
    const paidAt = v.paidAt ?? new Date();
    const [payment] = await db
      .insert(payments)
      .values({
        caseId: d.invoice.caseId,
        retainerId: d.invoice.retainerId,
        amountUsd: d.invoice.totalUsd,
        method: v.method,
        status: "paid",
        reference: v.reference ?? d.invoice.invoiceNumber,
        paidAt,
      })
      .returning({ id: payments.id });
    await db
      .update(invoices)
      .set({ status: "paid", paidAt, paymentId: payment.id })
      .where(eq(invoices.id, d.invoice.id));
    if (d.invoice.caseId) {
      await db.update(cases).set({ paymentStatus: "paid" }).where(eq(cases.id, d.invoice.caseId));
      await db.insert(caseNotes).values({
        caseId: d.invoice.caseId,
        authorName: await getActorName(),
        body: `Invoice ${d.invoice.invoiceNumber} paid: ${formatUsd(d.invoice.totalUsd)} via ${PAYMENT_METHOD_LABELS[v.method]}.`,
      });
    }
    revalidateAdmin();
    return done(`${d.invoice.invoiceNumber} marked paid and payment recorded.`);
  } catch (error) {
    return unexpected(error, "mark the invoice paid");
  }
}

export async function voidInvoiceAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(idOnlySchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const d = await getInvoice(parsed.data.id);
    if (!d) return failed("Invoice not found.");
    if (d.invoice.status === "paid") return failed("A paid invoice cannot be voided. Refund the payment instead.");
    await db.update(invoices).set({ status: "void" }).where(eq(invoices.id, d.invoice.id));
    revalidateAdmin();
    return done(`${d.invoice.invoiceNumber} voided.`);
  } catch (error) {
    return unexpected(error, "void the invoice");
  }
}

/** Copy an invoice as a new draft with today's date and a fresh number. */
export async function duplicateInvoiceAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(idOnlySchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const d = await getInvoice(parsed.data.id);
    if (!d) return failed("Invoice not found.");
    const i = d.invoice;
    const row = await insertWithNumber({
      type: i.type,
      clientId: i.clientId,
      caseId: i.caseId,
      retainerId: i.retainerId,
      templateId: i.templateId,
      issueDate: new Date(),
      dueDate: null,
      currency: i.currency,
      subtotalUsd: i.subtotalUsd,
      taxUsd: i.taxUsd,
      totalUsd: i.totalUsd,
      notes: i.notes,
      snapshot: i.snapshot,
    });
    if (d.items.length) {
      await db.insert(invoiceItems).values(
        d.items.map((it) => ({
          invoiceId: row.id,
          position: it.position,
          description: it.description,
          quantity: it.quantity,
          unitUsd: it.unitUsd,
          amountUsd: it.amountUsd,
        })),
      );
    }
    revalidateAdmin();
    return done(`Duplicated as ${row.invoiceNumber}.`, row.id);
  } catch (error) {
    return unexpected(error, "duplicate the invoice");
  }
}
