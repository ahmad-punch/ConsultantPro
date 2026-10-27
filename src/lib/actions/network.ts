"use server";

import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { requirePermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { PARTNER_TIERS } from "@/lib/db/enums";
import { caseNotes, cases, partnerEngagements, partners } from "@/lib/db/schema";
import { computeTier, getProviderStats } from "@/lib/queries/network";
import { NO_POACHING_POLICY } from "@/lib/validation/engagements";
import { idField, nullableText, type FormState } from "@/lib/validation/fields";

import { done, failed, getActorName, parseForm, revalidateAdmin, unexpected } from "./helpers";

const idOnly = z.object({ id: idField() });

async function setStage(formData: FormData, stage: "agreement_sent" | "trial_case" | "active", message: string): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(idOnly, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const [p] = await db.select().from(partners).where(eq(partners.id, parsed.data.id)).limit(1);
    if (!p) return failed("Provider not found.");
    if ((stage === "trial_case" || stage === "active") && (!p.agreementSignedAt || !p.noPoachingAcceptedAt)) {
      return failed("Record the signed agreement (with no-poaching accepted) first.");
    }
    await db
      .update(partners)
      .set({ onboardingStage: stage, active: stage === "trial_case" || stage === "active" ? true : p.active })
      .where(eq(partners.id, p.id));
    revalidateAdmin();
    return done(message, p.id);
  } catch (error) {
    return unexpected(error, "update the provider");
  }
}

export async function markAgreementSentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return setStage(formData, "agreement_sent", "Agreement marked as sent.");
}

export async function startTrialAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return setStage(formData, "trial_case", "Trial case stage started.");
}

export async function activateProviderAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return setStage(formData, "active", "Provider is active.");
}

const signedSchema = z.object({
  id: idField(),
  agreementVersion: z.string().trim().min(1, "Enter the agreement version.").max(40),
  signedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter the date signed."),
  noPoaching: z.literal("on", "The no-poaching clause must be accepted."),
});

export async function recordAgreementSignedAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(signedSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, agreementVersion, signedOn } = parsed.data;
  const at = new Date(`${signedOn}T12:00:00Z`);
  try {
    await db
      .update(partners)
      .set({ onboardingStage: "agreement_signed", agreementVersion, agreementSignedAt: at, noPoachingAcceptedAt: at })
      .where(eq(partners.id, id));
    revalidateAdmin();
    return done("Signed agreement recorded.", id);
  } catch (error) {
    return unexpected(error, "record the agreement");
  }
}

const suspendSchema = z.object({ id: idField(), reason: z.string().trim().min(3, "Give a reason.").max(1000) });

export async function suspendProviderAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(suspendSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, reason } = parsed.data;
  try {
    const [p] = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
    if (!p) return failed("Provider not found.");
    const stamp = `Suspended ${new Date().toISOString().slice(0, 10)} by ${await getActorName()}: ${reason}`;
    await db
      .update(partners)
      .set({ onboardingStage: "suspended", active: false, availabilityNote: stamp })
      .where(eq(partners.id, id));
    revalidateAdmin();
    return done("Provider suspended.", id);
  } catch (error) {
    return unexpected(error, "suspend the provider");
  }
}

const tierSchema = z.object({ id: idField(), tier: z.enum(PARTNER_TIERS) });

/** Applies a tier chosen by staff (the page suggests one from computeTier; nothing is written automatically). */
export async function applyTierAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(tierSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const [p] = await db.select().from(partners).where(eq(partners.id, parsed.data.id)).limit(1);
    if (!p) return failed("Provider not found.");
    const stats = (await getProviderStats([p.id])).get(p.id)!;
    const suggested = computeTier(p, stats);
    if (suggested !== parsed.data.tier) return failed("The suggested tier changed. Reload the page.");
    await db.update(partners).set({ tier: suggested }).where(eq(partners.id, p.id));
    revalidateAdmin();
    return done(`Tier set to ${suggested}.`, p.id);
  } catch (error) {
    return unexpected(error, "apply the tier");
  }
}

/* ------------------------------------------------------------ dispatch */

const batchSchema = z.object({
  partnerId: z.uuid("Choose a provider."),
  city: nullableText(100),
  department: nullableText(100),
  agreedFeeUsd: z.coerce.number().int().min(0).max(100_000).default(0),
  visitOn: nullableText(20),
});

