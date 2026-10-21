import "server-only";

import { and, asc, desc, eq, inArray, isNull, notInArray, or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { PARTNER_TIERS, PARTNER_TYPES, type PartnerTier, type PartnerType } from "@/lib/db/enums";
import { cases, clients, partnerEngagements, partners, type Partner } from "@/lib/db/schema";
import { listHas } from "@/lib/validation/applications";

import { enumParam, param, type SearchParams } from "./params";

/* ------------------------------------------------------------ tiers */

export type ProviderStats = {
  completed: number;
  /** Completed engagements delivered on or before dueAt (or with no dueAt). */
  onTime: number;
  /** Average of engagement ratings, 1-5, or null with no ratings. */
  avgRating: number | null;
  disputed: number;
};

/**
 * Tier thresholds (decision 0004). Probation until 3 completed engagements.
 * bronze: >= 3 completed, on-time >= 70%, rating >= 3.5
 * silver: >= 10 completed, on-time >= 85%, rating >= 4.2, at most 1 dispute
 * gold:   >= 25 completed, on-time >= 92%, rating >= 4.6, no disputes in the record
 * A suspended provider keeps its tier but is excluded from dispatch.
 */
export const TIER_RULES: { tier: Exclude<PartnerTier, "probation">; completed: number; onTime: number; rating: number; maxDisputes: number }[] = [
  { tier: "gold", completed: 25, onTime: 0.92, rating: 4.6, maxDisputes: 0 },
  { tier: "silver", completed: 10, onTime: 0.85, rating: 4.2, maxDisputes: 1 },
  { tier: "bronze", completed: 3, onTime: 0.7, rating: 3.5, maxDisputes: Infinity },
];

export function computeTier(_partner: Pick<Partner, "tier" | "onboardingStage">, stats: ProviderStats): PartnerTier {
  if (stats.completed < 3) return "probation";
  const onTimeRate = stats.completed ? stats.onTime / stats.completed : 0;
  const rating = stats.avgRating ?? 0;
  for (const r of TIER_RULES) {
    if (stats.completed >= r.completed && onTimeRate >= r.onTime && rating >= r.rating && stats.disputed <= r.maxDisputes) return r.tier;
  }
  return "probation";
}

export const TIER_RANK: Record<PartnerTier, number> = { gold: 0, silver: 1, bronze: 2, probation: 3 };

export async function getProviderStats(partnerIds: string[]): Promise<Map<string, ProviderStats>> {
  const out = new Map<string, ProviderStats>();
  if (partnerIds.length === 0) return out;
  const rows = await db
    .select({
      partnerId: partnerEngagements.partnerId,
      completed: sql<number>`count(*) filter (where ${partnerEngagements.status} = 'completed')`.mapWith(Number),
      onTime: sql<number>`count(*) filter (where ${partnerEngagements.status} = 'completed' and (${partnerEngagements.dueAt} is null or coalesce(${partnerEngagements.deliveredAt}, ${partnerEngagements.completedAt}) <= ${partnerEngagements.dueAt}))`.mapWith(Number),
      avgRating: sql<string | null>`avg(${partnerEngagements.rating})`,
      disputed: sql<number>`count(*) filter (where ${partnerEngagements.status} = 'disputed')`.mapWith(Number),
    })
    .from(partnerEngagements)
    .where(inArray(partnerEngagements.partnerId, partnerIds))
    .groupBy(partnerEngagements.partnerId);
  for (const r of rows) {
    out.set(r.partnerId, {
      completed: r.completed,
      onTime: r.onTime,
      avgRating: r.avgRating == null ? null : Math.round(Number(r.avgRating) * 10) / 10,
      disputed: r.disputed,
    });
  }
  for (const id of partnerIds) if (!out.has(id)) out.set(id, { completed: 0, onTime: 0, avgRating: null, disputed: 0 });
  return out;
}

/* ------------------------------------------------------------ providers */

export type ProviderFilters = { type?: PartnerType; tier?: PartnerTier; department?: string; city?: string; q?: string };

export function readProviderFilters(sp: SearchParams): ProviderFilters {
  return {
    type: enumParam(sp, "type", PARTNER_TYPES),
    tier: enumParam(sp, "tier", PARTNER_TIERS),
    department: param(sp, "department"),
    city: param(sp, "city"),
    q: param(sp, "q"),
  };
}

export async function listProviders(f: ProviderFilters) {
  const conds = [isNull(partners.archivedAt)];
  if (f.type) conds.push(eq(partners.type, f.type));
  if (f.tier) conds.push(eq(partners.tier, f.tier));
  const rows = await db.select().from(partners).where(and(...conds)).orderBy(asc(partners.name));
  const q = f.q?.toLowerCase();
  return rows.filter(
    (p) =>
      (!f.department || listHas(p.departments, f.department)) &&
      (!f.city || listHas(p.serviceAreas, f.city) || p.city?.toLowerCase() === f.city.toLowerCase()) &&
      (!q || p.name.toLowerCase().includes(q) || (p.city ?? "").toLowerCase().includes(q)),
  );
}

/** Providers able to take work in a city + department, best first (tier, then rating). */
export async function rankedProvidersFor(city: string | null, department: string | null) {
  const rows = await db
    .select()
    .from(partners)
    .where(and(isNull(partners.archivedAt), eq(partners.active, true), notInArray(partners.onboardingStage, ["applied", "agreement_sent", "suspended"])));
  return rows
    .filter((p) => (!department || listHas(p.departments, department)) && (!city || listHas(p.serviceAreas, city) || p.city?.toLowerCase() === city.toLowerCase()))
    .sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier] || (b.avgRating ?? b.rating ?? 0) - (a.avgRating ?? a.rating ?? 0) || b.casesCompleted - a.casesCompleted);
}

