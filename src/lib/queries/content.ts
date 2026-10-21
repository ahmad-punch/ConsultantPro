import "server-only";

import { and, asc, desc, eq, ilike, isNull, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { CONTENT_FORMATS, CONTENT_STATUSES } from "@/lib/db/enums";
import { contentItems } from "@/lib/db/schema";

import { enumParam, likePattern, param, type SearchParams } from "./params";

export function readContentFilters(sp: SearchParams) {
  return {
    archived: param(sp, "archived") === "1",
    q: param(sp, "q"),
    status: enumParam(sp, "status", CONTENT_STATUSES),
    format: enumParam(sp, "format", CONTENT_FORMATS),
  };
}

export async function listContent(f: ReturnType<typeof readContentFilters>) {
  const where: SQL[] = [];
  if (f.q) where.push(ilike(contentItems.title, likePattern(f.q)));
  if (!f.archived) where.push(isNull(contentItems.archivedAt));
  if (f.status) where.push(eq(contentItems.status, f.status));
  if (f.format) where.push(eq(contentItems.format, f.format));
  return db
    .select()
    .from(contentItems)
    .where(where.length ? and(...where) : undefined)
    .orderBy(asc(contentItems.scheduledFor), desc(contentItems.createdAt));
}
