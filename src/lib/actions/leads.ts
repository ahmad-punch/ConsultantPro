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
import { labelledDetails } from "@/components/marketing/intake/details-questions";
import {
  LEAD_IMPORT_COLUMNS,
  leadImportRowSchema,
  type ImportPreview,
  type ImportResult,
} from "@/lib/validation/imports";
import { leadConvertSchema, leadSchema, leadUpdateSchema } from "@/lib/validation/leads";
import { toPreview, validateCsv } from "@/lib/import/validate-rows";

import { setArchived } from "./archive-helper";
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
      summary: [
        input.summary ?? lead.description,
        ...labelledDetails(lead.category, lead.details).map((r) => `${r.label}: ${r.value}`),
      ].join("\n"),
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

export async function archiveLeadAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  return setArchived("leads", formData, true, "lead");
}

export async function unarchiveLeadAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  return setArchived("leads", formData, false, "lead");
}

/* ------------------------------------------------------- CSV import */

const waDigits = (v: string) => v.replace(/\D/g, "");

async function validateLeadCsv(text: string) {
  const existing = await db.select({ whatsapp: leads.whatsapp }).from(leads);
  return validateCsv(
    text,
    LEAD_IMPORT_COLUMNS,
    ["name", "whatsapp", "country", "category", "description"],
    leadImportRowSchema,
    (r) => waDigits(r.whatsapp),
    new Set(existing.map((l) => waDigits(l.whatsapp))),
  );
}

/** Preview: parse and validate pasted CSV without writing anything. */
export async function previewLeadImportAction(text: string): Promise<ImportPreview> {
  await requireAdmin();
  return toPreview(await validateLeadCsv(String(text ?? "")));
}

/** Insert the valid rows whose WhatsApp number is not already a lead. */
export async function importLeadsAction(text: string): Promise<ImportResult> {
  await requireAdmin();
  const result = await validateLeadCsv(String(text ?? ""));
  if (!result.ok) return { ok: false, error: result.error, imported: 0, skipped: 0 };
  const values = result.parsed
    .filter((r) => r !== null)
    .map((r) => ({
      name: r.name,
      whatsapp: r.whatsapp,
      email: r.email,
      country: r.country,
      category: r.category,
      urgency: r.urgency,
      description: r.description,
      referralCode: r.referral_code,
      source: r.source,
    }));
  const skipped = result.rows.length - values.length;
  try {
    if (values.length) await db.insert(leads).values(values);
    revalidateAdmin();
    return { ok: true, message: `Imported ${values.length} leads; skipped ${skipped}.`, imported: values.length, skipped };
  } catch (error) {
    console.error("[admin] import leads failed", error);
    return { ok: false, error: "Could not import the leads. Nothing was saved.", imported: 0, skipped: 0 };
  }
}
