import "server-only";

import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { RETAINER_TIER_LABELS } from "@/lib/db/enums";
import { ambassadors, cases, clients, partners, retainers, teamMembers } from "@/lib/db/schema";

export type Option = { value: string; label: string };

/** Select options for forms. Inactive records are left out unless `all`. */
export async function getTeamOptions(all = false): Promise<Option[]> {
  const rows = await db
    .select({ id: teamMembers.id, name: teamMembers.name, active: teamMembers.active })
    .from(teamMembers)
    .orderBy(asc(teamMembers.name));
  return rows.filter((r) => all || r.active).map((r) => ({ value: r.id, label: r.name }));
}

export async function getPartnerOptions(all = false): Promise<Option[]> {
  const rows = await db
    .select({ id: partners.id, name: partners.name, city: partners.city, active: partners.active })
    .from(partners)
    .orderBy(asc(partners.name));
  return rows
    .filter((r) => all || r.active)
    .map((r) => ({ value: r.id, label: r.city ? `${r.name} (${r.city})` : r.name }));
}

export async function getAmbassadorOptions(all = false): Promise<Option[]> {
  const rows = await db
    .select({
      id: ambassadors.id,
      name: ambassadors.name,
      code: ambassadors.referralCode,
      active: ambassadors.active,
    })
    .from(ambassadors)
    .orderBy(asc(ambassadors.name));
  return rows
    .filter((r) => all || r.active)
    .map((r) => ({ value: r.id, label: `${r.name} (${r.code})` }));
}

export async function getClientOptions(): Promise<Option[]> {
  const rows = await db
    .select({ id: clients.id, name: clients.name, country: clients.country })
    .from(clients)
    .orderBy(asc(clients.name));
  return rows.map((r) => ({ value: r.id, label: r.country ? `${r.name} (${r.country})` : r.name }));
}

export async function getCaseOptions(): Promise<Option[]> {
  const rows = await db
    .select({ id: cases.id, caseNumber: cases.caseNumber, client: clients.name })
    .from(cases)
    .innerJoin(clients, eq(cases.clientId, clients.id))
    .orderBy(desc(cases.caseNumber));
  return rows.map((r) => ({ value: r.id, label: `${r.caseNumber} · ${r.client}` }));
}

export async function getRetainerOptions(): Promise<Option[]> {
  const rows = await db
    .select({ id: retainers.id, tier: retainers.tier, status: retainers.status, client: clients.name })
    .from(retainers)
    .innerJoin(clients, eq(retainers.clientId, clients.id))
    .orderBy(asc(clients.name));
  return rows.map((r) => ({
    value: r.id,
    label: `${r.client} · ${RETAINER_TIER_LABELS[r.tier]}${r.status === "cancelled" ? " (cancelled)" : ""}`,
  }));
}