/**
 * Create batch: assign one provider to several items (case ids for unassigned
 * cases, engagement ids for open proposed engagements) with a shared batchKey.
 * Form fields: `caseIds` and `engagementIds` (repeated).
 */
export async function createBatchAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(batchSchema, formData);
  if (!parsed.ok) return parsed.state;
  const caseIds = formData.getAll("caseIds").map(String).filter((v) => z.uuid().safeParse(v).success);
  const engagementIds = formData.getAll("engagementIds").map(String).filter((v) => z.uuid().safeParse(v).success);
  if (caseIds.length + engagementIds.length === 0) return failed("Tick at least one item for the batch.");
  const { partnerId, city, department, agreedFeeUsd, visitOn } = parsed.data;
  const day = visitOn && /^\d{4}-\d{2}-\d{2}$/.test(visitOn) ? visitOn : new Date().toISOString().slice(0, 10);
  const batchKey = `${day}-${(city ?? "any").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${(department ?? "any").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random().toString(36).slice(2, 6)}`;
  try {
    const [p] = await db.select().from(partners).where(eq(partners.id, partnerId)).limit(1);
    if (!p) return failed("Provider not found.");
    if (p.onboardingStage === "suspended") return failed("This provider is suspended.");
    const actor = await getActorName();
    const dueAt = new Date(`${day}T12:00:00Z`);
    if (caseIds.length) {
      await db.insert(partnerEngagements).values(
        caseIds.map((caseId) => ({
          caseId,
          partnerId,
          role: p.type,
          agreedFeeUsd,
          feeBilledBy: "company",
          department,
          locationCity: city,
          batchKey,
          dueAt,
          notes: NO_POACHING_POLICY,
        })),
      );
    }
    if (engagementIds.length) {
      await db
        .update(partnerEngagements)
        .set({ partnerId, batchKey })
        .where(and(inArray(partnerEngagements.id, engagementIds), eq(partnerEngagements.status, "proposed")));
    }
    const affected = new Set(caseIds);
    if (engagementIds.length) {
      const rows = await db.select({ caseId: partnerEngagements.caseId }).from(partnerEngagements).where(inArray(partnerEngagements.id, engagementIds));
      rows.forEach((r) => affected.add(r.caseId));
    }
    if (affected.size) {
      await db.insert(caseNotes).values(
        [...affected].map((caseId) => ({ caseId, authorName: actor, body: `Added to batch ${batchKey} with ${p.name} (${department ?? "office"} in ${city ?? "city"}, ${day}).` })),
      );
    }
    revalidateAdmin();
    return done(`Batch ${batchKey} created with ${caseIds.length + engagementIds.length} item(s).`);
  } catch (error) {
    return unexpected(error, "create the batch");
  }
}

const goingInSchema = z.object({
  partnerId: z.uuid("Choose a provider."),
  city: z.string().trim().min(1, "Enter the city.").max(100),
  department: z.string().trim().min(1, "Choose the office.").max(100),
});

/**
 * "Going in": a provider is visiting an office today. Records a note on every
 * open case already engaged with that provider in that city + office, and
 * returns; the dispatch page then highlights the group so staff can add
 * other pending items to the batch.
 */
export async function goingInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(goingInSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { partnerId, city, department } = parsed.data;
  try {
    const [p] = await db.select().from(partners).where(eq(partners.id, partnerId)).limit(1);
    if (!p) return failed("Provider not found.");
    const mine = await db
      .select({ caseId: partnerEngagements.caseId })
      .from(partnerEngagements)
      .innerJoin(cases, eq(cases.id, partnerEngagements.caseId))
      .where(and(eq(partnerEngagements.partnerId, partnerId), inArray(partnerEngagements.status, ["proposed", "accepted", "in_progress"])));
    const today = new Date().toISOString().slice(0, 10);
    if (mine.length) {
      const actor = await getActorName();
      await db.insert(caseNotes).values(mine.map((m) => ({ caseId: m.caseId, authorName: actor, body: `${p.name} is going in to ${department}, ${city} on ${today}.` })));
    }
    revalidateAdmin();
    return done(`Recorded: ${p.name} at ${department}, ${city} today. Add other pending items in that group to the batch.`);
  } catch (error) {
    return unexpected(error, "record the visit");
  }
}
