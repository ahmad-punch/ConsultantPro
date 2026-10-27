"use server";

import { eq } from "drizzle-orm";

import { requirePermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/db/enums";
import { caseNotes, cases, payments } from "@/lib/db/schema";
import { formatUsd } from "@/lib/pricing";
import type { FormState } from "@/lib/validation/fields";
import { paymentSchema } from "@/lib/validation/payments";

import { done, getActorName, parseForm, revalidateAdmin, unexpected } from "./helpers";

/**
 * Record a payment against a case or a retainer. For a case, the case's
 * paymentStatus follows the payment (paid or refunded) and a note is logged.
 */
export async function createPaymentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(paymentSchema, formData);
  if (!parsed.ok) return parsed.state;
  const v = parsed.data;
  try {
    const paidAt = v.paidAt ?? (v.status === "unpaid" ? null : new Date());
    const [row] = await db
      .insert(payments)
      .values({ ...v, paidAt })
      .returning({ id: payments.id });
    if (v.caseId) {
      if (v.status !== "unpaid") {
        await db.update(cases).set({ paymentStatus: v.status }).where(eq(cases.id, v.caseId));
      }
      await db.insert(caseNotes).values({
        caseId: v.caseId,
        authorName: await getActorName(),
        body: `Payment recorded: ${formatUsd(v.amountUsd)} via ${PAYMENT_METHOD_LABELS[v.method]} (${PAYMENT_STATUS_LABELS[v.status].toLowerCase()})${v.reference ? `, ref ${v.reference}` : ""}.`,
      });
    }
    revalidateAdmin();
    return done(`Payment of ${formatUsd(v.amountUsd)} recorded.`, row.id);
  } catch (error) {
    return unexpected(error, "record the payment");
  }
}
