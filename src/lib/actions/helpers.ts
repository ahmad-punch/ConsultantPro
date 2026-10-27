/**
 * Shared plumbing for control-panel server actions. Not a "use server" file:
 * import from action modules only.
 */
import "server-only";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";
import { nextCaseNumber } from "@/lib/ids";
import type { FormState } from "@/lib/validation/fields";

export const ACTOR_COOKIE = "rasta_actor";
const FALLBACK_ACTOR = "Control panel";

/** FormData to a plain object for zod. Ignores React's internal $ACTION fields. */
export function formToObject(formData: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("$ACTION")) continue;
    out[key] = value;
  }
  return out;
}

type Parsed<T> = { ok: true; data: T } | { ok: false; state: FormState };

export function parseForm<S extends z.ZodType>(schema: S, formData: FormData): Parsed<z.output<S>> {
  const result = schema.safeParse(formToObject(formData));
  if (result.success) return { ok: true, data: result.data };
  const flat = z.flattenError(result.error);
  const fieldErrors = flat.fieldErrors as Record<string, string[] | undefined>;
  const first = flat.formErrors[0] ?? Object.values(fieldErrors).flat()[0];
  return {
    ok: false,
    state: {
      ok: false,
      error: first ? `Please fix: ${first}` : "Please check the form.",
      fieldErrors,
    },
  };
}

export const done = (message: string, id?: string): FormState => ({
  ok: true,
  message,
  data: id ? { id } : undefined,
});

export const failed = (error: string): FormState => ({ ok: false, error });

/** Refresh every control-panel page (they are all request-time rendered). */
export function revalidateAdmin() {
  revalidatePath("/admin", "layout");
}

/** Postgres unique violation, through Drizzle's error wrapper or not. */
export function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } } | null;
  return e?.code === "23505" || e?.cause?.code === "23505";
}

/** Log and convert an unexpected error into a toast-friendly result. */
export function unexpected(error: unknown, what: string): FormState {
  console.error(`[admin] ${what} failed`, error);
  return failed(`Could not ${what}. Try again; if it keeps failing, check the server log.`);
}

/**
 * Name used on case notes: the team member chosen under Settings ("Acting as"),
 * else the signed-in email, else a generic label.
 */
export async function getActorName(): Promise<string> {
  const store = await cookies();
  const raw = store.get(ACTOR_COOKIE)?.value;
  const fallback = (await getSession())?.email.slice(0, 100) || FALLBACK_ACTOR;
  if (!raw) return fallback;
  try {
    return decodeURIComponent(raw).slice(0, 100) || fallback;
  } catch {
    return fallback;
  }
}

type CaseInsert = Omit<typeof cases.$inferInsert, "caseNumber">;

/**
 * Insert a case with the next RS-0000 number, retrying once on a collision.
 * Not a server action: call only after requireAdmin().
 */
export async function insertCaseWithNumber(values: CaseInsert): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    try {
      const caseNumber = await nextCaseNumber();
      const [row] = await db
        .insert(cases)
        .values({ ...values, caseNumber })
        .returning({ id: cases.id });
      return row.id;
    } catch (error) {
      if (attempt === 0 && isUniqueViolation(error)) continue;
      throw error;
    }
  }
}
