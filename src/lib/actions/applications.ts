"use server";

import { eq } from "drizzle-orm";

import { requirePermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { ambassadors, partnerApplications, partners } from "@/lib/db/schema";
import {
  AREAS_PREFIX,
  DEPT_PREFIX,
  applicationNotesSchema,
  applicationStatusSchema,
  readTaggedLine,
  rejectApplicationSchema,
} from "@/lib/validation/applications";
import type { FormState } from "@/lib/validation/fields";
import { idField } from "@/lib/validation/fields";
import { z } from "zod";

import { done, failed, isUniqueViolation, parseForm, revalidateAdmin, unexpected } from "./helpers";

export async function setApplicationStatusAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(applicationStatusSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, status } = parsed.data;
  if (status === "approved") return failed("Use \"Approve and create provider\" to approve.");
  try {
    await db.update(partnerApplications).set({ status, reviewedAt: new Date() }).where(eq(partnerApplications.id, id));
    revalidateAdmin();
    return done("Application updated.", id);
  } catch (error) {
    return unexpected(error, "update the application");
  }
}

export async function saveApplicationNotesAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(applicationNotesSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    await db.update(partnerApplications).set({ notes: parsed.data.notes }).where(eq(partnerApplications.id, parsed.data.id));
    revalidateAdmin();
    return done("Notes saved.", parsed.data.id);
  } catch (error) {
    return unexpected(error, "save the notes");
  }
}

export async function rejectApplicationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(rejectApplicationSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, reason } = parsed.data;
  try {
    const [app] = await db.select().from(partnerApplications).where(eq(partnerApplications.id, id)).limit(1);
    if (!app) return failed("Application not found.");
    const notes = [app.notes, `Rejected ${new Date().toISOString().slice(0, 10)}: ${reason}`].filter(Boolean).join("\n");
    await db.update(partnerApplications).set({ status: "rejected", reviewedAt: new Date(), notes }).where(eq(partnerApplications.id, id));
    revalidateAdmin();
    return done("Application rejected.", id);
  } catch (error) {
    return unexpected(error, "reject the application");
  }
}

function referralCodeFor(name: string): string {
  const stem = name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6) || "AMB";
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${stem}${n}`;
}

/**
 * Approve: create a partners row (starts at onboardingStage "applied" and
 * inactive; "Mark agreement sent" moves it on) or, for an
 * ambassador, an ambassadors row with a generated referral code. Links the
 * application to the new row. No transaction (Neon HTTP): insert first, then
 * update the application; a failure in between leaves an unlinked row that is
 * visible in the directory.
 */
export async function approveApplicationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(z.object({ id: idField() }), formData);
  if (!parsed.ok) return parsed.state;
  const { id } = parsed.data;
  try {
    const [app] = await db.select().from(partnerApplications).where(eq(partnerApplications.id, id)).limit(1);
    if (!app) return failed("Application not found.");
    if (app.convertedPartnerId || app.convertedAmbassadorId) return failed("This application is already approved.");

    if (app.type === "ambassador") {
      let ambassadorId: string | null = null;
      for (let attempt = 0; attempt < 3 && !ambassadorId; attempt++) {
        try {
          const [row] = await db
            .insert(ambassadors)
            .values({
              name: app.name,
              country: app.country,
              city: app.city,
              whatsapp: app.whatsapp,
              referralCode: referralCodeFor(app.name),
              notes: app.channelOrNetwork ? `Community: ${app.channelOrNetwork}` : null,
            })
            .returning({ id: ambassadors.id });
          ambassadorId = row.id;
        } catch (error) {
          if (!isUniqueViolation(error)) throw error;
        }
      }
      if (!ambassadorId) return failed("Could not generate a unique referral code. Try again.");
      await db
        .update(partnerApplications)
        .set({ status: "approved", reviewedAt: new Date(), convertedAmbassadorId: ambassadorId })
        .where(eq(partnerApplications.id, id));
      revalidateAdmin();
      return done("Ambassador created with a referral code.", ambassadorId);
    }

    const [row] = await db
      .insert(partners)
      .values({
        name: app.name,
        type: app.type,
        city: app.city,
        whatsapp: app.whatsapp,
        email: app.email,
        ownLetterhead: app.type === "advocate",
        barCouncilNumber: app.barCouncilNumber,
        specialties: app.specialties,
        departments: readTaggedLine(app.notes, DEPT_PREFIX),
        serviceAreas: readTaggedLine(app.notes, AREAS_PREFIX) ?? app.city,
        languages: app.languages,
        bio: app.bio,
        tier: "probation",
        onboardingStage: "applied",
        active: false,
      })
      .returning({ id: partners.id });
    await db
      .update(partnerApplications)
      .set({ status: "approved", reviewedAt: new Date(), convertedPartnerId: row.id })
      .where(eq(partnerApplications.id, id));
    revalidateAdmin();
    return done("Provider created. Next: send the agreement.", row.id);
  } catch (error) {
    return unexpected(error, "approve the application");
  }
}
