"use server";

import { eq } from "drizzle-orm";

import { requirePermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { ENGAGEMENT_STATUS_LABELS } from "@/lib/db/enums";
import { caseNotes, partnerEngagements, partners } from "@/lib/db/schema";
import { getProviderStats } from "@/lib/queries/network";
import {
  ENGAGEMENT_NEXT,
  NO_POACHING_POLICY,
  engagementSchema,
  engagementStatusSchema,
  rateEngagementSchema,
} from "@/lib/validation/engagements";
import type { FormState } from "@/lib/validation/fields";

import { done, failed, getActorName, parseForm, revalidateAdmin, unexpected } from "./helpers";

async function note(caseId: string, body: string) {
  await db.insert(caseNotes).values({ caseId, authorName: await getActorName(), body });
}

export async function createEngagementAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(engagementSchema, formData);
  if (!parsed.ok) return parsed.state;
  const v = parsed.data;
  try {
    const [p] = await db.select().from(partners).where(eq(partners.id, v.partnerId)).limit(1);
    if (!p) return failed("Provider not found.");
    if (p.onboardingStage === "suspended") return failed("This provider is suspended.");
    if (!p.noPoachingAcceptedAt) return failed("This provider has not signed the agreement with the no-poaching clause.");
    if (p.type === "advocate" && v.feeBilledBy !== "partner") return failed("Advocates bill the client directly on their own letterhead. Choose \"Provider bills client directly\".");
    const dueAt = v.dueAt ?? (v.slaDays ? new Date(Date.now() + v.slaDays * 86_400_000) : null);
    const [row] = await db
      .insert(partnerEngagements)
      .values({ ...v, role: p.type, slaDays: v.slaDays ?? p.slaDays, dueAt, notes: [NO_POACHING_POLICY, v.notes].filter(Boolean).join("\n\n") })
      .returning({ id: partnerEngagements.id });
    await note(v.caseId, `Engagement proposed to ${p.name} (${v.department ?? "office not set"}, ${v.locationCity ?? "city not set"}), fee $${v.agreedFeeUsd}, billed by ${v.feeBilledBy === "partner" ? "the provider" : "Rasta"}.`);
    revalidateAdmin();
    return done("Engagement proposed.", row.id);
  } catch (error) {
    return unexpected(error, "create the engagement");
  }
}

export async function setEngagementStatusAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(engagementStatusSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, status } = parsed.data;
  try {
    const [e] = await db.select().from(partnerEngagements).where(eq(partnerEngagements.id, id)).limit(1);
    if (!e) return failed("Engagement not found.");
    if (!ENGAGEMENT_NEXT[e.status].includes(status)) {
      return failed(`Cannot move from ${ENGAGEMENT_STATUS_LABELS[e.status]} to ${ENGAGEMENT_STATUS_LABELS[status]}.`);
    }
    const now = new Date();
    const patch: Partial<typeof partnerEngagements.$inferInsert> = { status };
    if (status === "accepted") patch.noPoachingAcknowledgedAt = now;
    if (status === "in_progress" && !e.startedAt) patch.startedAt = now;
    if (status === "delivered") patch.deliveredAt = now;
    if (status === "completed") patch.completedAt = now;
    await db.update(partnerEngagements).set(patch).where(eq(partnerEngagements.id, id));
    const [p] = await db.select({ name: partners.name }).from(partners).where(eq(partners.id, e.partnerId)).limit(1);
    await note(
      e.caseId,
      status === "accepted"
        ? `${p?.name ?? "Provider"} accepted the engagement and acknowledged the no-poaching policy. Client contact details may now be shared.`
        : `Engagement with ${p?.name ?? "provider"}: ${ENGAGEMENT_STATUS_LABELS[status]}.`,
    );
    if (status === "completed") await refreshPartnerStats(e.partnerId);
    revalidateAdmin();
    return done(`Engagement ${ENGAGEMENT_STATUS_LABELS[status].toLowerCase()}.`, id);
  } catch (error) {
    return unexpected(error, "update the engagement");
  }
}

async function refreshPartnerStats(partnerId: string) {
  const stats = (await getProviderStats([partnerId])).get(partnerId)!;
  await db
    .update(partners)
    .set({ casesCompleted: stats.completed, avgRating: stats.avgRating == null ? null : Math.round(stats.avgRating) })
    .where(eq(partners.id, partnerId));
}

export async function rateEngagementAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(rateEngagementSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, rating, ratingNote } = parsed.data;
  try {
    const [e] = await db.select().from(partnerEngagements).where(eq(partnerEngagements.id, id)).limit(1);
    if (!e) return failed("Engagement not found.");
    if (e.status !== "completed") return failed("Rate an engagement once it is completed.");
    await db.update(partnerEngagements).set({ rating, ratingNote }).where(eq(partnerEngagements.id, id));
    await refreshPartnerStats(e.partnerId);
    await note(e.caseId, `Provider rated ${rating}/5${ratingNote ? `: ${ratingNote}` : ""}.`);
    revalidateAdmin();
    return done("Rating saved.", id);
  } catch (error) {
    return unexpected(error, "save the rating");
  }
}
