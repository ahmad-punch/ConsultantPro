import "server-only";

import { and, asc, desc, eq, ilike, isNull, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { CASE_CATEGORIES, LEAD_STATUSES } from "@/lib/db/enums";
import { ambassadors, cases, clients, leads } from "@/lib/db/schema";

import { enumParam, likePattern, param, sortDir, type SearchParams } from "./params";

export const LEAD_SORTS = {
  created: leads.createdAt,
  name: leads.name,
  urgency: leads.urgency,
  status: leads.status,
} as const;
export type LeadSort = keyof typeof LEAD_SORTS;

export function readLeadFilters(sp: SearchParams) {
  const sortKey = param(sp, "sort");
  return {
    archived: param(sp, "archived") === "1",
    q: param(sp, "q"),
    status: enumParam(sp, "status", LEAD_STATUSES),
    category: enumParam(sp, "category", CASE_CATEGORIES),
    source: param(sp, "source"),
    sort: (sortKey && sortKey in LEAD_SORTS ? sortKey : "created") as LeadSort,
    dir: sortDir(sp),
  };
}
export type LeadFilters = ReturnType<typeof readLeadFilters>;

export async function listLeads(f: LeadFilters) {
  const where: SQL[] = [];
  if (f.q) {
    const p = likePattern(f.q);
    where.push(
      or(
        ilike(leads.name, p),
        ilike(leads.description, p),
        ilike(leads.whatsapp, p),
        ilike(leads.country, p),
      )!,
    );
  }
  if (!f.archived) where.push(isNull(leads.archivedAt));
  if (f.status) where.push(eq(leads.status, f.status));
  if (f.category) where.push(eq(leads.category, f.category));
  if (f.source) where.push(eq(leads.source, f.source));
  const col = LEAD_SORTS[f.sort];
  return db
    .select({
      id: leads.id,
      name: leads.name,
      whatsapp: leads.whatsapp,
      country: leads.country,
      category: leads.category,
      urgency: leads.urgency,
      description: leads.description,
      source: leads.source,
      status: leads.status,
      referralCode: leads.referralCode,
      createdAt: leads.createdAt,
      archivedAt: leads.archivedAt,
      caseId: cases.id,
      caseNumber: cases.caseNumber,
    })
    .from(leads)
    .leftJoin(cases, eq(leads.convertedCaseId, cases.id))
    .where(where.length ? and(...where) : undefined)
    .orderBy(f.dir === "asc" ? asc(col) : desc(col), desc(leads.createdAt));
}

export async function listLeadSources(): Promise<string[]> {
  const rows = await db.selectDistinct({ source: leads.source }).from(leads).orderBy(asc(leads.source));
  return rows.map((r) => r.source);
}

export async function getLead(id: string) {
  const lead = await db.query.leads.findFirst({
    where: (l, { eq }) => eq(l.id, id),
    with: { convertedCase: { columns: { id: true, caseNumber: true, stage: true } } },
  });
  if (!lead) return null;
  const digits = lead.whatsapp.replace(/\D/g, "");
  const [matches, ambassador] = await Promise.all([
    findMatchingClients(digits, lead.email),
    lead.referralCode ? findAmbassadorByCode(lead.referralCode) : Promise.resolve(null),
  ]);
  return { ...lead, matchingClients: matches, ambassador };
}

/** Clients whose WhatsApp digits or email match. Used when converting a lead. */
export async function findMatchingClients(whatsappDigits: string, email: string | null) {
  const rows = await db
    .select({ id: clients.id, name: clients.name, whatsapp: clients.whatsapp, email: clients.email })
    .from(clients);
  return rows.filter(
    (c) =>
      (whatsappDigits.length >= 7 && c.whatsapp?.replace(/\D/g, "") === whatsappDigits) ||
      (email && c.email && c.email.toLowerCase() === email.toLowerCase()),
  );
}

export async function findAmbassadorByCode(code: string) {
  const rows = await db
    .select({ id: ambassadors.id, name: ambassadors.name, referralCode: ambassadors.referralCode })
    .from(ambassadors)
    .where(sql`lower(${ambassadors.referralCode}) = lower(${code.trim()})`);
  return rows[0] ?? null;
}
