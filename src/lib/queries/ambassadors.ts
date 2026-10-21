import "server-only";

import { asc, desc, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { ambassadors, cases, channels, clients } from "@/lib/db/schema";

/**
 * Commission owed to an ambassador: paid case revenue they referred times
 * their commission rate, minus what has already been paid out. Never negative.
 */
export function commissionDue(revenueUsd: number, commissionPct: number, totalPaidUsd: number) {
  const earned = Math.round((revenueUsd * commissionPct) / 100);
  return { earned, due: Math.max(0, earned - totalPaidUsd) };
}

export async function listAmbassadors(includeArchived = false) {
  const rows = await db
    .select({
      ambassador: ambassadors,
      referredCases: sql<number>`(select count(*)::int from ${cases} where ${cases.ambassadorId} = ${ambassadors.id})`,
      revenueUsd: sql<number>`(select coalesce(sum(${cases.priceUsd}), 0)::int from ${cases} where ${cases.ambassadorId} = ${ambassadors.id} and ${cases.paymentStatus} = 'paid')`,
      channelCount: sql<number>`(select count(*)::int from ${channels} where ${channels.ambassadorId} = ${ambassadors.id})`,
    })
    .from(ambassadors)
    .where(includeArchived ? undefined : isNull(ambassadors.archivedAt))
    .orderBy(desc(ambassadors.active), asc(ambassadors.name));
  return rows.map((r) => ({
    ...r,
    ...commissionDue(r.revenueUsd, r.ambassador.commissionPct, r.ambassador.totalPaidUsd),
  }));
}

export async function getAmbassador(id: string) {
  const ambassador = await db.query.ambassadors.findFirst({
    where: (a, { eq }) => eq(a.id, id),
    with: { channels: true, clients: { columns: { id: true, name: true, country: true } } },
  });
  if (!ambassador) return null;
  const referred = await db
    .select({
      id: cases.id,
      caseNumber: cases.caseNumber,
      product: cases.product,
      stage: cases.stage,
      priceUsd: cases.priceUsd,
      paymentStatus: cases.paymentStatus,
      createdAt: cases.createdAt,
      clientName: clients.name,
    })
    .from(cases)
    .innerJoin(clients, eq(cases.clientId, clients.id))
    .where(eq(cases.ambassadorId, id))
    .orderBy(desc(cases.createdAt));
  const revenueUsd = referred
    .filter((c) => c.paymentStatus === "paid")
    .reduce((sum, c) => sum + c.priceUsd, 0);
  return {
    ...ambassador,
    referred,
    revenueUsd,
    ...commissionDue(revenueUsd, ambassador.commissionPct, ambassador.totalPaidUsd),
  };
}
