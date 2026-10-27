"use server";

import { asc, eq } from "drizzle-orm";

import { requirePermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { brandingSettings } from "@/lib/db/schema";
import { brandingSchema } from "@/lib/validation/documents";
import type { FormState } from "@/lib/validation/fields";

import { done, parseForm, revalidateAdmin, unexpected } from "./helpers";

/** Save the single branding row (insert the first time, update after). */
export async function saveBrandingAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("documents.templates");
  const parsed = parseForm(brandingSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const [existing] = await db
      .select({ id: brandingSettings.id })
      .from(brandingSettings)
      .orderBy(asc(brandingSettings.createdAt))
      .limit(1);
    if (existing) {
      await db.update(brandingSettings).set(parsed.data).where(eq(brandingSettings.id, existing.id));
    } else {
      await db.insert(brandingSettings).values(parsed.data);
    }
    revalidateAdmin();
    return done("Branding saved. New documents will use it.");
  } catch (error) {
    return unexpected(error, "save the branding");
  }
}
