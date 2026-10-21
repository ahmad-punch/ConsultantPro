/**
 * Shared archive / unarchive plumbing. Archiving sets `archivedAt`; lists hide
 * archived rows unless `?archived=1`. Not a "use server" file: call from
 * action modules after requireAdmin().
 */
import "server-only";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { ambassadors, cases, channels, clients, contentItems, leads, partners } from "@/lib/db/schema";
import { idField, type FormState } from "@/lib/validation/fields";

import { done, failed, parseForm, revalidateAdmin, unexpected } from "./helpers";

const TABLES = { cases, leads, clients, partners, ambassadors, channels, contentItems } as const;
export type ArchivableTable = keyof typeof TABLES;

/** Set or clear archivedAt on one row. Returns the FormState for the toast. */
export async function setArchived(
  table: ArchivableTable,
  formData: FormData,
  archive: boolean,
  noun: string,
  after?: (id: string) => Promise<void>,
): Promise<FormState> {
  const parsed = parseForm(z.object({ id: idField() }), formData);
  if (!parsed.ok) return parsed.state;
  const t = TABLES[table];
  try {
    const updated = await db
      .update(t)
      .set({ archivedAt: archive ? new Date() : null })
      .where(eq(t.id, parsed.data.id))
      .returning({ id: t.id });
    if (!updated.length) return failed(`That ${noun} no longer exists.`);
    if (after) await after(parsed.data.id);
    revalidateAdmin();
    return done(archive ? `${capitalise(noun)} archived.` : `${capitalise(noun)} restored.`, parsed.data.id);
  } catch (error) {
    return unexpected(error, `${archive ? "archive" : "unarchive"} the ${noun}`);
  }
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
