import "server-only";

import { and, asc, desc, eq, gte, inArray, isNull, lt, notInArray, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { cases, clients, leads, payments, teamMembers } from "@/lib/db/schema";

import { addDays, startOfDayUtc, startOfMonthUtc, subtractWorkingDays } from "./time";

const CLOSED = ["closed", "declined"] as const;

/** Everything the dashboard needs, in parallel. `now` comes from the caller. */
export async function getDashboard(now: Date) {
  const tomorrow = addDays(startOfDayUtc(now), 1);
  const today = startOfDayUtc(now);
  const memoCutoff = subtractWorkingDays(now, 3);
  const monthStart = startOfMonthUtc(now);

  const caseCols = {
    id: cases.id,
    caseNumber: cases.caseNumber,
    stage: cases.stage,
    product: cases.product,
    category: cases.category,
    nextAction: cases.nextAction,
    nextActionDue: cases.nextActionDue,
    createdAt: cases.createdAt,
    paymentStatus: cases.paymentStatus,
    clientName: clients.name,
    managerName: teamMembers.name,
  };

  const [due, memoDue, newLeads, stageCounts, revenue, paid, recentLeads, noNextAction] =
    await Promise.all([
      db
        .select(caseCols)
        .from(cases)
        .innerJoin(clients, eq(cases.clientId, clients.id))
        .leftJoin(teamMembers, eq(cases.caseManagerId, teamMembers.id))
        .where(and(lt(cases.nextActionDue, tomorrow), notInArray(cases.stage, [...CLOSED])))
        .orderBy(asc(cases.nextActionDue)),
      db
        .select(caseCols)
        .from(cases)
        .innerJoin(clients, eq(cases.clientId, clients.id))
        .leftJoin(teamMembers, eq(cases.caseManagerId, teamMembers.id))
        .where(
          and(
            isNull(cases.memoDeliveredAt),
            lt(cases.createdAt, memoCutoff),
            inArray(cases.stage, ["intake", "triage", "memo_drafting"]),
            inArray(cases.product, ["question", "call", "assessment", "managed"]),
          ),
        )
        .orderBy(asc(cases.createdAt)),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(leads)
        .where(eq(leads.status, "new")),
      db
        .select({ stage: cases.stage, n: sql<number>`count(*)::int` })
        .from(cases)
        .groupBy(cases.stage),
      db
        .select({ total: sql<number>`coalesce(sum(${payments.amountUsd}), 0)::int`, n: sql<number>`count(*)::int` })
        .from(payments)
        .where(and(eq(payments.status, "paid"), gte(payments.paidAt, monthStart))),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(cases)
        .where(eq(cases.paymentStatus, "paid")),
      db
        .select({
          id: leads.id,
          name: leads.name,
          category: leads.category,
          urgency: leads.urgency,
          source: leads.source,
          createdAt: leads.createdAt,
        })
        .from(leads)
        .where(eq(leads.status, "new"))
        .orderBy(desc(leads.createdAt))
        .limit(5),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(cases)
        .where(and(isNull(cases.nextActionDue), notInArray(cases.stage, [...CLOSED]))),
    ]);

  return {
    today,
    overdue: due.filter((c) => c.nextActionDue && c.nextActionDue < today),
    dueToday: due.filter((c) => c.nextActionDue && c.nextActionDue >= today),
    memoDue,
    newLeads: newLeads[0]?.n ?? 0,
    recentLeads,
    stageCounts: Object.fromEntries(stageCounts.map((r) => [r.stage, r.n])) as Record<string, number>,
    revenueThisMonth: revenue[0]?.total ?? 0,
    paymentsThisMonth: revenue[0]?.n ?? 0,
    paidCases: paid[0]?.n ?? 0,
    openWithoutNextAction: noNextAction[0]?.n ?? 0,
  };
}
