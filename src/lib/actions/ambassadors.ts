"use server";

import { eq, sql } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { ambassadors } from "@/lib/db/schema";
import { formatUsd } from "@/lib/pricing";
import {
  ambassadorPayoutSchema,
  ambassadorSchema,
  ambassadorUpdateSchema,
} from "@/lib/validation/ambassadors";
import type { FormState } from "@/lib/validation/fields";

import { done, failed, isUniqueViolation, parseForm, revalidateAdmin, unexpected } from "./helpers";

const CODE_TAKEN = "That referral code is already used by another ambassador.";

export async function createAmbassadorAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(ambassadorSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const [row] = await db.insert(ambassadors).values(parsed.data).returning({ id: ambassadors.id });
    revalidateAdmin();
    return done("Ambassador added.", row.id);
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: CODE_TAKEN, fieldErrors: { referralCode: [CODE_TAKEN] } };
    return unexpected(error, "add the ambassador");
  }
}

export async function updateAmbassadorAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(ambassadorUpdateSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, ...values } = parsed.data;
  try {
    await db.update(ambassadors).set(values).where(eq(ambassadors.id, id));
    revalidateAdmin();
    return done("Ambassador saved.", id);
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: CODE_TAKEN, fieldErrors: { referralCode: [CODE_TAKEN] } };
    return unexpected(error, "save the ambassador");
  }
}

/** Record a commission payout: adds to totalPaidUsd. */
export async function recordPayoutAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(ambassadorPayoutSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, amountUsd } = parsed.data;
  try {
    const updated = await db
      .update(ambassadors)
      .set({ totalPaidUsd: sql`${ambassadors.totalPaidUsd} + ${amountUsd}` })
      .where(eq(ambassadors.id, id))
      .returning({ id: ambassadors.id });
    if (!updated.length) return failed("That ambassador no longer exists.");
    revalidateAdmin();
    return done(`Payout of ${formatUsd(amountUsd)} recorded.`, id);
  } catch (error) {
    return unexpected(error, "record the payout");
  }
}
