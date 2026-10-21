import "server-only";

import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { APPLICATION_STATUSES, APPLICATION_TYPES, type ApplicationStatus, type ApplicationType } from "@/lib/db/enums";
import { partnerApplications } from "@/lib/db/schema";

import { enumParam, type SearchParams } from "./params";

export type ApplicationFilters = { status?: ApplicationStatus; type?: ApplicationType };

export function readApplicationFilters(sp: SearchParams): ApplicationFilters {
  return { status: enumParam(sp, "status", APPLICATION_STATUSES), type: enumParam(sp, "type", APPLICATION_TYPES) };
}

export async function listApplications(f: ApplicationFilters) {
  const conds = [isNull(partnerApplications.archivedAt)];
  if (f.status) conds.push(eq(partnerApplications.status, f.status));
  if (f.type) conds.push(eq(partnerApplications.type, f.type));
  return db.select().from(partnerApplications).where(and(...conds)).orderBy(desc(partnerApplications.createdAt));
}

export async function getApplication(id: string) {
  const [row] = await db.select().from(partnerApplications).where(eq(partnerApplications.id, id)).limit(1);
  return row ?? null;
}
