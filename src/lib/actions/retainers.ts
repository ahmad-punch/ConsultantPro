"use server";

import { and, eq } from "drizzle-orm";

import { requirePermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { retainers } from "@/lib/db/schema";
import type { FormState } from "@/lib/validation/fields";
import { retainerIdSchema, retainerSchema } from "@/lib/validation/retainers";

import { done, failed, parseForm, revalidateAdmin, unexpected } from "./helpers";

export async function createRetainerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(retainerSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const [row] = await db.insert(retainers).values(parsed.data).returning({ id: retainers.id });
    revalidateAdmin();
    return done("Retainer started.", row.id);
  } catch (error) {
    return unexpected(error, "start the retainer");
  }
}

export async function cancelRetainerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(retainerIdSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const updated = await db
      .update(retainers)
      .set({ status: "cancelled", cancelledAt: new Date() })
      .where(and(eq(retainers.id, parsed.data.id), eq(retainers.status, "active")))
      .returning({ id: retainers.id });
    if (!updated.length) return failed("That retainer is not active.");
    revalidateAdmin();
    return done("Retainer cancelled.", parsed.data.id);
  } catch (error) {
    return unexpected(error, "cancel the retainer");
  }
}
