"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { channels } from "@/lib/db/schema";
import { channelSchema, channelUpdateSchema } from "@/lib/validation/channels";
import { idField, type FormState } from "@/lib/validation/fields";

import { done, failed, parseForm, revalidateAdmin, unexpected } from "./helpers";

export async function createChannelAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
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
