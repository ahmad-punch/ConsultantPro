"use server";

/**
 * Public "Work with us" form (/partners/apply, /partners/ambassadors). No auth:
 * validates with zod, drops honeypot submissions, rate-limits by IP in memory,
 * then inserts a row into `partner_applications` with status "new".
 */
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/lib/db";
import { partnerApplications } from "@/lib/db/schema";
import { AREAS_PREFIX, DEPT_PREFIX, publicApplicationSchema } from "@/lib/validation/applications";
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
  if (hits.size > 5000) hits.clear();
  return false;
}

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return h.get("x-real-ip") ?? "unknown";
}

export type ApplicationFormState = ActionResult | null;

export async function submitPartnerApplication(
  _prev: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("$ACTION") || key === "departments") continue;
    raw[key] = value;
  }
  raw.departments = formData.getAll("departments").map(String);

  const parsed = publicApplicationSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[] | undefined>,
    };
  }
  const v = parsed.data;
  if (v.website) return { ok: true, message: "received" };

  if (isRateLimited(await clientIp())) {
    return { ok: false, error: "You have sent several applications in a short time. Please wait a few minutes and try again." };
  }

  const tagged = [
    v.departments.length ? `${DEPT_PREFIX}${v.departments.join(", ")}` : null,
    v.serviceAreas ? `${AREAS_PREFIX}${v.serviceAreas}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await db.insert(partnerApplications).values({
      type: v.type,
      name: v.name,
      whatsapp: v.whatsapp,
      email: v.email ?? null,
      country: v.country,
      city: v.city ?? null,
      barCouncilNumber: v.type === "advocate" ? (v.barCouncilNumber ?? null) : null,
      yearsExperience: v.yearsExperience ?? null,
      specialties: v.specialties ?? null,
      languages: v.languages ?? null,
      bio: v.bio ?? null,
      channelOrNetwork: v.channelOrNetwork ?? null,
      source: "website",
      acceptedTermsAt: new Date(),
      notes: tagged || null,
    });
    return { ok: true, message: "Thank you. We review every application and reply on WhatsApp within a week." };
  } catch (error) {
    console.error("[partners] application insert failed", error);
    return { ok: false, error: "We could not save your application. Please try again in a minute." };
  }
}
