"use server";

import { eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { clientSchema, clientUpdateSchema } from "@/lib/validation/clients";
import type { FormState } from "@/lib/validation/fields";

import { setArchived } from "./archive-helper";
import { done, parseForm, revalidateAdmin, unexpected } from "./helpers";

export async function createClientAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(clientSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const [row] = await db.insert(clients).values(parsed.data).returning({ id: clients.id });
    revalidateAdmin();
    return done("Client added.", row.id);
  } catch (error) {
    return unexpected(error, "add the client");
  }
}

export async function updateClientAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(clientUpdateSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, ...values } = parsed.data;
  try {
    await db.update(clients).set(values).where(eq(clients.id, id));
    revalidateAdmin();
    return done("Client saved.", id);
  } catch (error) {
    return unexpected(error, "save the client");
  }
}

export async function archiveClientAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  return setArchived("clients", formData, true, "client");
}

export async function unarchiveClientAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  return setArchived("clients", formData, false, "client");
}
