import "server-only";

import { and, asc, eq, ilike, inArray, isNull, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { PARTNER_TYPES } from "@/lib/db/enums";
import { cases, partners } from "@/lib/db/schema";

import { enumParam, likePattern, param, type SearchParams } from "./params";

export function readPartnerFilters(sp: SearchParams) {
  return {
    archived: param(sp, "archived") === "1",
    q: param(sp, "q"),
    type: enumParam(sp, "type", PARTNER_TYPES),
    active: enumParam(sp, "active", ["yes", "no"] as const),
  };
}

export async function listPartners(f: ReturnType<typeof readPartnerFilters>) {
  const where: SQL[] = [];
  if (f.q) {
    const p = likePattern(f.q);
    where.push(or(ilike(partners.name, p), ilike(partners.city, p))!);
  }
  if (!f.archived) where.push(isNull(partners.archivedAt));
  if (f.type) where.push(eq(partners.type, f.type));
  if (f.active) where.push(eq(partners.active, f.active === "yes"));
  return db
    .select({
      partner: partners,
      openCases: sql<number>`(select count(*)::int from ${cases} where ${cases.partnerId} = ${partners.id} and ${inArray(
        cases.stage,
        ["intake", "triage", "memo_drafting", "memo_delivered", "managed", "errand_in_progress"],
      )})`,
      totalCases: sql<number>`(select count(*)::int from ${cases} where ${cases.partnerId} = ${partners.id})`,
    })
    .from(partners)
    .where(where.length ? and(...where) : undefined)
    .orderBy(asc(partners.name));
}
