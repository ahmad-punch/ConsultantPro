"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { requirePermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { ambassadors, channels } from "@/lib/db/schema";
import { toPreview, validateCsv } from "@/lib/import/validate-rows";
import { channelSchema, channelUpdateSchema } from "@/lib/validation/channels";
import { idField, type FormState } from "@/lib/validation/fields";
import {
  CHANNEL_IMPORT_COLUMNS,
  channelImportRowSchema,
  type ImportPreview,
  type ImportResult,
} from "@/lib/validation/imports";

import { setArchived } from "./archive-helper";
import { done, failed, parseForm, revalidateAdmin, unexpected } from "./helpers";

export async function createChannelAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(channelSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const [row] = await db.insert(channels).values(parsed.data).returning({ id: channels.id });
    revalidateAdmin();
    return done("Channel added.", row.id);
  } catch (error) {
    return unexpected(error, "add the channel");
  }
}

export async function updateChannelAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(channelUpdateSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, ...values } = parsed.data;
  try {
    await db.update(channels).set(values).where(eq(channels.id, id));
    revalidateAdmin();
    return done("Channel saved.", id);
  } catch (error) {
    return unexpected(error, "save the channel");
  }
}

/** "Log post": stamp lastPostedAt now and set status to posted. */
export async function logChannelPostAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(z.object({ id: idField() }), formData);
  if (!parsed.ok) return parsed.state;
  try {
    const updated = await db
      .update(channels)
      .set({ lastPostedAt: new Date(), status: "posted" })
      .where(eq(channels.id, parsed.data.id))
      .returning({ name: channels.name });
    if (!updated.length) return failed("That channel no longer exists.");
    revalidateAdmin();
    return done(`Post logged for ${updated[0].name}.`, parsed.data.id);
  } catch (error) {
    return unexpected(error, "log the post");
  }
}

export async function archiveChannelAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.archive");
  return setArchived("channels", formData, true, "channel");
}

export async function unarchiveChannelAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.archive");
  return setArchived("channels", formData, false, "channel");
}

/* ------------------------------------------------------- CSV import */

async function validateChannelCsv(text: string) {
  const [existing, ambassadorRows] = await Promise.all([
    db.select({ name: channels.name, platform: channels.platform }).from(channels),
    db.select({ id: ambassadors.id, name: ambassadors.name, code: ambassadors.referralCode }).from(ambassadors),
  ]);
  const keys = new Set(existing.map((c) => channelKey(c.name, c.platform)));
  const result = validateCsv(
    text,
    CHANNEL_IMPORT_COLUMNS,
    ["name", "platform"],
    channelImportRowSchema,
    (r) => channelKey(r.name, r.platform),
    keys,
  );
  const findAmbassador = (v: string | null) => {
    if (!v) return null;
    const k = v.trim().toLowerCase();
    return ambassadorRows.find((a) => a.code.toLowerCase() === k || a.name.toLowerCase() === k)?.id ?? null;
  };
  return { result, findAmbassador };
}

const channelKey = (name: string, platform: string) => `${name.trim().toLowerCase()}|${platform}`;

/** Preview: parse and validate pasted CSV without writing anything. */
export async function previewChannelImportAction(text: string): Promise<ImportPreview> {
  await requirePermission("records.edit");
  const { result } = await validateChannelCsv(String(text ?? ""));
  return toPreview(result);
}

/** Insert the valid, non-duplicate rows. Duplicates are by name + platform. */
export async function importChannelsAction(text: string): Promise<ImportResult> {
  await requirePermission("records.edit");
  const { result, findAmbassador } = await validateChannelCsv(String(text ?? ""));
  if (!result.ok) return { ok: false, error: result.error, imported: 0, skipped: 0 };
  const values = result.parsed
    .filter((r) => r !== null)
    .map((r) => ({
      name: r.name,
      platform: r.platform,
      country: r.country,
      memberCount: r.member_count,
      adminContact: r.admin_contact,
      status: r.status,
      ambassadorId: findAmbassador(r.ambassador),
      notes: r.notes,
    }));
  const skipped = result.rows.length - values.length;
  try {
    if (values.length) await db.insert(channels).values(values);
    revalidateAdmin();
    return { ok: true, message: `Imported ${values.length} channels; skipped ${skipped}.`, imported: values.length, skipped };
  } catch (error) {
    console.error("[admin] import channels failed", error);
    return { ok: false, error: "Could not import the channels. Nothing was saved.", imported: 0, skipped: 0 };
  }
}
