"use server";

/**
 * Public intake (the /start form). No auth: validates with zod, drops honeypot
 * submissions, rate-limits by IP in memory, then inserts a row into `leads`.
 * The in-memory limiter is per server instance; good enough for launch.
 */
import { headers } from "next/headers";
import { after } from "next/server";
import { z } from "zod";

import {
  cleanReferralCode,
  cleanSource,
  intakeSchema,
  type IntakeInput,
} from "@/components/marketing/intake/schema";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";
import { intakeConfirmationEmail } from "@/lib/email/templates";
import type { ActionResult } from "@/lib/validation/common";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  // Keep the map small on long-running instances.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return h.get("x-real-ip") ?? "unknown";
}

export async function submitPublicIntake(
  input: IntakeInput,
): Promise<ActionResult<{ reference: string }>> {
  const parsed = intakeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[] | undefined>,
    };
  }
  const values = parsed.data;

  // Honeypot filled: pretend success, store nothing.
  if (values.website) {
    return { ok: true, data: { reference: "received" } };
  }

  if (isRateLimited(await clientIp())) {
    return {
      ok: false,
      error: "You have sent several requests in a short time. Please wait a few minutes and try again.",
    };
  }

  try {
    const [row] = await db
      .insert(leads)
      .values({
        name: values.name,
        whatsapp: values.whatsapp,
        email: values.email ?? null,
        country: values.country,
        category: values.category,
        urgency: values.urgency,
        description: values.description,
        details: values.details ?? null,
        referralCode: cleanReferralCode(values.referralCode) || null,
        source: cleanSource(values.source),
        status: "new",
      })
      .returning({ id: leads.id });
    const reference = row.id.slice(0, 8).toUpperCase();
    const email = values.email;
    if (email) {
      // After the response is sent; never blocks or fails the form.
      after(async () => {
        await sendEmail({ to: email, ...intakeConfirmationEmail({ name: values.name, reference }) });
      });
    }
    return { ok: true, data: { reference } };
  } catch (error) {
    console.error("submitPublicIntake failed", error);
    return {
      ok: false,
      error: "Something went wrong on our side and your request was not saved. Please try again.",
    };
  }
}
