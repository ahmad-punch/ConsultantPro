import "server-only";

import { and, desc, eq, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/lib/db";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/db/enums";
import { cases, clients, payments, retainers } from "@/lib/db/schema";

import { enumParam, type SearchParams } from "./params";

export function readPaymentFilters(sp: SearchParams) {
  return {
    status: enumParam(sp, "status", PAYMENT_STATUSES),
    method: enumParam(sp, "method", PAYMENT_METHODS),
  };
}

const caseClient = alias(clients, "case_client");
const retainerClient = alias(clients, "retainer_client");

export async function listPayments(f: ReturnType<typeof readPaymentFilters>) {
  const where: SQL[] = [];
  if (f.status) where.push(eq(payments.status, f.status));
  if (f.method) where.push(eq(payments.method, f.method));
  return db
    .select({
      payment: payments,
      caseNumber: cases.caseNumber,
      caseProduct: cases.product,
      caseClientName: caseClient.name,
      retainerTier: retainers.tier,
      retainerClientName: retainerClient.name,
    })
    .from(payments)
    .leftJoin(cases, eq(payments.caseId, cases.id))
    .leftJoin(caseClient, eq(cases.clientId, caseClient.id))
    .leftJoin(retainers, eq(payments.retainerId, retainers.id))
    .leftJoin(retainerClient, eq(retainers.clientId, retainerClient.id))
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(payments.paidAt), desc(payments.createdAt));
}
