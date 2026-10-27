"use server";

import { eq } from "drizzle-orm";

import { requirePermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { partners } from "@/lib/db/schema";
import type { FormState } from "@/lib/validation/fields";
import { partnerSchema, partnerUpdateSchema } from "@/lib/validation/partners";

import { setArchived } from "./archive-helper";
import { done, parseForm, revalidateAdmin, unexpected } from "./helpers";

export async function createPartnerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(partnerSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const [row] = await db.insert(partners).values(parsed.data).returning({ id: partners.id });
    revalidateAdmin();
    return done("Partner added.", row.id);
  } catch (error) {
    return unexpected(error, "add the partner");
  }
}

export async function updatePartnerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(partnerUpdateSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, ...values } = parsed.data;
  try {
    await db.update(partners).set(values).where(eq(partners.id, id));
    revalidateAdmin();
    return done("Partner saved.", id);
  } catch (error) {
    return unexpected(error, "save the partner");
  }
}

export async function archivePartnerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.archive");
  return setArchived("partners", formData, true, "partner");
}

export async function unarchivePartnerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.archive");
  return setArchived("partners", formData, false, "partner");
}