export async function getProvider(id: string) {
  const [p] = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
  if (!p) return null;
  const [stats, engagements] = await Promise.all([
    getProviderStats([id]).then((m) => m.get(id)!),
    db
      .select({
        e: partnerEngagements,
        caseNumber: cases.caseNumber,
        clientId: clients.id,
        clientName: clients.name,
      })
      .from(partnerEngagements)
      .innerJoin(cases, eq(cases.id, partnerEngagements.caseId))
      .innerJoin(clients, eq(clients.id, cases.clientId))
      .where(eq(partnerEngagements.partnerId, id))
      .orderBy(desc(partnerEngagements.createdAt)),
  ]);

  // Non-solicitation watch list: clients this provider has served, and when the 12-month window ends.
  const byClient = new Map<string, { clientId: string; clientName: string; engagements: number; lastAt: Date }>();
  for (const row of engagements) {
    if (!["accepted", "in_progress", "delivered", "completed", "disputed"].includes(row.e.status)) continue;
    const at = row.e.completedAt ?? row.e.updatedAt;
    const cur = byClient.get(row.clientId);
    if (cur) {
      cur.engagements += 1;
      if (at > cur.lastAt) cur.lastAt = at;
    } else byClient.set(row.clientId, { clientId: row.clientId, clientName: row.clientName, engagements: 1, lastAt: at });
  }
  const watch = [...byClient.values()].map((c) => {
    const until = new Date(c.lastAt);
    until.setUTCMonth(until.getUTCMonth() + 12);
    return { ...c, until, repeat: c.engagements > 1 };
  });

  return { partner: p, stats, suggestedTier: computeTier(p, stats), engagements, watch };
}

/* ------------------------------------------------------------ dispatch */

const ERRAND_CATEGORIES = ["nadra", "attestation", "tax_fbr", "company_secp", "court"] as const;
const OPEN_ENGAGEMENT = ["proposed", "accepted", "in_progress"] as const;
const CLOSED_STAGES = ["closed", "declined"] as const;

const CATEGORY_DEPARTMENT: Record<string, string> = {
  nadra: "NADRA",
  attestation: "HEC/IBCC",
  tax_fbr: "FBR",
  company_secp: "SECP",
  court: "Courts",
};

export type DispatchItem = {
  kind: "engagement" | "case";
  key: string;
  caseId: string;
  caseNumber: string;
  summary: string;
  engagementId?: string;
  status?: string;
  providerName?: string;
  batchKey?: string | null;
  dueAt?: Date | null;
};

export type DispatchGroup = { city: string; department: string; items: DispatchItem[] };

export async function getDispatchBoard(): Promise<DispatchGroup[]> {
  const [openEngagements, errandCases, accepted] = await Promise.all([
    db
      .select({ e: partnerEngagements, caseNumber: cases.caseNumber, summary: cases.summary, caseCity: cases.locationCity, caseDept: cases.department, providerName: partners.name })
      .from(partnerEngagements)
      .innerJoin(cases, eq(cases.id, partnerEngagements.caseId))
      .innerJoin(partners, eq(partners.id, partnerEngagements.partnerId))
      .where(inArray(partnerEngagements.status, [...OPEN_ENGAGEMENT])),
    db
      .select()
      .from(cases)
      .where(
        and(
          isNull(cases.archivedAt),
          notInArray(cases.stage, [...CLOSED_STAGES]),
          or(eq(cases.product, "errand"), inArray(cases.category, [...ERRAND_CATEGORIES])),
        ),
      ),
    db
      .selectDistinct({ caseId: partnerEngagements.caseId })
      .from(partnerEngagements)
      .where(inArray(partnerEngagements.status, ["accepted", "in_progress", "delivered", "completed"])),
  ]);
  const covered = new Set(accepted.map((r) => r.caseId));
  const groups = new Map<string, DispatchGroup>();
  const add = (city: string | null, dept: string | null, item: DispatchItem) => {
    const c = city?.trim() || "No city";
    const d = dept?.trim() || "No office";
    const k = `${c.toLowerCase()}|${d.toLowerCase()}`;
    const g = groups.get(k) ?? { city: c, department: d, items: [] };
    g.items.push(item);
    groups.set(k, g);
  };
  for (const r of openEngagements) {
    add(r.e.locationCity ?? r.caseCity, r.e.department ?? r.caseDept, {
      kind: "engagement",
      key: `e-${r.e.id}`,
      caseId: r.e.caseId,
      caseNumber: r.caseNumber,
      summary: r.summary,
      engagementId: r.e.id,
      status: r.e.status,
      providerName: r.providerName,
      batchKey: r.e.batchKey,
      dueAt: r.e.dueAt,
    });
  }
  const engagedCaseIds = new Set(openEngagements.map((r) => r.e.caseId));
  for (const c of errandCases) {
    if (covered.has(c.id) || engagedCaseIds.has(c.id)) continue;
    add(c.locationCity, c.department ?? CATEGORY_DEPARTMENT[c.category] ?? null, {
      kind: "case",
      key: `c-${c.id}`,
      caseId: c.id,
      caseNumber: c.caseNumber,
      summary: c.summary,
      dueAt: c.nextActionDue,
    });
  }
  return [...groups.values()].sort((a, b) => b.items.length - a.items.length || a.city.localeCompare(b.city));
}

export { CATEGORY_DEPARTMENT };
