import "server-only";

import { and, asc, eq, ilike, isNull, or, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { CHANNEL_PLATFORMS, CHANNEL_STATUSES } from "@/lib/db/enums";
import { ambassadors, channels } from "@/lib/db/schema";

import { enumParam, likePattern, param, type SearchParams } from "./params";
import { DAY_MS } from "./time";

export function readChannelFilters(sp: SearchParams) {
  return {
    archived: param(sp, "archived") === "1",
    q: param(sp, "q"),
    status: enumParam(sp, "status", CHANNEL_STATUSES),
    platform: enumParam(sp, "platform", CHANNEL_PLATFORMS),
    view: param(sp, "view") === "due" ? ("due" as const) : ("all" as const),
  };
}

/**
 * When a channel is next due a post: lastPostedAt + cadenceDays. Channels with
 * a cadence that have never been posted to are due now. No cadence: never due.
 */
export function nextPostDue(c: { lastPostedAt: Date | null; cadenceDays: number | null; status: string }) {
  if (!c.cadenceDays || c.status === "paused") return null;
  if (!c.lastPostedAt) return new Date(0);
  return new Date(c.lastPostedAt.getTime() + c.cadenceDays * DAY_MS);
}

export async function listChannels(f: ReturnType<typeof readChannelFilters>, now: Date) {
  const where: SQL[] = [];
  if (f.q) {
    const p = likePattern(f.q);
    where.push(or(ilike(channels.name, p), ilike(channels.country, p), ilike(channels.adminContact, p))!);
  }
  if (!f.archived) where.push(isNull(channels.archivedAt));
  if (f.status) where.push(eq(channels.status, f.status));
  if (f.platform) where.push(eq(channels.platform, f.platform));
  const rows = await db
    .select({ channel: channels, ambassadorName: ambassadors.name })
    .from(channels)
    .leftJoin(ambassadors, eq(channels.ambassadorId, ambassadors.id))
    .where(where.length ? and(...where) : undefined)
    .orderBy(asc(channels.name));
  const withDue = rows.map((r) => {
    const due = nextPostDue(r.channel);
    return { ...r, nextDue: due, isDue: !!due && due < now };
  });
  if (f.view === "due") {
    return withDue
      .filter((r) => r.isDue)
      .sort((a, b) => (a.nextDue?.getTime() ?? 0) - (b.nextDue?.getTime() ?? 0));
  }
  return withDue;
}
