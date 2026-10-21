/**
 * Stripe webhook. Listens for `checkout.session.completed` and records the
 * payment against the case named in `client_reference_id` (set by
 * `paymentLinkForCase`) or `metadata.caseNumber`. Idempotent on the session id.
 */
import { and, eq } from "drizzle-orm";
import Stripe from "stripe";

import { db } from "@/lib/db";
import { caseNotes, cases, payments } from "@/lib/db/schema";

let stripe: Stripe | null = null;

function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return json(
      { ok: false, error: "Stripe webhook is not configured: set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET." },
      503,
    );
  }
  stripe ??= new Stripe(secretKey);

  const signature = request.headers.get("stripe-signature");
  if (!signature) return json({ ok: false, error: "Missing stripe-signature header." }, 400);

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret);
  } catch (error) {
    console.warn("[stripe] signature check failed", error);
    return json({ ok: false, error: "Invalid signature." }, 400);
  }

  if (event.type !== "checkout.session.completed") {
    return json({ ok: true, ignored: event.type });
  }

  const session = event.data.object;
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return json({ ok: true, ignored: `payment_status ${session.payment_status}` });
  }

  const caseNumber = (session.client_reference_id || session.metadata?.caseNumber || "").trim().toUpperCase();
  if (!caseNumber) {
    console.warn(`[stripe] session ${session.id} has no case reference; record it by hand.`);
    return json({ ok: true, unmatched: true });
  }

  try {
    const row = await db.query.cases.findFirst({
      where: (c, { eq }) => eq(c.caseNumber, caseNumber),
      columns: { id: true, caseNumber: true },
    });
    if (!row) {
      console.warn(`[stripe] session ${session.id} names unknown case ${caseNumber}.`);
      return json({ ok: true, unmatched: true });
    }

    const existing = await db.query.payments.findFirst({
      where: and(eq(payments.reference, session.id), eq(payments.method, "stripe")),
      columns: { id: true },
    });
    if (existing) return json({ ok: true, duplicate: true });

    const amountUsd = Math.round((session.amount_total ?? 0) / 100);
    const currency = (session.currency ?? "usd").toUpperCase();
    const paidAt = new Date(event.created * 1000);

    await db.insert(payments).values({
      caseId: row.id,
      amountUsd,
      method: "stripe",
      status: "paid",
      reference: session.id,
      paidAt,
    });
    await db.update(cases).set({ paymentStatus: "paid" }).where(eq(cases.id, row.id));
    await db.insert(caseNotes).values({
      caseId: row.id,
      authorName: "Stripe",
      body: `Payment received by card: ${amountUsd} ${currency} (Stripe ${session.id}).`,
    });
    return json({ ok: true, caseNumber: row.caseNumber });
  } catch (error) {
    console.error("[stripe] failed to record payment", error);
    // 500 makes Stripe retry; the reference check keeps retries idempotent.
    return json({ ok: false, error: "Could not record the payment." }, 500);
  }
}
