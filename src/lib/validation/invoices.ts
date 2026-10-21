import { z } from "zod";

import { DOCUMENT_TYPES, PAYMENT_METHODS } from "@/lib/db/enums";

import { idField, nullableDate, nullableText, nullableUuid, requiredDate } from "./fields";

export const INVOICE_DOC_TYPES = ["invoice", "receipt", "quote"] as const satisfies readonly (typeof DOCUMENT_TYPES)[number][];

export type LineItemInput = { description: string; quantity: number; unitUsd: number };

const itemsField = z.preprocess(
  (v) => {
    if (typeof v !== "string" || v.trim() === "") return [];
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  },
  z
    .array(
      z.object({
        description: z.string().trim().min(1, "Every line needs a description.").max(500),
        quantity: z.coerce.number().int().min(1).max(10_000),
        unitUsd: z.coerce.number().int().min(0).max(1_000_000),
      }),
    )
    .min(1, "Add at least one line item.")
    .max(50),
);

export const invoiceSchema = z.object({
  type: z.enum(INVOICE_DOC_TYPES),
  clientId: idField(),
  caseId: nullableUuid(),
  templateId: nullableUuid(),
  issueDate: requiredDate(),
  dueDate: nullableDate(),
  taxUsd: z.preprocess((v) => (v === "" || v == null ? 0 : v), z.coerce.number().int().min(0).max(1_000_000)),
  notes: nullableText(5000),
  items: itemsField,
});

export const markPaidSchema = z.object({
  id: idField(),
  method: z.enum(PAYMENT_METHODS),
  reference: nullableText(200),
  paidAt: nullableDate(),
});

/** Whole-USD totals for a set of lines plus tax. */
export function computeTotals(items: LineItemInput[], taxUsd: number) {
  const lines = items.map((i) => ({ ...i, amountUsd: i.quantity * i.unitUsd }));
  const subtotalUsd = lines.reduce((s, l) => s + l.amountUsd, 0);
  return { lines, subtotalUsd, taxUsd, totalUsd: subtotalUsd + taxUsd };
}
