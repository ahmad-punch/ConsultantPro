import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { ENGAGEMENT_STATUSES, type EngagementStatus } from "@/lib/db/enums";
import { cases, clients, partnerEngagements, partners } from "@/lib/db/schema";

import { enumParam, type SearchParams } from "./params";

export function readEngagementFilters(sp: SearchParams): { status?: EngagementStatus } {
  return { status: enumParam(sp, "status", ENGAGEMENT_STATUSES) };
}

const base = () =>
  db
    .select({
      e: partnerEngagements,
      caseNumber: cases.caseNumber,
      caseSummary: cases.summary,
      clientName: clients.name,
      clientWhatsapp: clients.whatsapp,
      clientEmail: clients.email,
      partnerName: partners.name,
      partnerType: partners.type,
      partnerTier: partners.tier,
    })
    .from(partnerEngagements)
    .innerJoin(cases, eq(cases.id, partnerEngagements.caseId))
    .innerJoin(clients, eq(clients.id, cases.clientId))
    .innerJoin(partners, eq(partners.id, partnerEngagements.partnerId));

export type EngagementRow = Awaited<ReturnType<ReturnType<typeof base>["execute"]>>[number];

export async function listEngagements(f: { status?: EngagementStatus }) {
  const q = base();
  const rows = f.status ? await q.where(eq(partnerEngagements.status, f.status)).orderBy(desc(partnerEngagements.createdAt)) : await q.orderBy(desc(partnerEngagements.createdAt));
  return rows;
}

export async function engagementsForCase(caseId: string) {
  return base().where(eq(partnerEngagements.caseId, caseId)).orderBy(desc(partnerEngagements.createdAt));
}
