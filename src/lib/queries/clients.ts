import "server-only";

import { asc, eq, ilike, or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { ambassadors, cases, clients, retainers } from "@/lib/db/schema";

import { likePattern } from "./params";

export async function listClients(q?: string) {
  const p = q ? likePattern(q) : null;
  return db
    .select({
      id: clients.id,
      name: clients.name,
      whatsapp: clients.whatsapp,
      email: clients.email,
      country: clients.country,
      city: clients.city,
      createdAt: clients.createdAt,
      ambassadorName: ambassadors.name,
      caseCount: sql<number>`(select count(*)::int from ${cases} where ${cases.clientId} = ${clients.id})`,
      activeRetainers: sql<number>`(select count(*)::int from ${retainers} where ${retainers.clientId} = ${clients.id} and ${retainers.status} = 'active')`,
      paidUsd: sql<number>`(select coalesce(sum(${cases.priceUsd}), 0)::int from ${cases} where ${cases.clientId} = ${clients.id} and ${cases.paymentStatus} = 'paid')`,
    })
    .from(clients)
    .leftJoin(ambassadors, eq(clients.ambassadorId, ambassadors.id))
    .where(
      p
        ? or(
            ilike(clients.name, p),
            ilike(clients.whatsapp, p),
            ilike(clients.email, p),
            ilike(clients.country, p),
            ilike(clients.city, p),
          )
        : undefined,
    )
    .orderBy(asc(clients.name));
}

export async function getClient(id: string) {
  return db.query.clients.findFirst({
    where: (c, { eq }) => eq(c.id, id),
    with: {
      ambassador: true,
      cases: { orderBy: (c, { desc }) => [desc(c.createdAt)] },
      retainers: { orderBy: (r, { desc }) => [desc(r.startedAt)] },
    },
  });
}
