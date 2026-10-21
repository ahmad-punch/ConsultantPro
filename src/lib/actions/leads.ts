"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/lib/db/enums";
import { caseNotes, clients, leads } from "@/lib/db/schema";
import { findAmbassadorByCode, findMatchingClients } from "@/lib/queries/leads";
import { addDays, noonUtc } from "@/lib/queries/time";
import { idField, type FormState } from "@/lib/validation/fields";
import { leadConvertSchema, leadSchema, leadUpdateSchema } from "@/lib/validation/leads";

import {
  done,
  failed,
  getActorName,
  insertCaseWithNumber,
  parseForm,
  revalidateAdmin,
  unexpected,
} from "./helpers";

export async function createLeadAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(leadSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const [row] = await db.insert(leads).values(parsed.data).returning({ id: leads.id });
    revalidateAdmin();
    return done("Lead added.", row.id);
  } catch (error) {
    return unexpected(error, "add the lead");
  }
}

export async function updateLeadAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(leadUpdateSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, ...values } = parsed.data;
  try {
    await db.update(leads).set(values).where(eq(leads.id, id));
    revalidateAdmin();
    return done("Lead saved.", id);
  } catch (error) {
    return unexpected(error, "save the lead");
  }
}

const statusSchema = z.object({ id: idField(), status: z.enum(LEAD_STATUSES) });

/** Mark contacted / Mark lost / Reopen. Conversion goes through convertLeadAction. */
export async function setLeadStatusAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(statusSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, status } = parsed.data;
  if (status === "converted") return failed("Use Convert to case instead.");
  try {
    await db.update(leads).set({ status }).where(eq(leads.id, id));
    revalidateAdmin();
    return done(`Lead marked ${LEAD_STATUS_LABELS[status].toLowerCase()}.`, id);
  } catch (error) {
    return unexpected(error, "update the lead");
  }
}

/**
 * Convert a lead: reuse a client with the same WhatsApp number or email, or
 * create one; open a case with the next case number; link the lead.
 */
export async function convertLeadAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(leadConvertSchema, formData);
  if (!parsed.ok) return parsed.state;
  const input = parsed.data;
  try {
    const lead = await db.query.leads.findFirst({ where: (l, { eq }) => eq(l.id, input.id) });
    if (!lead) return failed("That lead no longer exists.");
    if (lead.convertedCaseId) return failed("This lead is already linked to a case.");

    const actor = await getActorName();
    const ambassador = lead.referralCode ? await findAmbassadorByCode(lead.referralCode) : null;
    const [match] = await findMatchingClients(lead.whatsapp.replace(/\D/g, ""), lead.email);

    let clientId = match?.id;
    if (!clientId) {
      const [client] = await db
        .insert(clients)
        .values({
          name: lead.name,
          whatsapp: lead.whatsapp,
          email: lead.email,
          country: lead.country,
          ambassadorId: ambassador?.id ?? null,
        })
        .returning({ id: clients.id });
      clientId = client.id;
    }

    const caseId = await insertCaseWithNumber({
      clientId,
      category: lead.category,
      product: input.product,
      priceUsd: input.priceUsd,
      summary: input.summary ?? lead.description,
      caseManagerId: input.caseManagerId,
      ambassadorId: ambassador?.id ?? null,
      nextAction: "Confirm details and send the payment link",
      nextActionDue: noonUtc(addDays(new Date(), 1)),
    });

    await db.insert(caseNotes).values({
      caseId,
      authorName: actor,
      body: `Case opened from lead "${lead.name}" (source: ${lead.source}${
        lead.referralCode ? `, referral code ${lead.referralCode}` : ""
      }). ${match ? `Linked to existing client ${match.name}.` : "New client created."}`,
    });
    await db
      .update(leads)
      .set({ status: "converted", convertedCaseId: caseId })
      .where(eq(leads.id, lead.id));

    revalidateAdmin();
    return done("Lead converted. Case opened.", caseId);
  } catch (error) {
    return unexpected(error, "convert the lead");
  }
}
