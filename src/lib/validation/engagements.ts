/** Partner engagements: zod schemas and the anti-poaching policy text. Client-safe. */
import { z } from "zod";

import { ENGAGEMENT_STATUSES } from "@/lib/db/enums";

import { idField, nullableDate, nullableInt, nullableText } from "./fields";

export const NO_POACHING_POLICY =
  "Rasta introduced this client. Until you accept this engagement you will not receive the client's contact details. " +
  "For 12 months after your last engagement with this client you will not solicit them directly or take instructions on this matter without telling Rasta. " +
  "All client communication is logged on the case. Documents stay in the client's Drive folder; keep no copies. " +
  "Advocates bill their professional fee to the client directly on their own letterhead, as disclosed here; no other direct fees.";

export const FEE_BILLED_BY = ["partner", "company"] as const;
export const FEE_BILLED_BY_LABELS: Record<(typeof FEE_BILLED_BY)[number], string> = {
  partner: "Provider bills client directly (own letterhead)",
  company: "Rasta pays the provider a fixed fee",
};

export const engagementSchema = z.object({
  caseId: idField(),
  partnerId: z.uuid("Choose a provider."),
  role: z.string().trim().min(1).max(60).default("advocate"),
  agreedFeeUsd: z.coerce.number().int().min(0).max(1_000_000),
  feeBilledBy: z.enum(FEE_BILLED_BY),
  department: nullableText(100),
  locationCity: nullableText(100),
  slaDays: nullableInt(0, 365),
  dueAt: nullableDate(),
  notes: nullableText(3000),
});

export const engagementStatusSchema = z.object({
  id: idField(),
  status: z.enum(ENGAGEMENT_STATUSES),
});

export const rateEngagementSchema = z.object({
  id: idField(),
  rating: z.coerce.number().int().min(1, "Rating 1 to 5.").max(5, "Rating 1 to 5."),
  ratingNote: nullableText(1000),
});

/** Allowed next statuses from each status (staff can always cancel or dispute open work). */
export const ENGAGEMENT_NEXT: Record<(typeof ENGAGEMENT_STATUSES)[number], (typeof ENGAGEMENT_STATUSES)[number][]> = {
  proposed: ["accepted", "cancelled"],
  accepted: ["in_progress", "cancelled", "disputed"],
  in_progress: ["delivered", "cancelled", "disputed"],
  delivered: ["completed", "disputed"],
  completed: [],
  cancelled: [],
  disputed: ["in_progress", "completed", "cancelled"],
};

/** Statuses where the provider has accepted and may see the client's contact details. */
export const CONTACT_VISIBLE = ["accepted", "in_progress", "delivered", "completed", "disputed"] as const;
