import "server-only";

import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { clients, payments, retainers } from "@/lib/db/schema";

export async function listRetainers() {
  return db
    .select({
      retainer: retainers,
      clientName: clients.name,
      paidUsd: sql<number>`(select coalesce(sum(${payments.amountUsd}), 0)::int from ${payments} where ${payments.retainerId} = ${retainers.id} and ${payments.status} = 'paid')`,
    })
    .from(retainers)
    .innerJoin(clients, eq(retainers.clientId, clients.id))
    .orderBy(retainers.status, desc(retainers.startedAt));
}
