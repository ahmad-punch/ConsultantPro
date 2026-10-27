"use server";

import { eq } from "drizzle-orm";

import { requirePermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { CONTENT_STATUS_LABELS } from "@/lib/db/enums";
import { contentItems } from "@/lib/db/schema";
import {
  contentPostedSchema,
  contentSchema,
  contentStatusChangeSchema,
  contentUpdateSchema,
} from "@/lib/validation/content";
import type { FormState } from "@/lib/validation/fields";

import { setArchived } from "./archive-helper";
import { done, failed, parseForm, revalidateAdmin, unexpected } from "./helpers";

export async function createContentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(contentSchema, formData);
  if (!parsed.ok) return parsed.state;
  const v = parsed.data;
  try {
    const [row] = await db
      .insert(contentItems)
      .values({ ...v, postedAt: v.status === "posted" ? new Date() : null })
      .returning({ id: contentItems.id });
    revalidateAdmin();
    return done("Content item added.", row.id);
  } catch (error) {
    return unexpected(error, "add the content item");
  }
}

export async function updateContentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(contentUpdateSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, ...values } = parsed.data;
  try {
    const row = await db.query.contentItems.findFirst({ where: (c, { eq }) => eq(c.id, id) });
    if (!row) return failed("That content item no longer exists.");
    const postedAt =
      values.status === "posted" ? (row.postedAt ?? new Date()) : null;
    await db.update(contentItems).set({ ...values, postedAt }).where(eq(contentItems.id, id));
    revalidateAdmin();
    return done("Content item saved.", id);
  } catch (error) {
    return unexpected(error, "save the content item");
  }
}

export async function setContentStatusAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(contentStatusChangeSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, status } = parsed.data;
  try {
    await db
      .update(contentItems)
      .set({ status, ...(status !== "posted" ? { postedAt: null } : { postedAt: new Date() }) })
      .where(eq(contentItems.id, id));
    revalidateAdmin();
    return done(`Moved to ${CONTENT_STATUS_LABELS[status]}.`, id);
  } catch (error) {
    return unexpected(error, "change the status");
  }
}

export async function markContentPostedAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(contentPostedSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, url, postedAt } = parsed.data;
  try {
    await db
      .update(contentItems)
      .set({ status: "posted", postedAt: postedAt ?? new Date(), ...(url ? { url } : {}) })
      .where(eq(contentItems.id, id));
    revalidateAdmin();
    return done("Marked posted.", id);
  } catch (error) {
    return unexpected(error, "mark the item posted");
  }
}

export async function archiveContentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.archive");
  return setArchived("contentItems", formData, true, "content item");
}

export async function unarchiveContentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.archive");
  return setArchived("contentItems", formData, false, "content item");
}
