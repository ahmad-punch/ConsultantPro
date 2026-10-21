import "server-only";

import { and, asc, desc, eq, ilike, inArray, isNull, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  CASE_CATEGORIES,
  CASE_STAGES,
  PAYMENT_STATUSES,
  PRODUCTS,
  type CaseStage,
} from "@/lib/db/enums";
import { cases, clients, teamMembers } from "@/lib/db/schema";

import { enumParam, likePattern, param, sortDir, uuidParam, type SearchParams } from "./params";

export const CASE_SORTS = {
  caseNumber: cases.caseNumber,
  created: cases.createdAt,
  due: cases.nextActionDue,
  price: cases.priceUsd,
  client: clients.name,
  stage: cases.stage,
} as const;
export type CaseSort = keyof typeof CASE_SORTS;

export function readCaseFilters(sp: SearchParams) {
  const sortKey = param(sp, "sort");
  return {
    archived: param(sp, "archived") === "1",
    q: param(sp, "q"),
    stage: enumParam(sp, "stage", CASE_STAGES),
    category: enumParam(sp, "category", CASE_CATEGORIES),
    product: enumParam(sp, "product", PRODUCTS),
    payment: enumParam(sp, "payment", PAYMENT_STATUSES),
    manager: param(sp, "manager") === "none" ? ("none" as const) : uuidParam(sp, "manager"),
    open: param(sp, "open") === "1",
    sort: (sortKey && sortKey in CASE_SORTS ? sortKey : "created") as CaseSort,
    dir: sortDir(sp),
  };
}
export type CaseFilters = ReturnType<typeof readCaseFilters>;

export async function listCases(f: CaseFilters) {
  const where: SQL[] = [];
  if (f.q) {
    const p = likePattern(f.q);
    where.push(or(ilike(cases.caseNumber, p), ilike(cases.summary, p), ilike(clients.name, p))!);
  }
  if (!f.archived) where.push(isNull(cases.archivedAt));
  if (f.stage) where.push(eq(cases.stage, f.stage));
  if (f.category) where.push(eq(cases.category, f.category));
  if (f.product) where.push(eq(cases.product, f.product));
  if (f.payment) where.push(eq(cases.paymentStatus, f.payment));
  if (f.manager === "none") where.push(sql`${cases.caseManagerId} is null`);
  else if (f.manager) where.push(eq(cases.caseManagerId, f.manager));
  if (f.open) where.push(inArray(cases.stage, openStages));

  const col = CASE_SORTS[f.sort];
  const order = f.dir === "asc" ? asc(col) : desc(col);
  return db
    .select({
      id: cases.id,
      caseNumber: cases.caseNumber,
      category: cases.category,
      product: cases.product,
      stage: cases.stage,
      priceUsd: cases.priceUsd,
      paymentStatus: cases.paymentStatus,
      summary: cases.summary,
      nextAction: cases.nextAction,
      nextActionDue: cases.nextActionDue,
      memoDeliveredAt: cases.memoDeliveredAt,
      createdAt: cases.createdAt,
      archivedAt: cases.archivedAt,
      clientId: clients.id,
      clientName: clients.name,
      managerName: teamMembers.name,
    })
    .from(cases)
    .innerJoin(clients, eq(cases.clientId, clients.id))
    .leftJoin(teamMembers, eq(cases.caseManagerId, teamMembers.id))
    .where(where.length ? and(...where) : undefined)
    .orderBy(order, desc(cases.caseNumber));
}
export type CaseListRow = Awaited<ReturnType<typeof listCases>>[number];

const openStages: CaseStage[] = [
  "intake",
  "triage",
  "memo_drafting",
  "memo_delivered",
  "managed",
  "errand_in_progress",
];

export async function getCase(id: string) {
  return db.query.cases.findFirst({
    where: (c, { eq }) => eq(c.id, id),
    with: {
      client: true,
      caseManager: true,
      partner: true,
      ambassador: true,
      referredByCase: { columns: { id: true, caseNumber: true } },
      referredCases: { columns: { id: true, caseNumber: true } },
      notes: { orderBy: (n, { desc }) => [desc(n.createdAt)] },
      payments: { orderBy: (p, { desc }) => [desc(p.createdAt)] },
      leads: { columns: { id: true, name: true, source: true } },
    },
  });
}
export type CaseDetail = NonNullable<Awaited<ReturnType<typeof getCase>>>;
